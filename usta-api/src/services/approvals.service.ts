import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  ActorContext,
  ApprovalAttachmentResponse,
  ApprovalRequestAnnex3,
  ApprovalStatus,
  CreateApprovalRequestDto,
  DecideApprovalDto,
  IdGenerator,
  UploadApprovalAttachmentDto,
} from '@usta/domain';
import { assertUnitAccess, getActorAllowedUnitIds } from '../auth/actor-resolver.js';
import { ENV_CONFIG } from '../config/env.config.js';
import type { TransactionRunner } from '../database/transaction-runner.js';
import type { Repositories } from '../repositories/repositories.js';
import {
  BadRequestError,
  BusinessRuleError,
  ForbiddenError,
  NotFoundError,
} from '../utils/app-error.js';
import type { AuditService } from './audit.service.js';
import type { PeriodContextService } from './period-context.service.js';

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

const ALLOWED_ATTACHMENT_MIME_BY_EXT: Readonly<Record<string, string>> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

function verifyAttachmentMagicBytes(ext: string, buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  if (ext === '.pdf') {
    return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  }
  if (ext === '.png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8;
  }
  if (ext === '.docx' || ext === '.xlsx') {
    return (
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04
    );
  }
  if (ext === '.doc' || ext === '.xls') {
    return (
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0
    );
  }
  return false;
}

export class ApprovalsService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly repos: Repositories,
    private readonly periodContext: PeriodContextService,
    private readonly audit: AuditService,
    private readonly ids: IdGenerator,
  ) {}

  private getAnnex3Dir(): string {
    return path.resolve(ENV_CONFIG.uploadsDir, 'annex3');
  }

  public async list(
    requestedPeriod?: string,
    unitId?: string,
    status?: ApprovalStatus,
    actor?: ActorContext,
  ): Promise<ApprovalRequestAnnex3[]> {
    if (actor && unitId) {
      assertUnitAccess(actor, unitId);
    }
    const db = this.tx.executor;
    const periodCode = await this.periodContext.resolvePeriod(db, requestedPeriod);
    const items = await this.repos.approvals.listByPeriod(db, periodCode, {
      unitId,
      status,
    });
    if (actor?.role === 'dean' && !unitId) {
      const allowed = new Set(getActorAllowedUnitIds(actor));
      return items.filter((item) => allowed.has(item.unitId));
    }
    return items;
  }

  public async uploadAttachment(
    _actor: ActorContext,
    dto: UploadApprovalAttachmentDto,
  ): Promise<ApprovalAttachmentResponse> {
    const rawName = path.basename(dto.fileName.trim());
    const ext = path.extname(rawName).toLowerCase();
    const canonicalMime = ALLOWED_ATTACHMENT_MIME_BY_EXT[ext];
    if (!canonicalMime) {
      throw new BadRequestError(
        'Formato de archivo no permitido. Adjunte un documento PDF, Word (.docx o .doc), Excel (.xlsx o .xls) o imagen (.png o .jpg).',
      );
    }

    const base64Payload = dto.contentBase64.includes(',')
      ? (dto.contentBase64.split(',').pop() ?? '')
      : dto.contentBase64;
    const cleanBase64 = base64Payload.replace(/\s+/g, '');
    if (!cleanBase64) {
      throw new BadRequestError('El archivo adjunto está vacío.');
    }

    const buffer = Buffer.from(cleanBase64, 'base64');
    if (buffer.length === 0) {
      throw new BadRequestError('No se pudo leer el archivo adjunto.');
    }
    if (buffer.length > MAX_ATTACHMENT_BYTES) {
      throw new BadRequestError(
        'El soporte documental supera el tamaño máximo permitido de 8 MB.',
      );
    }
    if (!verifyAttachmentMagicBytes(ext, buffer)) {
      throw new BadRequestError(
        `El archivo «${rawName}» no corresponde a un formato ${ext.toUpperCase()} válido.`,
      );
    }

    const stem = path
      .basename(rawName, ext)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 50);
    const storedFileName = `${this.ids.next()}-${stem || 'soporte'}${ext}`;
    const annexDir = this.getAnnex3Dir();
    await fs.mkdir(annexDir, { recursive: true });
    await fs.writeFile(path.join(annexDir, storedFileName), buffer);

    return {
      fileName: storedFileName,
      originalName: rawName,
      mimeType: ALLOWED_ATTACHMENT_MIME_BY_EXT[ext]!,
      sizeBytes: buffer.length,
      url: `/api/approvals/attachments/${storedFileName}`,
    };
  }

  public async readAttachment(
    storedFileName: string,
    actor?: ActorContext,
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
    const cleanName = storedFileName.trim();
    if (!cleanName || /[/\\]/.test(cleanName) || !/^[a-zA-Z0-9._-]+$/.test(cleanName)) {
      throw new BadRequestError('El nombre del archivo solicitado no es válido.');
    }
    const ext = path.extname(cleanName).toLowerCase();
    const mimeType = ALLOWED_ATTACHMENT_MIME_BY_EXT[ext];
    if (!mimeType) {
      throw new NotFoundError('El soporte documental solicitado no existe.');
    }

    if (actor?.role === 'dean') {
      const allowed = new Set(getActorAllowedUnitIds(actor));
      const suffix = `/api/approvals/attachments/${cleanName}`;
      const linkedRow = await this.tx.executor
        .selectFrom('approval_requests')
        .select(['unit_id'])
        .where('attachment_url', 'like', `%${suffix}`)
        .executeTakeFirst();
      if (linkedRow && !allowed.has(linkedRow.unit_id)) {
        throw new ForbiddenError(
          'No tiene permisos para consultar soportes documentales de otra unidad académica.',
        );
      }
    }

    const annexDir = this.getAnnex3Dir();
    const resolved = path.resolve(annexDir, cleanName);
    if (!resolved.startsWith(annexDir + path.sep)) {
      throw new BadRequestError('La referencia al archivo solicitado no es válida.');
    }

    try {
      const buffer = await fs.readFile(resolved);
      return { buffer, mimeType, fileName: cleanName };
    } catch {
      throw new NotFoundError('El archivo adjunto solicitado no se encuentra disponible.');
    }
  }

  public async create(
    actor: ActorContext,
    dto: CreateApprovalRequestDto,
    requestedPeriod?: string,
  ): Promise<ApprovalRequestAnnex3> {
    assertUnitAccess(actor, dto.unitId);
    return this.tx.run(async (trx) => {
      const periodCode = await this.periodContext.resolvePeriod(trx, requestedPeriod);
      const unitRecord = await this.repos.units.findById(trx, dto.unitId);
      if (!unitRecord) {
        throw new NotFoundError('La unidad académica seleccionada no existe.');
      }

      if (actor.role === 'dean') {
        const cycle = await this.repos.units.findCycle(trx, dto.unitId, periodCode);
        const status = cycle?.payrollStatus ?? 'Borrador';
        if (status === 'Enviada' || status === 'En Revisión' || status === 'Avalada') {
          throw new BusinessRuleError(
            `La prenómina de ${unitRecord.name} se encuentra en estado ${status} y no admite nuevas solicitudes hasta reabrirse.`,
          );
        }
      }

      const scopedTeacher = await this.repos.teachers.findById(trx, dto.teacherId);
      if (!scopedTeacher || scopedTeacher.periodCode !== periodCode) {
        throw new BadRequestError(
          'El docente seleccionado no se encuentra registrado en el periodo activo.',
        );
      }
      if (scopedTeacher.entity.unitId !== dto.unitId) {
        throw new ForbiddenError(
          'El docente seleccionado no pertenece a la unidad académica de la solicitud.',
        );
      }

      const sacDef = await this.repos.sacCodes.findByCode(trx, dto.code);
      if (!sacDef) {
        throw new BadRequestError(
          `El código SAC ${dto.code} no figura en el catálogo institucional.`,
        );
      }

      const today = new Date().toISOString().slice(0, 10);

      const existing = await this.repos.approvals.findByTeacherAndCode(
        trx,
        dto.teacherId,
        dto.code,
        { forUpdate: true },
      );

      let persisted: ApprovalRequestAnnex3;
      if (existing) {
        persisted = {
          ...dto,
          unitName: unitRecord.name,
          teacherName: scopedTeacher.entity.fullName,
          teacherDocumentId: scopedTeacher.entity.documentId,
          id: existing.id,
          period: existing.period,
          status: 'Pendiente',
          requestedAt: today,
        };
        await this.repos.approvals.update(trx, persisted);
      } else {
        persisted = {
          ...dto,
          unitName: unitRecord.name,
          teacherName: scopedTeacher.entity.fullName,
          teacherDocumentId: scopedTeacher.entity.documentId,
          id: this.ids.next(),
          period: periodCode,
          status: 'Pendiente',
          requestedAt: today,
        };
        await this.repos.approvals.insertMany(trx, [persisted]);
      }

      const formattedType = persisted.formatType.replace('_', ' / ');
      const itemCount = persisted.projectDetails.length;
      const itemsLabel = itemCount === 1 ? '1 actividad' : `${itemCount} actividades`;

      await this.audit.record(trx, actor, {
        periodCode: persisted.period,
        unitId: persisted.unitId,
        unitName: persisted.unitName,
        teacherName: persisted.teacherName,
        action: existing
          ? `Actualización de solicitud Anexo 3 (código ${persisted.code})`
          : `Radicación de solicitud Anexo 3 (código ${persisted.code})`,
        previousValue: existing ? `${existing.requestedHours} h (${existing.status})` : 'Sin radicar',
        newValue: `${persisted.requestedHours} h (${itemsLabel} · Pendiente)`,
        reason: `Formato ${formattedType} · Programa: ${persisted.programName}`,
      });

      return (await this.repos.approvals.findById(trx, persisted.id)) ?? persisted;
    });
  }

  public async decide(
    actor: ActorContext,
    dto: DecideApprovalDto,
  ): Promise<ApprovalRequestAnnex3> {
    return this.tx.run(async (trx) => {
      const existing = await this.repos.approvals.findById(trx, dto.id, {
        forUpdate: true,
      });
      if (!existing) {
        throw new NotFoundError('La solicitud de aval seleccionada no existe.');
      }

      const today = new Date().toISOString().slice(0, 10);
      const updated: ApprovalRequestAnnex3 = {
        ...existing,
        status: dto.status,
        ...(dto.viceRectorNote !== undefined
          ? { viceRectorNote: dto.viceRectorNote }
          : {}),
        decidedBy: actor.name,
        decidedAt: today,
      };

      await this.repos.approvals.update(trx, updated);

      await this.audit.record(trx, actor, {
        periodCode: updated.period,
        unitId: updated.unitId,
        unitName: updated.unitName,
        teacherName: updated.teacherName,
        action: `Concepto de Vicerrectoría Académica en código ${updated.code}: ${updated.status}`,
        previousValue: existing.status,
        newValue: `${updated.status} (${updated.requestedHours} h)`,
        reason:
          dto.viceRectorNote ||
          `Revisión de Anexo 3 registrada por ${actor.name}`,
      });

      return updated;
    });
  }
}

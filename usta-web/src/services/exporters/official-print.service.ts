import type { ApprovalRequestAnnex3 } from '@usta/domain';
import { useToast } from '@/composables/useToast';

/** Escapes dynamic fields before interpolating into the printable Annex 3 HTML document. */
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Generates standalone printable HTML documents for official institutional forms. */
export class OfficialPrintService {
  /**
   * Opens a dedicated browser window and writes the formatted Annex 3 approval document,
   * surfacing a toast error if popup windows are blocked by the browser.
   */
  public static printOfficialAnnex3Format(
    request: ApprovalRequestAnnex3,
    _period?: string,
  ): void {
    const win = window.open('', '_blank', 'width=920,height=780');
    if (!win) {
      useToast().showToast(
        'El navegador bloqueó la ventana de impresión. Permita las ventanas emergentes en este sitio e intente de nuevo.',
        'error',
      );
      return;
    }

    const badgeBg =
      request.status === 'Avalado'
        ? '#dff5e8'
        : request.status === 'Rechazado'
          ? '#fde8e8'
          : '#fff3cd';
    const badgeColor =
      request.status === 'Avalado'
        ? '#1d7a4a'
        : request.status === 'Rechazado'
          ? '#b3413a'
          : '#8a5b00';

    const rowsHtml = request.projectDetails
      .map(
        (d, idx) => `
      <tr>
        <td style="text-align:center">${idx + 1}</td>
        <td><b>${escapeHtml(d.title)}</b></td>
        <td>${escapeHtml(d.projectType)}</td>
        <td>${escapeHtml(d.studentsOrCourse)}</td>
        <td>${escapeHtml(d.committeeApprovalMinute)}</td>
        <td style="text-align:center; font-weight:700">${escapeHtml(d.hours)} h</td>
      </tr>
    `,
      )
      .join('');

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Anexo 3 · Solicitud de aval ${escapeHtml(request.code)} · ${escapeHtml(request.teacherName)}</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #101826;
          margin: 32px;
          font-size: 13px;
          line-height: 1.45;
        }
        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          border: 2px solid #00336a;
        }
        .header-table td {
          border: 1px solid #00336a;
          padding: 10px 14px;
        }
        .title {
          font-size: 15px;
          font-weight: 800;
          color: #00336a;
          text-align: center;
          text-transform: uppercase;
        }
        .subtitle {
          font-size: 12px;
          text-align: center;
          color: #445164;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          background: #f5f8fc;
          border: 1px solid #d0dce8;
          padding: 14px;
          border-radius: 8px;
          margin-bottom: 18px;
        }
        table.items {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 22px;
        }
        table.items th {
          background: #00336a;
          color: #fff;
          font-size: 11px;
          text-transform: uppercase;
          padding: 8px 10px;
          border: 1px solid #00336a;
          text-align: left;
        }
        table.items td {
          padding: 9px 10px;
          border: 1px solid #cbd5e1;
        }
        .stamp-box {
          margin-top: 28px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .sign-card {
          border: 1.5px solid #00336a;
          border-radius: 8px;
          padding: 14px;
          background: #fafcff;
        }
        .badge-status {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
          background: ${badgeBg};
          color: ${badgeColor};
        }
        @media print {
          .no-print { display: none; }
          body { margin: 12px; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 16px; text-align: right;">
        <button onclick="window.print()" style="background:#00336a;color:#fff;border:none;padding:9px 18px;border-radius:6px;font-weight:700;cursor:pointer;">
          Imprimir o guardar PDF
        </button>
      </div>

      <table class="header-table">
        <tr>
          <td style="width: 22%; text-align: center; font-weight: 800; color: #00336a;">
            UNIVERSIDAD SANTO TOMÁS<br/>SECCIONAL TUNJA
          </td>
          <td style="width: 56%;">
            <div class="title">ANEXO 3. SOLICITUD DE AVAL ANTE VICERRECTORÍA ACADÉMICA</div>
            <div class="subtitle">DIRECCIÓN DE ENSEÑANZA Y APRENDIZAJE · PERIODO ACADÉMICO ${escapeHtml(request.period)}</div>
          </td>
          <td style="width: 22%; font-size: 11px;">
            <b>Código SAC:</b> ${escapeHtml(request.code)}<br/>
            <b>Radicado:</b> ${escapeHtml(request.id.toUpperCase())}<br/>
            <b>Fecha:</b> ${escapeHtml(request.requestedAt)}
          </td>
        </tr>
      </table>

      <div class="meta-grid">
        <div><b>Unidad académica:</b> ${escapeHtml(request.unitName)}</div>
        <div><b>Programa académico:</b> ${escapeHtml(request.programName)}</div>
        <div><b>Docente:</b> ${escapeHtml(request.teacherName)}</div>
        <div><b>Documento:</b> CC ${escapeHtml(request.teacherDocumentId)}</div>
        <div><b>Actividad:</b> ${escapeHtml(request.code)} — ${escapeHtml(request.codeName)}</div>
        <div><b>Horas solicitadas:</b> ${escapeHtml(request.requestedHours)} h/mes</div>
      </div>

      <h3 style="color:#00336a; font-size:13px; text-transform:uppercase; margin-bottom:8px;">
        Detalle de proyectos, cursos o actividades y soporte curricular
      </h3>

      <table class="items">
        <thead>
          <tr>
            <th style="width:40px">#</th>
            <th>Proyecto, curso o actividad</th>
            <th>Modalidad</th>
            <th>Estudiantes o curso</th>
            <th>Acta de comité curricular</th>
            <th style="width:90px; text-align:center">Horas/mes</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr style="background:#f1f5f9; font-weight:700;">
            <td colspan="5" style="text-align:right">TOTAL HORAS MENSUALES SOLICITADAS (${escapeHtml(request.code)}):</td>
            <td style="text-align:center">${escapeHtml(request.requestedHours)} h</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-bottom: 14px; font-size: 12px;">
        <b>Soporte adjunto:</b> ${escapeHtml(request.attachmentUrl || 'Sin archivo adjunto')}
      </div>

      <div class="stamp-box">
        <div class="sign-card">
          <div style="font-size:11px; text-transform:uppercase; color:#445164; font-weight:700;">
            Radicación por decanatura
          </div>
          <p style="margin:8px 0 4px;"><b>Unidad:</b> ${escapeHtml(request.unitName)}</p>
          <p style="margin:0; font-size:11.5px; color:#445164;">
            Fecha de radicación: ${escapeHtml(request.requestedAt)}
          </p>
        </div>

        <div class="sign-card">
          <div style="font-size:11px; text-transform:uppercase; color:#445164; font-weight:700;">
            Decisión de aval — Vicerrectoría Académica
          </div>
          <p style="margin:8px 0 6px;">
            Estado: <span class="badge-status">${escapeHtml(request.status.toUpperCase())}</span>
          </p>
          <p style="margin:0; font-size:12px;">
            <b>Decidido por:</b> ${escapeHtml(request.decidedBy ?? 'Pendiente de revisión')}
          </p>
          <p style="margin:3px 0 0; font-size:11.5px; color:#445164;">
            Fecha de decisión: ${escapeHtml(request.decidedAt ?? 'Pendiente')}
          </p>
          ${
            request.viceRectorNote
              ? `<p style="margin:6px 0 0; font-size:11.5px; color:#00336a;"><b>Observación:</b> ${escapeHtml(request.viceRectorNote)}</p>`
              : ''
          }
        </div>
      </div>
    </body>
    </html>
  `;

    win.document.open();
    win.document.write(html);
    win.document.close();
  }
}

export const printOfficialAnnex3Format =
  OfficialPrintService.printOfficialAnnex3Format.bind(OfficialPrintService);

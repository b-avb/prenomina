import type {
  AcademicUnitSummary,
  ApprovalRequestAnnex3,
  AuditLogEntry,
  FacultyTeacher,
  ProgramQuotaAnnex5,
  ResearchAllocationAnnex7,
  SacCode,
} from '@usta/domain';

export const SAC_CODES_ANNEX4_SEED: SacCode[] = [
  {
    "code": "40104",
    "name": "TUNJA ORIENTACIÓN DE ESPACIOS ACADÉMICOS",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Orientación directa de clases teóricas, teórico-prácticas y prácticas en programas de pregrado.",
    "guideline": "Tiempo completo en facultades: mínimo 96 h/mes (24 h/sem) y hasta 128 h/mes. En direcciones académicas (Humanidades, Ciencias Básicas y CILCE): mínimo 128 h/mes (32 h/sem). Medio tiempo: mínimo 64 h/mes (16 h/sem). Cátedra: 16 a 48 h/mes.",
    "baseHours": 12,
    "capHours": 160,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todos los programas y direcciones académicas",
    "severity": "justifiable_alert",
    "mandatoryInFaculty": true
  },
  {
    "code": "40006",
    "name": "TUNJA ORIENTACIÓN ESPACIOS ACADÉMICOS DE POSGRADO",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Orientación de módulos en programas de especialización, maestría o doctorado.",
    "guideline": "Cantidad de horas mensuales que multiplicadas por 4 da el total del módulo de posgrado que orientará (Horas mes = Horas módulo ÷ 4). Tope máximo: 48 h/mes.",
    "baseHours": 4,
    "capHours": 48,
    "requiresViceRectorApproval": false,
    "appliesTo": "Programas con posgrado y directivos que orientan en posgrado",
    "severity": "justifiable_alert"
  },
  {
    "code": "40105",
    "name": "TUNJA PREPARATORIOS FACULTAD DE DERECHO",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Evaluación y acompañamiento de exámenes preparatorios en el programa de Derecho.",
    "guideline": "Entre 4 y 16 h/mes por docente; tope agregado máximo de 120 h/mes en la Facultad de Derecho.",
    "baseHours": 4,
    "capHours": 16,
    "requiresViceRectorApproval": false,
    "appliesTo": "Exclusivo Facultad de Derecho",
    "severity": "blocking"
  },
  {
    "code": "40109",
    "name": "PLANEACIÓN DE PRUEBAS ACADÉMICAS EN EL MARCO DEL SEA",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Diseño, validación y análisis de pruebas del Sistema de Evaluación del Aprendizaje (SEA).",
    "guideline": "Obligatorio garantizar horas en todos los programas (Lineamiento B-23). Hasta 8 h/mes para pregrado y 4 h/mes para posgrado según ANEXO 5. Mínimo 2 años de antigüedad en la USTA.",
    "baseHours": 4,
    "capHours": 28,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todas las unidades académicas (según tope ANEXO 5)",
    "severity": "justifiable_alert",
    "mandatoryInFaculty": true
  },
  {
    "code": "40127",
    "name": "PLANEACIÓN DE PRUEBAS ACADÉMICAS EN EL MARCO DEL SABER PRO",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Acompañamiento, simulacros y fortalecimiento de competencias genéricas y específicas Saber Pro.",
    "guideline": "Obligatorio en todos los programas de pregrado (Lineamiento B-23). Según ANEXO 5: 8, 12, 20 o 24 h/mes según número de grupos; hasta 60 h/mes en direcciones académicas.",
    "baseHours": 8,
    "capHours": 24,
    "requiresViceRectorApproval": false,
    "appliesTo": "Programas de pregrado y direcciones académicas (según ANEXO 5)",
    "severity": "justifiable_alert",
    "mandatoryInFaculty": true
  },
  {
    "code": "40137",
    "name": "PREPARACIÓN EXAMEN HABILITANTE PARA ABOGADOS",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Preparación de estudiantes y egresados de Derecho para el examen de Estado habilitante.",
    "guideline": "Entre 4 y 12 h/mes. Máximo 4 docentes en el programa de Derecho (en hoja DOCENCIA figura como 40134).",
    "baseHours": 4,
    "capHours": 12,
    "requiresViceRectorApproval": false,
    "appliesTo": "Exclusivo Facultad de Derecho (máximo 4 docentes)",
    "severity": "justifiable_alert"
  },
  {
    "code": "40123",
    "name": "DOCENTE CILCE (ORIENTACIÓN DE ESPACIOS Y CURSOS DE EXTENSIÓN - INSTITUTO DE LENGUAS)",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Orientación de niveles de lengua extranjera y cursos de extensión del CILCE.",
    "guideline": "Entre 20 y 80 h/mes para docentes adscritos al Instituto de Lenguas CILCE.",
    "baseHours": 20,
    "capHours": 80,
    "requiresViceRectorApproval": false,
    "appliesTo": "Exclusivo CILCE - Instituto de Lenguas",
    "severity": "justifiable_alert"
  },
  {
    "code": "40317",
    "name": "DOCENTE DE TUTORÍAS ACADÉMICAS DISCIPLINARES - PROYECTO INTEGRADOR",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Acompañamiento transversal de taller y proyecto integrador en Arquitectura.",
    "guideline": "Hasta 4 h/mes por docente. Solo aplica para la Facultad de Arquitectura; horas adicionales requieren aval V.A.",
    "baseHours": 4,
    "capHours": 4,
    "requiresViceRectorApproval": false,
    "appliesTo": "Exclusivo Facultad de Arquitectura",
    "severity": "justifiable_alert"
  },
  {
    "code": "40138",
    "name": "TUNJA GESTIÓN ACADÉMICA VIRTUAL POSGRADOS",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Gestión académica y acompañamiento de espacios en modalidad virtual de posgrados.",
    "guideline": "Entre 4 y 28 h/mes (nota INC-01: en la fila 20 de CÓDIGOS aparece duplicado con rango 4–20 h; en DOCENCIA rige 4–28 h).",
    "baseHours": 4,
    "capHours": 28,
    "requiresViceRectorApproval": false,
    "appliesTo": "Programas de posgrado en modalidad virtual",
    "severity": "justifiable_alert"
  },
  {
    "code": "40108",
    "name": "PLANEACIÓN, SEGUIMIENTO Y EVALUACIÓN - PSE",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Preparación de clase, diseño de material pedagógico, evaluación y atención a estudiantes.",
    "guideline": "Equivale automáticamente al 25 % de las horas de orientación de espacios académicos de pregrado (40104). Aplica a todos los docentes Tiempo Completo y Medio Tiempo.",
    "baseHours": null,
    "capHours": null,
    "psePercentage": 25,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todos los docentes Tiempo Completo y Medio Tiempo",
    "severity": "blocking",
    "mandatoryInFaculty": true
  },
  {
    "code": "40222",
    "name": "TUNJA DISEÑO DE CURSOS E-LEARNING",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Virtualización y producción de aulas o módulos digitales para pregrado y posgrado.",
    "guideline": "Entre 8 y 32 h/mes. Solamente se aprueba con proyecto avalado por Dirección de Campus Virtual y pre-aval de la Vicerrectoría Académica (ANEXO 3).",
    "baseHours": 8,
    "capHours": 32,
    "requiresViceRectorApproval": true,
    "annex3Format": "40222",
    "appliesTo": "Todas las unidades con proyecto aprobado por Campus Virtual",
    "severity": "justifiable_alert"
  },
  {
    "code": "40126",
    "name": "TUNJA ORIENTACIÓN DE ESPACIOS ACADÉMICOS Y CURSOS DE EXTENSIÓN",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Orientación de diplomados y cursos de extensión universitaria.",
    "guideline": "Entre 8 y 80 h/mes. Solamente se aprueba con aval de la Vicerrectoría Académica (ANEXO 3) adjuntando relación de cursos, cronograma y entregables.",
    "baseHours": 8,
    "capHours": 80,
    "requiresViceRectorApproval": true,
    "annex3Format": "40126",
    "appliesTo": "Facultades y direcciones académicas",
    "severity": "justifiable_alert"
  },
  {
    "code": "40106",
    "name": "TUNJA LÍDER DE CURRÍCULO FACULTAD/DEPTO ACADÉMICO/INSTITUTO DE LENGUAS",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Gestión curricular, actualización de PEP, renovación de registro calificado y comité curricular.",
    "guideline": "Uso obligatorio (mínimo 2 años de antigüedad en la USTA). Relación según ANEXO 5 y Lineamiento B-21: 16 h/mes pregrado (1 grupo), 20 h/mes pregrado (2+ grupos) o Ciencias Básicas/Humanidades, 16 h/mes CILCE, hasta 8 h/mes posgrado, 28–32 h/mes en renovación de registro calificado.",
    "baseHours": 8,
    "capHours": 60,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todas las unidades académicas (según tope ANEXO 5)",
    "severity": "justifiable_alert",
    "mandatoryInFaculty": true
  },
  {
    "code": "40117",
    "name": "TUNJA LÍDER DE ÁREA(S) DE CONOCIMIENTO",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Articulación de docentes por área disciplinar y participación en el comité curricular.",
    "guideline": "Entre 4 y 8 horas al mes por área de conocimiento. Debe asistir a las sesiones de Comité Curricular.",
    "baseHours": 4,
    "capHours": 8,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todas las facultades y direcciones académicas",
    "severity": "justifiable_alert"
  },
  {
    "code": "40318",
    "name": "DOCENTE DE TUTORÍAS ESPECIALIZADAS DE SUFICIENCIA EN LINGÜÍSTICA EN L1 – L2",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Tutorías especializadas en competencias comunicativas en lengua materna y extranjeras.",
    "guideline": "Entre 4 y 32 h/mes. Aplica solamente para Licenciatura en Español y Lenguas Extranjeras.",
    "baseHours": 4,
    "capHours": 32,
    "requiresViceRectorApproval": true,
    "annex3Format": "43401",
    "appliesTo": "Exclusivo Licenciatura en Español y Lenguas Extranjeras",
    "severity": "justifiable_alert"
  },
  {
    "code": "40614",
    "name": "TUNJA DOCENTE GESTOR VIRTUAL",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Gestión académica y curricular de programas en modalidad virtual.",
    "guideline": "Entre 20 y 80 h/mes en hoja CÓDIGOS (hasta 160 h/mes en hoja DOCENCIA). Aplica a programas virtuales (Esp. Estructuras, M. Geotecnia Vial, Esp. Gerencia de Mantenimiento, Esp. Cadena de Valor, etc.).",
    "baseHours": 20,
    "capHours": 80,
    "requiresViceRectorApproval": false,
    "appliesTo": "Programas virtuales autorizados",
    "severity": "justifiable_alert"
  },
  {
    "code": "43401",
    "name": "TUNJA DOCENTE DE TUTORÍA ESPECIALIZADA",
    "substantiveFunction": "Enseñanza-Aprendizaje",
    "definition": "Acompañamiento tutorial disciplinar especializado para permanencia y éxito estudiantil.",
    "guideline": "Entre 4 y 8 h/mes. Un docente por área disciplinar del programa (direcciones académicas: hasta 3 docentes por área de formación básica). Requiere aval de la Vicerrectoría Académica (ANEXO 3).",
    "baseHours": 4,
    "capHours": 8,
    "requiresViceRectorApproval": true,
    "annex3Format": "43401",
    "appliesTo": "Todos los programas y direcciones salvo Licenciatura",
    "severity": "justifiable_alert"
  },
  {
    "code": "20220",
    "name": "TUNJA LÍDER DE GESTIÓN DE RESPONSABILIDAD SOCIAL",
    "substantiveFunction": "Proyección Social",
    "definition": "Liderazgo de procesos de proyección social y responsabilidad social universitaria en la unidad.",
    "guideline": "Regla condicionada por unidad: Entre 12 y 16 h/mes para facultades SIN posgrados; entre 16 y 20 h/mes para facultades CON posgrados.",
    "baseHours": 12,
    "capHours": 16,
    "postgraduateCapHours": 20,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todas las facultades",
    "severity": "justifiable_alert"
  },
  {
    "code": "20131",
    "name": "TUNJA CONSULTORIOS JURÍDICOS",
    "substantiveFunction": "Proyección Social",
    "definition": "Asesoría jurídica gratuita y acompañamiento a estudiantes de Consultorio Jurídico.",
    "guideline": "Entre 16 y 56 h/mes por docente (exceso justificado ante V.A.); tope agregado de 320 h/mes en la Facultad de Derecho.",
    "baseHours": 16,
    "capHours": 56,
    "requiresViceRectorApproval": false,
    "appliesTo": "Exclusivo Facultad de Derecho",
    "severity": "justifiable_alert"
  },
  {
    "code": "20222",
    "name": "TUNJA OTROS CONSULTORIOS",
    "substantiveFunction": "Proyección Social",
    "definition": "Atención en consultorios empresariales, contables o de comercio exterior.",
    "guideline": "Entre 8 y 32 h/mes. Aplica para facultades de la División de Ciencias Económicas. Requiere aval de la Vicerrectoría Académica (ANEXO 3) con plan de acción.",
    "baseHours": 8,
    "capHours": 32,
    "requiresViceRectorApproval": true,
    "annex3Format": "20222",
    "appliesTo": "Administración de Empresas, Contaduría Pública y Negocios Internacionales",
    "severity": "justifiable_alert"
  },
  {
    "code": "20110",
    "name": "TUNJA CLASES PRENOVICIADO",
    "substantiveFunction": "Proyección Social",
    "definition": "Formación académica y humanística en el programa de Prenoviciado.",
    "guideline": "Entre 4 y 32 h/mes según programación aprobada.",
    "baseHours": 4,
    "capHours": 32,
    "requiresViceRectorApproval": false,
    "appliesTo": "Unidades designadas para apoyo al Prenoviciado",
    "severity": "justifiable_alert"
  },
  {
    "code": "20223",
    "name": "DIRECCIÓN Y/O ASESORÍA EN OPCIONES DE GRADO DE ORDEN SOCIAL, EMPRESARIAL (PREGRADO Y POSGRADO)",
    "substantiveFunction": "Proyección Social",
    "definition": "Dirección o asesoría de trabajos de grado en modalidad de proyección social o empresarial.",
    "guideline": "Entre 2 y 24 h/mes (2 h por proyecto en hoja PS / hasta 4 h en CÓDIGOS). Requiere aval de la Vicerrectoría Académica (ANEXO 3) presentando listado de proyectos aprobados por comité curricular.",
    "baseHours": 2,
    "capHours": 24,
    "hoursPerUnitFactor": 2,
    "unitLabel": "proyectos sociales/empresariales",
    "requiresViceRectorApproval": true,
    "annex3Format": "20223_20120",
    "appliesTo": "Programas con opción de grado social o empresarial",
    "severity": "justifiable_alert"
  },
  {
    "code": "20120",
    "name": "TUNJA PRÁCTICAS PEDAGÓGICAS, PROFESIONALES, PASANTÍAS",
    "substantiveFunction": "Proyección Social",
    "definition": "Seguimiento a prácticas profesionales, pedagógicas o pasantías como opción de grado.",
    "guideline": "Entre 2 y 16 h/mes (2 h por práctica). Solamente aplica para programas que incluyan la práctica como opción de grado; se excluye si la práctica ya es un espacio académico con docente asignado en 40104 (Lineamiento B-13).",
    "baseHours": 2,
    "capHours": 16,
    "hoursPerUnitFactor": 2,
    "unitLabel": "prácticas/pasantías",
    "requiresViceRectorApproval": true,
    "annex3Format": "20223_20120",
    "appliesTo": "Programas con práctica social/profesional como opción de grado",
    "severity": "justifiable_alert"
  },
  {
    "code": "20311",
    "name": "COORDINADOR DE PRÁCTICA PEDAGÓGICA E INVESTIGATIVA EN ELE, L1 Y L2",
    "substantiveFunction": "Proyección Social",
    "definition": "Coordinación de convenios y escenarios de práctica pedagógica en Licenciatura.",
    "guideline": "Entre 8 y 32 h/mes. Aplica exclusivamente para Licenciatura en Español y Lenguas Extranjeras.",
    "baseHours": 8,
    "capHours": 32,
    "requiresViceRectorApproval": false,
    "appliesTo": "Exclusivo Licenciatura en Español y Lenguas Extranjeras",
    "severity": "justifiable_alert"
  },
  {
    "code": "20225",
    "name": "TUNJA EDUCACIÓN CONTINUA (SUMMA)",
    "substantiveFunction": "Proyección Social",
    "definition": "Gestión y estructuración de oferta de educación continua SUMMA en la facultad.",
    "guideline": "Entre 8 y 16 h/mes. Máximo un (1) docente por facultad.",
    "baseHours": 8,
    "capHours": 16,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todas las facultades (1 docente por facultad)",
    "severity": "justifiable_alert"
  },
  {
    "code": "20502",
    "name": "TUNJA GESTIÓN DE LOS GRADUADOS",
    "substantiveFunction": "Proyección Social",
    "definition": "Seguimiento, empleabilidad y articulación con graduados de pregrado y posgrado.",
    "guideline": "Un docente por facultad. Horas asignadas según número de graduados en el ANEXO 6 (4, 8, 12, 16, 24 o 32 h/mes). La suma de la facultad debe coincidir con el ANEXO 6.",
    "baseHours": 4,
    "capHours": 32,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todas las facultades (según tope ANEXO 6)",
    "severity": "justifiable_alert",
    "mandatoryInFaculty": true
  },
  {
    "code": "10340",
    "name": "DOCENTE EDITOR DE REVISTAS CIENTÍFICAS / REPRESENTANTE COMITÉ EDITORIAL",
    "substantiveFunction": "Investigación",
    "definition": "Edición de revistas científicas indexadas de las divisiones o departamentos.",
    "guideline": "Entre 8 y 80 h/mes (hasta 40 h/mes por revista). Según relación del ANEXO 7.",
    "baseHours": 8,
    "capHours": 80,
    "hoursPerUnitFactor": 40,
    "unitLabel": "revistas científicas",
    "requiresViceRectorApproval": false,
    "appliesTo": "Divisiones con revistas científicas (según ANEXO 7)",
    "severity": "justifiable_alert"
  },
  {
    "code": "13315",
    "name": "TUNJA DOCENTE EDITOR DE REVISTAS DE DIVULGACIÓN",
    "substantiveFunction": "Investigación",
    "definition": "Edición de revistas institucionales de divulgación académica.",
    "guideline": "Entre 8 y 40 h/mes (hasta 20 horas por revista). Según relación del ANEXO 7.",
    "baseHours": 8,
    "capHours": 40,
    "hoursPerUnitFactor": 20,
    "unitLabel": "revistas de divulgación",
    "requiresViceRectorApproval": false,
    "appliesTo": "Unidades con revistas de divulgación (según ANEXO 7)",
    "severity": "justifiable_alert"
  },
  {
    "code": "10334",
    "name": "TUNJA DOCENTE COEDITOR O ASISTENTE DE REVISTAS CIENTÍFICAS",
    "substantiveFunction": "Investigación",
    "definition": "Coedición y asistencia editorial de revistas científicas indexadas.",
    "guideline": "Entre 8 y 20 h/mes (hasta 40 h con dos revistas según hoja INVESTIGACIÓN). No aplica para revistas de divulgación.",
    "baseHours": 8,
    "capHours": 20,
    "hoursPerUnitFactor": 20,
    "unitLabel": "revistas científicas",
    "requiresViceRectorApproval": false,
    "appliesTo": "Divisiones con revistas científicas (según ANEXO 7)",
    "severity": "justifiable_alert"
  },
  {
    "code": "10224",
    "name": "TUNJA DOCENTE DIRECTOR DE POSDOCTORADO",
    "substantiveFunction": "Investigación",
    "definition": "Dirección y acompañamiento de estancias posdoctorales.",
    "guideline": "En CÓDIGOS: 20–80 h/mes; en INVESTIGACIÓN: hasta 12 h/mes (4 h por estancia posdoctoral, máximo 3). Solo aplica para Derecho.",
    "baseHours": 4,
    "capHours": 80,
    "requiresViceRectorApproval": false,
    "appliesTo": "Exclusivo Facultad de Derecho",
    "severity": "justifiable_alert"
  },
  {
    "code": "10384",
    "name": "DOCENTE COORDINADOR DE INVESTIGACIÓN DE FACULTAD/DPTO ACADÉMICO/INSTITUTO DE LENGUAS",
    "substantiveFunction": "Investigación",
    "definition": "Coordinación de procesos de investigación formativa y propiamente dicha en la unidad.",
    "guideline": "Entre 8 y 16 h/mes según relación del ANEXO 7 de Investigación.",
    "baseHours": 8,
    "capHours": 16,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todas las facultades y direcciones académicas",
    "severity": "justifiable_alert"
  },
  {
    "code": "10318",
    "name": "TUNJA LÍDERES GRUPOS DE INVESTIGACIÓN",
    "substantiveFunction": "Investigación",
    "definition": "Dirección y gestión de grupos de investigación categorizados o reconocidos.",
    "guideline": "Entre 4 y 8 h/mes. Un docente por grupo de investigación según ANEXO 7.",
    "baseHours": 4,
    "capHours": 8,
    "requiresViceRectorApproval": false,
    "appliesTo": "Facultades con grupos de investigación (según ANEXO 7)",
    "severity": "justifiable_alert"
  },
  {
    "code": "10336",
    "name": "TUNJA DESARROLLO DE PROYECTOS DE INVESTIGACIÓN",
    "substantiveFunction": "Investigación",
    "definition": "Ejecución de proyectos de investigación internos (FODEIN) o externos vigentes.",
    "guideline": "Horas asignadas estrictamente según lo aprobado en las convocatorias de investigación y el ANEXO 7 (Lineamiento B-28).",
    "baseHours": 4,
    "capHours": 80,
    "requiresViceRectorApproval": false,
    "appliesTo": "Docentes con proyecto activo en ANEXO 7",
    "severity": "justifiable_alert"
  },
  {
    "code": "10225",
    "name": "TUNJA DOCENTE CEDETS",
    "substantiveFunction": "Investigación",
    "definition": "Investigación y proyección adscrita al Centro de Estudios para el Desarrollo Territorial (CEDETS).",
    "guideline": "Entre 8 y 20 h/mes según convocatoria de la Dirección de Investigación e Innovación (ANEXO 7).",
    "baseHours": 8,
    "capHours": 20,
    "requiresViceRectorApproval": false,
    "appliesTo": "Docentes asignados en ANEXO 7",
    "severity": "justifiable_alert"
  },
  {
    "code": "10416",
    "name": "TUNJA DOCENTE APOYO CITECDES",
    "substantiveFunction": "Investigación",
    "definition": "Apoyo a proyectos en el Centro de Investigación e Innovación en Ingeniería (CITECDES).",
    "guideline": "Entre 8 y 20 h/mes según relación del ANEXO 7 (en ANEXO 2 aparece como columna CITECDES).",
    "baseHours": 8,
    "capHours": 20,
    "requiresViceRectorApproval": false,
    "appliesTo": "Facultades de Ingeniería (según ANEXO 7)",
    "severity": "justifiable_alert"
  },
  {
    "code": "10226",
    "name": "TUNJA DOCENTE SICDDI",
    "substantiveFunction": "Investigación",
    "definition": "Dedicación escalafonada de investigación según el Acuerdo 3 del 19/03/2025.",
    "guideline": "Horas FIJAS no modificables por el decano según Nivel SICDDI: Nivel I = 20 h/mes, Nivel II = 80 h/mes, Nivel III = 136 h/mes. Todas las demás actividades de investigación del docente quedan incluidas bajo SICDDI.",
    "baseHours": 20,
    "capHours": 136,
    "requiresViceRectorApproval": false,
    "appliesTo": "Docentes categorizados en SICDDI 2026 (ANEXO 7)",
    "severity": "blocking",
    "lockedByResearch": true
  },
  {
    "code": "10426",
    "name": "TUNJA DOCENTE LIVING LAB",
    "substantiveFunction": "Investigación",
    "definition": "Proyectos de innovación abierta y laboratorio vivo (Living Lab).",
    "guideline": "En CÓDIGOS: 8–20 h/mes (en INVESTIGACIÓN: 12–60 h/mes). Asignación directa por la Vicerrectoría Académica.",
    "baseHours": 8,
    "capHours": 60,
    "requiresViceRectorApproval": true,
    "annex3Format": "10212",
    "appliesTo": "Docentes seleccionados por la Vicerrectoría Académica (ANEXO 7)",
    "severity": "justifiable_alert"
  },
  {
    "code": "10383",
    "name": "TUNJA COMITÉ INSTITUCIONAL DE ÉTICA Y BIOÉTICA DE INVESTIGACIÓN",
    "substantiveFunction": "Investigación",
    "definition": "Participación como miembro activo del Comité de Ética e Integridad Científica.",
    "guideline": "Entre 1 y 4 h/mes; solo aplica para docentes avalados por la Dirección de Investigación en el ANEXO 7.",
    "baseHours": 1,
    "capHours": 4,
    "requiresViceRectorApproval": false,
    "appliesTo": "Docentes designados en ANEXO 7",
    "severity": "justifiable_alert"
  },
  {
    "code": "10364",
    "name": "TUNJA FORMACIÓN EN CAPACIDADES CTeI",
    "substantiveFunction": "Investigación",
    "definition": "Tutoría de semilleros de investigación y grupos de estudio estudiantiles.",
    "guideline": "Hasta 4 h/mes por cada estrategia CTeI liderada (semillero o grupo de estudio registrado ante Investigación). Tope: 12 h en CÓDIGOS / 16 h en INVESTIGACIÓN.",
    "baseHours": 4,
    "capHours": 16,
    "hoursPerUnitFactor": 4,
    "unitLabel": "semilleros/estrategias CTeI",
    "requiresViceRectorApproval": false,
    "appliesTo": "Unidades con semilleros o grupos de estudio activos",
    "severity": "justifiable_alert"
  },
  {
    "code": "10212",
    "name": "DIRECCIÓN Y/O ASESORÍA EN OPCIONES DE GRADO DE ORDEN INVESTIGATIVO (PREGRADO Y POSGRADO)",
    "substantiveFunction": "Investigación",
    "definition": "Dirección de trabajos de grado, monografías o proyectos de investigación en pregrado y posgrado.",
    "guideline": "Entre 4 y 24 h/mes (hasta 4 h/mes por proyecto dirigido). Requiere aprobación de la Vicerrectoría Académica (ANEXO 3) presentando listado de proyectos y aval del comité curricular.",
    "baseHours": 4,
    "capHours": 24,
    "hoursPerUnitFactor": 4,
    "unitLabel": "proyectos de grado investigativos",
    "requiresViceRectorApproval": true,
    "annex3Format": "10212",
    "appliesTo": "Todas las facultades",
    "severity": "justifiable_alert"
  },
  {
    "code": "30420",
    "name": "TUNJA GESTIÓN DE LA INTERNACIONALIZACIÓN",
    "substantiveFunction": "Gestión Académica",
    "definition": "Movilidad académica, clases espejo, COIL y convenios internacionales del programa.",
    "guideline": "Entre 4 y 8 horas al mes por unidad académica.",
    "baseHours": 4,
    "capHours": 8,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todas las facultades y direcciones académicas",
    "severity": "justifiable_alert"
  },
  {
    "code": "30411",
    "name": "TUNJA LÍDER ASEGURAMIENTO DE LA CALIDAD UNIVERSITARIA",
    "substantiveFunction": "Gestión Académica",
    "definition": "Procesos de autoevaluación, acreditación en alta calidad y planes de mejoramiento.",
    "guideline": "Mínimo 2 años de antigüedad en la USTA. Relación según ANEXO 5 y Lineamiento B-22: Programas acreditados 32 h/mes, acreditables 20 h/mes, pregrados 16 h/mes, posgrados 12 h/mes, programas nuevos 4–8 h/mes.",
    "baseHours": 4,
    "capHours": 60,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todas las unidades académicas (según tope ANEXO 5)",
    "severity": "justifiable_alert",
    "mandatoryInFaculty": true
  },
  {
    "code": "30222",
    "name": "TUNJA DECANO DE FACULTAD O DIRECTOR DEPARTAMENTO ACADÉMICO",
    "substantiveFunction": "Gestión Académica",
    "definition": "Dirección académico-administrativa de la facultad o dirección académica.",
    "guideline": "Hasta 240 horas al mes. Por Lineamiento B-12, todo Decano o Director Académico DEBE orientar al menos un espacio académico de pregrado (40104) o posgrado (40006).",
    "baseHours": null,
    "capHours": 240,
    "requiresViceRectorApproval": false,
    "appliesTo": "Decanos de Facultad y Directores Académicos",
    "severity": "justifiable_alert"
  },
  {
    "code": "30223",
    "name": "TUNJA DIRECTOR DE DEPENDENCIAS ACADÉMICO-ADMINISTRATIVAS",
    "substantiveFunction": "Gestión Académica",
    "definition": "Dirección de unidades académico-administrativas de la Seccional.",
    "guideline": "Hasta 240 horas al mes según nombramiento.",
    "baseHours": null,
    "capHours": 240,
    "requiresViceRectorApproval": false,
    "appliesTo": "Directores de dependencias académico-administrativas",
    "severity": "justifiable_alert"
  },
  {
    "code": "30224",
    "name": "TUNJA SECRETARIOS DE DIVISIÓN",
    "substantiveFunction": "Gestión Académica",
    "definition": "Gestión académico-administrativa de Secretaría de División y apoyo en planeación horaria.",
    "guideline": "Hasta 240 horas al mes. Por Lineamiento B-12, los Secretarios de División deben orientar un espacio académico de pregrado (40104) o posgrado (40006).",
    "baseHours": null,
    "capHours": 240,
    "requiresViceRectorApproval": false,
    "appliesTo": "Secretarios de División",
    "severity": "justifiable_alert"
  },
  {
    "code": "30407",
    "name": "TUNJA DIRECTOR DE PROGRAMA DE POSGRADOS",
    "substantiveFunction": "Gestión Académica",
    "definition": "Dirección académica y administrativa de programas de posgrado.",
    "guideline": "Hasta 240 h/mes (hasta 80 h/mes en posdoctorado). Debe orientar un módulo en posgrado registrado bajo código 40006.",
    "baseHours": null,
    "capHours": 240,
    "requiresViceRectorApproval": false,
    "appliesTo": "Directores de Posgrados",
    "severity": "justifiable_alert"
  },
  {
    "code": "30225",
    "name": "TUNJA LICENCIA DE MATERNIDAD",
    "substantiveFunction": "Gestión Académica",
    "definition": "Novedad de nómina por licencia legal de maternidad.",
    "guideline": "Hasta 160 horas al mes según soporte de Gestión del Talento Humano.",
    "baseHours": null,
    "capHours": 160,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todas las unidades académicas",
    "severity": "informative"
  },
  {
    "code": "30228",
    "name": "TUNJA INCAPACIDAD",
    "substantiveFunction": "Gestión Académica",
    "definition": "Novedad de nómina por incapacidad médica prolongada.",
    "guideline": "Hasta 160 horas al mes según soporte de Gestión del Talento Humano.",
    "baseHours": null,
    "capHours": 160,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todas las unidades académicas",
    "severity": "informative"
  },
  {
    "code": "30307",
    "name": "TUNJA CENTRO DE DOCUMENTACIÓN",
    "substantiveFunction": "Gestión Académica",
    "definition": "Coordinación y curaduría del Centro de Documentación de Arquitectura.",
    "guideline": "Entre 4 y 16 h/mes. Solo aplica para la Facultad de Arquitectura.",
    "baseHours": 4,
    "capHours": 16,
    "requiresViceRectorApproval": false,
    "appliesTo": "Exclusivo Facultad de Arquitectura",
    "severity": "justifiable_alert"
  },
  {
    "code": "LACT-MAT",
    "name": "TUNJA LACTANCIA MATERNA (SIN CÓDIGO SAC EN ANEXO 4)",
    "substantiveFunction": "Gestión Académica",
    "definition": "Hora de lactancia materna legalmente reconocida.",
    "guideline": "Entre 10 y 20 h/mes. Se asigna con aval de la Dirección de Gestión del Talento Humano (INC-14).",
    "baseHours": 10,
    "capHours": 20,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todas las unidades con aval de Talento Humano",
    "severity": "justifiable_alert"
  },
  {
    "code": "30312",
    "name": "TUNJA DOCENTE COORDINADOR PROMOCIÓN DE PROGRAMAS PREGRADO Y POSGRADO",
    "substantiveFunction": "Gestión Académica",
    "definition": "Actividades de promoción, mercadeo académico y visitas a colegios/empresas.",
    "guideline": "Entre 4 y 8 horas al mes para todos los programas activos.",
    "baseHours": 4,
    "capHours": 8,
    "requiresViceRectorApproval": false,
    "appliesTo": "Todas las facultades con pregrado activo",
    "severity": "justifiable_alert"
  }
];

export const ACADEMIC_UNITS_SEED: AcademicUnitSummary[] = [
  {
    "id": "ing-industrial",
    "name": "Ingeniería Industrial",
    "division": "División de Arquitectura e Ingenierías",
    "unitType": "Facultad",
    "hasPostgraduates": true,
    "deanName": "Gloria Elizabeth Grimaldo León",
    "payrollStatus": "En Revisión",
    "currentVersion": 2,
    "updatedAt": "2026-07-08 16:40",
    "qualityCap30411": 32,
    "curriculumCap40106": 20,
    "seaCap40109": 8,
    "saberProCap40127": 20,
    "graduatesCap20502": 12,
    "totalTeachers": 12,
    "pendingAlerts": 3,
    "pendingApprovals": 1
  },
  {
    "id": "ing-mecanica",
    "name": "Ingeniería Mecánica",
    "division": "División de Arquitectura e Ingenierías",
    "unitType": "Facultad",
    "hasPostgraduates": true,
    "deanName": "Helver Muñoz",
    "payrollStatus": "Enviada",
    "currentVersion": 1,
    "updatedAt": "2026-07-07 11:15",
    "qualityCap30411": 44,
    "curriculumCap40106": 24,
    "seaCap40109": 8,
    "saberProCap40127": 12,
    "graduatesCap20502": 12,
    "totalTeachers": 12,
    "pendingAlerts": 5,
    "pendingApprovals": 2
  },
  {
    "id": "ing-sistemas",
    "name": "Ingeniería de Sistemas",
    "division": "División de Arquitectura e Ingenierías",
    "unitType": "Facultad",
    "hasPostgraduates": true,
    "deanName": "William Mauricio Rojas Contreras",
    "payrollStatus": "Devuelta con Observaciones",
    "currentVersion": 1,
    "updatedAt": "2026-07-06 17:20",
    "qualityCap30411": 28,
    "curriculumCap40106": 44,
    "seaCap40109": 12,
    "saberProCap40127": 20,
    "graduatesCap20502": 16,
    "totalTeachers": 13,
    "pendingAlerts": 2,
    "pendingApprovals": 1
  },
  {
    "id": "adm-empresas",
    "name": "Administración de Empresas",
    "division": "División de Ciencias Económicas, Administrativas y Contables",
    "unitType": "Facultad",
    "hasPostgraduates": true,
    "deanName": "Claudia Patricia Motta Niño",
    "payrollStatus": "Avalada",
    "currentVersion": 2,
    "updatedAt": "2026-07-08 09:30",
    "qualityCap30411": 80,
    "curriculumCap40106": 60,
    "seaCap40109": 24,
    "saberProCap40127": 12,
    "graduatesCap20502": 16,
    "totalTeachers": 10,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  },
  {
    "id": "ing-ambiental",
    "name": "Ingeniería Ambiental",
    "division": "División de Arquitectura e Ingenierías",
    "unitType": "Facultad",
    "hasPostgraduates": true,
    "deanName": "Érika Johana Solano Niño",
    "payrollStatus": "Avalada",
    "currentVersion": 1,
    "updatedAt": "2026-07-07 14:10",
    "qualityCap30411": 28,
    "curriculumCap40106": 24,
    "seaCap40109": 8,
    "saberProCap40127": 12,
    "graduatesCap20502": 8,
    "totalTeachers": 8,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  },
  {
    "id": "derecho",
    "name": "Derecho",
    "division": "División de Ciencias Jurídicas y Políticas",
    "unitType": "Facultad",
    "hasPostgraduates": true,
    "deanName": "Nubia Lorena Daza López",
    "payrollStatus": "Borrador",
    "currentVersion": 1,
    "updatedAt": "2026-07-05 10:00",
    "qualityCap30411": 138,
    "curriculumCap40106": 104,
    "seaCap40109": 48,
    "saberProCap40127": 24,
    "graduatesCap20502": 32,
    "totalTeachers": 44,
    "pendingAlerts": 4,
    "pendingApprovals": 2
  },
  {
    "id": "ing-civil",
    "name": "Ingeniería Civil",
    "division": "División de Arquitectura e Ingenierías",
    "unitType": "Facultad",
    "hasPostgraduates": true,
    "deanName": "Jorge Enrique Vargas Torres",
    "payrollStatus": "En Revisión",
    "currentVersion": 1,
    "updatedAt": "2026-07-08 10:05",
    "qualityCap30411": 132,
    "curriculumCap40106": 68,
    "seaCap40109": 32,
    "saberProCap40127": 20,
    "graduatesCap20502": 32,
    "totalTeachers": 19,
    "pendingAlerts": 1,
    "pendingApprovals": 1
  },
  {
    "id": "arquitectura",
    "name": "Arquitectura",
    "division": "División de Arquitectura e Ingenierías",
    "unitType": "Facultad",
    "hasPostgraduates": true,
    "deanName": "Carlos Andrés Niño Bautista",
    "payrollStatus": "Avalada",
    "currentVersion": 1,
    "updatedAt": "2026-07-06 15:00",
    "qualityCap30411": 32,
    "curriculumCap40106": 24,
    "seaCap40109": 16,
    "saberProCap40127": 20,
    "graduatesCap20502": 24,
    "totalTeachers": 21,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  },
  {
    "id": "contaduria",
    "name": "Contaduría Pública",
    "division": "División de Ciencias Económicas, Administrativas y Contables",
    "unitType": "Facultad",
    "hasPostgraduates": true,
    "deanName": "Sandra Milena Gómez Buitrago",
    "payrollStatus": "Avalada",
    "currentVersion": 1,
    "updatedAt": "2026-07-07 16:00",
    "qualityCap30411": 32,
    "curriculumCap40106": 44,
    "seaCap40109": 16,
    "saberProCap40127": 12,
    "graduatesCap20502": 16,
    "totalTeachers": 7,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  },
  {
    "id": "negocios-int",
    "name": "Negocios Internacionales",
    "division": "División de Ciencias Económicas, Administrativas y Contables",
    "unitType": "Facultad",
    "hasPostgraduates": true,
    "deanName": "Luz Ángela Martínez Camacho",
    "payrollStatus": "En Revisión",
    "currentVersion": 1,
    "updatedAt": "2026-07-08 11:20",
    "qualityCap30411": 32,
    "curriculumCap40106": 44,
    "seaCap40109": 8,
    "saberProCap40127": 20,
    "graduatesCap20502": 12,
    "totalTeachers": 13,
    "pendingAlerts": 1,
    "pendingApprovals": 0
  },
  {
    "id": "ing-electronica",
    "name": "Ingeniería Electrónica",
    "division": "División de Arquitectura e Ingenierías",
    "unitType": "Facultad",
    "hasPostgraduates": true,
    "deanName": "Édgar Camilo Pedraza Moreno",
    "payrollStatus": "Avalada",
    "currentVersion": 1,
    "updatedAt": "2026-07-07 15:45",
    "qualityCap30411": 52,
    "curriculumCap40106": 40,
    "seaCap40109": 8,
    "saberProCap40127": 12,
    "graduatesCap20502": 12,
    "totalTeachers": 10,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  },
  {
    "id": "bioingenieria",
    "name": "Bioingeniería",
    "division": "División de Arquitectura e Ingenierías",
    "unitType": "Facultad",
    "hasPostgraduates": false,
    "deanName": "Lina María Zambrano Castellanos",
    "payrollStatus": "Avalada",
    "currentVersion": 1,
    "updatedAt": "2026-07-06 14:20",
    "qualityCap30411": 12,
    "curriculumCap40106": 16,
    "seaCap40109": 8,
    "saberProCap40127": 8,
    "graduatesCap20502": 0,
    "totalTeachers": 9,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  },
  {
    "id": "ing-datos-ia",
    "name": "Ingeniería de Datos e Inteligencia Artificial",
    "division": "División de Arquitectura e Ingenierías",
    "unitType": "Facultad",
    "hasPostgraduates": false,
    "deanName": "Alejandro Vela Quintero",
    "payrollStatus": "Avalada",
    "currentVersion": 1,
    "updatedAt": "2026-07-06 16:10",
    "qualityCap30411": 4,
    "curriculumCap40106": 16,
    "seaCap40109": 8,
    "saberProCap40127": 8,
    "graduatesCap20502": 0,
    "totalTeachers": 6,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  },
  {
    "id": "cultura-fisica",
    "name": "Cultura Física, Deporte y Recreación",
    "division": "División de Ciencias de la Salud",
    "unitType": "Facultad",
    "hasPostgraduates": true,
    "deanName": "Mauricio Hernán Salamanca Rincón",
    "payrollStatus": "Avalada",
    "currentVersion": 1,
    "updatedAt": "2026-07-07 10:30",
    "qualityCap30411": 10,
    "curriculumCap40106": 16,
    "seaCap40109": 16,
    "saberProCap40127": 12,
    "graduatesCap20502": 8,
    "totalTeachers": 12,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  },
  {
    "id": "diseno-interaccion",
    "name": "Diseño de Interacción",
    "division": "División de Ciencias Sociales y de la Educación",
    "unitType": "Facultad",
    "hasPostgraduates": false,
    "deanName": "Tatiana Marcela Pineda Vargas",
    "payrollStatus": "Avalada",
    "currentVersion": 1,
    "updatedAt": "2026-07-07 12:00",
    "qualityCap30411": 16,
    "curriculumCap40106": 16,
    "seaCap40109": 8,
    "saberProCap40127": 12,
    "graduatesCap20502": 4,
    "totalTeachers": 8,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  },
  {
    "id": "lic-lenguas",
    "name": "Licenciatura en Español y Lenguas Extranjeras",
    "division": "División de Ciencias Sociales y de la Educación",
    "unitType": "Facultad",
    "hasPostgraduates": true,
    "deanName": "Martha Cecilia Cárdenas Bohórquez",
    "payrollStatus": "Avalada",
    "currentVersion": 1,
    "updatedAt": "2026-07-07 17:00",
    "qualityCap30411": 16,
    "curriculumCap40106": 20,
    "seaCap40109": 8,
    "saberProCap40127": 0,
    "graduatesCap20502": 0,
    "totalTeachers": 17,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  },
  {
    "id": "lic-infantil",
    "name": "Licenciatura en Educación Infantil Bilingüe",
    "division": "División de Ciencias Sociales y de la Educación",
    "unitType": "Facultad",
    "hasPostgraduates": false,
    "deanName": "Yolanda Patricia Fonseca Arias",
    "payrollStatus": "Avalada",
    "currentVersion": 1,
    "updatedAt": "2026-07-07 17:15",
    "qualityCap30411": 0,
    "curriculumCap40106": 8,
    "seaCap40109": 4,
    "saberProCap40127": 0,
    "graduatesCap20502": 0,
    "totalTeachers": 3,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  },
  {
    "id": "marketing",
    "name": "Marketing y Transformación Digital",
    "division": "División de Ciencias Económicas, Administrativas y Contables",
    "unitType": "Facultad",
    "hasPostgraduates": false,
    "deanName": "Daniel Esteban Mendoza Prieto",
    "payrollStatus": "Avalada",
    "currentVersion": 1,
    "updatedAt": "2026-07-07 09:50",
    "qualityCap30411": 4,
    "curriculumCap40106": 16,
    "seaCap40109": 8,
    "saberProCap40127": 8,
    "graduatesCap20502": 0,
    "totalTeachers": 8,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  },
  {
    "id": "ciencias-basicas",
    "name": "Departamento de Ciencias Básicas",
    "division": "Direcciones Académicas Transversales",
    "unitType": "Dirección Académica",
    "hasPostgraduates": false,
    "deanName": "Dirección Ciencias Básicas",
    "payrollStatus": "En Revisión",
    "currentVersion": 1,
    "updatedAt": "2026-07-08 08:30",
    "qualityCap30411": 0,
    "curriculumCap40106": 20,
    "seaCap40109": 8,
    "saberProCap40127": 60,
    "graduatesCap20502": 0,
    "totalTeachers": 25,
    "pendingAlerts": 1,
    "pendingApprovals": 0
  },
  {
    "id": "humanidades",
    "name": "Departamento de Humanidades y Formación Integral",
    "division": "Direcciones Académicas Transversales",
    "unitType": "Dirección Académica",
    "hasPostgraduates": false,
    "deanName": "Dirección Humanidades",
    "payrollStatus": "Avalada",
    "currentVersion": 1,
    "updatedAt": "2026-07-07 16:40",
    "qualityCap30411": 0,
    "curriculumCap40106": 20,
    "seaCap40109": 8,
    "saberProCap40127": 40,
    "graduatesCap20502": 0,
    "totalTeachers": 21,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  },
  {
    "id": "cilce",
    "name": "CILCE - Instituto de Lenguas",
    "division": "Direcciones Académicas Transversales",
    "unitType": "Dirección Académica",
    "hasPostgraduates": false,
    "deanName": "Dirección CILCE",
    "payrollStatus": "Avalada",
    "currentVersion": 1,
    "updatedAt": "2026-07-07 15:10",
    "qualityCap30411": 16,
    "curriculumCap40106": 16,
    "seaCap40109": 8,
    "saberProCap40127": 40,
    "graduatesCap20502": 0,
    "totalTeachers": 13,
    "pendingAlerts": 0,
    "pendingApprovals": 0
  }
];

export const PROGRAM_QUOTAS_ANNEX5_SEED: ProgramQuotaAnnex5[] = [
  {
    "id": "p-adm-1",
    "unitId": "adm-empresas",
    "unitName": "Administración de Empresas",
    "programName": "ADMINISTRACIÓN DE EMPRESAS",
    "level": "Pregrado",
    "modality": "Presencial",
    "accreditationStatus": "Programa Acreditado · Proceso de Autoevaluación",
    "quality30411": 32,
    "curriculum40106": 16,
    "sea40109": 8,
    "saberPro40127": 12,
    "isActive": true
  },
  {
    "id": "p-adm-2",
    "unitId": "adm-empresas",
    "unitName": "Administración de Empresas",
    "programName": "ESPECIALIZACIÓN EN INNOVACIÓN Y MARKETING",
    "level": "Posgrado",
    "modality": "Presencial",
    "accreditationStatus": "Registro Calificado Vigente",
    "quality30411": 12,
    "curriculum40106": 8,
    "sea40109": 4,
    "saberPro40127": 0,
    "isActive": true
  },
  {
    "id": "p-adm-3",
    "unitId": "adm-empresas",
    "unitName": "Administración de Empresas",
    "programName": "ESPECIALIZACIÓN EN GOBIERNO Y GESTIÓN TERRITORIAL",
    "level": "Posgrado",
    "modality": "Presencial",
    "accreditationStatus": "Proceso de Autoevaluación",
    "quality30411": 12,
    "curriculum40106": 8,
    "sea40109": 4,
    "saberPro40127": 0,
    "isActive": true
  },
  {
    "id": "p-adm-4",
    "unitId": "adm-empresas",
    "unitName": "Administración de Empresas",
    "programName": "ESPECIALIZACIÓN EN AUDITORÍA DE SALUD",
    "level": "Posgrado",
    "modality": "Presencial",
    "accreditationStatus": "Renovación de Registro Calificado",
    "quality30411": 12,
    "curriculum40106": 20,
    "curriculumNotes": "Renovación de Registro Calificado",
    "sea40109": 4,
    "saberPro40127": 0,
    "isActive": true
  },
  {
    "id": "p-adm-5",
    "unitId": "adm-empresas",
    "unitName": "Administración de Empresas",
    "programName": "MAESTRÍA EN ADMINISTRACIÓN",
    "level": "Posgrado",
    "modality": "Presencial",
    "accreditationStatus": "Registro Calificado Vigente",
    "quality30411": 12,
    "curriculum40106": 8,
    "sea40109": 4,
    "saberPro40127": 0,
    "isActive": true
  },
  {
    "id": "p-ind-1",
    "unitId": "ing-industrial",
    "unitName": "Ingeniería Industrial",
    "programName": "INGENIERÍA INDUSTRIAL",
    "level": "Pregrado",
    "modality": "Presencial",
    "accreditationStatus": "Inicia Proceso de Acreditación",
    "quality30411": 24,
    "qualityNotes": "Inicia Proceso de Acreditación",
    "curriculum40106": 20,
    "sea40109": 8,
    "saberPro40127": 20,
    "isActive": true
  },
  {
    "id": "p-ind-2",
    "unitId": "ing-industrial",
    "unitName": "Ingeniería Industrial",
    "programName": "ESPECIALIZACIÓN EN GERENCIA DE LA CADENA DE VALOR Y PRODUCTIVIDAD",
    "level": "Posgrado",
    "modality": "Virtual",
    "accreditationStatus": "Proceso de Autoevaluación",
    "quality30411": 8,
    "qualityNotes": "Proceso de Autoevaluación",
    "curriculum40106": 0,
    "curriculumNotes": "Las funciones de gestión curricular son asumidas por el gestor virtual (40614)",
    "sea40109": 0,
    "saberPro40127": 0,
    "isActive": false
  },
  {
    "id": "p-mec-1",
    "unitId": "ing-mecanica",
    "unitName": "Ingeniería Mecánica",
    "programName": "INGENIERÍA MECÁNICA",
    "level": "Pregrado",
    "modality": "Presencial",
    "accreditationStatus": "Registro Calificado Vigente",
    "quality30411": 16,
    "curriculum40106": 16,
    "sea40109": 8,
    "saberPro40127": 12,
    "isActive": true
  },
  {
    "id": "p-mec-2",
    "unitId": "ing-mecanica",
    "unitName": "Ingeniería Mecánica",
    "programName": "ESPECIALIZACIÓN EN GERENCIA DE MANTENIMIENTO Y GESTIÓN DE ACTIVOS (VIRTUAL)",
    "level": "Posgrado",
    "modality": "Virtual",
    "accreditationStatus": "Proceso de Autoevaluación",
    "quality30411": 8,
    "curriculum40106": 0,
    "curriculumNotes": "Asumidas por el gestor virtual",
    "sea40109": 0,
    "saberPro40127": 0,
    "isActive": true
  },
  {
    "id": "p-mec-3",
    "unitId": "ing-mecanica",
    "unitName": "Ingeniería Mecánica",
    "programName": "ESPECIALIZACIÓN EN GERENCIA DE MANTENIMIENTO Y GESTIÓN DE ACTIVOS (PRESENCIAL)",
    "level": "Posgrado",
    "modality": "Presencial",
    "accreditationStatus": "Registro Calificado Vigente",
    "quality30411": 8,
    "curriculum40106": 0,
    "curriculumNotes": "Asumidas por el gestor virtual",
    "sea40109": 0,
    "saberPro40127": 0,
    "isActive": true
  },
  {
    "id": "p-mec-4",
    "unitId": "ing-mecanica",
    "unitName": "Ingeniería Mecánica",
    "programName": "ESPECIALIZACIÓN EN DIRECCIÓN Y GESTIÓN DE LA CALIDAD",
    "level": "Posgrado",
    "modality": "Presencial",
    "accreditationStatus": "Proceso de Autoevaluación",
    "quality30411": 12,
    "curriculum40106": 8,
    "curriculumNotes": "Asignar solamente si hay cohorte activa",
    "sea40109": 4,
    "saberPro40127": 0,
    "isActive": true
  },
  {
    "id": "p-amb-1",
    "unitId": "ing-ambiental",
    "unitName": "Ingeniería Ambiental",
    "programName": "INGENIERÍA AMBIENTAL",
    "level": "Pregrado",
    "modality": "Presencial",
    "accreditationStatus": "Proceso de Desistimiento",
    "quality30411": 16,
    "curriculum40106": 16,
    "sea40109": 8,
    "saberPro40127": 12,
    "isActive": true
  },
  {
    "id": "p-amb-2",
    "unitId": "ing-ambiental",
    "unitName": "Ingeniería Ambiental",
    "programName": "MAESTRÍA EN SOSTENIBILIDAD AMBIENTAL",
    "level": "Posgrado",
    "modality": "Presencial",
    "accreditationStatus": "Asignar solamente si hay cohorte activa",
    "quality30411": 12,
    "curriculum40106": 8,
    "curriculumNotes": "Asignar solamente si hay cohorte activa",
    "sea40109": 4,
    "saberPro40127": 0,
    "isActive": true
  },
  {
    "id": "p-sis-1",
    "unitId": "ing-sistemas",
    "unitName": "Ingeniería de Sistemas",
    "programName": "INGENIERÍA DE SISTEMAS",
    "level": "Pregrado",
    "modality": "Presencial",
    "accreditationStatus": "Programa Acreditado · Autoevaluación",
    "quality30411": 16,
    "curriculum40106": 20,
    "sea40109": 8,
    "saberPro40127": 20,
    "isActive": true
  },
  {
    "id": "p-sis-2",
    "unitId": "ing-sistemas",
    "unitName": "Ingeniería de Sistemas",
    "programName": "MAESTRÍA EN INGENIERÍA DE SOFTWARE Y SISTEMAS INFORMÁTICOS",
    "level": "Posgrado",
    "modality": "Presencial",
    "accreditationStatus": "Renovación de Registro Calificado",
    "quality30411": 12,
    "curriculum40106": 24,
    "curriculumNotes": "Renovación de Registro Calificado",
    "sea40109": 4,
    "saberPro40127": 0,
    "isActive": true
  },
  {
    "id": "p-der-1",
    "unitId": "derecho",
    "unitName": "Derecho",
    "programName": "DERECHO (PREGRADO Y 9 POSGRADOS EN CONSOLIDADO ANEXO 5)",
    "level": "Pregrado",
    "modality": "Presencial",
    "accreditationStatus": "Alta Calidad + Renovación Posgrados",
    "quality30411": 138,
    "curriculum40106": 104,
    "sea40109": 48,
    "saberPro40127": 24,
    "isActive": true
  },
  {
    "id": "p-civ-1",
    "unitId": "ing-civil",
    "unitName": "Ingeniería Civil",
    "programName": "INGENIERÍA CIVIL + ESPECIALIZACIONES Y MAESTRÍAS DEL ÁREA",
    "level": "Pregrado",
    "modality": "Presencial",
    "accreditationStatus": "Alta Calidad + 6 Posgrados Activos",
    "quality30411": 132,
    "curriculum40106": 68,
    "sea40109": 32,
    "saberPro40127": 20,
    "isActive": true
  },
  {
    "id": "p-arq-1",
    "unitId": "arquitectura",
    "unitName": "Arquitectura",
    "programName": "ARQUITECTURA + POSGRADO EN ORDENAMIENTO Y URBANISMO",
    "level": "Pregrado",
    "modality": "Presencial",
    "accreditationStatus": "Acreditación Alta Calidad",
    "quality30411": 32,
    "curriculum40106": 24,
    "sea40109": 16,
    "saberPro40127": 20,
    "isActive": true
  },
  {
    "id": "p-con-1",
    "unitId": "contaduria",
    "unitName": "Contaduría Pública",
    "programName": "CONTADURÍA PÚBLICA + ESPECIALIZACIÓN EN TRIBUTARIA Y REVISORÍA",
    "level": "Pregrado",
    "modality": "Presencial",
    "accreditationStatus": "Programa Acreditado",
    "quality30411": 32,
    "curriculum40106": 44,
    "sea40109": 16,
    "saberPro40127": 12,
    "isActive": true
  },
  {
    "id": "p-neg-1",
    "unitId": "negocios-int",
    "unitName": "Negocios Internacionales",
    "programName": "NEGOCIOS INTERNACIONALES + POSGRADO GERENCIA INTERNACIONAL",
    "level": "Pregrado",
    "modality": "Presencial",
    "accreditationStatus": "Registro Calificado Vigente",
    "quality30411": 32,
    "curriculum40106": 44,
    "sea40109": 8,
    "saberPro40127": 20,
    "isActive": true
  },
  {
    "id": "p-ele-1",
    "unitId": "ing-electronica",
    "unitName": "Ingeniería Electrónica",
    "programName": "INGENIERÍA ELECTRÓNICA + POSGRADOS AUTOMATIZACIÓN Y TELECOMUNICACIONES",
    "level": "Pregrado",
    "modality": "Presencial",
    "accreditationStatus": "Acreditación Alta Calidad",
    "quality30411": 52,
    "curriculum40106": 40,
    "sea40109": 8,
    "saberPro40127": 12,
    "isActive": true
  }
];

export const FACULTY_TEACHERS_SEED: FacultyTeacher[] = [
  {
    "id": "ind-1",
    "unitId": "ing-industrial",
    "documentId": "37274697",
    "fullName": "GLORIA ELIZABETH GRIMALDO LEÓN",
    "dedication": "DIRECTIVO",
    "expectedWorkload": 210,
    "rank": "Decana de Facultad",
    "education": "Ingeniera de Producción Industrial - Magíster en Administración y Dirección de Empresas",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 40,
        "version1Hours": 0,
        "directorNote": "Se incluyen 40h de proyecto de investigación aprobadas en revisión v2.",
        "adjustedByDirector": true
      },
      "30222": {
        "code": "30222",
        "hours": 170,
        "version1Hours": 240,
        "directorNote": "Se reduce de 240h a 170h en revisión con la Directora.",
        "adjustedByDirector": true
      }
    },
    "sharedHours": 18,
    "sharedUnitName": "INVESTIGACIÓN",
    "generalNote": "En v2 se ajustó 30222 de 240h a 170h y se asignaron 40h en 10336 (Investigación) para un total de 210h. Alerta RN-12: Lineamiento B-12 exige que los Decanos orienten al menos 1 espacio académico (40104 o 40006).",
    "version1Total": 240
  },
  {
    "id": "ind-2",
    "unitId": "ing-industrial",
    "documentId": "40039517",
    "fullName": "CASTILLO MONROY MARTHA LILIANA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniera Industrial · Especialista en Finanzas · Magíster en Ingeniería Industrial",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "e1",
        "name": "ECONOMÍA EMPRESARIAL",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "e2",
        "name": "INTELIGENCIA DE MERCADOS",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "e3",
        "name": "INGENIERÍA ECONÓMICA",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "e4",
        "name": "GESTIÓN DE PROYECTOS EN INGENIERÍA",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "pseManualOverride": 22,
    "allocations": {
      "10212": {
        "code": "10212",
        "hours": 8,
        "version1Hours": 8,
        "unitCount": 2
      },
      "10336": {
        "code": "10336",
        "hours": 10,
        "version1Hours": 10
      },
      "30420": {
        "code": "30420",
        "hours": 8,
        "version1Hours": 8
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      }
    },
    "sharedHours": 16,
    "sharedUnitName": "PROYECCIÓN SOCIAL",
    "version1Total": 160
  },
  {
    "id": "ind-3",
    "unitId": "ing-industrial",
    "documentId": "74182244",
    "fullName": "TRUJILLO MANRIQUE JAIME",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero Industrial · Esp. en Salud Ocupacional y Prevención del Riesgo · Magíster en Ingeniería",
    "isProvisional": false,
    "seniorityYears": 10,
    "academicSpaces": [
      {
        "id": "e5",
        "name": "MATERIALES PARA INGENIERÍA",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "e6",
        "name": "EXPRESIÓN GRÁFICA Y MODELACIÓN DIGITAL",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "e7",
        "name": "INVESTIGACIÓN DE OPERACIONES I",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "e8",
        "name": "SUPPLY CHAIN MANAGEMENT",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "e9",
        "name": "PRÁCTICA PROFESIONAL",
        "level": "Pregrado",
        "monthlyHours": 8
      }
    ],
    "allocations": {
      "10212": {
        "code": "10212",
        "hours": 4,
        "version1Hours": 4,
        "unitCount": 1
      },
      "20120": {
        "code": "20120",
        "hours": 16,
        "version1Hours": 16,
        "unitCount": 8
      },
      "20223": {
        "code": "20223",
        "hours": 16,
        "version1Hours": 16,
        "unitCount": 8
      },
      "43401": {
        "code": "43401",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ind-4",
    "unitId": "ing-industrial",
    "documentId": "1049606736",
    "fullName": "LUIS ANDRÉS SANDOVAL CASTILLO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Administrador de Empresas · Esp. en Sistemas Integrados QHSE · Maestría en Sistemas de Gestión",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "e10",
        "name": "GESTIÓN ORGANIZACIONAL",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "e11",
        "name": "CONTABILIDAD Y COSTOS",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "e12",
        "name": "PRESUPUESTOS Y FINANZAS",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "e13",
        "name": "FINANZAS",
        "level": "Pregrado",
        "monthlyHours": 8
      }
    ],
    "pseManualOverride": 18,
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 10,
        "version1Hours": 10
      },
      "20223": {
        "code": "20223",
        "hours": 16,
        "version1Hours": 0,
        "unitCount": 8,
        "directorNote": "En v2 se reasignó de 30411 Calidad (16h) a 20223 Opciones de Grado Social (16h)."
      },
      "20225": {
        "code": "20225",
        "hours": 16,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      },
      "40127": {
        "code": "40127",
        "hours": 20,
        "version1Hours": 20
      },
      "43401": {
        "code": "43401",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ind-5",
    "unitId": "ing-industrial",
    "documentId": "7186316",
    "fullName": "ZIPAQUIRÁ VARGAS ÁNGEL ALEXANDER",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero Industrial · Esp. en Gerencia Logística · Magíster en Salud Ocupacional y Ambiental",
    "isProvisional": false,
    "seniorityYears": 9,
    "academicSpaces": [
      {
        "id": "e14",
        "name": "GESTIÓN EN SEGURIDAD Y SALUD EN EL TRABAJO",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "e15",
        "name": "GESTIÓN Y CONTROL DE CALIDAD",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "e16",
        "name": "LOGÍSTICA DE DISTRIBUCIÓN",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "e17",
        "name": "GESTIÓN EN SST Y MEDIO AMBIENTE",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10212": {
        "code": "10212",
        "hours": 4,
        "version1Hours": 4,
        "unitCount": 1
      },
      "10336": {
        "code": "10336",
        "hours": 20,
        "version1Hours": 20
      },
      "20220": {
        "code": "20220",
        "hours": 16,
        "version1Hours": 16
      }
    },
    "sharedHours": 120,
    "sharedUnitName": "INGENIERÍA AMBIENTAL (Compartido)",
    "version1Total": 160
  },
  {
    "id": "ind-6",
    "unitId": "ing-industrial",
    "documentId": "1002697950",
    "fullName": "MARLY YASMIN HASTAMORIR DUARTE",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniera Industrial · Magíster en Administración de Empresas",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "e18",
        "name": "INVESTIGACIÓN DE OPERACIONES II",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "e19",
        "name": "MODELOS DE OPTIMIZACIÓN",
        "level": "Pregrado",
        "monthlyHours": 48
      },
      {
        "id": "e20",
        "name": "GESTIÓN DE LA PRODUCCIÓN",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "e21",
        "name": "PLANEACIÓN Y PROGRAMACIÓN DE LA PRODUCCIÓN",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10212": {
        "code": "10212",
        "hours": 4,
        "version1Hours": 4,
        "unitCount": 1
      },
      "10318": {
        "code": "10318",
        "hours": 4,
        "version1Hours": 4
      },
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 64
      },
      "20223": {
        "code": "20223",
        "hours": 4,
        "version1Hours": 0,
        "unitCount": 2
      },
      "40117": {
        "code": "40117",
        "hours": 6,
        "version1Hours": 8
      }
    },
    "sharedHours": 110,
    "sharedUnitName": "ADMINISTRACIÓN / POSGRADOS",
    "version1Total": 160
  },
  {
    "id": "ind-7",
    "unitId": "ing-industrial",
    "documentId": "19619292",
    "fullName": "QUINTERO NAVARRO GEIDER",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero Industrial · Esp. en Producción y Operaciones · Magíster en Administración de Organizaciones",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "e22",
        "name": "PROCESOS INDUSTRIALES",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "e23",
        "name": "MODELOS PROBABILÍSTICOS",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "e24",
        "name": "ESTADÍSTICA INDUSTRIAL",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "e25",
        "name": "FILOSOFÍA LEAN",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "e26",
        "name": "PLANEACIÓN Y PROGRAMACIÓN DE LA PRODUCCIÓN",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "e27",
        "name": "NUEVAS TECNOLOGÍAS INDUSTRIALES",
        "level": "Pregrado",
        "monthlyHours": 4
      }
    ],
    "allocations": {
      "10212": {
        "code": "10212",
        "hours": 16,
        "version1Hours": 12,
        "unitCount": 4
      },
      "10364": {
        "code": "10364",
        "hours": 8,
        "version1Hours": 8,
        "unitCount": 2
      },
      "20223": {
        "code": "20223",
        "hours": 5,
        "version1Hours": 0,
        "unitCount": 3
      },
      "30420": {
        "code": "30420",
        "hours": 8,
        "version1Hours": 16,
        "directorNote": "En v1 tenía 16h (excedía el tope de 8h). Se redujo a 8h en revisión.",
        "adjustedByDirector": true
      },
      "40109": {
        "code": "40109",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "generalNote": "Caso real CP-01 y CP-07: En la versión 1 tenía 197 h totales y 16 h en Internacionalización (30420, cuyo tope es 8 h). Tras la revisión con la Directora quedó cuadrado en 160 h.",
    "version1Total": 197
  },
  {
    "id": "ind-8",
    "unitId": "ing-industrial",
    "documentId": "1020396093",
    "fullName": "MEDINA JARAMILLO CAROLINA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniera de Alimentos · Magíster en Tecnología de Alimentos · Doctora en Ingeniería",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "e28",
        "name": "ELECTIVA: Procesos de transformación en alimentos",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "e29",
        "name": "METODOLOGÍA DE LA INVESTIGACIÓN",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "e30",
        "name": "OPCIÓN DE GRADO I",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "e31",
        "name": "OPCIÓN DE GRADO II",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "e32",
        "name": "PRODUCCIÓN AGROINDUSTRIAL",
        "level": "Pregrado",
        "monthlyHours": 4
      }
    ],
    "allocations": {
      "10212": {
        "code": "10212",
        "hours": 14,
        "version1Hours": 12,
        "unitCount": 4
      },
      "10225": {
        "code": "10225",
        "hours": 8,
        "version1Hours": 16
      },
      "10336": {
        "code": "10336",
        "hours": 36,
        "version1Hours": 36
      },
      "10364": {
        "code": "10364",
        "hours": 8,
        "version1Hours": 8,
        "unitCount": 2
      },
      "10384": {
        "code": "10384",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ind-9",
    "unitId": "ing-industrial",
    "documentId": "1049642079",
    "fullName": "AGUILAR TOVAR CRISTIAN ALEJANDRO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero Industrial · Magíster en Gestión Humana y Desarrollo Organizacional",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "e33",
        "name": "INGENIERÍA DE MÉTODOS Y TIEMPOS",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "e34",
        "name": "MÉTODOS INFERENCIALES",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "e35",
        "name": "CONTROL ESTADÍSTICO DE CALIDAD",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "pseManualOverride": 16,
    "allocations": {
      "10226": {
        "code": "10226",
        "hours": 48,
        "version1Hours": 48,
        "exceptionJustification": "Asignación registrada en columna SICDDI del archivo de Industrial."
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      }
    },
    "generalNote": "Caso real CP-02 y CP-05: En v1 sumaba 178 h. En v2 se retiraron 16 h de CTeI (10364) y se ajustó PSE de 18 h a 16 h (marcado en rojo en el Excel) para cerrar en 160 h.",
    "version1Total": 178
  },
  {
    "id": "ind-10",
    "unitId": "ing-industrial",
    "documentId": "7178217",
    "fullName": "ORTEGA CELIS PAUL EDUARDO (Antes INDUSTRIAL PENDIENTE 1)",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero Industrial · Magíster en Administración",
    "isProvisional": true,
    "seniorityYears": 1,
    "academicSpaces": [
      {
        "id": "e36",
        "name": "INTRODUCCIÓN A LA INGENIERÍA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "e37",
        "name": "INNOVACIÓN Y DISEÑO",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "e38",
        "name": "GESTIÓN DE LA CADENA DE SUMINISTRO",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "e39",
        "name": "CREACIÓN DE EMPRESA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "e40",
        "name": "GERENCIA DE SERVICIOS",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10212": {
        "code": "10212",
        "hours": 16,
        "version1Hours": 16,
        "unitCount": 4
      },
      "20223": {
        "code": "20223",
        "hours": 8,
        "version1Hours": 8,
        "unitCount": 4
      },
      "20502": {
        "code": "20502",
        "hours": 8,
        "version1Hours": 8
      },
      "30312": {
        "code": "30312",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ind-11",
    "unitId": "ing-industrial",
    "documentId": "VACANTE-IND-02",
    "fullName": "INDUSTRIAL PENDIENTE 2 (Gestor Virtual MT)",
    "dedication": "MT",
    "expectedWorkload": 80,
    "rank": "Medio Tiempo Gestor Virtual",
    "education": "Por definir en proceso de selección",
    "isProvisional": true,
    "seniorityYears": 0,
    "academicSpaces": [],
    "allocations": {
      "40614": {
        "code": "40614",
        "hours": 80,
        "version1Hours": 80
      }
    },
    "version1Total": 80
  },
  {
    "id": "ind-12",
    "unitId": "ing-industrial",
    "documentId": "46457808",
    "fullName": "DIANA MIREYA AYALA VALDERRAMA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) Industrial · Magíster en Ingeniería Industrial",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ind-12-esp-1",
        "name": "LOGISTICA DE DISTRIBUCIÓN - IDUUA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ind-12-esp-2",
        "name": "CONTABILIDAD Y COSTOS - IDUUA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ind-12-esp-3",
        "name": "CONTROL ESTADISTICO DE CALIDAD - IDUUA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ind-12-esp-4",
        "name": "CREACIÓN DE EMPRESA - IDU6A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ind-12-esp-5",
        "name": "PROCESOS INDUSTRIALES - IDUUB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ind-12-esp-6",
        "name": "GESTION DE LA PRODUCCION - IDUUB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ind-12-esp-7",
        "name": "SUPPLY CHAIN MANAGEMENT - IDUUA",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "mec-1",
    "unitId": "ing-mecanica",
    "documentId": "1049616934",
    "fullName": "HELVER MAURICIO MUÑOZ BARAJAS",
    "dedication": "DIRECTIVO",
    "expectedWorkload": 210,
    "rank": "Decano de Facultad",
    "education": "Ingeniero Mecánico · Magíster en Ingeniería",
    "isProvisional": false,
    "seniorityYears": 9,
    "academicSpaces": [
      {
        "id": "m1",
        "name": "ELECTIVA DE FORMACIÓN INTEGRAL 2 (Gestión de residuos peligrosos e ionizantes)",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "30222": {
        "code": "30222",
        "hours": 190
      }
    }
  },
  {
    "id": "mec-2",
    "unitId": "ing-mecanica",
    "documentId": "7161314",
    "fullName": "ALONSO HERNANDEZ MOLANO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero Mecánico",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "m2",
        "name": "DIBUJO DE MÁQUINAS (Grupo 1)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m3",
        "name": "DIBUJO DE MÁQUINAS (Grupo 2)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m4",
        "name": "OPTATIVA 2 (Diagnóstico automotor)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m5",
        "name": "FORMULACIÓN Y EVALUACIÓN DE PROYECTOS",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32
      },
      "20220": {
        "code": "20220",
        "hours": 20
      },
      "40109": {
        "code": "40109",
        "hours": 13
      }
    }
  },
  {
    "id": "mec-3",
    "unitId": "ing-mecanica",
    "documentId": "7163979",
    "fullName": "LUIS FERNANDO ACOSTA JOYA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero Mecánico",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "m6",
        "name": "INTRODUCCIÓN A LA INGENIERÍA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m7",
        "name": "ELECTIVA PROFESIONAL I (Motores de combustión interna)",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "m8",
        "name": "TRABAJO DE GRADO",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "m9",
        "name": "TALLER DE FABRICACIÓN (BIO)",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 48
      },
      "10426": {
        "code": "10426",
        "hours": 20
      },
      "40222": {
        "code": "40222",
        "hours": 7
      }
    }
  },
  {
    "id": "mec-4",
    "unitId": "ing-mecanica",
    "documentId": "1032362640",
    "fullName": "CARLOS ANDRES AGUIRRE RODRIGUEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero Mecánico · Doctor en Ingeniería",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "m4-1",
        "name": "MECÁNICA DE FLUIDOS",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m4-2",
        "name": "SISTEMAS DE TRANSFORMACIÓN DE ENERGÍA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "m4-3",
        "name": "PROYECTO INTEGRADOR",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "m4-4",
        "name": "ELECTIVA PROFESIONAL 4 (Herramientas CAM para mecanizado)",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10226": {
        "code": "10226",
        "hours": 80
      }
    }
  },
  {
    "id": "mec-5",
    "unitId": "ing-mecanica",
    "documentId": "40035076",
    "fullName": "YENNY MARLEN GONZALEZ MANCILLA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniera Metalúrgica · Magíster en Metalurgia y Ciencia de los Materiales",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "m5-1",
        "name": "CIENCIA DE LOS MATERIALES (G1)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m5-2",
        "name": "CIENCIA DE LOS MATERIALES (G2)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m5-3",
        "name": "PROCESOS DE MANUFACTURA 2",
        "level": "Pregrado",
        "monthlyHours": 20
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 45
      },
      "30411": {
        "code": "30411",
        "hours": 8
      },
      "40106": {
        "code": "40106",
        "hours": 24
      },
      "43401": {
        "code": "43401",
        "hours": 8
      }
    }
  },
  {
    "id": "mec-6",
    "unitId": "ing-mecanica",
    "documentId": "7187129",
    "fullName": "GERMAN ANDRES GUTIERREZ ARIAS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero Electrónico / Mecánico · Magíster en Automatización",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "m6-1",
        "name": "LÓGICA COMPUTACIONAL (G1)",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "m6-2",
        "name": "ELECTRÓNICA INDUSTRIAL",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m6-3",
        "name": "INSTRUMENTACIÓN Y AUTOMATIZACIÓN",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "m6-4",
        "name": "LÓGICA COMPUTACIONAL (G2)",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10226": {
        "code": "10226",
        "hours": 65
      }
    }
  },
  {
    "id": "mec-7",
    "unitId": "ing-mecanica",
    "documentId": "7225532",
    "fullName": "FABIAN LEONARDO HIGUERA SANCHEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero Mecánico · Magíster en Metalurgia",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "m10",
        "name": "ESTÁTICA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m11",
        "name": "DINÁMICA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m12",
        "name": "TURBOMÁQUINAS",
        "level": "Pregrado",
        "monthlyHours": 20
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32
      },
      "20502": {
        "code": "20502",
        "hours": 12
      },
      "30420": {
        "code": "30420",
        "hours": 8
      },
      "40006": {
        "code": "40006",
        "hours": 10
      },
      "40127": {
        "code": "40127",
        "hours": 12
      },
      "43401": {
        "code": "43401",
        "hours": 11
      }
    }
  },
  {
    "id": "mec-8",
    "unitId": "ing-mecanica",
    "documentId": "6775059",
    "fullName": "JUAN RODRIGO SALAMANCA SARMIENTO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero Mecánico · Doctor en Ingeniería",
    "isProvisional": false,
    "seniorityYears": 10,
    "academicSpaces": [
      {
        "id": "m8-1",
        "name": "PROCESOS DE MANUFACTURA 1",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m8-2",
        "name": "PROCESOS DE MANUFACTURA 2",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m8-3",
        "name": "OPTATIVA 1 (Selección de Materiales)",
        "level": "Pregrado",
        "monthlyHours": 20
      }
    ],
    "allocations": {
      "10226": {
        "code": "10226",
        "hours": 80
      },
      "43401": {
        "code": "43401",
        "hours": 5
      }
    }
  },
  {
    "id": "mec-9",
    "unitId": "ing-mecanica",
    "documentId": "1100954487",
    "fullName": "ANA ROCIO CORDOBA MALAVER",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniera Mecánica · Magíster en Ingeniería",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "m9-1",
        "name": "TRANSFERENCIA DE CALOR",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m9-2",
        "name": "ELECTIVA PROFESIONAL III (Termografía Industrial)",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "m9-3",
        "name": "PROYECTO INTEGRADOR",
        "level": "Pregrado",
        "monthlyHours": 4
      }
    ],
    "allocations": {
      "10226": {
        "code": "10226",
        "hours": 50
      },
      "10340": {
        "code": "10340",
        "hours": 40
      },
      "10384": {
        "code": "10384",
        "hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 4
      }
    }
  },
  {
    "id": "mec-10",
    "unitId": "ing-mecanica",
    "documentId": "1049641668",
    "fullName": "JUAN DAVID CAMACHO COY",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero Mecánico · Magíster en Diseño Mecánico",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "m10-1",
        "name": "EXPRESIÓN GRÁFICA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m10-2",
        "name": "RESISTENCIA DE MATERIALES",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m10-3",
        "name": "MECANISMOS",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m10-4",
        "name": "DISEÑO DE MÁQUINAS 1",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m10-5",
        "name": "ELECTIVA DE FORMACIÓN INTEGRAL 1 (Análisis por Elementos Finitos)",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10426": {
        "code": "10426",
        "hours": 6
      },
      "20120": {
        "code": "20120",
        "hours": 6,
        "unitCount": 3
      },
      "20225": {
        "code": "20225",
        "hours": 16
      },
      "30312": {
        "code": "30312",
        "hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 4
      }
    }
  },
  {
    "id": "mec-11",
    "unitId": "ing-mecanica",
    "documentId": "1057573535",
    "fullName": "JAVIER ALEJANDRO BONILLA PAEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero Mecánico",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "m13",
        "name": "INGENIERÍA DE LOS MATERIALES",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m14",
        "name": "TERMODINÁMICA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m15",
        "name": "ADMINISTRACIÓN PARA INGENIEROS",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "m16",
        "name": "INGENIERÍA DE LOS MATERIALES (BIO G1)",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "m17",
        "name": "INGENIERÍA DE LOS MATERIALES (BIO G2)",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "30411": {
        "code": "30411",
        "hours": 18
      },
      "40117": {
        "code": "40117",
        "hours": 4
      },
      "43401": {
        "code": "43401",
        "hours": 8
      }
    }
  },
  {
    "id": "mec-12",
    "unitId": "ing-mecanica",
    "documentId": "7174097",
    "fullName": "NELSON IVAN VILLAMIZAR CRUZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero Electricista / Mecánico",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "m18",
        "name": "INSTALACIÓN DE MÁQUINAS ELÉCTRICAS (G1)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m19",
        "name": "INSTALACIÓN DE MÁQUINAS ELÉCTRICAS (G2)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "m20",
        "name": "METODOLOGÍA DE LA INVESTIGACIÓN",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "m21",
        "name": "DISEÑO DE TRANSMISIÓN DE POTENCIA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "m22",
        "name": "ELECTIVA PROFESIONAL II (Mantenimiento Industrial)",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10226": {
        "code": "10226",
        "hours": 32
      },
      "30411": {
        "code": "30411",
        "hours": 18
      }
    }
  },
  {
    "id": "ing-sistemas-1",
    "unitId": "ing-sistemas",
    "documentId": "1002368233",
    "fullName": "ANGEL MANUEL CORREA RIVERA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) de Sistemas · Magíster en Ingeniería de Software y Sistemas",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ing-sistemas-1-esp-1",
        "name": "CLOUD COMPUTING PARA EL DESARROLLO DE SOFTWARE - IGS8B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-1-esp-2",
        "name": "CLOUD COMPUTING PARA EL DESARROLLO DE SOFTWARE - INSSA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-1-esp-3",
        "name": "GERENCIA DE SOFTWARE - IGS6B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-1-esp-4",
        "name": "SIMULACION - INS7A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-1-esp-5",
        "name": "SIMULACION - INS7B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-1-esp-6",
        "name": "DISEÑO WEB - IGS1C - SEGUNDO",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-sistemas-2",
    "unitId": "ing-sistemas",
    "documentId": "1056709966",
    "fullName": "ANGIE LORENA SUAREZ ROJAS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) de Sistemas · Magíster en Ingeniería de Software y Sistemas",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "ing-sistemas-2-esp-1",
        "name": "INTRODUCCION A LA INGENIERIA SISTEMAS - IGS1A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-sistemas-2-esp-2",
        "name": "INTRODUCCION A LA INGENIERIA SISTEMAS - IGS1B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-sistemas-2-esp-3",
        "name": "BASES DE DATOS - IGS2B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-sistemas-2-esp-4",
        "name": "BASES DE DATOS - IGSHA",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "30411": {
        "code": "30411",
        "hours": 4,
        "version1Hours": 4
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-sistemas-3",
    "unitId": "ing-sistemas",
    "documentId": "1056931583",
    "fullName": "BRAYAN ANDREY VARGAS BECERRA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero(a) de Sistemas · Magíster en Ingeniería de Software y Sistemas",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ing-sistemas-3-esp-1",
        "name": "REDES - INS6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-3-esp-2",
        "name": "PRACTICA EMPRESARIAL - IGS8C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-3-esp-3",
        "name": "DISEÑO WEB - IGS1B - SEGUNDO",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-3-esp-4",
        "name": "DISEÑO WEB - IGS1D - SEGUNDO",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-3-esp-5",
        "name": "DISEÑO WEB - IGS1E -SEGUNDOYTERCE",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-sistemas-4",
    "unitId": "ing-sistemas",
    "documentId": "7168082",
    "fullName": "DAVID GERONIMO SOLER GOMEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) de Sistemas · Magíster en Ingeniería de Software y Sistemas",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "ing-sistemas-4-esp-1",
        "name": "LEGISLACION INFORMATICA - IG10A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-4-esp-2",
        "name": "LEGISLACION INFORMATICA - IG10B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-4-esp-3",
        "name": "REDES - IGS6B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-4-esp-4",
        "name": "REDES - IGS6C",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ing-sistemas-4-esp-5",
        "name": "SISTEMAS OPERATIVOS - IGS5B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ing-sistemas-4-esp-6",
        "name": "ARQUITECTURA DEL COMPUTADOR - IGS4B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ing-sistemas-4-esp-7",
        "name": "ARQUITECTURA DEL COMPUTADOR - ISSSA",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-sistemas-5",
    "unitId": "ing-sistemas",
    "documentId": "1056956709",
    "fullName": "DIEGO ALEJANDRO VELA BELTRAN",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) de Sistemas · Magíster en Ingeniería de Software y Sistemas",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ing-sistemas-5-esp-1",
        "name": "INTELIGENCIA ARTIFICIAL - IGS8B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-5-esp-2",
        "name": "INTELIGENCIA ARTIFICIAL - INSSA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-5-esp-3",
        "name": "INTELIGENCIA ARTIFICIAL GENERATIVA - IGS9D",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-5-esp-4",
        "name": "INTELIGENCIA ARTIFICIAL GENERATIVA - ISS9B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-5-esp-5",
        "name": "PRACTICA EMPRESARIAL - INS8A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-sistemas-6",
    "unitId": "ing-sistemas",
    "documentId": "1002397733",
    "fullName": "HARRIZON ALEXANDER SOLER GALINDO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) de Sistemas · Magíster en Ingeniería de Software y Sistemas",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "ing-sistemas-6-esp-1",
        "name": "DESARROLLO ORIENTADO A SERVICIOS - IGS6B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-sistemas-6-esp-2",
        "name": "DESARROLLO EMPRESARIAL - ISHA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-sistemas-6-esp-3",
        "name": "BASES DE DATOS NOSQL - IGSHB",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-sistemas-6-esp-4",
        "name": "PROGRAMACION ORIENTADA A OBJETOS - IGS2B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-sistemas-7",
    "unitId": "ing-sistemas",
    "documentId": "1049654983",
    "fullName": "HARVEY NICOLAS ECHAVARRIA ORTIZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero(a) de Sistemas · Magíster en Ingeniería de Software y Sistemas",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ing-sistemas-7-esp-1",
        "name": "CALIDAD DE SOFTWARE - INS7B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-7-esp-2",
        "name": "CIBERSEGURIDAD: WHITE HAT & BLUE TEAM STRATEGIES - IGS7B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-7-esp-3",
        "name": "SISTEMAS OPERATIVOS - ISS5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-7-esp-4",
        "name": "GERENCIA DE SOFTWARE - IGS6C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-7-esp-5",
        "name": "TRABAJO DE GRADO I - IGS9B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-7-esp-6",
        "name": "DISEÑO WEB - IGS1F - PRIMERO",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 20,
        "version1Hours": 20
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-sistemas-8",
    "unitId": "ing-sistemas",
    "documentId": "79689006",
    "fullName": "HENRY ALFONSO GUIO AVILA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) de Sistemas · Magíster en Ingeniería de Software y Sistemas",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "ing-sistemas-8-esp-1",
        "name": "ARQUITECTURA EMPRESARIAL - IGS5B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-8-esp-2",
        "name": "ARQUITECTURA EMPRESARIAL - ISS5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-8-esp-3",
        "name": "AUDITORIA DE SISTEMAS - IGS9B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-8-esp-4",
        "name": "AUDITORIA DE SISTEMAS - ISS9A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ing-sistemas-8-esp-5",
        "name": "CALIDAD DE SOFTWARE - IGS7C",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ing-sistemas-8-esp-6",
        "name": "PRACTICA EMPRESARIAL - IGS8B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ing-sistemas-8-esp-7",
        "name": "TRABAJO DE GRADO I - IGS9A",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "20502": {
        "code": "20502",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-sistemas-9",
    "unitId": "ing-sistemas",
    "documentId": "1002395771",
    "fullName": "JHON ALEXIS PIRACOCA ARCOS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) de Sistemas · Magíster en Ingeniería de Software y Sistemas",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ing-sistemas-9-esp-1",
        "name": "DESARROLLO ORIENTADO A SERVICIOS - IGS6C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-9-esp-2",
        "name": "DESARROLLO ORIENTADO A SERVICIOS - INS6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-9-esp-3",
        "name": "BIG DATA - IGS7B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-9-esp-4",
        "name": "DISEÑO WEB - IGS1A - PRIMERO",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-9-esp-5",
        "name": "PROGRAMACION ORIENTADA A OBJETOS - IGS2A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "20502": {
        "code": "20502",
        "hours": 4,
        "version1Hours": 4
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-sistemas-10",
    "unitId": "ing-sistemas",
    "documentId": "1049653701",
    "fullName": "MANUEL LEONARDO DE JESUS CASTRO BARINAS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) de Sistemas · Magíster en Ingeniería de Software y Sistemas",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "ing-sistemas-10-esp-1",
        "name": "DEVOPS - DEVOPS 8A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-10-esp-2",
        "name": "DEVOPS - DEVOPS 8B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-10-esp-3",
        "name": "GERENCIA DE SOFTWARE - INS6A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-10-esp-4",
        "name": "PROGRAMACION ESTRUCTURADA PARA INGENIERIAS - IGS1A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-10-esp-5",
        "name": "PROGRAMACION ESTRUCTURADA PARA INGENIERIAS - IGS1B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-sistemas-10-esp-6",
        "name": "PROGRAMACION ORIENTADA A OBJETOS - IGS2C",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-sistemas-11",
    "unitId": "ing-sistemas",
    "documentId": "37729226",
    "fullName": "MARTHA SUSANA CONTRERAS ORTIZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero(a) de Sistemas · Magíster en Ingeniería de Software y Sistemas",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ing-sistemas-11-esp-1",
        "name": "BIG DATA - INS7A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-sistemas-11-esp-2",
        "name": "TRABAJO DE GRADO II - IG10A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-sistemas-11-esp-3",
        "name": "TRABAJO DE GRADO II - IG10B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-sistemas-11-esp-4",
        "name": "DESARROLLO EMPRESARIAL - IGSHB",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-sistemas-12",
    "unitId": "ing-sistemas",
    "documentId": "40045535",
    "fullName": "PAOLA ANDREA CRUZ YOMAYUSA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) de Sistemas · Magíster en Ingeniería de Software y Sistemas",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "ing-sistemas-12-esp-1",
        "name": "OPTIMIZACION - IGS6B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-sistemas-12-esp-2",
        "name": "OPTIMIZACION - IGS6C",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-sistemas-12-esp-3",
        "name": "OPTIMIZACION - INS6A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-sistemas-12-esp-4",
        "name": "ANALISIS NUMERICO - IGSHB",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-sistemas-13",
    "unitId": "ing-sistemas",
    "documentId": "1052389021",
    "fullName": "SERGIO ARLEY PUERTO MORENO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) de Sistemas · Magíster en Ingeniería de Software y Sistemas",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ing-sistemas-13-esp-1",
        "name": "SEGURIDAD EN EL DESARROLLO DE SOFTWARE - DESA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-13-esp-2",
        "name": "CIBERSEGURIDAD: WHITE HAT & BLUE TEAM STRATEGIES - INS7A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-13-esp-3",
        "name": "CONSTRUCCION DE SOFTWARE - IGS4B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-13-esp-4",
        "name": "CONSTRUCCION DE SOFTWARE - IGS4C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-sistemas-13-esp-5",
        "name": "CONSTRUCCION DE SOFTWARE - ISS4A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "adm-empresas-1",
    "unitId": "adm-empresas",
    "documentId": "91508471",
    "fullName": "JEAN PIERRE ANCHICOQUE CADENA",
    "dedication": "DIRECTIVO",
    "expectedWorkload": 210,
    "rank": "Decano(a) de Facultad",
    "education": "Administrador(a) de Empresas · Magíster en Administración y Gestión Empresarial",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "adm-empresas-1-esp-1",
        "name": "PRACTICA DE RESP. SOCIAL UNIVERSITARIA - PRAC RESP SOCIAL",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "30222": {
        "code": "30222",
        "hours": 190,
        "version1Hours": 190
      }
    },
    "version1Total": 210
  },
  {
    "id": "adm-empresas-2",
    "unitId": "adm-empresas",
    "documentId": "1098691387",
    "fullName": "ALEX MAURICIO RODRIGUEZ SUAREZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Administrador(a) de Empresas · Magíster en Administración y Gestión Empresarial",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "adm-empresas-2-esp-1",
        "name": "ESTRATEGIA - ESTRATEGIA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "adm-empresas-2-esp-2",
        "name": "EVALUACIÓN INTEGRAL DE PROYECTOS - EVA INT PRO D",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "adm-empresas-2-esp-3",
        "name": "NEGOCIACIÓN INTERNACIONAL - NEG INT D",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "adm-empresas-2-esp-4",
        "name": "NEGOCIACIÓN INTERNACIONAL - NEG INT N",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "30312": {
        "code": "30312",
        "hours": 4,
        "version1Hours": 4
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40127": {
        "code": "40127",
        "hours": 12,
        "version1Hours": 12
      }
    },
    "version1Total": 160
  },
  {
    "id": "adm-empresas-3",
    "unitId": "adm-empresas",
    "documentId": "1127572688",
    "fullName": "ALIX JOHANA GAFFARO GARCIA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Administrador(a) de Empresas · Magíster en Administración y Gestión Empresarial",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "adm-empresas-3-esp-1",
        "name": "SISTEMAS DE INFORMACION GERENCIAL - SIGERENCIAL",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "adm-empresas-3-esp-2",
        "name": "EVALUACIÓN INTEGRAL DE PROYECTOS - EVA INT PRO N",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "adm-empresas-3-esp-3",
        "name": "ADMINISTRACIÓN DE LA PRODUCCIÓN - ADM PRO N",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "adm-empresas-3-esp-4",
        "name": "ANALÍTICA DE DATOS EMPRESARIALES - PROF I DAT EMP",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "20502": {
        "code": "20502",
        "hours": 12,
        "version1Hours": 12
      },
      "30312": {
        "code": "30312",
        "hours": 4,
        "version1Hours": 4
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      }
    },
    "version1Total": 160
  },
  {
    "id": "adm-empresas-4",
    "unitId": "adm-empresas",
    "documentId": "40033172",
    "fullName": "ANGELA MARIA RODRIGUEZ ORDUZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Administrador(a) de Empresas · Magíster en Administración y Gestión Empresarial",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "adm-empresas-4-esp-1",
        "name": "MICROECONOMIA - MICRO",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "adm-empresas-4-esp-2",
        "name": "MACROECONOMIA - MACRO",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "adm-empresas-4-esp-3",
        "name": "ADMINISTRACIÓN DE LA PRODUCCIÓN - ADM PRO D",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "20502": {
        "code": "20502",
        "hours": 4,
        "version1Hours": 4
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "adm-empresas-5",
    "unitId": "adm-empresas",
    "documentId": "6774229",
    "fullName": "CARLOS ORLANDO INFANTE MORENO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Administrador(a) de Empresas · Magíster en Administración y Gestión Empresarial",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "adm-empresas-5-esp-1",
        "name": "MARKETING DIGITAL - PROF II MAR DIG",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "adm-empresas-5-esp-2",
        "name": "CREATIVIDAD E INNOVACIÓN ORGANIZACIONAL - CRE INN ORG",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "adm-empresas-5-esp-3",
        "name": "HABILIDADES GERENCIALES - HAB GER D",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "adm-empresas-5-esp-4",
        "name": "HABILIDADES GERENCIALES - HAB GER N",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "adm-empresas-5-esp-5",
        "name": "BRAND EXPERIENCE - PROF III BRAND",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "adm-empresas-5-esp-6",
        "name": "HERRAMIENTAS DIGITALES PARA LA GESTIÓN - COC HER DIG GES",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "30411": {
        "code": "30411",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "adm-empresas-6",
    "unitId": "adm-empresas",
    "documentId": "6761660",
    "fullName": "HUGOBERTO SANCHEZ SANCHEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Administrador(a) de Empresas · Magíster en Administración y Gestión Empresarial",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "adm-empresas-6-esp-1",
        "name": "FUNDAMENTOS DE MERCADEO - FUN MER",
        "level": "Pregrado",
        "monthlyHours": 48
      },
      {
        "id": "adm-empresas-6-esp-2",
        "name": "INVESTIGACIÓN DE MERCADOS - INV MERC",
        "level": "Pregrado",
        "monthlyHours": 48
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "adm-empresas-7",
    "unitId": "adm-empresas",
    "documentId": "1007141977",
    "fullName": "MARÍA CAMILA MORENO GÓMEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Administrador(a) de Empresas · Magíster en Administración y Gestión Empresarial",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "adm-empresas-7-esp-1",
        "name": "DERECHO CONSTITUCIONAL Y ADMINISTRATIVO - DER CONS Y ADM",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "adm-empresas-7-esp-2",
        "name": "DERECHO COMERCIAL Y TRIBUTARIO - DER COM Y TRI",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "adm-empresas-7-esp-3",
        "name": "DERECHO LABORAL Y SEGURIDAD EN EL TRABAJO - DER LAB Y ST D",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "adm-empresas-7-esp-4",
        "name": "DERECHO LABORAL Y SEGURIDAD EN EL TRABAJO - DER LAB Y ST N",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "adm-empresas-8",
    "unitId": "adm-empresas",
    "documentId": "1049628191",
    "fullName": "MAURICIO ALEJANDRO JARRO SISA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Administrador(a) de Empresas · Magíster en Administración y Gestión Empresarial",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "adm-empresas-8-esp-1",
        "name": "PENSAMIENTO ADMINISTRATIVO - PEN ADM",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "adm-empresas-8-esp-2",
        "name": "TEORIA DE LAS ORGANIZACIONES - ADM2A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "adm-empresas-8-esp-3",
        "name": "CREACIÓN DE EMPRESAS - CREA EMP D",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "adm-empresas-8-esp-4",
        "name": "CREACIÓN DE EMPRESAS - CREA EMP N",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "adm-empresas-9",
    "unitId": "adm-empresas",
    "documentId": "7165031",
    "fullName": "RUBEN DARIO MONROY BECERRA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Administrador(a) de Empresas · Magíster en Administración y Gestión Empresarial",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "adm-empresas-9-esp-1",
        "name": "FUNDAMENTOS DE ECONOMIA - FUN ECO",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "adm-empresas-9-esp-2",
        "name": "COSTOS Y PRESUPUESTOS - COS Y PRES",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "adm-empresas-9-esp-3",
        "name": "CONTABILIDAD PARA LAS ORGANIZACIONES - CONT ORG",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "adm-empresas-9-esp-4",
        "name": "ANALISIS FINANCIERO - ADM4A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "adm-empresas-9-esp-5",
        "name": "INGENIERÍA ECONÓMICA - ING ECO",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "adm-empresas-10",
    "unitId": "adm-empresas",
    "documentId": "1049609104",
    "fullName": "YULIETH ROCIO IGUA PULIDO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Administrador(a) de Empresas · Magíster en Administración y Gestión Empresarial",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "adm-empresas-10-esp-1",
        "name": "GERENCIA DEL TALENTO HUMANO - GTH D",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "adm-empresas-10-esp-2",
        "name": "GERENCIA DEL TALENTO HUMANO - GTH N",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "adm-empresas-10-esp-3",
        "name": "RESPONSABILIDAD SOCIAL ORGANIZACIONAL - RES SOC ORG",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "adm-empresas-10-esp-4",
        "name": "NEGOCIOS INCLUSIVOS Y VALOR COMPARTIDO - NEG INCL",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "adm-empresas-10-esp-5",
        "name": "GESTIÓN DEL CONOCIMIENTO Y APRENDIZAJE ORGANIZACIONAL - GEST CON APRE ORG",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "adm-empresas-10-esp-6",
        "name": "PRACTICA PROFESIONAL - PRAC PROF",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-ambiental-1",
    "unitId": "ing-ambiental",
    "documentId": "33365693",
    "fullName": "ANDREA ANGELICA BERNAL FIGUEROA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) Ambiental · Magíster en Gestión y Ciencias Ambientales",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ing-ambiental-1-esp-1",
        "name": "ECONOMIA AMBIENTAL - IAM7A",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-ambiental-2",
    "unitId": "ing-ambiental",
    "documentId": "52351443",
    "fullName": "CLAUDIA ROCIO SUAREZ CASTILLO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Ambiental · Magíster en Gestión y Ciencias Ambientales",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "ing-ambiental-2-esp-1",
        "name": "MODELACIÓN Y SIMULACIÓN AMBIENTAL - IAM8A",
        "level": "Pregrado",
        "monthlyHours": 48
      },
      {
        "id": "ing-ambiental-2-esp-2",
        "name": "HIDROCLIMATOLOGÍA - HRIDRO 5-6",
        "level": "Pregrado",
        "monthlyHours": 48
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "30411": {
        "code": "30411",
        "hours": 4,
        "version1Hours": 4
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-ambiental-3",
    "unitId": "ing-ambiental",
    "documentId": "1193200629",
    "fullName": "CRISTIAN CAMILO FORERO BECERRA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero(a) Ambiental · Magíster en Gestión y Ciencias Ambientales",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ing-ambiental-3-esp-1",
        "name": "CLIMATOLOGIA - IAM6A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-ambiental-3-esp-2",
        "name": "CALIDAD DEL AIRE Y METEOROLOGÍA - AIRE 4-7",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-ambiental-3-esp-3",
        "name": "INTRODUCCIÓN A LA INGENIERÍA AMBIENTAL - IAM1A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-ambiental-3-esp-4",
        "name": "TRANSICIÓN ENERGÉTICA - ENERG 5-8",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-ambiental-4",
    "unitId": "ing-ambiental",
    "documentId": "1049652452",
    "fullName": "ELISA MARIA AVELLANEDA DIAZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Ambiental · Magíster en Gestión y Ciencias Ambientales",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "ing-ambiental-4-esp-1",
        "name": "SISTEMAS DE GESTION AMBIENTAL - IAM9A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-ambiental-4-esp-2",
        "name": "GESTIÓN AMBIENTAL DE PROCESOS - IAM8A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-ambiental-4-esp-3",
        "name": "TRATAMIENTO DE AGUAS RESIDUALES (PD) - IAM8A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-ambiental-4-esp-4",
        "name": "SANEAMIENTO AMBIENTAL - PROF II -III",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-ambiental-5",
    "unitId": "ing-ambiental",
    "documentId": "1098730752",
    "fullName": "JAIRO ANDRÉS GÓMEZ MUÑOZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) Ambiental · Magíster en Gestión y Ciencias Ambientales",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ing-ambiental-5-esp-1",
        "name": "LEGISLACION AMBIENTAL - IAM6A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-ambiental-5-esp-2",
        "name": "SEMINARIO DE ACTUALIZACION - IM10A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-ambiental-5-esp-3",
        "name": "PRODUCCIÓN MÁS LIMPIA - IAM9A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-ambiental-5-esp-4",
        "name": "GEOCIENCIAS - 1A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-ambiental-5-esp-5",
        "name": "PROGRAMACIÓN Y ANÁLISIS AMBIENTAL - IAM5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-ambiental-5-esp-6",
        "name": "INGENIERÍA DE RESIDUOS - RESIDU 5-7",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-ambiental-6",
    "unitId": "ing-ambiental",
    "documentId": "1049636598",
    "fullName": "KATHERINE JOHANA AGUJA HERRERA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Ambiental · Magíster en Gestión y Ciencias Ambientales",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "ing-ambiental-6-esp-1",
        "name": "OPCIÓN GRADO - IM10A",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 12,
        "version1Hours": 12
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-ambiental-7",
    "unitId": "ing-ambiental",
    "documentId": "1090365896",
    "fullName": "NYDIA MARGARITA HABRAN ESTEBAN",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero(a) Ambiental · Magíster en Gestión y Ciencias Ambientales",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ing-ambiental-7-esp-1",
        "name": "SEMINARIO DE GRADO III - IC10B (ING. CIVIL)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-ambiental-7-esp-2",
        "name": "IMPACTO AMBIENTAL - IM10A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-ambiental-7-esp-3",
        "name": "QUÍMICA AMBIENTAL - IAM3A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-ambiental-7-esp-4",
        "name": "MANEJO Y REMEDIACI¿N DE SUELOS - IAB4A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-ambiental-7-esp-5",
        "name": "INGENIERÍA AMBIENTAL APLICADA - IM10A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "20502": {
        "code": "20502",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "sharedUnitName": "ING. CIVIL",
    "version1Total": 160
  },
  {
    "id": "ing-ambiental-8",
    "unitId": "ing-ambiental",
    "documentId": "35261639",
    "fullName": "SANDRA CONSUELO DIAZ BELLO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Ambiental · Magíster en Gestión y Ciencias Ambientales",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "ing-ambiental-8-esp-1",
        "name": "SEMINARIO DE GRADO - IAM9A",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-1",
    "unitId": "derecho",
    "documentId": "1054678124",
    "fullName": "CAROL JULIANA HERREÑO ANGULO",
    "dedication": "DIRECTIVO",
    "expectedWorkload": 210,
    "rank": "Secretario(a) de División / General",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "derecho-1-esp-1",
        "name": "SUJETOS DE DERECHO - DER2A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "30222": {
        "code": "30222",
        "hours": 190,
        "version1Hours": 190
      }
    },
    "version1Total": 210
  },
  {
    "id": "derecho-2",
    "unitId": "derecho",
    "documentId": "1049621815",
    "fullName": "DIANA PAOLA CORREDOR PAMPLONA",
    "dedication": "DIRECTIVO",
    "expectedWorkload": 210,
    "rank": "Decano(a) de Facultad",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "derecho-2-esp-1",
        "name": "DERECHO ADMINISTRATIVO - DER3B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "30222": {
        "code": "30222",
        "hours": 190,
        "version1Hours": 190
      }
    },
    "version1Total": 210
  },
  {
    "id": "derecho-3",
    "unitId": "derecho",
    "documentId": "1049618184",
    "fullName": "ELIANA ANDREA COMBARIZA CAMARGO",
    "dedication": "DIRECTIVO",
    "expectedWorkload": 210,
    "rank": "Secretario(a) de División / General",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "derecho-3-esp-1",
        "name": "PROYECTO DE INVESTIGACION I - DER4A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "30222": {
        "code": "30222",
        "hours": 190,
        "version1Hours": 190
      }
    },
    "version1Total": 210
  },
  {
    "id": "derecho-4",
    "unitId": "derecho",
    "documentId": "7168963",
    "fullName": "ANDRES ALEJANDRO TORRES TELLEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "derecho-4-esp-1",
        "name": "PRV IX: DERECHO DE SOCIEDADES Y PROCESOS DE LIQUIDACION - DR10B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-4-esp-2",
        "name": "LAB II: SISTEMA GENERAL DE SALUD - DER9C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-4-esp-3",
        "name": "LAB VI: DERECHO INTERNACIONAL DE TRABAJO - DR10C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-4-esp-4",
        "name": "LAB IX: NEGOCIACION DE CONFLICTOS LABORALES - DR10C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-4-esp-5",
        "name": "LAB V: REGIMEN DEL TRABAJADOR OFICIAL - DER9C",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-5",
    "unitId": "derecho",
    "documentId": "7169629",
    "fullName": "ANDRES JOSE PARDO RODRIGUEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "derecho-5-esp-1",
        "name": "POL II: REGIMEN DE SERVICIOS PUBLICOS - DER9A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-5-esp-2",
        "name": "LABORAL APLICADO - DER8B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-5-esp-3",
        "name": "LABORAL APLICADO - DEREA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-5-esp-4",
        "name": "LAB I: SISTEMA GENERAL DE PENSIONES - DER9C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-5-esp-5",
        "name": "LAB IV: RIESGOS PROFESIONALES - DER9C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-5-esp-6",
        "name": "LAB VIII: ECONOMIA Y DERECHO LABORAL - DR10C",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-6",
    "unitId": "derecho",
    "documentId": "1069725022",
    "fullName": "CESAR FERNANDO HUTCHISON SALAZAR",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "derecho-6-esp-1",
        "name": "FILOSOFIA Y TEORIA DEL DERECHO - DER1A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-6-esp-2",
        "name": "FILOSOFIA Y TEORIA DEL DERECHO - DER1B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-6-esp-3",
        "name": "TEORIA DEL ESTADO Y DE LA CONSTITUCION - DER2A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-6-esp-4",
        "name": "TEORIA DEL ESTADO Y DE LA CONSTITUCION - DER2B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-6-esp-5",
        "name": "DERECHO CONSTITUCIONAL - DER3A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-7",
    "unitId": "derecho",
    "documentId": "40033698",
    "fullName": "DAISY DEL PILAR CADENA MORENO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "derecho-7-esp-1",
        "name": "DERECHO LABORAL INDIVIDUAL - DER LABIND",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-7-esp-2",
        "name": "DERECHO PROCESAL LABORAL - DERLAB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-7-esp-3",
        "name": "LAB X: TEORIA DEL TRABAJO - DR10C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-7-esp-4",
        "name": "SUJETOS DE DERECHO - DER2B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-7-esp-5",
        "name": "SUJETOS DE DERECHO - DER2C",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-7-esp-6",
        "name": "MECANISMOS ALTERNATIVOS DE SOLUCION DE CONFLICTOS - DER6A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-7-esp-7",
        "name": "MECANISMOS ALTERNATIVOS DE SOLUCION DE CONFLICTOS - DER6B",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-8",
    "unitId": "derecho",
    "documentId": "1049636219",
    "fullName": "DANIEL FELIPE GARAVITO RINCON",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "derecho-8-esp-1",
        "name": "ANALITICA VIII - DER8A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "derecho-8-esp-2",
        "name": "ANALITICA VIII - DER8B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "derecho-8-esp-3",
        "name": "ANALITICA VIII - DER8C",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "derecho-8-esp-4",
        "name": "PNL IX: ARGUMENTACIÓN JURÍDICA - DR10D",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-9",
    "unitId": "derecho",
    "documentId": "1049653324",
    "fullName": "DAVID ALEJANDRO RINTA LANDINEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "derecho-9-esp-1",
        "name": "ANALITICA V - DER5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-9-esp-2",
        "name": "ANALITICA IX - DER9A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-9-esp-3",
        "name": "ANALITICA X - DERA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-9-esp-4",
        "name": "ANALITICA X - DERC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-9-esp-5",
        "name": "DERECHO PUBLICO ECONOMICO - DER4A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-9-esp-6",
        "name": "DERECHO PUBLICO ECONOMICO - DER4B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 14,
        "version1Hours": 14
      },
      "30411": {
        "code": "30411",
        "hours": 18,
        "version1Hours": 18
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-10",
    "unitId": "derecho",
    "documentId": "1053605473",
    "fullName": "DAVID SUAREZ GOMEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "derecho-10-esp-1",
        "name": "DERECHO PROCESAL ADMINISTRATIVO Y PROBATORIO - DER4C",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-11",
    "unitId": "derecho",
    "documentId": "74244588",
    "fullName": "DEIBY ALBERTO SAENZ RODRIGUEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "derecho-11-esp-1",
        "name": "DERECHO PENAL GENERAL - DER8B",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "derecho-11-esp-2",
        "name": "DERECHO PENAL GENERAL - DER8C",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "derecho-11-esp-3",
        "name": "PNL X: DERECHO PENAL DE LA INFANCIA Y LA ADOLESCENCIA - DR10D",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-12",
    "unitId": "derecho",
    "documentId": "40048328",
    "fullName": "DEISY JOANNA FORERO FORERO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "derecho-12-esp-1",
        "name": "POL V: CONTRATACION ADMINISTRATIVA - DER9A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "derecho-12-esp-2",
        "name": "NEGOCIO JURIDICO Y OBLIGACIONES - DER5A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "derecho-12-esp-3",
        "name": "NEGOCIO JURIDICO Y OBLIGACIONES - DER5B",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-13",
    "unitId": "derecho",
    "documentId": "63554519",
    "fullName": "DIANA CAROLINA RODRIGUEZ JUNCO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "derecho-13-esp-1",
        "name": "ANALITICA I - DER1A",
        "level": "Pregrado",
        "monthlyHours": 48
      },
      {
        "id": "derecho-13-esp-2",
        "name": "METODOLOGIA DE LA INVESTIGACION - DER2C",
        "level": "Pregrado",
        "monthlyHours": 48
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-14",
    "unitId": "derecho",
    "documentId": "33378577",
    "fullName": "DIANA MARIA ROSERO MONROY",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "derecho-14-esp-1",
        "name": "DERECHO PROCESAL PENAL - DER8A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-14-esp-2",
        "name": "DERECHO PROCESAL PENAL - DER8C",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-14-esp-3",
        "name": "PNL VI: DERECHO PENAL COMPARADO - DR10D",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-14-esp-4",
        "name": "PNL V: TEORIA DEL DELITO Y LA PENA - DER9D",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-14-esp-5",
        "name": "DERECHO PENAL ESPECIAL - DER7B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-14-esp-6",
        "name": "CRIMINOLOGIA Y POLITICA CRIMINAL - DER7A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-14-esp-7",
        "name": "CRIMINOLOGIA Y POLITICA CRIMINAL - DER7B",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "derecho-14-esp-8",
        "name": "RESPONSABILIDAD PENAL JUVENIL - DER7A",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "derecho-14-esp-9",
        "name": "DERECHO PENAL INTERNACIONAL - DER7A",
        "level": "Pregrado",
        "monthlyHours": 8
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-15",
    "unitId": "derecho",
    "documentId": "33377298",
    "fullName": "EDITH LILIANA NIETO BERNAL",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "derecho-15-esp-1",
        "name": "CONTRATOS CIVILES - DER5A",
        "level": "Pregrado",
        "monthlyHours": 48
      },
      {
        "id": "derecho-15-esp-2",
        "name": "CONTRATOS CIVILES - DER5B",
        "level": "Pregrado",
        "monthlyHours": 48
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-16",
    "unitId": "derecho",
    "documentId": "80793949",
    "fullName": "EDMER LEANDRO LOPEZ PENA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "derecho-16-esp-1",
        "name": "POL I: ACCIONES CONSTITUCIONALES E INTERPRETACIÓN CONSTITUCIONAL - DER9A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "derecho-16-esp-2",
        "name": "POL III: DERECHO DISCIPLINARIO - DER9A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "derecho-16-esp-3",
        "name": "POL VIII: RESPONSABILIDAD ESTATAL - DR10A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "derecho-16-esp-4",
        "name": "TEORIA DEL ESTADO Y DE LA CONSTITUCION - DER2C",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-17",
    "unitId": "derecho",
    "documentId": "1057590913",
    "fullName": "FABIAN CAMILO ALFONSO CABEZAS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "derecho-17-esp-1",
        "name": "DERECHO PUBLICO ECONOMICO - DER4C",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-18",
    "unitId": "derecho",
    "documentId": "6775031",
    "fullName": "FABIO HUERFANO LOPEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "derecho-18-esp-1",
        "name": "DERECHO ADMINISTRATIVO - DER3A",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-19",
    "unitId": "derecho",
    "documentId": "11204755",
    "fullName": "FABIO JEFFREY ROJAS PALACIOS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "derecho-19-esp-1",
        "name": "DERECHO PENAL GENERAL - DER8A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-19-esp-2",
        "name": "DERECHO PROCESAL PENAL - DER8B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-19-esp-3",
        "name": "PNL III: PRUEBAS PENALES Y CRIMINALÍSTICA - DER9D",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-19-esp-4",
        "name": "PNL VII: FUNDAMENTOS CONSTITUCIONALES DEL DERECHO PENAL - DR10D",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-19-esp-5",
        "name": "PNL VIII: JUICIO ORAL - DR10D",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-19-esp-6",
        "name": "DERECHO PENAL GENERAL - DER7A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-19-esp-7",
        "name": "DERECHO PENAL GENERAL - DER7B",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-20",
    "unitId": "derecho",
    "documentId": "1049620563",
    "fullName": "FERNANDO ALONSO TOVAR URICOECHEA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "derecho-20-esp-1",
        "name": "DERECHO CONSTITUCIONAL - DER3B",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 12,
        "version1Hours": 12
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-21",
    "unitId": "derecho",
    "documentId": "24133694",
    "fullName": "GLORIA CARMENZA PAEZ PALACIOS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "derecho-21-esp-1",
        "name": "LAB III: DERECHO ADMINISTRATIVO LABORAL - DER9C",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "derecho-21-esp-2",
        "name": "LAB VII: DERECHO LABORAL CONSTITUCIONAL - DR10C",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "derecho-21-esp-3",
        "name": "INTRODUCCION AL DERECHO - DER1A",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 12,
        "version1Hours": 12
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-22",
    "unitId": "derecho",
    "documentId": "19284760",
    "fullName": "GUSTAVO ADOLFO LANZIANO MOLANO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "derecho-22-esp-1",
        "name": "POL VI: DERECHO ELECTORAL Y DE LOS PARTIDOS POLITICOS - DR10A",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "20502": {
        "code": "20502",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-23",
    "unitId": "derecho",
    "documentId": "19471810",
    "fullName": "HECTOR FRANCISCO AREVALO FOMEQUE",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "derecho-23-esp-1",
        "name": "PRV VI: CASACION CIVIL - DR10B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-23-esp-2",
        "name": "TEORIA GENERAL DEL PROCESO - DER2A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-23-esp-3",
        "name": "TEORIA GENERAL DEL PROCESO - DER2B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-23-esp-4",
        "name": "TEORIA GENERAL DEL PROCESO - DER2C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-23-esp-5",
        "name": "DERECHO PROCESAL CIVIL Y DERECHO PROBATORIO - DER6A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-23-esp-6",
        "name": "DERECHO PROCESAL CIVIL Y DERECHO PROBATORIO - DER6B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "20502": {
        "code": "20502",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-24",
    "unitId": "derecho",
    "documentId": "6768532",
    "fullName": "JORGE ALBERTO VALCARCEL GARCIA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "derecho-24-esp-1",
        "name": "ANALITICA IV - DER4A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-24-esp-2",
        "name": "ANALITICA IV - DER4B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-24-esp-3",
        "name": "ANALITICA VI - DER6A",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "derecho-24-esp-4",
        "name": "ANALITICA VI - DER6B",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "derecho-24-esp-5",
        "name": "ANALITICA IX - DER9D",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "derecho-24-esp-6",
        "name": "ANALITICA X - DERD",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "derecho-24-esp-7",
        "name": "HISTORIA DEL DERECHO Y DE LAS INSTITUCIONES JURIDICAS - DER1A",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "derecho-24-esp-8",
        "name": "HISTORIA DEL DERECHO Y DE LAS INSTITUCIONES JURIDICAS - DER1B",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "derecho-24-esp-9",
        "name": "ANALITICA III - DER3A",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "derecho-24-esp-10",
        "name": "ANALITICA III - DER3B",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "derecho-24-esp-11",
        "name": "SOCIOLOGÍA JURÍDICA - DER2A",
        "level": "Pregrado",
        "monthlyHours": 8
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "20502": {
        "code": "20502",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-25",
    "unitId": "derecho",
    "documentId": "4118914",
    "fullName": "JORGE ENRIQUE PATINO ROJAS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "derecho-25-esp-1",
        "name": "POL IV: ENTIDADES TERRITORIALES - DER9A",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-26",
    "unitId": "derecho",
    "documentId": "1052385384",
    "fullName": "JOSE EDUARDO VALDERRAMA VELANDIA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "derecho-26-esp-1",
        "name": "PRV IV: NOTARIADO Y REGISTRO - DER9B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-26-esp-2",
        "name": "DERECHO COMERCIAL Y BIENES - DER5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-26-esp-3",
        "name": "DERECHO COMERCIAL Y BIENES - DER5B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-26-esp-4",
        "name": "SOCIEDADES CIVILES Y COMERCIALES - DER6A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-26-esp-5",
        "name": "SOCIEDADES CIVILES Y COMERCIALES - DER6B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-26-esp-6",
        "name": "PROCESAL CIVIL Y COMERCIAL ESPECIAL - DER6A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-27",
    "unitId": "derecho",
    "documentId": "7164361",
    "fullName": "JOSÉ OVIDIO NOCUA ACUÑA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "derecho-27-esp-1",
        "name": "ANALITICA IX - DER9B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-27-esp-2",
        "name": "ANALITICA X - DERB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-27-esp-3",
        "name": "PRV VII: PROPIEDAD INTELECTUAL Y NOMBRES DE DOMINIO - DR10B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-27-esp-4",
        "name": "PRV VIII: COMERCIO ELECTRONICO - DR10B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-27-esp-5",
        "name": "METODOLOGIA DE LA INVESTIGACION - DER2A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-27-esp-6",
        "name": "METODOLOGIA DE LA INVESTIGACION - DER2B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-27-esp-7",
        "name": "SUCESIONES - DER5A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-27-esp-8",
        "name": "CONTRATOS Y OBLIGACIONES CIVILES - DER6B",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-28",
    "unitId": "derecho",
    "documentId": "1049614690",
    "fullName": "JULIO CESAR LESMES CAMARGO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "derecho-28-esp-1",
        "name": "INTRODUCCION AL DERECHO - DER1B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-28-esp-2",
        "name": "DERECHO INTERNACIONAL PUBLICO Y COMUNITARIO - DER3A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-28-esp-3",
        "name": "DERECHO INTERNACIONAL PUBLICO Y COMUNITARIO - DER3B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-28-esp-4",
        "name": "DERECHOS HUMANOS Y DERECHO INTERNACIONAL - DER4A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-28-esp-5",
        "name": "DERECHOS HUMANOS Y DERECHO INTERNACIONAL - DER4B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-29",
    "unitId": "derecho",
    "documentId": "33377124",
    "fullName": "LADY CAROLINA BAYONA ESTUPIÑAN",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "derecho-29-esp-1",
        "name": "INVESTIGACION ASISTIDA III - DER8A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-29-esp-2",
        "name": "INVESTIGACION ASISTIDA III - DER8B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-29-esp-3",
        "name": "INVESTIGACION ASISTIDA III - DER8C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-29-esp-4",
        "name": "POL X: DERECHO AMBIENTAL - DR10A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-29-esp-5",
        "name": "PRV I: DERECHO AGRARIO - DER9B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-29-esp-6",
        "name": "INTERPRETACION Y ARGUMENTACION JURIDICA - DER3A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-29-esp-7",
        "name": "INTERPRETACION Y ARGUMENTACION JURIDICA - DER3B",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-30",
    "unitId": "derecho",
    "documentId": "40041862",
    "fullName": "LUCIA FERNANDA TÉLLEZ PÉREZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "derecho-30-esp-1",
        "name": "PRV X: DERECHO DE SEGUROS - DR10B",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-31",
    "unitId": "derecho",
    "documentId": "7162901",
    "fullName": "LUIS ANTONIO BAYONA HERNANDEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "derecho-31-esp-1",
        "name": "ETICA PROFESIONAL - DER8A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-31-esp-2",
        "name": "ETICA PROFESIONAL - DER8B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-31-esp-3",
        "name": "ETICA PROFESIONAL - DER8C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-31-esp-4",
        "name": "PNL I: ESCUELAS DE DERECHO PENAL Y ESQUEMAS DEL DELITO - DER9D",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-31-esp-5",
        "name": "DERECHO POLICIVO - DEREA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-31-esp-6",
        "name": "DERECHO POLICIVO - DEREB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-31-esp-7",
        "name": "DERECHO POLICIVO - DEREC",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-32",
    "unitId": "derecho",
    "documentId": "91105963",
    "fullName": "MANUEL RODRIGUEZ ACEVEDO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "derecho-32-esp-1",
        "name": "DERECHO PENAL ESPECIAL - DER8B",
        "level": "Pregrado",
        "monthlyHours": 48
      },
      {
        "id": "derecho-32-esp-2",
        "name": "DERECHO PENAL ESPECIAL - DER7A",
        "level": "Pregrado",
        "monthlyHours": 48
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-33",
    "unitId": "derecho",
    "documentId": "72246118",
    "fullName": "MARLON IVAN MALDONADO NARVAEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "derecho-33-esp-1",
        "name": "PRV II: TÍTULOS VALORES - DER9B",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "derecho-33-esp-2",
        "name": "TITULOS VALORES - DER6A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "derecho-33-esp-3",
        "name": "TITULOS VALORES - DER6B",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-34",
    "unitId": "derecho",
    "documentId": "7169502",
    "fullName": "MARTIN HERNAN PEREZ CUERVO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "derecho-34-esp-1",
        "name": "PRACTICA CIVIL - DER8B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-34-esp-2",
        "name": "PRACTICA CIVIL - DEREA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-34-esp-3",
        "name": "DERECHO PROCESAL ADMINISTRATIVO Y PROBATORIO - DER4A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-34-esp-4",
        "name": "DERECHO PROCESAL ADMINISTRATIVO Y PROBATORIO - DER4B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-34-esp-5",
        "name": "CONTRATOS COMERCIALES E INTERNACIONALES - DER6A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-34-esp-6",
        "name": "CONTRATOS COMERCIALES E INTERNACIONALES - DER6B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "derecho-34-esp-7",
        "name": "RESPONSABILIDAD DEL ESTADO - DER3A",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-35",
    "unitId": "derecho",
    "documentId": "1049617492",
    "fullName": "NESTOR HERNANDO MORENO HUERTAS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "derecho-35-esp-1",
        "name": "ANALITICA IV - DER4C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-35-esp-2",
        "name": "ANALITICA V - DER5B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-35-esp-3",
        "name": "ANALITICA VII - DER7A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-35-esp-4",
        "name": "ANALITICA VII - DER7B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-35-esp-5",
        "name": "SOCIOLOGIA JURIDICA - DER1A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-35-esp-6",
        "name": "SOCIOLOGIA JURIDICA - DER1B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-36",
    "unitId": "derecho",
    "documentId": "33369931",
    "fullName": "NOHORA MILENA CANO FONSECA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "derecho-36-esp-1",
        "name": "POL IX: POLITICAS PUBLICAS - DR10A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-36-esp-2",
        "name": "PROYECTO DE INVESTIGACION I - DER4B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-36-esp-3",
        "name": "PROYECTO DE INVESTIGACION I - DER4C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-36-esp-4",
        "name": "PROYECTO DE INVESTIGACION II - DER5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-36-esp-5",
        "name": "PROYECTO DE INVESTIGACION II - DER5B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-36-esp-6",
        "name": "POLÍTICAS PÚBLICAS - DER3A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-37",
    "unitId": "derecho",
    "documentId": "19186997",
    "fullName": "RAFAEL ANTONIO PARRA SERNA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "derecho-37-esp-1",
        "name": "PNL II: MEDICINA LEGAL - DER9D",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-38",
    "unitId": "derecho",
    "documentId": "79641577",
    "fullName": "ROBINSON ARI CARDENAS SIERRA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "derecho-38-esp-1",
        "name": "ANALITICA I - DER1B",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-39",
    "unitId": "derecho",
    "documentId": "51625848",
    "fullName": "ROSALBA ALARCON GERENA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "derecho-39-esp-1",
        "name": "PRV III: REGIMEN PATRIMONIAL DE LA FAMILIA Y SUCESIONES - DER9B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "derecho-39-esp-2",
        "name": "DERECHO DE FAMILIA Y LEGISLACION DEL MENOR - DER5A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "derecho-39-esp-3",
        "name": "DERECHO DE FAMILIA Y LEGISLACION DEL MENOR - DER5B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "derecho-39-esp-4",
        "name": "SUCESIONES - DER5B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-40",
    "unitId": "derecho",
    "documentId": "75096094",
    "fullName": "RUBEN DARIO SERNA SALAZAR",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "derecho-40-esp-1",
        "name": "CONSULTORIO JURIDICO - CONS JURA",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "derecho-40-esp-2",
        "name": "CONSULTORIO JURIDICO - CONSU JURB",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-3",
        "name": "CONSULTORIO JURIDICO - CONSU JURC",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-4",
        "name": "CONSULTORIO JURIDICO - CONSU JURD",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-5",
        "name": "CONSULTORIO JURIDICO - CONSU JURE",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-6",
        "name": "CONSULTORIO JURIDICO - CONSU JURF",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-7",
        "name": "CONSULTORIO JURIDICO - CONSU JURG",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-8",
        "name": "CONSULTORIO JURIDICO - CONSU JURH",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-9",
        "name": "CONSULTORIO JURIDICO - CONSU JURI",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-10",
        "name": "CONSULTORIO JURIDICO - CONSU JURJ",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-11",
        "name": "CONSULTORIO JURIDICO - CONS JURB",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-12",
        "name": "CONSULTORIO JURIDICO - CONS JURC",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-13",
        "name": "CONSULTORIO JURIDICO - CONS JURD",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-14",
        "name": "CONSULTORIO JURIDICO - CONS JURE",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-15",
        "name": "CONSULTORIO JURIDICO - CONS JURF",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-16",
        "name": "CONSULTORIO JURIDICO - CONS JURG",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-17",
        "name": "CONSULTORIO JURIDICO - CONS JURH",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-18",
        "name": "CONSULTORIO JURIDICO - CONS JURI",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-19",
        "name": "CONSULTORIO JURIDICO - CONS JURJ",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-20",
        "name": "POL VII: DERECHO TRIBUTARIO Y REGULACION ECONOMICA - DR10A",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-21",
        "name": "PRV V: DERECHO DEL CONSUMIDOR - DER9B",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-22",
        "name": "CONSULTORIO JURIDICO I - CONSU JURA",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-23",
        "name": "CONSULTORIO JURIDICO I - CONSU JURB",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-24",
        "name": "CONSULTORIO JURIDICO I - CONSU JURC",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-25",
        "name": "CONSULTORIO JURIDICO I - CONSU JURD",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-26",
        "name": "CONSULTORIO JURIDICO I - CONSU JURE",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-27",
        "name": "CONSULTORIO JURIDICO I - CONSU JURF",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-28",
        "name": "CONSULTORIO JURIDICO I - CONSU JURG",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-29",
        "name": "CONSULTORIO JURIDICO I - CONSU JURH",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-30",
        "name": "CONSULTORIO JURIDICO I - CONSU JURI",
        "level": "Pregrado",
        "monthlyHours": 4
      },
      {
        "id": "derecho-40-esp-31",
        "name": "CONSULTORIO JURIDICO I - CONSU JURJ",
        "level": "Pregrado",
        "monthlyHours": 4
      }
    ],
    "allocations": {},
    "version1Total": 160
  },
  {
    "id": "derecho-41",
    "unitId": "derecho",
    "documentId": "46674075",
    "fullName": "SANDRA LILIANA AVELLANEDA HERNÁNDEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "derecho-41-esp-1",
        "name": "TEORIA GENERAL DE LA PRUEBA - DER2A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-41-esp-2",
        "name": "TEORIA GENERAL DE LA PRUEBA - DER2B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-41-esp-3",
        "name": "TEORIA GENERAL DE LA PRUEBA - DER2C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-41-esp-4",
        "name": "DERECHOS HUMANOS Y DERECHO INTERNACIONAL - DER4C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "derecho-41-esp-5",
        "name": "TEORÍA DE LOS DERECHOS FUNDAMENTALES - DEREA",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-42",
    "unitId": "derecho",
    "documentId": "1049629014",
    "fullName": "SERGIO ANDRES LOPEZ ZAMORA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "derecho-42-esp-1",
        "name": "DERECHO PENAL ESPECIAL - DER8A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "derecho-42-esp-2",
        "name": "DERECHO PENAL ESPECIAL - DER8C",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "derecho-42-esp-3",
        "name": "DERECHO PROCESAL PENAL Y PROBATORIO - DER7A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "derecho-42-esp-4",
        "name": "DERECHO PROCESAL PENAL Y PROBATORIO - DER7B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-43",
    "unitId": "derecho",
    "documentId": "7164015",
    "fullName": "SIMON EDUARDO MARTINEZ ESCANDON",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "derecho-43-esp-1",
        "name": "PNL IV: CRIMINOLOGIA - DER9D",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "derecho-44",
    "unitId": "derecho",
    "documentId": "79796254",
    "fullName": "WILLIAN FERNANDO HERNANDEZ BUITRAGO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Abogado(a) · Magíster en Derecho",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "derecho-44-esp-1",
        "name": "ANALITICA IX - DER9C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-44-esp-2",
        "name": "ANALITICA II - DER2A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-44-esp-3",
        "name": "ANALITICA II - DER2B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-44-esp-4",
        "name": "ANALITICA II - DER2C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-44-esp-5",
        "name": "PENSAMIENTO LOGICO - DER7A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "derecho-44-esp-6",
        "name": "PENSAMIENTO LOGICO - DER7B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-1",
    "unitId": "ing-civil",
    "documentId": "1049618165",
    "fullName": "ANDRES FELIPE BERNAL VILLATE",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ing-civil-1-esp-1",
        "name": "FUNDACIONES - ICVA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-1-esp-2",
        "name": "ESTRUCTURAS DE CONTENCIÓN Y MODELACIÓN GEOTECNICA APLICADA - IC10A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-1-esp-3",
        "name": "ESTRUCTURAS DE CONTENCIÓN Y MODELACIÓN GEOTECNICA APLICADA - IC10B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-1-esp-4",
        "name": "SEMINARIO DE GRADO III - IC10A",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-2",
    "unitId": "ing-civil",
    "documentId": "6773003",
    "fullName": "ANGEL FRANCISCO DAZA PINZON",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "ing-civil-2-esp-1",
        "name": "ESTATICA - ICV3A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-2-esp-2",
        "name": "ESTATICA - ICV3B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-2-esp-3",
        "name": "MAQUINARIA Y EQUIPO - ICV7A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-2-esp-4",
        "name": "ESTRUCTURAS EN ACERO - ICV9A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-2-esp-5",
        "name": "ESTRUCTURAS EN ACERO - ICV9B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-3",
    "unitId": "ing-civil",
    "documentId": "80108194",
    "fullName": "CAMILO ANDRES VARGAS TERRANOVA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ing-civil-3-esp-1",
        "name": "TUBERIAS Y CANALES - ICV6A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-3-esp-2",
        "name": "TUBERIAS Y CANALES - ICV6B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-3-esp-3",
        "name": "MECANICA DE FLUIDOS - ICV4A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-3-esp-4",
        "name": "MECANICA DE FLUIDOS - ICV4B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-4",
    "unitId": "ing-civil",
    "documentId": "1049614636",
    "fullName": "CARLOS ANDRES VILLAMIL BUENO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "ing-civil-4-esp-1",
        "name": "MECANICA DE MATERIALES - ICV4A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-4-esp-2",
        "name": "MECANICA DE MATERIALES - ICV4B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-4-esp-3",
        "name": "CONSTRUCCION Y COSTOS - ICV8A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-4-esp-4",
        "name": "CONSTRUCCION Y COSTOS - ICV8B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-5",
    "unitId": "ing-civil",
    "documentId": "1136880903",
    "fullName": "DIANA MARIA BELTRAN BELTRAN",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ing-civil-5-esp-1",
        "name": "ALCANTARILLADOS - ICV7A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "ing-civil-5-esp-2",
        "name": "DRENAJE URBANO - IC10A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "ing-civil-5-esp-3",
        "name": "DRENAJE URBANO - IC10B",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-6",
    "unitId": "ing-civil",
    "documentId": "1049643017",
    "fullName": "FREDY AQUILINO FAGUA VARGAS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "ing-civil-6-esp-1",
        "name": "PAVIMENTOS - ICV8A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-6-esp-2",
        "name": "PAVIMENTOS - ICV8B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-6-esp-3",
        "name": "EVALUACION DE PROYECTOS - ICVVA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-6-esp-4",
        "name": "DISEÑO GEOMETRICO DE VÍAS - ICVA",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "30411": {
        "code": "30411",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-7",
    "unitId": "ing-civil",
    "documentId": "7177725",
    "fullName": "GERMAN OSWALDO PARADA PEREZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ing-civil-7-esp-1",
        "name": "ACUEDUCTOS - ICV7A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-7-esp-2",
        "name": "HIDRAULICA - ICVA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-7-esp-3",
        "name": "INSTALACIONES HIDRAULICAS Y SANITARIAS PARA EDIFICACIONES - ICV9A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-7-esp-4",
        "name": "INSTALACIONES HIDRAULICAS Y SANITARIAS PARA EDIFICACIONES - ICV9B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-8",
    "unitId": "ing-civil",
    "documentId": "1052410886",
    "fullName": "HANS KURT WIEST ZEA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "ing-civil-8-esp-1",
        "name": "GEOCIENCIAS - IAMIA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-8-esp-2",
        "name": "GEOCIENCIAS - IAMIB",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-8-esp-3",
        "name": "FUNDAMENTOS DE GEOTECNIA - ICV4A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-8-esp-4",
        "name": "FUNDAMENTOS DE GEOTECNIA - ICV4B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-9",
    "unitId": "ing-civil",
    "documentId": "9397835",
    "fullName": "HAROLD ALEXANDER ALVAREZ CASTANEDA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ing-civil-9-esp-1",
        "name": "CONCRETO REFORZADO - ICV6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-9-esp-2",
        "name": "CONCRETO REFORZADO - ICV6B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-9-esp-3",
        "name": "CONCRETO PRE-ESFORZADO - ICV8A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-9-esp-4",
        "name": "CONCRETO PRE-ESFORZADO - ICV8B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-9-esp-5",
        "name": "CONCRETO REFORZADO II - ICV7A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-10",
    "unitId": "ing-civil",
    "documentId": "80114000",
    "fullName": "JOSE DARIO GAVILANES",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "ing-civil-10-esp-1",
        "name": "REPRESENTACION GRAFICA - IAMIA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-10-esp-2",
        "name": "TECNOLOGÍA DEL CONCRETO - ICV3A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-10-esp-3",
        "name": "PROCESOS CONSTRUCTIVOS - ICV4A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-10-esp-4",
        "name": "PROCESOS CONSTRUCTIVOS - ICV4B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-11",
    "unitId": "ing-civil",
    "documentId": "7175704",
    "fullName": "JUAN RICARDO PEREZ CUERVO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ing-civil-11-esp-1",
        "name": "DISEÑO VIAL ASISTIDO POR COMPUTADOR AUTOCAD CIVIL 3D - ICV9A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-11-esp-2",
        "name": "DISEÑO VIAL ASISTIDO POR COMPUTADOR AUTOCAD CIVIL 3D - ICV9B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-11-esp-3",
        "name": "TRANSITO Y TRANSPORTE - ICV4A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-11-esp-4",
        "name": "TRANSITO Y TRANSPORTE - ICV4B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-12",
    "unitId": "ing-civil",
    "documentId": "1049641490",
    "fullName": "JULIAN SANTIAGO CASTRO PEÑA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "ing-civil-12-esp-1",
        "name": "INTRODUCCIÓN A LA INGENIERÍA - ICV1A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-12-esp-2",
        "name": "LEGISLACION PARA INGENIEROS - ICV9A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-12-esp-3",
        "name": "LEGISLACION PARA INGENIEROS - ICV9B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-12-esp-4",
        "name": "MODELACIÓN CON SISTEMAS BUILDING INFORMATION MODELING - BIM - ICV9A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-12-esp-5",
        "name": "MODELACIÓN CON SISTEMAS BUILDING INFORMATION MODELING - BIM - ICV9B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-13",
    "unitId": "ing-civil",
    "documentId": "1049608842",
    "fullName": "LAURA NATALIA GARAVITO RINCÓN",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ing-civil-13-esp-1",
        "name": "GEOMATICA - ICV6B",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-14",
    "unitId": "ing-civil",
    "documentId": "1049641025",
    "fullName": "LAURA YANETH GIL ALVARADO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "ing-civil-14-esp-1",
        "name": "HIDROLOGIA - ICV6A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "ing-civil-14-esp-2",
        "name": "HIDROLOGIA - ICV6B",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "ing-civil-14-esp-3",
        "name": "HIDROLOGIA - ICVA",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 20,
        "version1Hours": 20
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-15",
    "unitId": "ing-civil",
    "documentId": "1049634637",
    "fullName": "LUZ ADRIANA OCHOA RISCANEVO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ing-civil-15-esp-1",
        "name": "MECANICA DE SUELOS - ICV6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-15-esp-2",
        "name": "MECANICA DE SUELOS - ICV6B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-15-esp-3",
        "name": "FUNDACIONES - ICV7A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-15-esp-4",
        "name": "SEMINARIO DE GRADO II - ICV9A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-civil-15-esp-5",
        "name": "SEMINARIO DE GRADO II - ICV9B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "20502": {
        "code": "20502",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-16",
    "unitId": "ing-civil",
    "documentId": "7177038",
    "fullName": "NESTOR IVÁN ROJAS GAMBA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "ing-civil-16-esp-1",
        "name": "GEOMATICA - ICV2B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-16-esp-2",
        "name": "GEOMATICA - ICV6A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-16-esp-3",
        "name": "GEOMATICA - ICVVA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-16-esp-4",
        "name": "SEMINARIO DE GRADO I - ICV8A",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "20502": {
        "code": "20502",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-17",
    "unitId": "ing-civil",
    "documentId": "7186213",
    "fullName": "PEDRO MAURICIO ACOSTA CASTELLANOS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ing-civil-17-esp-1",
        "name": "INGENIERIA APLICADA - IC10A",
        "level": "Pregrado",
        "monthlyHours": 48
      },
      {
        "id": "ing-civil-17-esp-2",
        "name": "INGENIERIA APLICADA - IC10B",
        "level": "Pregrado",
        "monthlyHours": 48
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "20502": {
        "code": "20502",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-18",
    "unitId": "ing-civil",
    "documentId": "1012438721",
    "fullName": "SAMANTHA PINZÓN RIAÑO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "ing-civil-18-esp-1",
        "name": "TRATAMIENTO DE AGUAS - ICV8A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-18-esp-2",
        "name": "TRATAMIENTO DE AGUAS - ICV8B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-18-esp-3",
        "name": "AMBIENTAL - ICV8A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-18-esp-4",
        "name": "AMBIENTAL - ICV8B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-civil-19",
    "unitId": "ing-civil",
    "documentId": "7172708",
    "fullName": "WILSON ALFREDO MEDINA SIERRA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero(a) Civil · Magíster en Ingeniería Civil",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ing-civil-19-esp-1",
        "name": "ANALISIS ESTRUCTURAL - ICV5A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-19-esp-2",
        "name": "ANALISIS ESTRUCTURAL - ICV5B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-19-esp-3",
        "name": "CASA DE UNO Y DOS PISOS - IC10A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-civil-19-esp-4",
        "name": "CASA DE UNO Y DOS PISOS - IC10B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-1",
    "unitId": "arquitectura",
    "documentId": "41772814",
    "fullName": "ADRIANA PAULINA GIRALDO MELENDEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "arquitectura-1-esp-1",
        "name": "PROYECTO I. ARQUITECTURA Y LEGUAJE - ARQ3B",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "arquitectura-1-esp-2",
        "name": "PROYECTO DE GRADO I - ARQ9A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "arquitectura-1-esp-3",
        "name": "ENFASIS PATRI - TECNICAS Y PROCEDIMIENTOS - ARQ9A",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-2",
    "unitId": "arquitectura",
    "documentId": "40041917",
    "fullName": "ANDREA GABRIELA CAMARGO PULIDO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "arquitectura-2-esp-1",
        "name": "GEOMETRIA DESCRIPTIVA I - ARQ1A (CIENCIAS BÁSICAS)",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-2-esp-2",
        "name": "GEOMETRIA DESCRIPTIVA II - ARQUA (CIENCIAS BÁSICAS)",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-2-esp-3",
        "name": "FUNDAMENTOS DEL PROYECTO I - ARQ1B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-2-esp-4",
        "name": "PRACTICA PROFESIONAL - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "30411": {
        "code": "30411",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "sharedUnitName": "CIENCIAS BÁSICAS",
    "version1Total": 160
  },
  {
    "id": "arquitectura-3",
    "unitId": "arquitectura",
    "documentId": "1015409881",
    "fullName": "ANDRES CAMILO GOMEZ AGUILAR",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "arquitectura-3-esp-1",
        "name": "GEOMETRIA DESCRIPTIVA II - ARQ2B (CIENCIAS BÁSICAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-3-esp-2",
        "name": "PROYECTO II. SISTEMAS Y ORGANIZACIONES ESPACIALES - ARQ4C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-3-esp-3",
        "name": "EXPRESION IV. DIBUJO PLANIMÉTRICO ANÁLOGO Y DIGITAL - ARQ4B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-3-esp-4",
        "name": "EXPRESIÓN V. ADVANCED DIGITAL EXPRESIÓN TOOLS - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-3-esp-5",
        "name": "BIM - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "sharedUnitName": "CIENCIAS BÁSICAS",
    "version1Total": 160
  },
  {
    "id": "arquitectura-4",
    "unitId": "arquitectura",
    "documentId": "7167481",
    "fullName": "CARLOS ALFREDO CASTRO BOHORQUEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "arquitectura-4-esp-1",
        "name": "PROYECTO I. ARQUITECTURA Y LEGUAJE - ARQ3A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "arquitectura-4-esp-2",
        "name": "PROYECTO VI. EXPERIMENTAL - ARQ8A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "arquitectura-4-esp-3",
        "name": "SEMINARIO DE INVESTIGACIÓN - ARQ8B",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-5",
    "unitId": "arquitectura",
    "documentId": "6766752",
    "fullName": "FERNANDO AUGUSTO TORRES BERNAL",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "arquitectura-5-esp-1",
        "name": "GEOMETRÍA PLANA Y DEL ESPACIO - ARQ1A (CIENCIAS BÁSICAS)",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-5-esp-2",
        "name": "FUNDAMENTOS DEL PROYECTO II - ARQ2B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-5-esp-3",
        "name": "CONSTRUCCIÓN II. SISTEMAS Y PROCESOS CONSTRUCTIVOS - ARQ4B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-5-esp-4",
        "name": "ESTRUCTURAS II. SISTEMAS ESTRUCTURALES SISMO RESITENTES - ARQIB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "arquitectura-5-esp-5",
        "name": "ADMINISTRACIÓN Y LEGISLACIÓN I. ADMINISTRACIÓN DE OBRA - ARQIB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "arquitectura-5-esp-6",
        "name": "PROCESOS CONSTRUCTIVOS E INTERVENTORÍA DE OBRA - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "arquitectura-5-esp-7",
        "name": "ELECTIVA - RESIDENCIA DE OBRA - AQ10A",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "sharedUnitName": "CIENCIAS BÁSICAS",
    "version1Total": 160
  },
  {
    "id": "arquitectura-6",
    "unitId": "arquitectura",
    "documentId": "40049214",
    "fullName": "GINNA PAOLA CANO CASTRO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "arquitectura-6-esp-1",
        "name": "ESTRUCTURAS II. SISTEMAS ESTRUCTURALES SISMO RESITENTES - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-6-esp-2",
        "name": "ESTRUCTURAS III. PREDIMENSIONAMIENTO ESTRUCTURAL - ARQ6B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-6-esp-3",
        "name": "ESTRUCTURAS III. PREDIMENSIONAMIENTO ESTRUCTURAL - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-6-esp-4",
        "name": "ESTRUCTURAS IV. SIMULACIÓN - ARQIB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-6-esp-5",
        "name": "ESTRUCTURAS IV. SIMULACIÓN - ARQUA",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40109": {
        "code": "40109",
        "hours": 4,
        "version1Hours": 4
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-7",
    "unitId": "arquitectura",
    "documentId": "6764437",
    "fullName": "GUILLERMO ANTONIO AGUILAR MOLINA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "arquitectura-7-esp-1",
        "name": "FUNDAMENTACIÓN TÉCNICA - ARQ2B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-7-esp-2",
        "name": "FUNDAMENTACIÓN TÉCNICA - ARQUA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-7-esp-3",
        "name": "CONSTRUCCIÓN II. SISTEMAS Y PROCESOS CONSTRUCTIVOS - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-7-esp-4",
        "name": "ESTRUCTURAS I. ELEMENTOS ESTRUCTURALES - ARQ4B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-7-esp-5",
        "name": "PROYECTO VI. EXPERIMENTAL - ARQ8C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-7-esp-6",
        "name": "INTRODUCCION AL PATRIMONIO ARQUITECTONICO - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 20,
        "version1Hours": 20
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-8",
    "unitId": "arquitectura",
    "documentId": "1049617541",
    "fullName": "HERNANDO GUTIERREZ RODRIGUEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "arquitectura-8-esp-1",
        "name": "PROYECTO IV. HABITAR - ARQ6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-8-esp-2",
        "name": "TEORIA E HISTORIA VI. HABITAD Y COMPLEJIDAD - ARQ6B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-8-esp-3",
        "name": "TEORIA E HISTORIA VI. HABITAD Y COMPLEJIDAD - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-8-esp-4",
        "name": "SEMINARIO DE INVESTIGACIÓN - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-8-esp-5",
        "name": "I.A. EN EL PROYECTO DE ARQUITECTURA - ARQ9A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "20502": {
        "code": "20502",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-9",
    "unitId": "arquitectura",
    "documentId": "6765345",
    "fullName": "JAIRO MAURICIO MEDINA ALBA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "arquitectura-9-esp-1",
        "name": "FUNDAMENTOS DEL PROYECTO II - ARQ2A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-9-esp-2",
        "name": "EXPRESIÓN II - ARQUA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-9-esp-3",
        "name": "EXPRESIÓN III. ILUSTRACIÓN ARQUITECTÓNICA Y PERSPECTIVA - A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-9-esp-4",
        "name": "EXPRESION I - ARQ1B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "20502": {
        "code": "20502",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-10",
    "unitId": "arquitectura",
    "documentId": "1026293672",
    "fullName": "JAVIER AUGUSTO MENDOZA DEL RIO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "arquitectura-10-esp-1",
        "name": "PROYECTO II. SISTEMAS Y ORGANIZACIONES ESPACIALES - ARQ4B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-10-esp-2",
        "name": "EXPRESION IV. DIBUJO PLANIMÉTRICO ANÁLOGO Y DIGITAL - ARQ4C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-10-esp-3",
        "name": "TEORIA E HISTORIA V. LA CONDICIÓN URBANA: CRÍTICA Y UTOPÍA - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-10-esp-4",
        "name": "BIM - ARQIB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-10-esp-5",
        "name": "METODOS Y REPRESENTACION I - ARQ3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-10-esp-6",
        "name": "GERENCIA DE PROYECTOS - ARQ9A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-11",
    "unitId": "arquitectura",
    "documentId": "1049608109",
    "fullName": "JEIMY ALEXANDRA REYES VARGAS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "arquitectura-11-esp-1",
        "name": "PROYECTO V. LO TECTÓNICO Y ESTEREOTÓMICO - ARQ7A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "arquitectura-11-esp-2",
        "name": "PROYECTO DE GRADO I - ARQ9C",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "arquitectura-11-esp-3",
        "name": "PROYECTO DE GRADO II - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-12",
    "unitId": "arquitectura",
    "documentId": "19430865",
    "fullName": "JOSE JOAQUIN MAYORGA ROA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "arquitectura-12-esp-1",
        "name": "URBANO I. LO URBANO COMO SIGNIFICADO: LARELACIÓN SOCIEDAD, ESPCACIO Y SIGNIFICADO - ARQUA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-12-esp-2",
        "name": "URBANOIII. LO URBANO COMO PREOYECTO.: LOS MODELOS Y RELACIÓN ENTRE TEORÍAS Y TÉCNICAS - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-12-esp-3",
        "name": "URBANO V. ESTRUCTURA E INFRAESTRUCTURA URBANA - ARQIB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-12-esp-4",
        "name": "PROYECTO VI. EXPERIMENTAL - ARQ8B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-12-esp-5",
        "name": "ENFASIS URB AMB - PLANIFICACION URBANA REGIONAL Y MEDIO AMBIENTE - ARQ8A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-13",
    "unitId": "arquitectura",
    "documentId": "6763366",
    "fullName": "JUAN CARLOS MACHADO MONCAYO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "arquitectura-13-esp-1",
        "name": "CONSTRUCCIÓN I. MATERIALIDAD - ARQUA",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "arquitectura-13-esp-2",
        "name": "CONSTRUCCIÓN III. INFRAESTRUCTURA DE REDES - ARQIB",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "arquitectura-13-esp-3",
        "name": "PROYECTO IV. HABITAR - ARQ6C",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-14",
    "unitId": "arquitectura",
    "documentId": "1007436068",
    "fullName": "JULIAN RICARDO GUIO NEIRA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "arquitectura-14-esp-1",
        "name": "ARQUITECTURA DEL PAISAJE - ARQ3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-14-esp-2",
        "name": "TEORIA E HISTORIA IV. SISTEMAS SOCILES Y ORGANIZACIÓN ESPACIALES - ARQ4B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-14-esp-3",
        "name": "TEORIA E HISTORIA IV. SISTEMAS SOCILES Y ORGANIZACIÓN ESPACIALES - ARQUA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-14-esp-4",
        "name": "PROYECTO V. LO TECTÓNICO Y ESTEREOTÓMICO - ARQ7C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-14-esp-5",
        "name": "URBANO V. ESTRUCTURA E INFRAESTRUCTURA URBANA - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-14-esp-6",
        "name": "TEORÍA E HISTORIA VII. TÉCNICA + POÉTICA = TÉCTONICA - ARQIB",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-15",
    "unitId": "arquitectura",
    "documentId": "1049613142",
    "fullName": "LEIDY ISABEL LÓPEZ RUIZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "arquitectura-15-esp-1",
        "name": "DISEÑO ASISTIDO POR COMPUTADOR - IAM1A (ING. AMBIENTAL)",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "arquitectura-15-esp-2",
        "name": "EXPRESIÓN III. ILUSTRACIÓN ARQUITECTÓNICA Y PERSPECTIVA - B",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "arquitectura-15-esp-3",
        "name": "PROYECTO V. LO TECTÓNICO Y ESTEREOTÓMICO - ARQ7B",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "sharedUnitName": "ING. AMBIENTAL",
    "version1Total": 160
  },
  {
    "id": "arquitectura-16",
    "unitId": "arquitectura",
    "documentId": "7178785",
    "fullName": "LEONARDO ENRIQUE OSORIO SALAZAR",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "arquitectura-16-esp-1",
        "name": "TEORIA E HISTORIA III. ARQUITECTURA Y LEGUAJE - ARQIC",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-16-esp-2",
        "name": "PROYECTO III. URBANO - ARQ5B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-16-esp-3",
        "name": "URBANO IV. LO URBANO COMO HABITAD: LA VIVIENDA Y SUS EXTENSIONES - ARQIB",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-16-esp-4",
        "name": "TEORÍA E HISTORIA VII. TÉCNICA + POÉTICA = TÉCTONICA - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-17",
    "unitId": "arquitectura",
    "documentId": "40047802",
    "fullName": "LINA MARCELA BENAVIDES SILVA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "arquitectura-17-esp-1",
        "name": "FUNDAMENTOS DEL PROYECTO I - ARQ1A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-17-esp-2",
        "name": "TEORIA E HISTORIA II - ARQ2A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-17-esp-3",
        "name": "TEORIA E HISTORIA II - ARQIB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-17-esp-4",
        "name": "ENFASIS PATRI - HISTORIOGRAFIA, TEORIA ARQUITECTONICA Y URBANA - A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "arquitectura-17-esp-5",
        "name": "TEORIA E HISTORIA I - ARQUA",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-18",
    "unitId": "arquitectura",
    "documentId": "40024504",
    "fullName": "MARIA ASTRID PEREZ MENDOZA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "arquitectura-18-esp-1",
        "name": "FUNDAMENTOS DEL PROYECTO II - ARQ2C",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-18-esp-2",
        "name": "EXPRESIÓN II - ARQ2B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-18-esp-3",
        "name": "ESTRUCTURAS I. ELEMENTOS ESTRUCTURALES - ARQUA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-18-esp-4",
        "name": "INTERIORISMO - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-19",
    "unitId": "arquitectura",
    "documentId": "3181317",
    "fullName": "RENAN FERNANDO JIMENEZ ESPINEL",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "arquitectura-19-esp-1",
        "name": "PROYECTO IV. HABITAR - ARQ6B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-19-esp-2",
        "name": "PROYECTO V. LO TECTÓNICO Y ESTEREOTÓMICO - ARQ7D",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-19-esp-3",
        "name": "ADMINISTRACIÓN Y LEGISLACIÓN II. LEGISLACIÓN EN CONSTRUCCIÓN - AQ10A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "arquitectura-19-esp-4",
        "name": "ADMINISTRACIÓN Y LEGISLACIÓN II. LEGISLACIÓN EN CONSTRUCCIÓN - AQ10B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-20",
    "unitId": "arquitectura",
    "documentId": "7188095",
    "fullName": "RUBEN DARIO CALIXTO MORALES",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "arquitectura-20-esp-1",
        "name": "URBANO II. LO URBANO Y EL TERRITORIO COMO ORDEN FISICO-ESPACIAL: SISTEMAS Y ORGANIZACIONES EN EL ESPACIO URBANO - ARQ4B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-20-esp-2",
        "name": "URBANO II. LO URBANO Y EL TERRITORIO COMO ORDEN FISICO-ESPACIAL: SISTEMAS Y ORGANIZACIONES EN EL ESPACIO URBANO - ARQIC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-20-esp-3",
        "name": "PROYECTO III. URBANO - ARQ5C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-20-esp-4",
        "name": "URBANOIII. LO URBANO COMO PREOYECTO.: LOS MODELOS Y RELACIÓN ENTRE TEORÍAS Y TÉCNICAS - ARQIB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "arquitectura-20-esp-5",
        "name": "URBANO IV. LO URBANO COMO HABITAD: LA VIVIENDA Y SUS EXTENSIONES - ARQ6A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "arquitectura-20-esp-6",
        "name": "VIVIENDA ADECUADA Y ASENTAMIENTOS HUMANOS SOSTENIBLES - ARQ9A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "arquitectura-20-esp-7",
        "name": "ECOURBANISMO - AQ10A",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "arquitectura-21",
    "unitId": "arquitectura",
    "documentId": "40043794",
    "fullName": "YENNIA ESPERANZA SIERRA CAMARGO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Arquitecto(a) · Magíster en Arquitectura y Urbanismo",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "arquitectura-21-esp-1",
        "name": "PROYECTO II. SISTEMAS Y ORGANIZACIONES ESPACIALES - ARQ4A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-21-esp-2",
        "name": "CONSTRUCCIÓN IV. COSTOS Y PRESUPUESTOS - ARQ6B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-21-esp-3",
        "name": "CONSTRUCCIÓN IV. COSTOS Y PRESUPUESTOS - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-21-esp-4",
        "name": "CONSTRUCCIÓN V. PROGRAMACIÓN DE OBRA - ARQIA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-21-esp-5",
        "name": "CONSTRUCCIÓN V. PROGRAMACIÓN DE OBRA - ARQIB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "arquitectura-21-esp-6",
        "name": "ADMINISTRACIÓN Y LEGISLACIÓN II. LEGISLACIÓN EN CONSTRUCCIÓN - AQ10C",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "contaduria-1",
    "unitId": "contaduria",
    "documentId": "74360724",
    "fullName": "ANGEL MIGUEL PUERTO GONZALEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Contador(a) Público(a) · Magíster en Ciencias Contables y Financieras",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "contaduria-1-esp-1",
        "name": "AUDITORIA FORENSE - ELEC III AUD FOR",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "contaduria-1-esp-2",
        "name": "SISTEMAS DE CONTROL Y RIESGO - SIST CONT RIES",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "contaduria-1-esp-3",
        "name": "AUDITING AND ASSURANCE - AUDITING D",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "contaduria-1-esp-4",
        "name": "AUDITING AND ASSURANCE - AUDITING N",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "contaduria-1-esp-5",
        "name": "GESTIÓN DE IMPUESTOS Y RÉGIMEN TRIBUTARIO ESPECIAL - COC GESIMP RTE",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "30312": {
        "code": "30312",
        "hours": 4,
        "version1Hours": 4
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40127": {
        "code": "40127",
        "hours": 12,
        "version1Hours": 12
      }
    },
    "version1Total": 160
  },
  {
    "id": "contaduria-2",
    "unitId": "contaduria",
    "documentId": "1014257027",
    "fullName": "EDWIN STEVEN MATALLANA CHILITO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Contador(a) Público(a) · Magíster en Ciencias Contables y Financieras",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "contaduria-2-esp-1",
        "name": "SISTEMAS DE INFORMACION GERENCIAL - ELEC I SIG CON",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "contaduria-2-esp-2",
        "name": "ORGANIZACIONES Y ENTORNO ECONÓMICO - ORG Y ENT ECON",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "contaduria-2-esp-3",
        "name": "HABILIDADES GERENCIALES - HAB GER CON",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "contaduria-2-esp-4",
        "name": "PRESUPUESTOS Y COSTOS - MDG4B (MARKETING)",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "20502": {
        "code": "20502",
        "hours": 12,
        "version1Hours": 12
      },
      "30411": {
        "code": "30411",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "sharedUnitName": "MARKETING",
    "version1Total": 160
  },
  {
    "id": "contaduria-3",
    "unitId": "contaduria",
    "documentId": "40044343",
    "fullName": "ENID MARGARET OVALLE SALAZAR",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Contador(a) Público(a) · Magíster en Ciencias Contables y Financieras",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "contaduria-3-esp-1",
        "name": "CONTABILIDAD GUBERNAMENTAL - CONT GUB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "contaduria-3-esp-2",
        "name": "CONTABILIDAD FINANCIERA AVANZADA - CONT FIN AVA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "contaduria-3-esp-3",
        "name": "TRIBUTARIA II - TRIB II D",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "contaduria-3-esp-4",
        "name": "TRIBUTARIA II - TRIB II N",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "contaduria-3-esp-5",
        "name": "CONTROL INTERNO Y PRESUPUESTO PÚBLICO Y PRIVADO - ELEC II CON PRES PYP",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "20502": {
        "code": "20502",
        "hours": 4,
        "version1Hours": 4
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "contaduria-4",
    "unitId": "contaduria",
    "documentId": "1065897036",
    "fullName": "INGRI LORENA CASTRO VERGEL",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Contador(a) Público(a) · Magíster en Ciencias Contables y Financieras",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "contaduria-4-esp-1",
        "name": "CONTABILIDAD AMBIENTAL - PROF I CONT AMB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "contaduria-4-esp-2",
        "name": "CONTABILIDAD AMBIENTAL, SOCIAL Y GOBIERNO CORPORATIVO - CON AMB, SOC Y GOB C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "contaduria-4-esp-3",
        "name": "COSTOS I - COSTOS I",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "contaduria-4-esp-4",
        "name": "COSTOS II - COSTOS II D",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "contaduria-4-esp-5",
        "name": "COSTOS II - COSTOS II N",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "contaduria-5",
    "unitId": "contaduria",
    "documentId": "37670457",
    "fullName": "LUZ HELENA NIÑO ABAUNZA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Contador(a) Público(a) · Magíster en Ciencias Contables y Financieras",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "contaduria-5-esp-1",
        "name": "SISTEMAS DE INFORMACION CONTABLE - SIS INF CON",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "contaduria-5-esp-2",
        "name": "CONTABILIDAD DE FENÓMENOS SOCIETARIOS - PROF II CON FEN SOC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "contaduria-5-esp-3",
        "name": "CONTABILIDAD FINANCIERA BÁSICA - CON FIN BAS",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "contaduria-5-esp-4",
        "name": "CONTABILIDAD FINANCIERA INTERMEDIA - CON FIN INTE",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "contaduria-5-esp-5",
        "name": "TRIBUTARIA I - TRIB I",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "contaduria-5-esp-6",
        "name": "FINANZAS BÁSICAS (VIRTUAL) - FIN BAS",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "contaduria-6",
    "unitId": "contaduria",
    "documentId": "1049612423",
    "fullName": "NIDIA JULIETH SANCHEZ LOPEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Contador(a) Público(a) · Magíster en Ciencias Contables y Financieras",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "contaduria-6-esp-1",
        "name": "INVESTIGACIÓN APLICADA BÁSICA - INV APL BAS",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "contaduria-6-esp-2",
        "name": "INVESTIGACIÓN APLICADA INTERMEDIA - INV APL INT D",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "contaduria-6-esp-3",
        "name": "INVESTIGACIÓN APLICADA INTERMEDIA - INV APL INT N",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "contaduria-6-esp-4",
        "name": "OPCION DE GRADO - MONOGRAFIA/OTR",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "contaduria-7",
    "unitId": "contaduria",
    "documentId": "1052394342",
    "fullName": "RUTH CRISTINA VALDERRAMA VELANDIA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Contador(a) Público(a) · Magíster en Ciencias Contables y Financieras",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "contaduria-7-esp-1",
        "name": "FUNDAMENTOS DE ECONOMIA - FUNDECON",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "contaduria-7-esp-2",
        "name": "DERECHO DE LOS NEGOCIOS - DER NEG",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "contaduria-7-esp-3",
        "name": "DERECHO COMERCIAL Y LABORAL - DER COM Y LAB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "contaduria-7-esp-4",
        "name": "FINANZAS PÚBLICAS - PRO III FIN PUB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "contaduria-7-esp-5",
        "name": "PENSAMIENTO Y PROCESO ADMINISTRATIVO - PEN PROC ADM",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "contaduria-7-esp-6",
        "name": "FINANZAS AVANZADAS - FIN AVAN",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40109": {
        "code": "40109",
        "hours": 4,
        "version1Hours": 4
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "negocios-int-1",
    "unitId": "negocios-int",
    "documentId": "1057608006",
    "fullName": "ANDRES FELIPE BERNAL DAZA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Profesional en Negocios Internacionales · Magíster en Comercio Internacional",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "negocios-int-1-esp-1",
        "name": "FUNDAMENTOS CONSTITUCIONALES Y ECONÓMICOS - NEG2A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "negocios-int-1-esp-2",
        "name": "FUNDAMENTOS CONSTITUCIONALES Y ECONÓMICOS - NEG2B",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "negocios-int-1-esp-3",
        "name": "LEGISLACION ADUANERA Y CAMBIARIA - NEG3A",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "negocios-int-2",
    "unitId": "negocios-int",
    "documentId": "40023997",
    "fullName": "ELIZABETH MALAGON SAENZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Negocios Internacionales · Magíster en Comercio Internacional",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "negocios-int-2-esp-1",
        "name": "GEOGRAFIA ECONÓMICA - NEG1A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-2-esp-2",
        "name": "GEOGRAFIA ECONÓMICA - NEG1B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-2-esp-3",
        "name": "MICROECONOMIA - NEG1B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-2-esp-4",
        "name": "ADMINISTRACION Y PROCESOS - NEG2A",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "30411": {
        "code": "30411",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "negocios-int-3",
    "unitId": "negocios-int",
    "documentId": "40045507",
    "fullName": "GLORIA STELLA ACUNA DAZA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Profesional en Negocios Internacionales · Magíster en Comercio Internacional",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "negocios-int-3-esp-1",
        "name": "GESTIÓN DE IMPORTACIONES - NEG3A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-3-esp-2",
        "name": "COMERCIO INTERNACIONAL - NEG2A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-3-esp-3",
        "name": "COMERCIO INTERNACIONAL - NEG2B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-3-esp-4",
        "name": "PROTOCOLO Y ETIQUETA DE ALTA DIRECCION - NEG3B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "negocios-int-4",
    "unitId": "negocios-int",
    "documentId": "7174597",
    "fullName": "JAVIER ALFONSO MOJICA ROA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Negocios Internacionales · Magíster en Comercio Internacional",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "negocios-int-4-esp-1",
        "name": "LOGÍSTICA Y DFI - NEG4A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "negocios-int-4-esp-2",
        "name": "LOGÍSTICA Y DFI - NEG4B",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "negocios-int-4-esp-3",
        "name": "CONTEXTO DE LOS NEGOCIOS INTERNACIONALES - NEG1B",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "negocios-int-5",
    "unitId": "negocios-int",
    "documentId": "74181135",
    "fullName": "JAVIER FERNANDO MURCIA BARACALDO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Profesional en Negocios Internacionales · Magíster en Comercio Internacional",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "negocios-int-5-esp-1",
        "name": "FINANZAS INTERNACIONALES - NEGEB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-5-esp-2",
        "name": "ADMINISTRACION Y PROCESOS - NEG2B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-5-esp-3",
        "name": "FORMULACIÓN Y EVALUACIÓN FINANCIERA DE PROYECTOS - NEG6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-5-esp-4",
        "name": "FORMULACIÓN Y EVALUACIÓN FINANCIERA DE PROYECTOS - NEG6B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-5-esp-5",
        "name": "CONTEXTO DE LOS NEGOCIOS INTERNACIONALES - NEG1A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "negocios-int-6",
    "unitId": "negocios-int",
    "documentId": "7184465",
    "fullName": "JOSE ALEXANDER CELY RAMIREZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Negocios Internacionales · Magíster en Comercio Internacional",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "negocios-int-6-esp-1",
        "name": "TRADING III - NEGEA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-6-esp-2",
        "name": "FINANZAS INTERNACIONALES - NEGEA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-6-esp-3",
        "name": "MERCADOS BURSÁTILES II - NEG7A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-6-esp-4",
        "name": "INGENIERIA FINACIERA Y DE MERCADOS - NEG3A",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "negocios-int-7",
    "unitId": "negocios-int",
    "documentId": "1002330478",
    "fullName": "LUIS CARLOS GONZALEZ SILVA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Profesional en Negocios Internacionales · Magíster en Comercio Internacional",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "negocios-int-7-esp-1",
        "name": "OPCIÓN DE GRADO - NEGEA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-7-esp-2",
        "name": "AMBIENTE CULTURAL ECONÓMICO Y POLÍTICO I (AMÉRICA) - NEG7A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-7-esp-3",
        "name": "AMBIENTE CULTURAL ECONÓMICO Y POLÍTICO I (AMÉRICA) - NEG7B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-7-esp-4",
        "name": "INTERNATIONAL BUSINESS MANAGEMENT - NEG8A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-7-esp-5",
        "name": "INTERNATIONAL BUSINESS MANAGEMENT - NEG8B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 20,
        "version1Hours": 20
      }
    },
    "version1Total": 160
  },
  {
    "id": "negocios-int-8",
    "unitId": "negocios-int",
    "documentId": "79949702",
    "fullName": "LUIS FELIPE CAMACHO CARVAJAL",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Negocios Internacionales · Magíster en Comercio Internacional",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "negocios-int-8-esp-1",
        "name": "CONTABILIDAD EMPRESARIAL - NEG2A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-8-esp-2",
        "name": "CONTABILIDAD EMPRESARIAL - NEG2B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-8-esp-3",
        "name": "ANÁLISIS FINANCIERO - NEG4A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-8-esp-4",
        "name": "ANÁLISIS FINANCIERO - NEG4B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "20502": {
        "code": "20502",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "negocios-int-9",
    "unitId": "negocios-int",
    "documentId": "79912927",
    "fullName": "MARCOS ALEXANDER CARDENAS GARCIA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Profesional en Negocios Internacionales · Magíster en Comercio Internacional",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "negocios-int-9-esp-1",
        "name": "INTEGRACIÓN Y RELACIONES ECONÓMICAS INTERNACIONALES - NEG4A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-9-esp-2",
        "name": "CONTRATACIÓN Y RESOLUCIÓN DE CONTROVERSIAS INTERNACIONALES - NEGEA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-9-esp-3",
        "name": "AMBIENTE CULTURAL ECONÓMICO Y POLÍTICO: ASIA - NEG8B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-9-esp-4",
        "name": "AMBIENTE CULTURAL ECONÓMICO Y POLÍTICO: ASIA - NEG8C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-9-esp-5",
        "name": "INTRODUCCION A LAS RELACCIONES INTERNACIONALES - NEG3A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "negocios-int-10",
    "unitId": "negocios-int",
    "documentId": "52259759",
    "fullName": "MARIBEL GARCIA ROJAS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Negocios Internacionales · Magíster en Comercio Internacional",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "negocios-int-10-esp-1",
        "name": "MERCADEO INTERNACIONAL III - NEGEA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-10-esp-2",
        "name": "MARKETING INTERNACIONAL - NEG6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-10-esp-3",
        "name": "E-COMMERCE - NEG7A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-10-esp-4",
        "name": "E-COMMERCE - NEG7B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-10-esp-5",
        "name": "MERCADEO INTERNACIONAL I - NEG6A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "negocios-int-11",
    "unitId": "negocios-int",
    "documentId": "40023568",
    "fullName": "NANCY STELLA AYALA JOYA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Profesional en Negocios Internacionales · Magíster en Comercio Internacional",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "negocios-int-11-esp-1",
        "name": "MACROECONOMIA - NEG3A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-11-esp-2",
        "name": "MICROECONOMIA - NEG1A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-11-esp-3",
        "name": "ECONOMÍA INTERNACIONAL - NEGEA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "negocios-int-11-esp-4",
        "name": "ECONOMÍA INTERNACIONAL - NEGEB",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "negocios-int-12",
    "unitId": "negocios-int",
    "documentId": "1049605556",
    "fullName": "OSCAR DAVID ANDRES JULIAN LOPEZ CAMARGO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Negocios Internacionales · Magíster en Comercio Internacional",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "negocios-int-12-esp-1",
        "name": "INTEGRACIÓN Y RELACIONES ECONÓMICAS INTERNACIONALES - NEG4B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-12-esp-2",
        "name": "SEMINARIO DE INVESTIGACIÓN EN N.I. - NEGEA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-12-esp-3",
        "name": "STRATEGIC DECISION MAKING - NEGEA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-12-esp-4",
        "name": "AMBIENTE CULTURAL ECONÓMICO Y POLÍTICO II (UNIÓN EUROPEA Y ÁFRICA) - NEG6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "negocios-int-12-esp-5",
        "name": "AMBIENTE CULTURAL ECONÓMICO Y POLÍTICO II (UNIÓN EUROPEA Y ÁFRICA) - NEG6B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "negocios-int-13",
    "unitId": "negocios-int",
    "documentId": "40035530",
    "fullName": "SUSANA JIMENA BARRETO BEDOYA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Profesional en Negocios Internacionales · Magíster en Comercio Internacional",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "negocios-int-13-esp-1",
        "name": "LOGISTICA Y DISTRIBUCION FISICA INTERNACIONAL I - NEG6A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "negocios-int-13-esp-2",
        "name": "LOGISTICA Y DISTRIBUCION INTERNACIONAL II - NEG7A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "negocios-int-13-esp-3",
        "name": "LOGISTICA Y DISTRIBUCIÓN FISICA INTERNACIONAL III - NEGEA",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-electronica-1",
    "unitId": "ing-electronica",
    "documentId": "7165159",
    "fullName": "LUIS FREDY SOSA QUINTERO",
    "dedication": "DIRECTIVO",
    "expectedWorkload": 210,
    "rank": "Decano(a) de Facultad",
    "education": "Ingeniero(a) Electrónico(a) · Magíster en Ingeniería Electrónica",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ing-electronica-1-esp-1",
        "name": "CIRCUITOS I - IELTA",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "30222": {
        "code": "30222",
        "hours": 190,
        "version1Hours": 190
      }
    },
    "version1Total": 210
  },
  {
    "id": "ing-electronica-2",
    "unitId": "ing-electronica",
    "documentId": "74379190",
    "fullName": "WILLIAM FABIAN CHAPARRO BECERRA",
    "dedication": "DIRECTIVO",
    "expectedWorkload": 210,
    "rank": "Decano(a) de Facultad",
    "education": "Ingeniero(a) Electrónico(a) · Magíster en Ingeniería Electrónica",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ing-electronica-2-esp-1",
        "name": "TRANSMISION DE DATOS - IEL8A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "30222": {
        "code": "30222",
        "hours": 190,
        "version1Hours": 190
      }
    },
    "version1Total": 210
  },
  {
    "id": "ing-electronica-3",
    "unitId": "ing-electronica",
    "documentId": "6774100",
    "fullName": "ADOLFO AVILA BARON",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero(a) Electrónico(a) · Magíster en Ingeniería Electrónica",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ing-electronica-3-esp-1",
        "name": "CONTROL ANALÓGICO - IEL7A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-electronica-3-esp-2",
        "name": "ELECTRÓNICA II - IEL4A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-electronica-3-esp-3",
        "name": "ELECTRÓNICA III - IEL5A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-electronica-3-esp-4",
        "name": "IDENTIFICACIÓN Y MODELADO DE SISTEMAS - IEL6A",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-electronica-4",
    "unitId": "ing-electronica",
    "documentId": "7182608",
    "fullName": "CAMILO ERNESTO PARDO BEAINY",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Electrónico(a) · Magíster en Ingeniería Electrónica",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "ing-electronica-4-esp-1",
        "name": "SISTEMAS DIGITALES II - IEL4A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-electronica-4-esp-2",
        "name": "SEÑALES Y SISTEMAS - IEL5A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-electronica-4-esp-3",
        "name": "PROCESAMIENTO DIGITAL DE SEÑALES - IEL6A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-electronica-4-esp-4",
        "name": "MACHINE VISION - IEL8A",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 8,
        "version1Hours": 8
      },
      "30411": {
        "code": "30411",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-electronica-5",
    "unitId": "ing-electronica",
    "documentId": "1098778305",
    "fullName": "CRISTIAN DAVID CAMACHO PARRA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) Electrónico(a) · Magíster en Ingeniería Electrónica",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ing-electronica-5-esp-1",
        "name": "CIRCUITOS II - IEL4A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-electronica-5-esp-2",
        "name": "CONVERSIÓN ELECTROMAGNÉTICA - IEL6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-electronica-5-esp-3",
        "name": "ELECTRÓNICA DE POTENCIA - IEL7A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-electronica-5-esp-4",
        "name": "AUTOMATIZACIÓN INDUSTRIAL - IEL9A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-electronica-5-esp-5",
        "name": "OPTIMIZACIÓN APLICADA A SISTEMAS ELÉCTRICOS - IE10A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "30411": {
        "code": "30411",
        "hours": 4,
        "version1Hours": 4
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-electronica-6",
    "unitId": "ing-electronica",
    "documentId": "1019011806",
    "fullName": "EDGAR ANDRES GUTIERREZ CACERES",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Electrónico(a) · Magíster en Ingeniería Electrónica",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "ing-electronica-6-esp-1",
        "name": "PROGRAMACIÓN - IEL5A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-electronica-6-esp-2",
        "name": "CONTROL DIGITAL - IEL8A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-electronica-6-esp-3",
        "name": "SISTEMAS DIGITALES I - IELTA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-electronica-6-esp-4",
        "name": "DISEÑO ELECTRÓNICO - IEL9A",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-electronica-7",
    "unitId": "ing-electronica",
    "documentId": "6771357",
    "fullName": "JOSE RICARDO CASALLAS GUTIERREZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero(a) Electrónico(a) · Magíster en Ingeniería Electrónica",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ing-electronica-7-esp-1",
        "name": "COMUNICACIONES INALÁMBRICAS - IEL7A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "ing-electronica-7-esp-2",
        "name": "SEMICONDUCTORES - IEL6A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "ing-electronica-7-esp-3",
        "name": "TEORÍA DE LA COMUNICACIÓN - IEL6A",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-electronica-8",
    "unitId": "ing-electronica",
    "documentId": "1095827756",
    "fullName": "LEIDY LORENA ARIAS CABEZA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Electrónico(a) · Magíster en Ingeniería Electrónica",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "ing-electronica-8-esp-1",
        "name": "LOGICA DE PROGRAMACION - ELEC-A (CIENCIAS BÁSICAS)",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-electronica-8-esp-2",
        "name": "LOGICA DE PROGRAMACION - ELEC-B (CIENCIAS BÁSICAS)",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-electronica-8-esp-3",
        "name": "ELECTRÓNICA I - IELTA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-electronica-8-esp-4",
        "name": "PROYECTO DE INVESTIGACIÓN O DESARROLLO I - IEL8A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-electronica-8-esp-5",
        "name": "PROYECTO DE INVESTIGACIÓN Y DESARROLLO II - IEL9A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-electronica-8-esp-6",
        "name": "OPCIÓN DE GRADO - IE10A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "sharedUnitName": "CIENCIAS BÁSICAS",
    "version1Total": 160
  },
  {
    "id": "ing-electronica-9",
    "unitId": "ing-electronica",
    "documentId": "40013778",
    "fullName": "TERESA ESPITIA CARDENAS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) Electrónico(a) · Magíster en Ingeniería Electrónica",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ing-electronica-9-esp-1",
        "name": "ECONOMIA Y CONTABILIDAD - IAMIA (ING. CIVIL)",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-electronica-9-esp-2",
        "name": "ADMINISTRACION DE PROYECTOS - IEL7A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-electronica-9-esp-3",
        "name": "GESTIÓN DE PROYECTOS - IEL8A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ing-electronica-9-esp-4",
        "name": "EMPRENDIMIENTO Y LIDERAZGO - IEL9A",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 12,
        "version1Hours": 12
      }
    },
    "sharedUnitName": "ING. CIVIL",
    "version1Total": 160
  },
  {
    "id": "ing-electronica-10",
    "unitId": "ing-electronica",
    "documentId": "74184255",
    "fullName": "WILLIAM FERNANDO ALVAREZ CASTAÑEDA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) Electrónico(a) · Magíster en Ingeniería Electrónica",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "ing-electronica-10-esp-1",
        "name": "FUNDAMENTOS DE CIRCUITOS - IEL2A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-electronica-10-esp-2",
        "name": "FUNDAMENTOS DE CIRCUITOS - IEL2B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-electronica-10-esp-3",
        "name": "INSTRUMENTACION INDUSTRIAL - IEL7A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-electronica-10-esp-4",
        "name": "INTRODUCCIÓN A LA ING. ELECTRÓNICA - IET1A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-electronica-10-esp-5",
        "name": "GESTIÓN DE LA INNOVACIÓN TECNOLÓGICA - IEL9A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "20502": {
        "code": "20502",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "bioingenieria-1",
    "unitId": "bioingenieria",
    "documentId": "1234792422",
    "fullName": "CAMILO ANDRES MUR PARRA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Bioingeniero(a) · Magíster en Ingeniería Biomédica",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "bioingenieria-1-esp-1",
        "name": "LÓGICA COMPUTACIONAL - CIV-A (CIENCIAS BÁSICAS)",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "bioingenieria-1-esp-2",
        "name": "ELECTRONICA - BIO3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "bioingenieria-1-esp-3",
        "name": "ELECTRONICA - BIO3B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "bioingenieria-1-esp-4",
        "name": "FORMULACIÓN Y EVALUACIÓN DE PROYECTOS - BIO7A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "bioingenieria-1-esp-5",
        "name": "INSTRUMENTACIÓN Y AUTOMATIZACIÓN - BIO6A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "bioingenieria-1-esp-6",
        "name": "INSTRUMENTACIÓN Y AUTOMATIZACIÓN - BIO6B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "30411": {
        "code": "30411",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "sharedUnitName": "CIENCIAS BÁSICAS",
    "version1Total": 160
  },
  {
    "id": "bioingenieria-2",
    "unitId": "bioingenieria",
    "documentId": "1049646485",
    "fullName": "DANIEL MAURICIO BARRERA LEGUIZAMON",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Bioingeniero(a) · Magíster en Ingeniería Biomédica",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "bioingenieria-2-esp-1",
        "name": "CIRCUITOS ELÉCTRICOS - BIO2A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "bioingenieria-2-esp-2",
        "name": "CIRCUITOS ELÉCTRICOS - BIO2B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "bioingenieria-2-esp-3",
        "name": "CIRCUITOS ELÉCTRICOS - BIO2C",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "bioingenieria-2-esp-4",
        "name": "ENERGÍAS RENOVABLES - BIO7A",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "bioingenieria-3",
    "unitId": "bioingenieria",
    "documentId": "1018472681",
    "fullName": "DERIAN DAVID ESPINOSA MONTES",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Bioingeniero(a) · Magíster en Ingeniería Biomédica",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "bioingenieria-3-esp-1",
        "name": "EVALUACION DE PROYECTOS - IAMIB (ING. CIVIL)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-3-esp-2",
        "name": "BIOMECÁNICA - BIO5A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-3-esp-3",
        "name": "PROCESAMIENTO DE LA INFORMACIÓN BIOLÓGICA - BIO6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-3-esp-4",
        "name": "PRÓTESIS Y ORTESIS - BIO7A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-3-esp-5",
        "name": "IMPLANTES - BIO7A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "sharedUnitName": "ING. CIVIL",
    "version1Total": 160
  },
  {
    "id": "bioingenieria-4",
    "unitId": "bioingenieria",
    "documentId": "1014260389",
    "fullName": "EILLEN TATIANA MONTOYA RODRIGUEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Bioingeniero(a) · Magíster en Ingeniería Biomédica",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "bioingenieria-4-esp-1",
        "name": "LÓGICA COMPUTACIONAL - CIV-B (CIENCIAS BÁSICAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-4-esp-2",
        "name": "SISTEMAS DIGITALES - BIO4A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-4-esp-3",
        "name": "SISTEMAS DIGITALES - BIO4B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-4-esp-4",
        "name": "SEÑALES Y SISTEMAS - BIO5A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-4-esp-5",
        "name": "RESPONSABILIDAD SOCIAL DESDE LA BIOINGENIERÍA - BIO5A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      },
      "40127": {
        "code": "40127",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "sharedUnitName": "CIENCIAS BÁSICAS",
    "version1Total": 160
  },
  {
    "id": "bioingenieria-5",
    "unitId": "bioingenieria",
    "documentId": "1005258966",
    "fullName": "LEIDY VALENTINA AVILA BUITRAGO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Bioingeniero(a) · Magíster en Ingeniería Biomédica",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "bioingenieria-5-esp-1",
        "name": "LOGICA COMPUTACIONAL - IDU-A (CIENCIAS BÁSICAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-5-esp-2",
        "name": "LOGICA COMPUTACIONAL - IDU-B (CIENCIAS BÁSICAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-5-esp-3",
        "name": "LOGICA COMPUTACIONAL - BIO-A (CIENCIAS BÁSICAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-5-esp-4",
        "name": "EQUIPOS E INSTRUMENTACIÓN BIOLÓGICA - BIO6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-5-esp-5",
        "name": "INGENIERÍA CLÍNICA - BIO7A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "sharedUnitName": "CIENCIAS BÁSICAS",
    "version1Total": 160
  },
  {
    "id": "bioingenieria-6",
    "unitId": "bioingenieria",
    "documentId": "1013605514",
    "fullName": "MARIA CAROLINA DUARTE PENAGOS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Bioingeniero(a) · Magíster en Ingeniería Biomédica",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "bioingenieria-6-esp-1",
        "name": "PRÁCTICA: ANATOMÍA HUMANA - BIOA",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "bioingenieria-7",
    "unitId": "bioingenieria",
    "documentId": "514482",
    "fullName": "MARIA FERNANDA ARAGON MORALES",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Bioingeniero(a) · Magíster en Ingeniería Biomédica",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "bioingenieria-7-esp-1",
        "name": "ECOLOGIA - BIOEA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-7-esp-2",
        "name": "ECOLOGIA - BIOEB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-7-esp-3",
        "name": "INTRODUCCIÓN A LA BIOINGENIERÍA - BIOEB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-7-esp-4",
        "name": "MICROBIOLOGÍA Y BIOLOGÍA DE SISTEMAS - BIOEB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-7-esp-5",
        "name": "BIOMIMÉTICA - BIO7A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "bioingenieria-8",
    "unitId": "bioingenieria",
    "documentId": "46452729",
    "fullName": "MARTHA ELIZABETH BENAVIDES ROZO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Bioingeniero(a) · Magíster en Ingeniería Biomédica",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "bioingenieria-8-esp-1",
        "name": "BIOLOGIA GENERAL - BIO-A (CIENCIAS BÁSICAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-8-esp-2",
        "name": "BIOLOGIA GENERAL - BIO-A1 (CIENCIAS BÁSICAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-8-esp-3",
        "name": "BIOLOGÍA CELULAR MOLECULAR - BIO2A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-8-esp-4",
        "name": "BIOLOGÍA CELULAR MOLECULAR - BIO2B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-8-esp-5",
        "name": "BIOLOGÍA CELULAR MOLECULAR - BIO2C",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "sharedUnitName": "CIENCIAS BÁSICAS",
    "version1Total": 160
  },
  {
    "id": "bioingenieria-9",
    "unitId": "bioingenieria",
    "documentId": "52268659",
    "fullName": "MONICA GABRIELA HUERTAS VALERO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Bioingeniero(a) · Magíster en Ingeniería Biomédica",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "bioingenieria-9-esp-1",
        "name": "SEMINARIO DE GRADO I - ICV8B (ING. CIVIL)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-9-esp-2",
        "name": "MICROBIOLOGÍA Y BIOLOGÍA DE SISTEMAS - BIOEA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-9-esp-3",
        "name": "FISIOLOGÍA DE SISTEMAS - BIO4A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-9-esp-4",
        "name": "FISIOLOGÍA DE SISTEMAS - BIO4B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "bioingenieria-9-esp-5",
        "name": "INVESTIGACIÓN EN BIOINGENIERÍA - BIO5A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "sharedUnitName": "ING. CIVIL",
    "version1Total": 160
  },
  {
    "id": "ing-datos-ia-1",
    "unitId": "ing-datos-ia",
    "documentId": "1049617372",
    "fullName": "FERNANDO JIMENEZ DIAZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) de Sistemas / Datos · Magíster en Ciencia de Datos e IA",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ing-datos-ia-1-esp-1",
        "name": "SEGURIDAD DE LA INFORMACIÓN - IDTAA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-1-esp-2",
        "name": "SISTEMAS OPERATIVOS - IDTAA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-1-esp-3",
        "name": "ARQUITECTURA DEL COMPUTADORES - IDTAA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-1-esp-4",
        "name": "ARQUITECTURA DEL COMPUTADORES - IDTAB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-1-esp-5",
        "name": "ARQUITECTURA DEL COMPUTADORES - IDTAC",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "30411": {
        "code": "30411",
        "hours": 4,
        "version1Hours": 4
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-datos-ia-2",
    "unitId": "ing-datos-ia",
    "documentId": "1002329551",
    "fullName": "HECTOR MAURICIO BRAVO CEPEDA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) de Sistemas / Datos · Magíster en Ciencia de Datos e IA",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "ing-datos-ia-2-esp-1",
        "name": "INTRODUCCIÓN A LA INGENIERÍA DE DATOS E INTELIGENCIA ARTIFICIAL - IDT1A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "ing-datos-ia-2-esp-2",
        "name": "INTRODUCCIÓN A LA INGENIERÍA DE DATOS E INTELIGENCIA ARTIFICIAL - IDT1B",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "ing-datos-ia-2-esp-3",
        "name": "LOGICA COMPUTACIONAL - IDT1B",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-datos-ia-3",
    "unitId": "ing-datos-ia",
    "documentId": "1002537543",
    "fullName": "IVAN FELIPE MARIÑO BARRETO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Ingeniero(a) de Sistemas / Datos · Magíster en Ciencia de Datos e IA",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ing-datos-ia-3-esp-1",
        "name": "COMPUTACIÓN PARALELA Y DISTRIBUIDA - IDT4A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-datos-ia-3-esp-2",
        "name": "COMPUTACIÓN PARALELA Y DISTRIBUIDA - IDT4B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-datos-ia-3-esp-3",
        "name": "COMPUTACIÓN PARALELA Y DISTRIBUIDA - IDT4C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-datos-ia-3-esp-4",
        "name": "MINERIA DE DATOS - IDT5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-datos-ia-3-esp-5",
        "name": "CLOUD COMPUTING - IDT5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ing-datos-ia-3-esp-6",
        "name": "EVALUACIÓN ECONÓMICA DE SOLUCIONES DE INTELIGENCIA ARTIFICIAL - IDT5A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-datos-ia-4",
    "unitId": "ing-datos-ia",
    "documentId": "1019022774",
    "fullName": "JULIÁN DAVID PAREJA GARZÓN",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) de Sistemas / Datos · Magíster en Ciencia de Datos e IA",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "ing-datos-ia-4-esp-1",
        "name": "SISTEMAS DE ADQUISICIÓN Y PROCESAMIENTO DE DATOS - IDTAB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-4-esp-2",
        "name": "ANALITICA Y VIZUALIZACIÓN DE DATOS - IDT4A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-4-esp-3",
        "name": "ANALITICA Y VIZUALIZACIÓN DE DATOS - IDT4B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-4-esp-4",
        "name": "ANALITICA Y VIZUALIZACIÓN DE DATOS - IDT4C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-4-esp-5",
        "name": "LOGICA COMPUTACIONAL - IDT1A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      },
      "40127": {
        "code": "40127",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-datos-ia-5",
    "unitId": "ing-datos-ia",
    "documentId": "72192520",
    "fullName": "YASHIN ALBERTO RUEDA MATOS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Ingeniero(a) de Sistemas / Datos · Magíster en Ciencia de Datos e IA",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ing-datos-ia-5-esp-1",
        "name": "SISTEMAS DE ADQUISICIÓN Y PROCESAMIENTO DE DATOS - IDTAC",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-5-esp-2",
        "name": "ESTRUCTURAS DE DATOS - IDTAA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-5-esp-3",
        "name": "ESTRUCTURAS DE DATOS - IDTAB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-5-esp-4",
        "name": "ESTRUCTURAS DE DATOS - IDTAC",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-5-esp-5",
        "name": "BASES DE DATOS - IDTAA",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ing-datos-ia-6",
    "unitId": "ing-datos-ia",
    "documentId": "1007655187",
    "fullName": "ZALMA VALENTINA MORENO GALEANO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Ingeniero(a) de Sistemas / Datos · Magíster en Ciencia de Datos e IA",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "ing-datos-ia-6-esp-1",
        "name": "SISTEMAS DE ADQUISICIÓN Y PROCESAMIENTO DE DATOS - IDTAA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-6-esp-2",
        "name": "REDES E INFRAESTRUCTURA - IDT4A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-6-esp-3",
        "name": "REDES E INFRAESTRUCTURA - IDT4B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-6-esp-4",
        "name": "REDES E INFRAESTRUCTURA - IDT4C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ing-datos-ia-6-esp-5",
        "name": "MACHINE LEARNING - IDT5A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "cultura-fisica-1",
    "unitId": "cultura-fisica",
    "documentId": "1069731428",
    "fullName": "LUIS RAFAEL HUTCHISON SALAZAR",
    "dedication": "DIRECTIVO",
    "expectedWorkload": 210,
    "rank": "Decano(a) de Facultad",
    "education": "Profesional en Cultura Física y Deporte · Magíster en Ciencias del Deporte",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "cultura-fisica-1-esp-1",
        "name": "PRACTICA PROFESIONAL - CFS9A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "30222": {
        "code": "30222",
        "hours": 190,
        "version1Hours": 190
      }
    },
    "version1Total": 210
  },
  {
    "id": "cultura-fisica-2",
    "unitId": "cultura-fisica",
    "documentId": "1049627598",
    "fullName": "CRISTIAN LEONARDO CEPEDA BARAJAS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Cultura Física y Deporte · Magíster en Ciencias del Deporte",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "cultura-fisica-2-esp-1",
        "name": "INICIACIÓN Y FORMACIÓN DEPORTIVA - CUF2A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "cultura-fisica-2-esp-2",
        "name": "ENTRENAMIENTO DEPORTIVO - CFS4A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "cultura-fisica-2-esp-3",
        "name": "ENTRENAMIENTO DEPORTIVO 1 - CUF3A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "cultura-fisica-2-esp-4",
        "name": "DEPORTES TIEMPO Y MARCA - CFS6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "cultura-fisica-2-esp-5",
        "name": "PROFUNDIZACIÓN II - CFS8A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 22,
        "version1Hours": 22
      },
      "30411": {
        "code": "30411",
        "hours": 10,
        "version1Hours": 10
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "cultura-fisica-3",
    "unitId": "cultura-fisica",
    "documentId": "79943045",
    "fullName": "FERNANDO ALBERTO BOHORQUEZ CAMPOS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Profesional en Cultura Física y Deporte · Magíster en Ciencias del Deporte",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "cultura-fisica-3-esp-1",
        "name": "FISIOLOGÍA DEL EJERCICIO - CUF3A",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "cultura-fisica-4",
    "unitId": "cultura-fisica",
    "documentId": "7187232",
    "fullName": "GERARDO ALBERTO MORENO MEDINA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Cultura Física y Deporte · Magíster en Ciencias del Deporte",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "cultura-fisica-4-esp-1",
        "name": "RECREACION TURISTICA - CFS7A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-4-esp-2",
        "name": "DEPORTE ADAPTADO - CFS8A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-4-esp-3",
        "name": "PEDAGOGÍA DEL JUEGO - CUF3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-4-esp-4",
        "name": "METODOLOGÍA PARA LA ENSEÑANZA DE LA RECREACIÓN - CFS4A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cultura-fisica-4-esp-5",
        "name": "PROMOCIÓN Y PREVENCIÓN - CFS5A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cultura-fisica-4-esp-6",
        "name": "CAMPAMENTO - CFS5A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cultura-fisica-4-esp-7",
        "name": "DISEÑO DE INSTRUMENTOS Y PROPUESTAS RECREATIVAS - CFS6A",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 12,
        "version1Hours": 12
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "cultura-fisica-5",
    "unitId": "cultura-fisica",
    "documentId": "74189930",
    "fullName": "JULIAN MAURICIO SOTO MORCOTE",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Profesional en Cultura Física y Deporte · Magíster en Ciencias del Deporte",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "cultura-fisica-5-esp-1",
        "name": "PROFUNDIZACIÓN I - CFS7A",
        "level": "Pregrado",
        "monthlyHours": 48
      },
      {
        "id": "cultura-fisica-5-esp-2",
        "name": "METODOLOGÍA DE LA INVESTIGACIÓN - CFS8A",
        "level": "Pregrado",
        "monthlyHours": 48
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40109": {
        "code": "40109",
        "hours": 4,
        "version1Hours": 4
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "cultura-fisica-6",
    "unitId": "cultura-fisica",
    "documentId": "1054679877",
    "fullName": "LEYDY VIVIANA ACOSTA FAJARDO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Cultura Física y Deporte · Magíster en Ciencias del Deporte",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "cultura-fisica-6-esp-1",
        "name": "DEPORTES DE COMBATE - CFS5A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "cultura-fisica-6-esp-2",
        "name": "ENTRENAMIENTO PERSONALIZADO Y GRUPAL - CFS6A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "cultura-fisica-6-esp-3",
        "name": "DEPORTES ALTERNATIVOS - CFS6A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "cultura-fisica-6-esp-4",
        "name": "PROFUNDIZACIÓN I - CFS7A",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 12,
        "version1Hours": 12
      }
    },
    "version1Total": 160
  },
  {
    "id": "cultura-fisica-7",
    "unitId": "cultura-fisica",
    "documentId": "40040157",
    "fullName": "LYDA FABIOLA VALLEJO CASTILLO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Profesional en Cultura Física y Deporte · Magíster en Ciencias del Deporte",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "cultura-fisica-7-esp-1",
        "name": "PSICOMOTRICIDAD - CUF2A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-7-esp-2",
        "name": "BIOMECÁNICA - CUF3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-7-esp-3",
        "name": "EVALUACIÓN FUNCIONAL - CFS4A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-7-esp-4",
        "name": "ENFERMEDADES CRÓNICAS NO TRANSMISIBLES - PATOKINESIS - CFS4A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-7-esp-5",
        "name": "NUTRICIÓN - CFS5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-7-esp-6",
        "name": "PRACTICA PROFESIONAL - CFS9A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "20502": {
        "code": "20502",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "cultura-fisica-8",
    "unitId": "cultura-fisica",
    "documentId": "7178288",
    "fullName": "NESTOR MANUEL ABRIL ESTUPINAN",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Cultura Física y Deporte · Magíster en Ciencias del Deporte",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "cultura-fisica-8-esp-1",
        "name": "MARKETING DEPORTIVO - CFS4A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "cultura-fisica-8-esp-2",
        "name": "DEPORTES DE CONJUNTO - CFS5A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "cultura-fisica-8-esp-3",
        "name": "MARCO CONCEPTUAL, HISTORIA Y TENDENCIAS DE LA RECREACIÓN - CFS5A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "cultura-fisica-8-esp-4",
        "name": "PRACTICA PROFESIONAL - CFS9A",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "cultura-fisica-9",
    "unitId": "cultura-fisica",
    "documentId": "1010233236",
    "fullName": "NICOLAS CORDOBA JIMENEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Profesional en Cultura Física y Deporte · Magíster en Ciencias del Deporte",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "cultura-fisica-9-esp-1",
        "name": "APRENDIZAJE Y DESARROLLO - CUF2A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-9-esp-2",
        "name": "INTRODUCCIÓN A LA CULTURA FÍSICA DEPORTE Y RECREACIÓN - CFSIA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-9-esp-3",
        "name": "FUNDAMENTOS DE MORFOFISIOLOGÍA - CUF2A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-9-esp-4",
        "name": "PRAXIOLOGÍA MOTRIZ - CUF2A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-9-esp-5",
        "name": "DIDÁCTICA DE LA CULTURA FÍSICA - CUF3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-9-esp-6",
        "name": "PRACTICA PROFESIONAL - CFS9A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "cultura-fisica-10",
    "unitId": "cultura-fisica",
    "documentId": "6766032",
    "fullName": "OSCAR AUGUSTO SUAREZ GIL",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Cultura Física y Deporte · Magíster en Ciencias del Deporte",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "cultura-fisica-10-esp-1",
        "name": "EVENTOS Y ESCENARIOS DEPORTIVOS - CUF2A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-10-esp-2",
        "name": "DISEÑO Y GESTIÓN DE PROYECTOS DE LA CULTURA FISICA - CUF3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-10-esp-3",
        "name": "ADMINISTRACIÓN DE ORGANISMOS DEPORTIVOS - CFS6A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-10-esp-4",
        "name": "PROFUNDIZACIÓN I - CFS7A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cultura-fisica-10-esp-5",
        "name": "PROFUNDIZACIÓN II - CFS8A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cultura-fisica-10-esp-6",
        "name": "INTRODUCCIÓN A LA ADMINISTRACIÓN DE LA CULTURA FÍSICA - CFSIA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cultura-fisica-10-esp-7",
        "name": "PEDAGOGÍA DE LA CULTURA FÍSICA - CFSIA",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "cultura-fisica-11",
    "unitId": "cultura-fisica",
    "documentId": "1049638076",
    "fullName": "SOFIA RODRIGUEZ CHAPARRO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Profesional en Cultura Física y Deporte · Magíster en Ciencias del Deporte",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "cultura-fisica-11-esp-1",
        "name": "MASAJE TERAPEUTICO Y DEPORTIVO - CFS7A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-11-esp-2",
        "name": "CLASES GRUPALES - CFS8A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-11-esp-3",
        "name": "EXPRESION CORPORAL - CFSIA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-11-esp-4",
        "name": "EDUCACIÓN EXPERIENCIAL - CFS6A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-11-esp-5",
        "name": "PSICOLOGÍA DEPORTIVA - CFS6A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-11-esp-6",
        "name": "PROYECTO DE INVESTIGACIÓN - CFS7A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "cultura-fisica-12",
    "unitId": "cultura-fisica",
    "documentId": "1049606298",
    "fullName": "YASMIN CASTELLANOS RUÍZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Cultura Física y Deporte · Magíster en Ciencias del Deporte",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "cultura-fisica-12-esp-1",
        "name": "DEPORTES ARTE Y PRECISIÓN - CFS4A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-12-esp-2",
        "name": "PROGRAMACIÓN DEL EJERCICIO - CFS5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-12-esp-3",
        "name": "HISTORIA Y TENDENCIAS DE LA RECREACIÓN - CUF2A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-12-esp-4",
        "name": "TECNOLOGÍA APLICADA A LA ACTIVIDAD FÍSICA - CFS7A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-12-esp-5",
        "name": "PROFUNDIZACIÓN II - CFS8A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cultura-fisica-12-esp-6",
        "name": "OPCIÓN DE GRADO - CFS9A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "diseno-interaccion-1",
    "unitId": "diseno-interaccion",
    "documentId": "1097666178",
    "fullName": "BAYRON SAMUEL MARIN ORTIZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Diseñador(a) · Magíster en Diseño de Interacción y Medios Digitales",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "diseno-interaccion-1-esp-1",
        "name": "PROGRAMACION IXD I - DIT2A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "diseno-interaccion-1-esp-2",
        "name": "PROGRAMACION IXD II - DIT3A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "diseno-interaccion-1-esp-3",
        "name": "PROGRAMACION IXD III - DITTA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "diseno-interaccion-1-esp-4",
        "name": "PROGRAMACION IXD IV - DIT5A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "diseno-interaccion-1-esp-5",
        "name": "DESARROLLO Y PROGRAMACIÓN PARA VIDEO JUEGOS - DIT7A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "30411": {
        "code": "30411",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "diseno-interaccion-2",
    "unitId": "diseno-interaccion",
    "documentId": "7186685",
    "fullName": "EDISON AUGUSTO YAYA CONTRERAS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Diseñador(a) · Magíster en Diseño de Interacción y Medios Digitales",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "diseno-interaccion-2-esp-1",
        "name": "INTRODUCCION AL DISEÑO DE INTERACCION - DIT1A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "diseno-interaccion-2-esp-2",
        "name": "EXPRESION II - DIT2A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "diseno-interaccion-2-esp-3",
        "name": "TEORIAS DEL JUEGO [VIRTUAL] - DIT5A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "diseno-interaccion-2-esp-4",
        "name": "TENDENCIAS Y MERCADOS - DIT5A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "diseno-interaccion-2-esp-5",
        "name": "GESTION I - DIT5A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "diseno-interaccion-2-esp-6",
        "name": "GESTION II GERENCIA DE PROYECTOS - DIT6A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "diseno-interaccion-2-esp-7",
        "name": "LUDICA Y LOS VIDEOJUEGOS - DIT6A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "diseno-interaccion-2-esp-8",
        "name": "MODELADO DE PERSONAJES Y ESCENARIOS PARA VIDEOJUEGOS - DIT8A",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "diseno-interaccion-3",
    "unitId": "diseno-interaccion",
    "documentId": "1057580987",
    "fullName": "JOHANN JULIAN SALCEDO MALDONADO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Diseñador(a) · Magíster en Diseño de Interacción y Medios Digitales",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "diseno-interaccion-3-esp-1",
        "name": "FUNDAMENTOS DE DISEÑO - DIT1A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "diseno-interaccion-3-esp-2",
        "name": "X LAB I - DIT6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "diseno-interaccion-3-esp-3",
        "name": "X LAB II - DIT7A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "diseno-interaccion-3-esp-4",
        "name": "ESTUDIO UCD (DISEÑO CENTRADO EN LOS USUARIOS) - DIT8A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "diseno-interaccion-3-esp-5",
        "name": "DIMENSIONES DEL DISEÑO DE INTERACCION - DIT3A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "diseno-interaccion-4",
    "unitId": "diseno-interaccion",
    "documentId": "1049629691",
    "fullName": "JOSE ALEJANDRO ACUNA NAJAR",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Diseñador(a) · Magíster en Diseño de Interacción y Medios Digitales",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "diseno-interaccion-4-esp-1",
        "name": "PAUTAS DE DISEÑO UNIVERSAL - DIT2A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "diseno-interaccion-4-esp-2",
        "name": "METODOLOGIAS Y METODOS DE INVESTIGACION - DIT2A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "diseno-interaccion-4-esp-3",
        "name": "DISEÑO DE INTERACCION I - DIT3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "diseno-interaccion-4-esp-4",
        "name": "DISEÑO DE INTERACCION II - DITTA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "diseno-interaccion-4-esp-5",
        "name": "ESTUDIOS CULTURALES - DITTA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "diseno-interaccion-4-esp-6",
        "name": "CULTURA VISUAL - DIT6A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "diseno-interaccion-4-esp-7",
        "name": "OPCION DE GRADO I - DIT7A",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 12,
        "version1Hours": 12
      }
    },
    "version1Total": 160
  },
  {
    "id": "diseno-interaccion-5",
    "unitId": "diseno-interaccion",
    "documentId": "1049622203",
    "fullName": "JUAN ENRIQUE CABRA SANCHEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Diseñador(a) · Magíster en Diseño de Interacción y Medios Digitales",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "diseno-interaccion-5-esp-1",
        "name": "INTRODUCCION A LA PROGRAMACION - DIT1A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "diseno-interaccion-5-esp-2",
        "name": "EXPRESION III - DIT3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "diseno-interaccion-5-esp-3",
        "name": "INVESTIGACION EN DISEÑO DE INTERACCION I - DIT3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "diseno-interaccion-5-esp-4",
        "name": "PROYECTO DE INTERACCION I - DITTA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "diseno-interaccion-5-esp-5",
        "name": "INVESTIGACION EN DISEÑO DE INTERACCION II - DITTA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "diseno-interaccion-5-esp-6",
        "name": "OPCION DE GRADO II - DIT8A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "20502": {
        "code": "20502",
        "hours": 4,
        "version1Hours": 4
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "diseno-interaccion-6",
    "unitId": "diseno-interaccion",
    "documentId": "1049634538",
    "fullName": "JULIAN SANTIAGO DELGADILLO APONTE",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Diseñador(a) · Magíster en Diseño de Interacción y Medios Digitales",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "diseno-interaccion-6-esp-1",
        "name": "DISEÑO DE SONIDO - DIT4A",
        "level": "Pregrado",
        "monthlyHours": 48
      },
      {
        "id": "diseno-interaccion-6-esp-2",
        "name": "DISEÑO DE SONIDO - DIT4B",
        "level": "Pregrado",
        "monthlyHours": 48
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "diseno-interaccion-7",
    "unitId": "diseno-interaccion",
    "documentId": "1057892283",
    "fullName": "MARÍA DEL CARMEN CHACÓN MARTÍNEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Diseñador(a) · Magíster en Diseño de Interacción y Medios Digitales",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "diseno-interaccion-7-esp-1",
        "name": "FUNDAMENTOS DE ADMINISTRACION - DITTA",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "diseno-interaccion-8",
    "unitId": "diseno-interaccion",
    "documentId": "1056030143",
    "fullName": "MARTHA LILIANA SUAREZ CRUCES",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Diseñador(a) · Magíster en Diseño de Interacción y Medios Digitales",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "diseno-interaccion-8-esp-1",
        "name": "EXPRESION I - DIT1A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "diseno-interaccion-8-esp-2",
        "name": "INTRODUCCION A LA INVESTIGACION - DIT1A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "diseno-interaccion-8-esp-3",
        "name": "OBJETOS DE DISEÑO - DIS2A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "diseno-interaccion-8-esp-4",
        "name": "HISTORIA DEL DISEÑO - DIT2A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "diseno-interaccion-8-esp-5",
        "name": "DISEÑO Y VISUALIZACIÓN - DIT3A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "diseno-interaccion-8-esp-6",
        "name": "PROYECTO DE INTERACCION II - DIT5A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "diseno-interaccion-8-esp-7",
        "name": "REALIDADES - DIT6A",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-1",
    "unitId": "lic-lenguas",
    "documentId": "7175390",
    "fullName": "FR. JAVIER ANIBAL MORENO MOJICA, O.P.",
    "dedication": "DIRECTIVO",
    "expectedWorkload": 210,
    "rank": "Decano(a) de Facultad",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "lic-lenguas-1-esp-1",
        "name": "LINGÜÍSTICA APLICADA AL ELE - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "30222": {
        "code": "30222",
        "hours": 190,
        "version1Hours": 190
      }
    },
    "version1Total": 210
  },
  {
    "id": "lic-lenguas-2",
    "unitId": "lic-lenguas",
    "documentId": "40032659",
    "fullName": "GLADIS LEONOR ARIAS RODRIGUEZ",
    "dedication": "DIRECTIVO",
    "expectedWorkload": 210,
    "rank": "Decano(a) de Facultad",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "lic-lenguas-2-esp-1",
        "name": "INVESTIGACIÓN EDUCATIVA - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "30222": {
        "code": "30222",
        "hours": 190,
        "version1Hours": 190
      }
    },
    "version1Total": 210
  },
  {
    "id": "lic-lenguas-3",
    "unitId": "lic-lenguas",
    "documentId": "1057605307",
    "fullName": "CAMILA ANDREA PALACIOS OLARTE",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "lic-lenguas-3-esp-1",
        "name": "INGLÉS BÁSICO III - LCF3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-3-esp-2",
        "name": "FONÉTICA Y FONOLOGÍA DEL INGLÉS - LCF3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-3-esp-3",
        "name": "LINGÜÍSTICA APLICADA ELT & TIC - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-3-esp-4",
        "name": "INGLÉS INTERMEDIO - LCF5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-3-esp-5",
        "name": "CULTURA Y LITERATURA INGLESA UNIVERSAL - LCF5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-3-esp-6",
        "name": "CULTURA Y LITERATURA INGLESA UNIVERSAL - LCF5B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "30411": {
        "code": "30411",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-4",
    "unitId": "lic-lenguas",
    "documentId": "1032387844",
    "fullName": "DIANA ALEJANDRA CORREDOR LADINO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "lic-lenguas-4-esp-1",
        "name": "FRANCÉS PREINTERMEDIO - LCF4A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-4-esp-2",
        "name": "LINGÜÍSTICA APLICADA FLE & TIC - LCF5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-4-esp-3",
        "name": "LINGÜÍSTICA APLICADA FLE & TIC - LCF5B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-4-esp-4",
        "name": "FRANCÉS AVANZADO - LCF7B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-4-esp-5",
        "name": "EDUCACIÓN INCLUSIVA MULTICULTURAL - LCF8A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-4-esp-6",
        "name": "EDUCACIÓN INCLUSIVA MULTICULTURAL - LCF8B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-5",
    "unitId": "lic-lenguas",
    "documentId": "1057594006",
    "fullName": "DIEGO ANDRES NINO SANCHEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "lic-lenguas-5-esp-1",
        "name": "FRANCÉS BÁSICO III - LCF3B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-lenguas-5-esp-2",
        "name": "FRANCÉS INTERMEDIO - LCF5A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-lenguas-5-esp-3",
        "name": "FRANCÉS INTERMEDIO ALTO - LCF6A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-lenguas-5-esp-4",
        "name": "FRANCÉS INTERMEDIO ALTO - LCF6B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-lenguas-5-esp-5",
        "name": "PREPARACION DE EXAMENES INTERNACIONALES - LCEFB",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-6",
    "unitId": "lic-lenguas",
    "documentId": "40045967",
    "fullName": "ELIANA EDITH ROBERTO FLOREZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "lic-lenguas-6-esp-1",
        "name": "MODELOS PEDAGÓGICOS - LCF1B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-6-esp-2",
        "name": "EVALUACIÓN EN CONTEXTO ESCOLAR - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-6-esp-3",
        "name": "PRÁCTICA PEDAGÓGICA E INVESTIGATIVA I - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-6-esp-4",
        "name": "PRÁCTICA PEDAGÓGICA E INVESTIGATIVA III - LCF8B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-6-esp-5",
        "name": "PRÁCTICA PROFESIONAL Y PROYECTO DE GRADO II - LC10A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-6-esp-6",
        "name": "EDUCACIÓN MULTILINGÜE - LCF7A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-7",
    "unitId": "lic-lenguas",
    "documentId": "80194830",
    "fullName": "FELIPE MORENO PERDOMO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "lic-lenguas-7-esp-1",
        "name": "FRANCÉS INTERMEDIO - LCF5B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-lenguas-7-esp-2",
        "name": "FRANCÉS AVANZADO - LCF7A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-lenguas-7-esp-3",
        "name": "CULTURA Y CIVILIZACIÓN FRANCÓFONA - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-lenguas-7-esp-4",
        "name": "POLÍTICA EDUCATIVA, GESTIÓN Y ADMINISTRACIÓN - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-lenguas-7-esp-5",
        "name": "PROYECTO COMUNICATIVO DEL FRANCÉS - LCFA",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-8",
    "unitId": "lic-lenguas",
    "documentId": "1049630217",
    "fullName": "GINA MARCELA SAMACA AGUILAR",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "lic-lenguas-8-esp-1",
        "name": "FONÉTICA Y FONOLOGÍA DEL FRANCÉS - LCF3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-8-esp-2",
        "name": "FONÉTICA Y FONOLOGÍA DEL FRANCÉS - LCF3B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-8-esp-3",
        "name": "FRANCÉS PREINTERMEDIO - LCF4B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-8-esp-4",
        "name": "FRANCÉS PREINTERMEDIO - LCFAC",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-8-esp-5",
        "name": "PRÁCTICA PEDAGÓGICA E INVESTIGATIVA II - LCF7B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-8-esp-6",
        "name": "PRÁCTICA PROFESIONAL Y PROYECTO DE GRADO II - LC10A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-8-esp-7",
        "name": "PREPARACION DE EXAMENES INTERNACIONALES - LCEFA",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-9",
    "unitId": "lic-lenguas",
    "documentId": "1053345671",
    "fullName": "JONY ALEXANDER RODRIGUEZ VALDERRAMA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "lic-lenguas-9-esp-1",
        "name": "MODELOS PEDAGÓGICOS - LCF1A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-9-esp-2",
        "name": "LITERATURA UNIVERSAL - LCF2B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-9-esp-3",
        "name": "LITERATURA UNIVERSAL - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-9-esp-4",
        "name": "PROCESOS DE APRENDIZAJE - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-9-esp-5",
        "name": "INTRODUCCIÓN A LA INVESTIGACIÓN - LCF3A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-9-esp-6",
        "name": "LITERATURA ESPAÑOLA - LCF4B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-9-esp-7",
        "name": "LITERATURA ESPAÑOLA - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "lic-lenguas-9-esp-8",
        "name": "LITERATURA COLOMBIANA E HISPANOAMAERICANA - LCF6A",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "lic-lenguas-9-esp-9",
        "name": "LITERATURA COLOMBIANA E HISPANOAMAERICANA - LCF6B",
        "level": "Pregrado",
        "monthlyHours": 8
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-10",
    "unitId": "lic-lenguas",
    "documentId": "1120377690",
    "fullName": "JOSE ARMANDO QUINTERO PENA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "lic-lenguas-10-esp-1",
        "name": "INGLÉS AVANZADO - LCF7A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-lenguas-10-esp-2",
        "name": "INGLÉS AVANZADO - LCF7B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-lenguas-10-esp-3",
        "name": "INGLÉS AVANZADO - LCF7C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-lenguas-10-esp-4",
        "name": "PREPARACION DE EXAMENES INTERNACIONALES - LCEFA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-lenguas-10-esp-5",
        "name": "POLITICAS EDUCATIVAS - LCFB",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-11",
    "unitId": "lic-lenguas",
    "documentId": "1058038030",
    "fullName": "JUAN GUILLERMO REY PEREZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "lic-lenguas-11-esp-1",
        "name": "LINGÜÍSTICA GENERAL - LCFB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-11-esp-2",
        "name": "GRAMÁTICA DEL ESPAÑOL - LCFAB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-11-esp-3",
        "name": "INTRODUCCIÓN A LA INVESTIGACIÓN - LCF3B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-11-esp-4",
        "name": "PRÁCTICA INVESTIGATIVA EN PEDAGOGÍA DE LENGUAS - LCF5B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-11-esp-5",
        "name": "ANTROPOLOGÍA LINGÜÍSTICA - LCF8A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-11-esp-6",
        "name": "ANTROPOLOGÍA LINGÜÍSTICA - LCF8B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-11-esp-7",
        "name": "DIDÁCTICA DEL ESPAÑOL Y LA LITERATURA - LCF9A",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "lic-lenguas-11-esp-8",
        "name": "DIDÁCTICA DEL ESPAÑOL Y LA LITERATURA - LCF9B",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "lic-lenguas-11-esp-9",
        "name": "PENSAMIENTO CRITICO - LIFRA",
        "level": "Pregrado",
        "monthlyHours": 8
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-12",
    "unitId": "lic-lenguas",
    "documentId": "1049654563",
    "fullName": "JUAN MATEO QUINTERO PENA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "lic-lenguas-12-esp-1",
        "name": "FONÉTICA Y FONOLOGÍA DEL INGLÉS - LCF3B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-12-esp-2",
        "name": "INGLÉS PREINTERMEDIO - LCF4A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-12-esp-3",
        "name": "LINGÜÍSTICA APLICADA ELT & TIC - LCF4B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-12-esp-4",
        "name": "INGLÉS INTERMEDIO - LCF5B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-12-esp-5",
        "name": "INGLÉS INTERMEDIO ALTO - LCF6A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-12-esp-6",
        "name": "PREPARACION DE EXAMENES INTERNACIONALES - LCEFB",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-13",
    "unitId": "lic-lenguas",
    "documentId": "1007479260",
    "fullName": "JULIAN MARTINEZ TORRES",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "lic-lenguas-13-esp-1",
        "name": "INGLES BÁSICO I - LCF1B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "lic-lenguas-13-esp-2",
        "name": "FRANCÉS BÁSICO I - LCF1A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "lic-lenguas-13-esp-3",
        "name": "FRANCÉS BÁSICO II - LCF2A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "lic-lenguas-13-esp-4",
        "name": "FRANCÉS BÁSICO II - LCF2B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-14",
    "unitId": "lic-lenguas",
    "documentId": "1049646667",
    "fullName": "LIZETH FERNANDA HERMOSILLA LÓPEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "lic-lenguas-14-esp-1",
        "name": "INGLÉS BÁSICO III - LCF3B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "lic-lenguas-14-esp-2",
        "name": "INGLÉS INTERMEDIO ALTO - LCF6B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "lic-lenguas-14-esp-3",
        "name": "PROYECTO COMUNICATIVO DEL INGLÉS - LCF8B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "lic-lenguas-14-esp-4",
        "name": "PRÁCTICA PEDAGÓGICA E INVESTIGATIVA III - LCF8A",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-15",
    "unitId": "lic-lenguas",
    "documentId": "7182314",
    "fullName": "MANUEL ALBERTO SUAREZ MONTANA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "lic-lenguas-15-esp-1",
        "name": "MÉTODOS Y ENFOQUES DE LA ENSEÑANZA DE LAS LENGUAS - LCF3B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-15-esp-2",
        "name": "CURRÍCULO Y DIDÁCTICA - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-15-esp-3",
        "name": "CURRÍCULO Y DIDÁCTICA - LCFAB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-15-esp-4",
        "name": "DIDÁCTICA DE LAS LENGUAS Y DISEÑO DE MATERIALES CON INCLUSIÓN DE TIC TAC TEP* - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-15-esp-5",
        "name": "PRÁCTICA PEDAGÓGICA E INVESTIGATIVA I - LCFAB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "lic-lenguas-15-esp-6",
        "name": "POLÍTICA EDUCATIVA, GESTIÓN Y ADMINISTRACIÓN - LCF7B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-16",
    "unitId": "lic-lenguas",
    "documentId": "1053343853",
    "fullName": "NIDIA PAOLA SANCHEZ SANCHEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "lic-lenguas-16-esp-1",
        "name": "INGLES BÁSICO I - LCF1A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "lic-lenguas-16-esp-2",
        "name": "INGLÉS BÁSICO II - LCF2B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "lic-lenguas-16-esp-3",
        "name": "INGLÉS BÁSICO II - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "lic-lenguas-16-esp-4",
        "name": "INGLÉS PREINTERMEDIO - LCF4B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-lenguas-17",
    "unitId": "lic-lenguas",
    "documentId": "1049635187",
    "fullName": "YESENIA KATHERIN HERNANDEZ CHAVEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Español y Lenguas Extranjeras · Magíster en Lingüística Aplicada",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "lic-lenguas-17-esp-1",
        "name": "LINGÜÍSTICA GENERAL - LCF1A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-17-esp-2",
        "name": "GRAMÁTICA DEL ESPAÑOL - LCFAA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-17-esp-3",
        "name": "PRAGMALINGÜÍSTICA - LCF3A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-17-esp-4",
        "name": "PRAGMALINGÜÍSTICA - LCF3B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "lic-lenguas-17-esp-5",
        "name": "INVESTIGACIÓN EDUCATIVA - LCF4B",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "lic-lenguas-17-esp-6",
        "name": "SEMIÓTICA - LCF5A",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "lic-lenguas-17-esp-7",
        "name": "SEMIÓTICA - LCF5B",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "lic-lenguas-17-esp-8",
        "name": "PRÁCTICA INVESTIGATIVA EN PEDAGOGÍA DE LENGUAS - LCF5A",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "lic-lenguas-17-esp-9",
        "name": "PSICOLINGÜÍSTICA - LC10A",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "lic-lenguas-17-esp-10",
        "name": "APRENDIZAJE SIGNIFICATIVO - LC10A",
        "level": "Pregrado",
        "monthlyHours": 8
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-infantil-1",
    "unitId": "lic-infantil",
    "documentId": "94528784",
    "fullName": "CARLOS FRANCISCO RINCON LOZADA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Educación Infantil · Magíster en Educación",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "lic-infantil-1-esp-1",
        "name": "DESARROLLO NEUROBIOLÓGICO - A1",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40106": {
        "code": "40106",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "lic-infantil-2",
    "unitId": "lic-infantil",
    "documentId": "1023947510",
    "fullName": "EDWIN OSPINA FONSECA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Educación Infantil · Magíster en Educación",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "lic-infantil-2-esp-1",
        "name": "FRANCÉS BÁSICO I - LCF1B (LIC. LENGUAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-infantil-2-esp-2",
        "name": "FRANCÉS BÁSICO II - LCF2C (LIC. LENGUAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-infantil-2-esp-3",
        "name": "FRANCÉS BÁSICO III - LCF3A (LIC. LENGUAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-infantil-2-esp-4",
        "name": "PRÁCTICA PEDAGÓGICA E INVESTIGATIVA II - LCFAA (LIC. LENGUAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-infantil-2-esp-5",
        "name": "INTRODUCCIÓN A LA EDUCACIÓN INFANTIL - A1",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40109": {
        "code": "40109",
        "hours": 4,
        "version1Hours": 4
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "sharedUnitName": "LIC. LENGUAS",
    "version1Total": 160
  },
  {
    "id": "lic-infantil-3",
    "unitId": "lic-infantil",
    "documentId": "1102378823",
    "fullName": "JHON JAIRO CHAPARRO MANTILLA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) en Educación Infantil · Magíster en Educación",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "lic-infantil-3-esp-1",
        "name": "INGLÉS PREINTERMEDIO - LCF4C (LIC. LENGUAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-infantil-3-esp-2",
        "name": "PROYECTO COMUNICATIVO DEL INGLÉS - LCF8A (LIC. LENGUAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-infantil-3-esp-3",
        "name": "PRÁCTICA PROFESIONAL Y PROYECTO DE GRADO I - LCFA (LIC. LENGUAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-infantil-3-esp-4",
        "name": "POLITICAS EDUCATIVAS - LCFA (LIC. LENGUAS)",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "lic-infantil-3-esp-5",
        "name": "FUNDAMENTOS DE LA EDUCACIÓN BILINGÜE - A1",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "sharedUnitName": "LIC. LENGUAS",
    "version1Total": 160
  },
  {
    "id": "marketing-1",
    "unitId": "marketing",
    "documentId": "1014277114",
    "fullName": "ANDRES FELIPE SANCHEZ SIERRA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Profesional en Mercadeo · Magíster en Marketing y Transformación Digital",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "marketing-1-esp-1",
        "name": "DERECHO LABORAL Y COMERCIAL - MDG3A",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "30411": {
        "code": "30411",
        "hours": 4,
        "version1Hours": 4
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "marketing-2",
    "unitId": "marketing",
    "documentId": "80074946",
    "fullName": "CAMILO ANDRES SEBA ZAPATA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Mercadeo · Magíster en Marketing y Transformación Digital",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "marketing-2-esp-1",
        "name": "TENDENCIAS DIGITALES Y TECNOLÓGICAS - MADGC",
        "level": "Pregrado",
        "monthlyHours": 48
      },
      {
        "id": "marketing-2-esp-2",
        "name": "TENDENCIAS DIGITALES Y TECNOLÓGICAS - MRD2B",
        "level": "Pregrado",
        "monthlyHours": 48
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "marketing-3",
    "unitId": "marketing",
    "documentId": "1055504742",
    "fullName": "CRISTHIAN ANDRES CASTRO CELY",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Profesional en Mercadeo · Magíster en Marketing y Transformación Digital",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "marketing-3-esp-1",
        "name": "MARKETING INTERNACIONAL - NEG6B (NEGOCIOS INT.)",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "marketing-3-esp-2",
        "name": "INVESTIGACIÓN DE MERCADOS - MDG3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "marketing-3-esp-3",
        "name": "INVESTIGACIÓN DE MERCADOS - MDG3B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "marketing-3-esp-4",
        "name": "FUNDAMENTOS DE MARKETING Y TRANSFORMACIÓN DIGITAL - MDG1B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "marketing-3-esp-5",
        "name": "FUNDAMENTOS DE MARKETING Y TRANSFORMACIÓN DIGITAL - MRD1A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "marketing-3-esp-6",
        "name": "PENSAMIENTO CREATIVO - MRD2B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "marketing-3-esp-7",
        "name": "PENSAMIENTO CREATIVO - MRDGA",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "sharedUnitName": "NEGOCIOS INT.",
    "version1Total": 160
  },
  {
    "id": "marketing-4",
    "unitId": "marketing",
    "documentId": "7188375",
    "fullName": "HERNAN RICARDO LEON GOMEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Mercadeo · Magíster en Marketing y Transformación Digital",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "marketing-4-esp-1",
        "name": "AUDIOVISUAL LAB - MAD2D",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "marketing-4-esp-2",
        "name": "AUDIOVISUAL LAB - MRD2A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "marketing-4-esp-3",
        "name": "AUDIOVISUAL LAB - MRD2B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "marketing-4-esp-4",
        "name": "COMUNICACIÓN ESTRATÉGICA - MDG3A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "marketing-4-esp-5",
        "name": "STARTUP NEGOCIOS DIGITALES - MDG3A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      },
      "40127": {
        "code": "40127",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "marketing-5",
    "unitId": "marketing",
    "documentId": "7180315",
    "fullName": "JAIME ANDRES RAMIREZ PARDO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Profesional en Mercadeo · Magíster en Marketing y Transformación Digital",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "marketing-5-esp-1",
        "name": "DATA LAB - MDG3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "marketing-5-esp-2",
        "name": "DATA LAB - MDG3B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "marketing-5-esp-3",
        "name": "BIG DATA - MDG4A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "marketing-5-esp-4",
        "name": "BIG DATA - MDG4B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "marketing-5-esp-5",
        "name": "E -COMMERCE Y DIGITAL MEDIA - MDG4A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "marketing-5-esp-6",
        "name": "E -COMMERCE Y DIGITAL MEDIA - MDG4B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "marketing-6",
    "unitId": "marketing",
    "documentId": "1056076386",
    "fullName": "JEISON DAVID MORENO CASTELLANOS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Mercadeo · Magíster en Marketing y Transformación Digital",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "marketing-6-esp-1",
        "name": "PROGRAMACIÓN - MDG1B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "marketing-6-esp-2",
        "name": "PROGRAMACIÓN - MRD1A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "marketing-6-esp-3",
        "name": "ANÁLISIS DE DATOS - MRD2B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "marketing-6-esp-4",
        "name": "ANÁLISIS DE DATOS - MRDGA",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "marketing-7",
    "unitId": "marketing",
    "documentId": "75065564",
    "fullName": "JORGE HERNAN GIRALDO CAMACHO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Profesional en Mercadeo · Magíster en Marketing y Transformación Digital",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "marketing-7-esp-1",
        "name": "ESTRATEGIAS DE MERCADEO - NEG4A (NEGOCIOS INT.)",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "marketing-7-esp-2",
        "name": "ESTRATEGIAS DE MERCADEO - NEG4B (NEGOCIOS INT.)",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "marketing-7-esp-3",
        "name": "SOCIOLOGÍA Y PSICOLOGÍA DEL CONSUMO - MRDGC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "marketing-7-esp-4",
        "name": "GERENCIA DE LA INNOVACIÓN Y EL CAMBIO - MDG3A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "marketing-7-esp-5",
        "name": "BRANDING & MERCHANDISING - MDG3B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "marketing-7-esp-6",
        "name": "GERENCIA COMERCIAL - MDG4A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "marketing-7-esp-7",
        "name": "GERENCIA COMERCIAL - MDG4B",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "sharedUnitName": "NEGOCIOS INT.",
    "version1Total": 160
  },
  {
    "id": "marketing-8",
    "unitId": "marketing",
    "documentId": "1016095166",
    "fullName": "KAREN ANDREA DIAZ GIRALDO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Profesional en Mercadeo · Magíster en Marketing y Transformación Digital",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "marketing-8-esp-1",
        "name": "SOCIOLOGÍA Y PSICOLOGÍA DEL CONSUMO - MRD2B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "marketing-8-esp-2",
        "name": "DIGITAL DESIGN LAB - MDG4A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "marketing-8-esp-3",
        "name": "DIGITAL DESIGN LAB - MDG4B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "marketing-8-esp-4",
        "name": "CREACIÓN DE CONTENIDO - MDG4A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "marketing-8-esp-5",
        "name": "CREACIÓN DE CONTENIDO - MDG4B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-1",
    "unitId": "ciencias-basicas",
    "documentId": "52219858",
    "fullName": "ADRIANA MARCELA VALERO POSADA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-1-esp-1",
        "name": "QUIMICA GENERAL - ELEC",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-1-esp-2",
        "name": "QUIMICA GENERAL - INDU-A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-1-esp-3",
        "name": "QUIMICA GENERAL - INDU-A1",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-1-esp-4",
        "name": "BIOLOGIA amb - AMB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-1-esp-5",
        "name": "FUNDAMENTOS DE BIOLOGIA - CULF-A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-2",
    "unitId": "ciencias-basicas",
    "documentId": "1052384956",
    "fullName": "ANA MARIA PRIETO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-2-esp-1",
        "name": "ALGEBRA LINEAL - CIV-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-2-esp-2",
        "name": "ALGEBRA LINEAL - MEC-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-2-esp-3",
        "name": "CALCULO DIFERENCIAL - CIV-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-2-esp-4",
        "name": "CALCULO DIFERENCIAL - IND-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-2-esp-5",
        "name": "ECUACIONES DIFERENCIALES - BIOB-AMB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-2-esp-6",
        "name": "ECUACIONES DIFERENCIALES - MEC-B",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-3",
    "unitId": "ciencias-basicas",
    "documentId": "1049622888",
    "fullName": "ANGELA ROCIO FUQUEN TIBATA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-3-esp-1",
        "name": "ALGEBRA LINEAL - BIO-AMB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-3-esp-2",
        "name": "ALGEBRA LINEAL - CIV-B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-3-esp-3",
        "name": "CALCULO DIFERENCIAL - SISB-ELEC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-3-esp-4",
        "name": "CALCULO INTEGRAL - BIO-AMB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-3-esp-5",
        "name": "CALCULO INTEGRAL - ELEC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-3-esp-6",
        "name": "ECUACIONES DIFERENCIALES - INDU-A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 20,
        "version1Hours": 20
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-4",
    "unitId": "ciencias-basicas",
    "documentId": "79962670",
    "fullName": "DANIEL AUGUSTO CASTELLANOS CORONADO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-4-esp-1",
        "name": "ONDAS Y ELECTROMAGNETISMO - ELEC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-4-esp-2",
        "name": "FISICA MECANICA - AMB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-4-esp-3",
        "name": "FISICA MECANICA - DAT-B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-4-esp-4",
        "name": "FISICA MECANICA - DAT-C",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-4-esp-5",
        "name": "ELECTRICIDAD Y MAGNETISMO - DAT-A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-4-esp-6",
        "name": "ELECTRICIDAD Y MAGNETISMO - DAT-A1",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-4-esp-7",
        "name": "ELECTRICIDAD Y MAGNETISMO - SIS-B1",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 20,
        "version1Hours": 20
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-5",
    "unitId": "ciencias-basicas",
    "documentId": "1054095760",
    "fullName": "DANIEL MAURICIO GUERRERO OSPINA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-5-esp-1",
        "name": "ELECTRICIDAD Y MAGNETISMO - BIO-ELEC-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-5-esp-2",
        "name": "ELECTRICIDAD Y MAGNETISMO - BIO-ELEC-A1",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-5-esp-3",
        "name": "ELECTRICIDAD Y MAGNETISMO - INDU-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-5-esp-4",
        "name": "ELECTRICIDAD Y MAGNETISMO - INDU-A1",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-5-esp-5",
        "name": "FISICA MECANICA - INDU-A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-5-esp-6",
        "name": "FISICA MECANICA - INDU-A1",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-5-esp-7",
        "name": "ELECTRICIDAD Y MAGNETISMO - SIS-B",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 20,
        "version1Hours": 20
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-6",
    "unitId": "ciencias-basicas",
    "documentId": "1049625911",
    "fullName": "DEISY MILDRET FORERO BENAVIDES",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-6-esp-1",
        "name": "MATEMATICAS I adm - NEG-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-6-esp-2",
        "name": "MATEMATICAS II cnt - CONT-ADMMB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-6-esp-3",
        "name": "CALCULO DIFERENCIAL - SISC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-6-esp-4",
        "name": "CALCULO INTEGRAL - IND-B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-6-esp-5",
        "name": "CALCULO INTEGRAL - MEC-B-DAT",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-6-esp-6",
        "name": "MATEMATICAS II - NEG-A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-7",
    "unitId": "ciencias-basicas",
    "documentId": "1049628697",
    "fullName": "ERIKA ALEJANDRA SUAREZ DIAZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-7-esp-1",
        "name": "ALGEBRA LINEAL - DAT-A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-7-esp-2",
        "name": "CALCULO DIFERENCIAL - DAT-A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-7-esp-3",
        "name": "CALCULO INTEGRAL - BIO-B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-7-esp-4",
        "name": "CALCULO INTEGRAL - CIV-B-SISB",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-7-esp-5",
        "name": "ECUACIONES DIFERENCIALES - CIV",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-8",
    "unitId": "ciencias-basicas",
    "documentId": "1049630934",
    "fullName": "FABIAN HERNANDO ANAYA SIERRA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-8-esp-1",
        "name": "ESTADISTICA II adm - ADM",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "ciencias-basicas-8-esp-2",
        "name": "MATEMATICA FINANCIERA - CONT",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "ciencias-basicas-8-esp-3",
        "name": "MATEMATICAS III - CONT-DN",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-9",
    "unitId": "ciencias-basicas",
    "documentId": "1054120259",
    "fullName": "HENRY ALBEIRO SAENZ LADINO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-9-esp-1",
        "name": "ESTADISTICA I - ADM-A-CONTA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-9-esp-2",
        "name": "ESTADISTICA I - MARK-A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-9-esp-3",
        "name": "PROBABILIDAD Y ESTADISTICA ele mec - ELEC-MEC",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-9-esp-4",
        "name": "PROBABILIDAD Y ESTADISTICA ele mec - SIS-B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-9-esp-5",
        "name": "ESTADISTICA Y PROBABILIDAD - DAT-B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-9-esp-6",
        "name": "ESTADISTICA Y PROBABILIDAD - IND",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-9-esp-7",
        "name": "ESTADISTICA Y PROBABILIDAD - SIS-A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-9-esp-8",
        "name": "ANÁLISIS DE DATOS - CULF-A",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-10",
    "unitId": "ciencias-basicas",
    "documentId": "1052386426",
    "fullName": "JORGE LEONARDO PITA OJEDA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-10-esp-1",
        "name": "ESTADISTICA I - MARK-B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-10-esp-2",
        "name": "PROBABILIDAD Y ESTADISTICA ele mec - BIO-AMB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-10-esp-3",
        "name": "ESTADISTICA Y PROBABILIDAD - CIV-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-10-esp-4",
        "name": "ESTADISTICA Y PROBABILIDAD - SIS-B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-10-esp-5",
        "name": "CALCULO INTEGRAL - INDA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-10-esp-6",
        "name": "CALCULO INTEGRAL - MEC-AMB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-10-esp-7",
        "name": "MATEMATICAS II - MARK-B",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-11",
    "unitId": "ciencias-basicas",
    "documentId": "7180864",
    "fullName": "JOSE ALBERTO CARRILLO CHAPARRO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-11-esp-1",
        "name": "METODOS NUMERICOS - SIS-A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-11-esp-2",
        "name": "CALCULO INTEGRAL - DAT-B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-11-esp-3",
        "name": "CALCULO INTEGRAL - SIS-B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-11-esp-4",
        "name": "CALCULO VECTORIAL - DAT-A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-11-esp-5",
        "name": "CALCULO VECTORIAL - SIS",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-12",
    "unitId": "ciencias-basicas",
    "documentId": "74433202",
    "fullName": "JOSE VICENTE SAMACA RAMIREZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-12-esp-1",
        "name": "OPERACIONAL Y NUMERICOS - SIS-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-12-esp-2",
        "name": "OPERACIONAL Y NUMERICOS - SIS-B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-12-esp-3",
        "name": "MATEMATICAS I adm - MARK-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-12-esp-4",
        "name": "INVESTIGACIÓN DE OPERACIONES - ADM",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-12-esp-5",
        "name": "MATEMATICAS II cnt - CONT-ADMMA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-12-esp-6",
        "name": "MATEMATICAS II - MARK-A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-13",
    "unitId": "ciencias-basicas",
    "documentId": "1049642391",
    "fullName": "JUAN ALEJANDRO RUBIO RODRIGUEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-13-esp-1",
        "name": "QUIMICA GENERAL - BIO-A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ciencias-basicas-13-esp-2",
        "name": "QUIMICA GENERAL - BIO-A1",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ciencias-basicas-13-esp-3",
        "name": "QUIMICA GENERAL - BIO-B-AMB",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ciencias-basicas-13-esp-4",
        "name": "BALANCE DE MATERIA Y ENERGÍA - AMB",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-14",
    "unitId": "ciencias-basicas",
    "documentId": "7188210",
    "fullName": "JULIAN DAVID SEGURA PENA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-14-esp-1",
        "name": "FISICA MECANICA - CIV-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-14-esp-2",
        "name": "FISICA MECANICA - CIV-A1",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-14-esp-3",
        "name": "FISICA MECANICA - DAT-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-14-esp-4",
        "name": "FISICA MECANICA - DAT-A1",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-14-esp-5",
        "name": "ELECTRICIDAD Y MAGNETISMO - MEC-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-14-esp-6",
        "name": "ELECTRICIDAD Y MAGNETISMO - MEC-A1",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-15",
    "unitId": "ciencias-basicas",
    "documentId": "1049616358",
    "fullName": "LEIDY JOHANA SUAREZ GOMEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-15-esp-1",
        "name": "PENSAMIENTO LOGICO - DIS",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-15-esp-2",
        "name": "ESTADISTICA Y PROBABILIDAD - CIV-B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-15-esp-3",
        "name": "ALGEBRA LINEAL - IND-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-15-esp-4",
        "name": "ALGEBRA LINEAL - SIS-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-15-esp-5",
        "name": "CALCULO DIFERENCIAL - SIS-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-15-esp-6",
        "name": "ECUACIONES DIFERENCIALES - MEC",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-16",
    "unitId": "ciencias-basicas",
    "documentId": "1002710163",
    "fullName": "LIS ALEJANDRA AVILA SOTO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-16-esp-1",
        "name": "MATEMATICAS I adm - ADMA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-16-esp-2",
        "name": "PROBABILIDAD Y ESTADISTICA ele mec - BIO-B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-16-esp-3",
        "name": "PROBABILIDAD Y ESTADISTICA ele mec - SIS-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-16-esp-4",
        "name": "ESTADISTICA Y PROBABILIDAD - DAT-A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-16-esp-5",
        "name": "ESTADISTICA Y PROBABILIDAD - SIS-C",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-16-esp-6",
        "name": "ALGEBRA LINEAL - SIS-C",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "ciencias-basicas-16-esp-7",
        "name": "ALGEBRA LINEAL - ELEC",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-17",
    "unitId": "ciencias-basicas",
    "documentId": "40049430",
    "fullName": "LUZ ADRIANA PABON CACHOPE",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-17-esp-1",
        "name": "ECUACIONES DIFERENCIALES amb - SIS-B-ELEC",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-17-esp-2",
        "name": "METODOS NUMERICOS - SIS-C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-17-esp-3",
        "name": "CALCULO VECTORIAL - BIO",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-17-esp-4",
        "name": "CALCULO VECTORIAL - DAT-B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-17-esp-5",
        "name": "ECUACIONES DIFERENCIALES - BIOA-DAT",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-18",
    "unitId": "ciencias-basicas",
    "documentId": "33369048",
    "fullName": "MAGDA PATRICIA ROJAS SARMIENTO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-18-esp-1",
        "name": "FISICA MECANICA - AMB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-18-esp-2",
        "name": "FISICA MECANICA - BIO-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-18-esp-3",
        "name": "FISICA MECANICA - BIO-A1",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-18-esp-4",
        "name": "FISICA MECANICA - CIV-B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-18-esp-5",
        "name": "ELECTRICIDAD Y MAGNETISMO - SIS-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-18-esp-6",
        "name": "ELECTRICIDAD Y MAGNETISMO - SIS-A1",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-19",
    "unitId": "ciencias-basicas",
    "documentId": "1057185999",
    "fullName": "MILTON ALFONSO FARIAS AVILA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-19-esp-1",
        "name": "ECUACIONES DIFERENCIALES amb - SIS-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-19-esp-2",
        "name": "ALGEBRA LINEAL - IND-B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-19-esp-3",
        "name": "ALGEBRA LINEAL - SIS-B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-19-esp-4",
        "name": "CALCULO VECTORIAL - CIV-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-19-esp-5",
        "name": "CALCULO VECTORIAL - ELEC-MEC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-19-esp-6",
        "name": "ECUACIONES DIFERENCIALES - BIOB-DATB",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-20",
    "unitId": "ciencias-basicas",
    "documentId": "1049644735",
    "fullName": "NICOLLE VIVIANA RODRIGUEZ AVILA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-20-esp-1",
        "name": "METODOS NUMERICOS - SIS-B",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-20-esp-2",
        "name": "CALCULO DIFERENCIAL - MEC-A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-20-esp-3",
        "name": "CALCULO INTEGRAL - CIV-A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-20-esp-4",
        "name": "CALCULO VECTORIAL - BIOA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "ciencias-basicas-20-esp-5",
        "name": "CALCULO VECTORIAL - IND",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-21",
    "unitId": "ciencias-basicas",
    "documentId": "23438690",
    "fullName": "NURY YOLANDA SUAREZ AVILA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-21-esp-1",
        "name": "HABILIDADES MATEMATICAS - CIV",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ciencias-basicas-21-esp-2",
        "name": "CALCULO DIFERENCIAL - BIO-AMB",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ciencias-basicas-21-esp-3",
        "name": "CALCULO INTEGRAL - DAT-A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ciencias-basicas-21-esp-4",
        "name": "CALCULO INTEGRAL - SIS-A",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-22",
    "unitId": "ciencias-basicas",
    "documentId": "33366850",
    "fullName": "RUTH MARLENE SANDOVAL ORTIZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-22-esp-1",
        "name": "PENSAMIENTO LÓGICO - LENG-A",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-23",
    "unitId": "ciencias-basicas",
    "documentId": "40040976",
    "fullName": "SANDRA BIVIANA GONZALEZ FIAGA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-23-esp-1",
        "name": "MATEMATICAS I adm - CONT-ADM B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ciencias-basicas-23-esp-2",
        "name": "MATEMATICAS I adm - MARK-B",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ciencias-basicas-23-esp-3",
        "name": "ESTADISTICA I - NEG-A",
        "level": "Pregrado",
        "monthlyHours": 24
      },
      {
        "id": "ciencias-basicas-23-esp-4",
        "name": "MATEMATICAS II - NEG-B",
        "level": "Pregrado",
        "monthlyHours": 24
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-24",
    "unitId": "ciencias-basicas",
    "documentId": "40043862",
    "fullName": "SULLY SEGURA PENA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-24-esp-1",
        "name": "FISICA MECANICA - SIS-A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "ciencias-basicas-24-esp-2",
        "name": "FISICA MECANICA - SIS-A1",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "ciencias-basicas-24-esp-3",
        "name": "FISICA MECANICA - BIO-B",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "ciencias-basicas-25",
    "unitId": "ciencias-basicas",
    "documentId": "7187551",
    "fullName": "WILLIAM OSWALDO SOSA CORREA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) / Físico / Matemático · Magíster en Ciencias Básicas",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "ciencias-basicas-25-esp-1",
        "name": "FISICA MECANICA - ELEC-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-25-esp-2",
        "name": "FISICA MECANICA - ELEC-A1",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-25-esp-3",
        "name": "FISICA MECANICA - INDU-B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-25-esp-4",
        "name": "FISICA MECANICA - MEC-A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-25-esp-5",
        "name": "FISICA MECANICA - MEC-A1",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "ciencias-basicas-25-esp-6",
        "name": "ELECTRICIDAD Y MAGNETISMO - MEC-A",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-1",
    "unitId": "humanidades",
    "documentId": "46386084",
    "fullName": "ANDREA DEL PILAR PEREZ RAIGOSO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "humanidades-1-esp-1",
        "name": "FILOSOFIA INSTITUCIONAL - ADM1C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-1-esp-2",
        "name": "FILOSOFIA INSTITUCIONAL - DER1A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-1-esp-3",
        "name": "FILOSOFIA POLITICA - ADM5E",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-1-esp-4",
        "name": "ANTROPOLOGIA neg in - ADMCONT",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-1-esp-5",
        "name": "FRAY DOMINIQUE PIRÉ: CÁTEDRA PARA LA PAZ - NEG6B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-1-esp-6",
        "name": "COMUNICACION ORAL Y ESCRITA - NEG1A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-1-esp-7",
        "name": "COMUNICACION ORAL Y ESCRITA - NEG1B",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40106": {
        "code": "40106",
        "hours": 20,
        "version1Hours": 20
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-2",
    "unitId": "humanidades",
    "documentId": "4151908",
    "fullName": "ANDRES FABIAN DIAZ SANABRIA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "humanidades-2-esp-1",
        "name": "FILOSOFIA POLITICA - AMELME",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-2-esp-2",
        "name": "ANTROPOLOGIA neg in - DER1B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-2-esp-3",
        "name": "PERSONA, SOCIEDAD Y CONOCIMIENTO - SIST",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-2-esp-4",
        "name": "FRAY JOSÉ DE JESÚS SEDANO: HABILIDADES Y MÉTODOS DE APRENDIZAJE - CIVA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-2-esp-5",
        "name": "FRAY JOSÉ DE JESÚS SEDANO: HABILIDADES Y MÉTODOS DE APRENDIZAJE - INTAMB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-2-esp-6",
        "name": "COMUNICACION ORAL Y ESCRITA - LICENB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-2-esp-7",
        "name": "REDES, PLATAFORMAS, COMUNIDADES Y ENTORNOS DIGITALES: LUUK JANSEN - SISTB",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 24,
        "version1Hours": 24
      },
      "40109": {
        "code": "40109",
        "hours": 8,
        "version1Hours": 8
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-3",
    "unitId": "humanidades",
    "documentId": "1049654788",
    "fullName": "CESAR PEREZ MORGAN",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "humanidades-3-esp-1",
        "name": "FILOSOFIA INSTITUCIONAL - ARQ",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "humanidades-3-esp-2",
        "name": "EPISTEMOLOGIA - ADMCONT",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "humanidades-3-esp-3",
        "name": "COMUNICACIÓN ORAL Y ESCRITA 1 - DATOS",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "humanidades-3-esp-4",
        "name": "PERSONA, SOCIEDAD Y CONOCIMIENTO - INDU",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "humanidades-3-esp-5",
        "name": "PERSONA, SOCIEDAD Y CONOCIMIENTO - MARK",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 20,
        "version1Hours": 20
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-4",
    "unitId": "humanidades",
    "documentId": "51872394",
    "fullName": "CLAUDIA LILIANA RAMOS QUINTERO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "humanidades-4-esp-1",
        "name": "FRAY JOSÉ LUIS GAGO DE VAL: LIDERAZGO Y COMUNICACIÓN - CONT",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-4-esp-2",
        "name": "FILOSOFIA INSTITUCIONAL - MEC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-4-esp-3",
        "name": "FILOSOFIA POLITICA - ARQB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-4-esp-4",
        "name": "FILOSOFIA POLITICA - CONT",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-4-esp-5",
        "name": "FILOSOFIA POLITICA - SIST",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-4-esp-6",
        "name": "ANTROPOLOGIA neg in - DER1A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-4-esp-7",
        "name": "PERSONA, SOCIEDAD Y CONOCIMIENTO - NEG2B",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 16,
        "version1Hours": 16
      },
      "40117": {
        "code": "40117",
        "hours": 4,
        "version1Hours": 4
      },
      "40127": {
        "code": "40127",
        "hours": 20,
        "version1Hours": 20
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-5",
    "unitId": "humanidades",
    "documentId": "1053327936",
    "fullName": "DAVID SAENZ GUERRERO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "humanidades-5-esp-1",
        "name": "CULTURA TEOLOGICA - BIOM",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-5-esp-2",
        "name": "CULTURA TEOLOGICA - ELMEC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-5-esp-3",
        "name": "FILOSOFIA POLITICA - DER3A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-5-esp-4",
        "name": "PERSONA, SOCIEDAD Y CONOCIMIENTO - CIV",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-5-esp-5",
        "name": "PERSONA, SOCIEDAD Y CONOCIMIENTO - NEG2C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-5-esp-6",
        "name": "ETICA - CIV",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-6",
    "unitId": "humanidades",
    "documentId": "46454283",
    "fullName": "DIANA DERLY HURTADO PENA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "humanidades-6-esp-1",
        "name": "FRAY JOSÉ DE JESÚS SEDANO: HABILIDADES Y MÉTODOS DE APRENDIZAJE - CIVB",
        "level": "Pregrado",
        "monthlyHours": 96
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-7",
    "unitId": "humanidades",
    "documentId": "1049604835",
    "fullName": "DIEGO EDGARDO ROJAS ESCOBAR",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "humanidades-7-esp-1",
        "name": "FILOSOFIA INSTITUCIONAL - SIST",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-7-esp-2",
        "name": "EPISTEMOLOGIA - LICENA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-7-esp-3",
        "name": "FILOSOFIA POLITICA - IND",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-7-esp-4",
        "name": "FILOSOFIA POLITICA - NEG",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-7-esp-5",
        "name": "PERSONA, SOCIEDAD Y CONOCIMIENTO - INTEB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-7-esp-6",
        "name": "CULTURA TEOLOGICA - DER4B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-7-esp-7",
        "name": "CULTURA TEOLOGICA - DER4C",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-7-esp-8",
        "name": "ETICA - INDAMB",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-8",
    "unitId": "humanidades",
    "documentId": "1070592370",
    "fullName": "DIEGO FERNANDO BARRIOS ANDRADE",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "humanidades-8-esp-1",
        "name": "FILOSOFIA INSTITUCIONAL - CULT",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-8-esp-2",
        "name": "FILOSOFIA INSTITUCIONAL - LICB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-8-esp-3",
        "name": "CULTURA TEOLOGICA - ADM4C",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-8-esp-4",
        "name": "CULTURA TEOLOGICA - DISE",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-8-esp-5",
        "name": "EPISTEMOLOGIA - AMB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-8-esp-6",
        "name": "EPISTEMOLOGIA - SIST",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-8-esp-7",
        "name": "COMUNICACIÓN ORAL Y ESCRITA 1 - CIVLENG",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-8-esp-8",
        "name": "COMUNICACIÓN ORAL Y ESCRITA 1 - CONTD",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-9",
    "unitId": "humanidades",
    "documentId": "74379615",
    "fullName": "EDGAR TAMARA PUERTO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "humanidades-9-esp-1",
        "name": "EPISTEMOLOGIA - ELMEC",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "humanidades-9-esp-2",
        "name": "PERSONA, SOCIEDAD Y CONOCIMIENTO - NEG2A",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "humanidades-9-esp-3",
        "name": "PRODUCCION DE TEXTO E INTRODUCCION AL PENSAMIENTO CIENTIFICO - CULFIS",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "humanidades-9-esp-4",
        "name": "EPISTEMOLOGIA - DER2C",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "humanidades-9-esp-5",
        "name": "FRAY JOSÉ DE JESÚS SEDANO: HABILIDADES Y MÉTODOS DE APRENDIZAJE - CONTD",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-10",
    "unitId": "humanidades",
    "documentId": "7173312",
    "fullName": "FABIAN LEONARDO BENAVIDES SILVA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "humanidades-10-esp-1",
        "name": "FILOSOFIA INSTITUCIONAL - DER1B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-10-esp-2",
        "name": "FILOSOFIA INSTITUCIONAL - IDTA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-10-esp-3",
        "name": "FILOSOFIA POLITICA - ARQA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-10-esp-4",
        "name": "FILOSOFIA POLITICA - DER3B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-10-esp-5",
        "name": "FRAY LOUIS JOSEPH LEBRET: ECONOMÍA Y HUMANISMO - ADMD",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-10-esp-6",
        "name": "PERSONA, SOCIEDAD Y CONOCIMIENTO - MEC",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-10-esp-7",
        "name": "FRAY DOMINIQUE PIRÉ: CÁTEDRA PARA LA PAZ - NEG6A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-10-esp-8",
        "name": "ETICA - ADMCONT",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-11",
    "unitId": "humanidades",
    "documentId": "7176089",
    "fullName": "HERNAN JAVIER PINZON MANRIQUE",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "humanidades-11-esp-1",
        "name": "CULTURA TEOLOGICA - ARQ6B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-11-esp-2",
        "name": "EPISTEMOLOGIA - ARQ",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-11-esp-3",
        "name": "FRAY LOUIS JOSEPH LEBRET: ECONOMÍA Y HUMANISMO - MECA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-11-esp-4",
        "name": "COMUNICACION ORAL Y ESCRITA - ELEC",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-11-esp-5",
        "name": "FRAY GIORDANO BRUNO: UNIVERSO, CIENCIAS Y HUMANISMO - ARQB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-11-esp-6",
        "name": "EPISTEMOLOGIA - CIV",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-11-esp-7",
        "name": "FRAY ANGÉLICO: ARTE Y HUMANISMO - ARQ",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-11-esp-8",
        "name": "COMUNICACION ORAL Y ESCRITA - LICENA",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-12",
    "unitId": "humanidades",
    "documentId": "1049604935",
    "fullName": "JONNATHAN ABDUL RINCON DIAZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "humanidades-12-esp-1",
        "name": "CULTURA TEOLOGICA - NEG5B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-12-esp-2",
        "name": "FRAY JOSÉ DE JESÚS SEDANO: HABILIDADES Y MÉTODOS DE APRENDIZAJE - MEC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-12-esp-3",
        "name": "ETICA - ADMCONTB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-12-esp-4",
        "name": "FRAY TEODORICO TEUTONICO DE VRIBERG: INGENIERÍA HUMANISTA - ELEC",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-12-esp-5",
        "name": "ETICA - ARQ8A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-12-esp-6",
        "name": "ETICA - LICENB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-12-esp-7",
        "name": "CIENCIA, TECNOLOGIA Y BIOETICA - BIO5A",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-13",
    "unitId": "humanidades",
    "documentId": "1049639919",
    "fullName": "JORGE ALBERTO VALCARCEL GUZMAN",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "humanidades-13-esp-1",
        "name": "FILOSOFIA POLITICA - LCA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "humanidades-13-esp-2",
        "name": "ANTROPOLOGIA - LICEA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "humanidades-13-esp-3",
        "name": "ETICA - CULDIS",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "humanidades-13-esp-4",
        "name": "ETICA - LICENA",
        "level": "Pregrado",
        "monthlyHours": 20
      },
      {
        "id": "humanidades-13-esp-5",
        "name": "COMUNICACION ORAL Y ESCRITA - MARKB",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-14",
    "unitId": "humanidades",
    "documentId": "1055273053",
    "fullName": "JOSE MANUEL SANCHEZ CAMACHO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "humanidades-14-esp-1",
        "name": "FILOSOFIA INSTITUCIONAL - BIOE",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-14-esp-2",
        "name": "FILOSOFIA INSTITUCIONAL - IND",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-14-esp-3",
        "name": "FILOSOFIA INSTITUCIONAL - NEG1A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-14-esp-4",
        "name": "FILOSOFIA INSTITUCIONAL - NEG1B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-14-esp-5",
        "name": "FILOSOFIA INSTITUCIONAL - CIV",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-14-esp-6",
        "name": "CATEDRA HENRI DIDON - DER1B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-14-esp-7",
        "name": "CATEDRA HENRI DIDON - LICENA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-14-esp-8",
        "name": "CATEDRA HENRI DIDON I - ELEC",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-15",
    "unitId": "humanidades",
    "documentId": "1015427180",
    "fullName": "JUAN FELIPE RIVERA PARDO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "humanidades-15-esp-1",
        "name": "CULTURA TEOLOGICA - NEG5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-15-esp-2",
        "name": "EPISTEMOLOGIA - NEG",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-15-esp-3",
        "name": "FILOSOFIA POLITICA - CULDIS",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-15-esp-4",
        "name": "PERSONA, SOCIEDAD Y CONOCIMIENTO - AMBBIO",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-15-esp-5",
        "name": "ETICA - ELMESI",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-15-esp-6",
        "name": "ETICA - ARQ8B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-15-esp-7",
        "name": "COMUNICACION ORAL Y ESCRITA - ADMD",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-16",
    "unitId": "humanidades",
    "documentId": "46382013",
    "fullName": "MARIA TERESA GOMEZ RAMIREZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "humanidades-16-esp-1",
        "name": "FRAY JOSÉ LUIS GAGO DE VAL: LIDERAZGO Y COMUNICACIÓN - CIV-AMBA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-16-esp-2",
        "name": "FRAY JOSÉ LUIS GAGO DE VAL: LIDERAZGO Y COMUNICACIÓN - CIV-AMBB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-16-esp-3",
        "name": "FILOSOFIA INSTITUCIONAL - ELECAM",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-16-esp-4",
        "name": "COMUNICACIÓN ORAL Y ESCRITA 1 - ARQUG",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-16-esp-5",
        "name": "COMUNICACIÓN ORAL Y ESCRITA 1 - BIOING",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-16-esp-6",
        "name": "COMUNICACIÓN ORAL Y ESCRITA 2 - BIOB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-16-esp-7",
        "name": "PERSONA, SOCIEDAD Y CONOCIMIENTO - INTEA",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "humanidades-16-esp-8",
        "name": "FRAY JOSÉ DE JESÚS SEDANO: HABILIDADES Y MÉTODOS DE APRENDIZAJE - ARQ",
        "level": "Pregrado",
        "monthlyHours": 8
      },
      {
        "id": "humanidades-16-esp-9",
        "name": "COMUNICACION ORAL Y ESCRITA - DISE",
        "level": "Pregrado",
        "monthlyHours": 8
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-17",
    "unitId": "humanidades",
    "documentId": "7180283",
    "fullName": "MILTON ADOLFO BAUTISTA ROA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "humanidades-17-esp-1",
        "name": "EPISTEMOLOGIA - LICENB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-17-esp-2",
        "name": "EPISTEMOLOGIA - DER2B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-17-esp-3",
        "name": "ETICA - NEG",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-17-esp-4",
        "name": "ETICA - ARQ8C",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-17-esp-5",
        "name": "COMUNICACION ORAL Y ESCRITA - MARKA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-17-esp-6",
        "name": "REDES, PLATAFORMAS, COMUNIDADES Y ENTORNOS DIGITALES: LUUK JANSEN - SISTA",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-18",
    "unitId": "humanidades",
    "documentId": "7314804",
    "fullName": "MILTON JAVIER PIRAZAN RODRIGUEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "humanidades-18-esp-1",
        "name": "FILOSOFIA INSTITUCIONAL - LICA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-18-esp-2",
        "name": "CATEDRA HENRI DIDON - ADMD",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-18-esp-3",
        "name": "CATEDRA HENRI DIDON - DER1A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-18-esp-4",
        "name": "CATEDRA HENRI DIDON - DISE",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-18-esp-5",
        "name": "CATEDRA HENRI DIDON - LICENB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-18-esp-6",
        "name": "FRAY BRUNO CADORÉ, O.P: DESARROLLO HUMANO, SALUD Y BIENESTAR - CULT",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-18-esp-7",
        "name": "CATEDRA DE LA FELICIDAD - DISE",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-19",
    "unitId": "humanidades",
    "documentId": "1026286839",
    "fullName": "NASLY YURANY GARZON REAL",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "humanidades-19-esp-1",
        "name": "CULTURA TEOLOGICA - ARQ6A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-19-esp-2",
        "name": "CULTURA TEOLOGICA - LICENB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-19-esp-3",
        "name": "EPISTEMOLOGIA - CULDIS",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-19-esp-4",
        "name": "FILOSOFIA POLITICA - LCB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-19-esp-5",
        "name": "FRAY GIORDANO BRUNO: UNIVERSO, CIENCIAS Y HUMANISMO - ARQA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-19-esp-6",
        "name": "ANTROPOLOGIA - ELECDIS",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-19-esp-7",
        "name": "ANTROPOLOGIA - LICENB",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-20",
    "unitId": "humanidades",
    "documentId": "1090413421",
    "fullName": "ORLANDO ORTEGA CHACON",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "humanidades-20-esp-1",
        "name": "FILOSOFIA INSTITUCIONAL - MARKTA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-20-esp-2",
        "name": "FILOSOFIA INSTITUCIONAL - MARKTB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-20-esp-3",
        "name": "CULTURA TEOLOGICA - CONTN",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "humanidades-20-esp-4",
        "name": "CULTURA TEOLOGICA - LICENA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-20-esp-5",
        "name": "FRAY LOUIS JOSEPH LEBRET: ECONOMÍA Y HUMANISMO - MARKET",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-20-esp-6",
        "name": "EPISTEMOLOGIA - DER2A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "humanidades-20-esp-7",
        "name": "CULTURA TEOLOGICA - DER4A",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "humanidades-21",
    "unitId": "humanidades",
    "documentId": "6404200",
    "fullName": "ROGELIO CANO MARÍN O.P",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Filosofía y Humanidades · Magíster en Humanidades",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "humanidades-21-esp-1",
        "name": "CULTURA TEOLOGICA - AMB7A",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "humanidades-21-esp-2",
        "name": "CULTURA TEOLOGICA - SIST",
        "level": "Pregrado",
        "monthlyHours": 32
      },
      {
        "id": "humanidades-21-esp-3",
        "name": "CULTURA TEOLOGICA - INTEAMB",
        "level": "Pregrado",
        "monthlyHours": 32
      }
    ],
    "allocations": {
      "10336": {
        "code": "10336",
        "hours": 32,
        "version1Hours": 32
      },
      "40117": {
        "code": "40117",
        "hours": 8,
        "version1Hours": 8
      }
    },
    "version1Total": 160
  },
  {
    "id": "cilce-1",
    "unitId": "cilce",
    "documentId": "7179815",
    "fullName": "JOSE MIGUEL FAGUA CONTRERAS",
    "dedication": "DIRECTIVO",
    "expectedWorkload": 210,
    "rank": "Director(a) de Unidad Académica",
    "education": "Licenciado(a) en Lenguas Extranjeras · Magíster en Didáctica de las Lenguas",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "cilce-1-esp-1",
        "name": "INGLES II - CIV",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "30222": {
        "code": "30222",
        "hours": 190,
        "version1Hours": 190
      }
    },
    "version1Total": 210
  },
  {
    "id": "cilce-2",
    "unitId": "cilce",
    "documentId": "1013600610",
    "fullName": "BREYNNER DANIEL CRUZ CAPADOR",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Lenguas Extranjeras · Magíster en Didáctica de las Lenguas",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "cilce-2-esp-1",
        "name": "INGLES I - CULDIS",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-2-esp-2",
        "name": "INGLES I - INTE",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-2-esp-3",
        "name": "INGLES II - BIOINTEA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-2-esp-4",
        "name": "INGLES III - INDUA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-2-esp-5",
        "name": "INGLES V - ARQ5A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-2-esp-6",
        "name": "INGLES VI - ELEC",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "30411": {
        "code": "30411",
        "hours": 16,
        "version1Hours": 16
      },
      "40123": {
        "code": "40123",
        "hours": 24,
        "version1Hours": 24
      }
    },
    "version1Total": 160
  },
  {
    "id": "cilce-3",
    "unitId": "cilce",
    "documentId": "1049612657",
    "fullName": "DAVID ESTEBAN AGUIRRE GOMEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) en Lenguas Extranjeras · Magíster en Didáctica de las Lenguas",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "cilce-3-esp-1",
        "name": "INGLES I - DER1A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-3-esp-2",
        "name": "INGLES II - ADMCONT",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-3-esp-3",
        "name": "INGLES III - DER3B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-3-esp-4",
        "name": "INGLES III - NEG",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-3-esp-5",
        "name": "INGLES IV - NEGB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-3-esp-6",
        "name": "INGLES V - ADMCONT",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-3-esp-7",
        "name": "INGLES VI - ADMD",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "40106": {
        "code": "40106",
        "hours": 16,
        "version1Hours": 16
      },
      "40123": {
        "code": "40123",
        "hours": 24,
        "version1Hours": 24
      }
    },
    "version1Total": 160
  },
  {
    "id": "cilce-4",
    "unitId": "cilce",
    "documentId": "1052395332",
    "fullName": "FLOR ANGELA HURTADO TORRES",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Lenguas Extranjeras · Magíster en Didáctica de las Lenguas",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "cilce-4-esp-1",
        "name": "INGLES II - BIOINTEB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-4-esp-2",
        "name": "INGLES III - BIO",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-4-esp-3",
        "name": "INGLES III - ELMEC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-4-esp-4",
        "name": "INGLES IV - ARQA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-4-esp-5",
        "name": "INGLES V - CULDISA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-4-esp-6",
        "name": "INGLES V - ELMEC",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "40109": {
        "code": "40109",
        "hours": 8,
        "version1Hours": 8
      },
      "40123": {
        "code": "40123",
        "hours": 32,
        "version1Hours": 32
      }
    },
    "version1Total": 160
  },
  {
    "id": "cilce-5",
    "unitId": "cilce",
    "documentId": "1049624683",
    "fullName": "HEIDY CATALINA BAUTISTA RODRIGUEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Lenguas Extranjeras · Magíster en Didáctica de las Lenguas",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "cilce-5-esp-1",
        "name": "IDIOMA EXTRANJERO VI - DER6B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-5-esp-2",
        "name": "INGLES II - DEREA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-5-esp-3",
        "name": "INGLES II - MRDGD",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-5-esp-4",
        "name": "INGLES III - MARK",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-5-esp-5",
        "name": "INGLES V - NEGB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-5-esp-6",
        "name": "INGLES VI - NEG",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "40123": {
        "code": "40123",
        "hours": 20,
        "version1Hours": 20
      },
      "40127": {
        "code": "40127",
        "hours": 20,
        "version1Hours": 20
      }
    },
    "version1Total": 160
  },
  {
    "id": "cilce-6",
    "unitId": "cilce",
    "documentId": "1052381111",
    "fullName": "HENRY ERNESTO GONZALEZ RUIZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Lenguas Extranjeras · Magíster en Didáctica de las Lenguas",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "cilce-6-esp-1",
        "name": "INGLES I - ARQA1",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-6-esp-2",
        "name": "INGLES II - ARQ",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-6-esp-3",
        "name": "INGLES II - SIST",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-6-esp-4",
        "name": "INGLES III - CULDIS",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-6-esp-5",
        "name": "INGLES IV - CIV",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-6-esp-6",
        "name": "INGLES I - DER1B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-6-esp-7",
        "name": "INGLES III - ADMCONT",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "40123": {
        "code": "40123",
        "hours": 20,
        "version1Hours": 20
      },
      "40127": {
        "code": "40127",
        "hours": 20,
        "version1Hours": 20
      }
    },
    "version1Total": 160
  },
  {
    "id": "cilce-7",
    "unitId": "cilce",
    "documentId": "1016008729",
    "fullName": "JAVIER VIVAS DIONICIO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) en Lenguas Extranjeras · Magíster en Didáctica de las Lenguas",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "cilce-7-esp-1",
        "name": "IDIOMA EXTRANJERO LEGAL I - DEREB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-7-esp-2",
        "name": "INGLES II - INDU",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-7-esp-3",
        "name": "INGLES III - SIST",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-7-esp-4",
        "name": "INGLES V - ARQ5B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-7-esp-5",
        "name": "INGLES IV - DER4B",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-7-esp-6",
        "name": "INGLES IV - MARK",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "40123": {
        "code": "40123",
        "hours": 40,
        "version1Hours": 40
      }
    },
    "version1Total": 160
  },
  {
    "id": "cilce-8",
    "unitId": "cilce",
    "documentId": "1049629005",
    "fullName": "JHON JAIRO RUIZ SANCHEZ",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Lenguas Extranjeras · Magíster en Didáctica de las Lenguas",
    "isProvisional": false,
    "seniorityYears": 4,
    "academicSpaces": [
      {
        "id": "cilce-8-esp-1",
        "name": "INGLES IV - ELMEC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-8-esp-2",
        "name": "INGLES V - INDU",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-8-esp-3",
        "name": "INGLES VI - CULDISA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-8-esp-4",
        "name": "INGLES VI - SIST",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-8-esp-5",
        "name": "IDIOMA EXTRANJERO VI - DER6A",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-8-esp-6",
        "name": "INGLES II - NEG",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "40123": {
        "code": "40123",
        "hours": 40,
        "version1Hours": 40
      }
    },
    "version1Total": 160
  },
  {
    "id": "cilce-9",
    "unitId": "cilce",
    "documentId": "1055332691",
    "fullName": "LEIDY GIRLEZA CANO GARCIA",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Lenguas Extranjeras · Magíster en Didáctica de las Lenguas",
    "isProvisional": false,
    "seniorityYears": 5,
    "academicSpaces": [
      {
        "id": "cilce-9-esp-1",
        "name": "IDIOMA EXTRANJERO LEGAL II - DERA",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-9-esp-2",
        "name": "INGLES IV - ARQB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-9-esp-3",
        "name": "INGLES I - MARK",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-9-esp-4",
        "name": "INGLES II - DER2B",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-9-esp-5",
        "name": "INGLES III - DER3A",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-9-esp-6",
        "name": "INGLES IV - DEREA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-9-esp-7",
        "name": "INGLES V - DERA",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "40123": {
        "code": "40123",
        "hours": 40,
        "version1Hours": 40
      }
    },
    "version1Total": 160
  },
  {
    "id": "cilce-10",
    "unitId": "cilce",
    "documentId": "33378603",
    "fullName": "MARIEN MONROY FAJARDO",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Lenguas Extranjeras · Magíster en Didáctica de las Lenguas",
    "isProvisional": false,
    "seniorityYears": 6,
    "academicSpaces": [
      {
        "id": "cilce-10-esp-1",
        "name": "INGLES I - ELMEC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-10-esp-2",
        "name": "INGLES I - INDU",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-10-esp-3",
        "name": "INGLES III - AMBI",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-10-esp-4",
        "name": "INGLES IV - INDUAMBIA",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-10-esp-5",
        "name": "INGLES VI - ARQ",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-10-esp-6",
        "name": "INGLES VI - CULDISB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-10-esp-7",
        "name": "INGLES I - ADMCONT",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "40123": {
        "code": "40123",
        "hours": 40,
        "version1Hours": 40
      }
    },
    "version1Total": 160
  },
  {
    "id": "cilce-11",
    "unitId": "cilce",
    "documentId": "79970106",
    "fullName": "NELSON D´OLIVARES DURAN OLIVARES",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 1 (Auxiliar)",
    "education": "Licenciado(a) en Lenguas Extranjeras · Magíster en Didáctica de las Lenguas",
    "isProvisional": false,
    "seniorityYears": 7,
    "academicSpaces": [
      {
        "id": "cilce-11-esp-1",
        "name": "INGLES II - CULDIS",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-11-esp-2",
        "name": "INGLES III - INDUB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-11-esp-3",
        "name": "INGLES V - BIODATOS",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-11-esp-4",
        "name": "INGLES I - NEG1",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-11-esp-5",
        "name": "INGLES IV - ADMCONT",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-11-esp-6",
        "name": "INGLES VI - ADMCONTN",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "40123": {
        "code": "40123",
        "hours": 40,
        "version1Hours": 40
      }
    },
    "version1Total": 160
  },
  {
    "id": "cilce-12",
    "unitId": "cilce",
    "documentId": "7267821",
    "fullName": "PALOMA ALINE LOPES VILLAS BOAS",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 3 (Asociado)",
    "education": "Licenciado(a) en Lenguas Extranjeras · Magíster en Didáctica de las Lenguas",
    "isProvisional": false,
    "seniorityYears": 8,
    "academicSpaces": [
      {
        "id": "cilce-12-esp-1",
        "name": "INGLES I - BIOING",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-12-esp-2",
        "name": "INGLES I - SIST",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-12-esp-3",
        "name": "INGLES III - ARQ",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-12-esp-4",
        "name": "INGLES IV - BIODATOS",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-12-esp-5",
        "name": "INGLES IV - CULDIS",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-12-esp-6",
        "name": "INGLES IV - NEGA",
        "level": "Pregrado",
        "monthlyHours": 16
      }
    ],
    "allocations": {
      "40123": {
        "code": "40123",
        "hours": 40,
        "version1Hours": 40
      }
    },
    "version1Total": 160
  },
  {
    "id": "cilce-13",
    "unitId": "cilce",
    "documentId": "1052386169",
    "fullName": "YENNY PAOLA NIÑO TORRES",
    "dedication": "TC",
    "expectedWorkload": 160,
    "rank": "Categoría 2 (Asistente)",
    "education": "Licenciado(a) en Lenguas Extranjeras · Magíster en Didáctica de las Lenguas",
    "isProvisional": false,
    "seniorityYears": 3,
    "academicSpaces": [
      {
        "id": "cilce-13-esp-1",
        "name": "INGLES II - ELMEC",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-13-esp-2",
        "name": "INGLES III - CIV",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-13-esp-3",
        "name": "INGLES IV - INDUAMBB",
        "level": "Pregrado",
        "monthlyHours": 16
      },
      {
        "id": "cilce-13-esp-4",
        "name": "INGLES IV - SIST",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-13-esp-5",
        "name": "INGLES V - CULDISB",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-13-esp-6",
        "name": "INGLES V - SIST",
        "level": "Pregrado",
        "monthlyHours": 12
      },
      {
        "id": "cilce-13-esp-7",
        "name": "INGLES VI - INDU",
        "level": "Pregrado",
        "monthlyHours": 12
      }
    ],
    "allocations": {
      "40123": {
        "code": "40123",
        "hours": 40,
        "version1Hours": 40
      }
    },
    "version1Total": 160
  }
];

export const APPROVAL_REQUESTS_ANNEX3_SEED: ApprovalRequestAnnex3[] = [
  {
    "id": "aval-1",
    "period": "2026-2",
    "unitId": "ing-industrial",
    "unitName": "Ingeniería Industrial",
    "teacherId": "ind-7",
    "teacherName": "QUINTERO NAVARRO GEIDER",
    "teacherDocumentId": "19619292",
    "code": "10212",
    "codeName": "DIRECCIÓN Y/O ASESORÍA EN OPCIONES DE GRADO DE ORDEN INVESTIGATIVO",
    "requestedHours": 16,
    "formatType": "10212",
    "programName": "Ingeniería Industrial",
    "projectDetails": [
      {
        "title": "Optimización estocástica de rutas de última milla en Boyacá",
        "projectType": "Proyecto de Investigación",
        "studentsOrCourse": "Laura Gómez, Mateo Rincón",
        "committeeApprovalMinute": "Acta Comité Curricular N° 014 - 12/06/2026",
        "hours": 4
      },
      {
        "title": "Simulación discreta de tiempos de espera en urgencias hospitalarias",
        "projectType": "Monografía Investigativa",
        "studentsOrCourse": "Camilo Torres",
        "committeeApprovalMinute": "Acta Comité Curricular N° 014 - 12/06/2026",
        "hours": 4
      },
      {
        "title": "Modelo Lean Six Sigma en plantas procesadoras de lácteos",
        "projectType": "Proyecto de Investigación",
        "studentsOrCourse": "Valentina Rojas, Sebastián Díaz",
        "committeeApprovalMinute": "Acta Comité Curricular N° 015 - 18/06/2026",
        "hours": 4
      },
      {
        "title": "Análisis ergonómico predictivo mediante visión artificial",
        "projectType": "Producto de Innovación",
        "studentsOrCourse": "Andrés Felipe Castro",
        "committeeApprovalMinute": "Acta Comité Curricular N° 015 - 18/06/2026",
        "hours": 4
      }
    ],
    "attachmentUrl": "Acta_Comite_Curricular_Industrial_014_015.pdf",
    "status": "Pendiente",
    "requestedAt": "2026-07-07 15:20"
  },
  {
    "id": "aval-2",
    "period": "2026-2",
    "unitId": "ing-industrial",
    "unitName": "Ingeniería Industrial",
    "teacherId": "ind-3",
    "teacherName": "TRUJILLO MANRIQUE JAIME",
    "teacherDocumentId": "74182244",
    "code": "20223",
    "codeName": "DIRECCIÓN Y/O ASESORÍA EN OPCIONES DE GRADO DE ORDEN SOCIAL / EMPRESARIAL",
    "requestedHours": 16,
    "formatType": "20223_20120",
    "programName": "Ingeniería Industrial",
    "projectDetails": [
      {
        "title": "Acompañamiento técnico en productividad a 8 MiPymes de la provincia Centro (8 proyectos × 2h)",
        "projectType": "Proyección Social / Consultoría Empresarial",
        "studentsOrCourse": "16 estudiantes de 8° y 9° semestre",
        "committeeApprovalMinute": "Acta Comité Curricular N° 014 - 12/06/2026",
        "hours": 16
      }
    ],
    "attachmentUrl": "Relacion_Pasantias_Empresariales_2026_2.pdf",
    "status": "Avalado",
    "requestedAt": "2026-07-06 10:15",
    "decidedBy": "Fr. Wilmar Yesid Ruiz Cortés, O.P. (Vicerrector Académico)",
    "decidedAt": "2026-07-07 09:40"
  },
  {
    "id": "aval-3",
    "period": "2026-2",
    "unitId": "ing-mecanica",
    "unitName": "Ingeniería Mecánica",
    "teacherId": "mec-3",
    "teacherName": "LUIS FERNANDO ACOSTA JOYA",
    "teacherDocumentId": "7163979",
    "code": "40222",
    "codeName": "DISEÑO DE CURSOS E-LEARNING",
    "requestedHours": 7,
    "formatType": "40222",
    "programName": "Especialización en Gerencia de Mantenimiento y Gestión de Activos",
    "projectDetails": [
      {
        "title": "Virtualización del módulo: Confiabilidad y Mantenimiento Predictivo (2 créditos)",
        "projectType": "Producción de Aula Virtual Posgrado",
        "studentsOrCourse": "Módulo de 32 horas - Cohorte 2026-2",
        "committeeApprovalMinute": "Aval Dirección Campus Virtual CV-2026-089",
        "hours": 7
      }
    ],
    "attachmentUrl": "Aval_Campus_Virtual_Mantenimiento.pdf",
    "status": "Con Observaciones",
    "viceRectorNote": "El mínimo del código 40222 en el ANEXO 4 es de 8 horas/mes. Ajustar de 7 h a 8 h en la prenómina.",
    "requestedAt": "2026-07-06 16:00",
    "decidedBy": "Sandra Lizeth Parra Cruz (Pre-revisión E&A)",
    "decidedAt": "2026-07-07 14:10"
  },
  {
    "id": "aval-4",
    "period": "2026-2",
    "unitId": "ing-mecanica",
    "unitName": "Ingeniería Mecánica",
    "teacherId": "mec-7",
    "teacherName": "FABIAN LEONARDO HIGUERA SANCHEZ",
    "teacherDocumentId": "7225532",
    "code": "43401",
    "codeName": "DOCENTE DE TUTORÍA ESPECIALIZADA",
    "requestedHours": 11,
    "formatType": "43401",
    "programName": "Ingeniería Mecánica",
    "projectDetails": [
      {
        "title": "Tutoría especializada en Ciencias Básicas de Ingeniería (Estática, Dinámica y Mecánica de Fluidos)",
        "projectType": "Tutoría Disciplinar",
        "studentsOrCourse": "Área de Mecánica Aplicada",
        "committeeApprovalMinute": "Solicitud Decanatura Mecánica",
        "hours": 11
      }
    ],
    "attachmentUrl": "Plan_Tutoria_Mecanica_2026_2.pdf",
    "status": "Pendiente",
    "requestedAt": "2026-07-07 11:00"
  }
];

export const RESEARCH_ALLOCATIONS_ANNEX7_SEED: ResearchAllocationAnnex7[] = [
  {
    "id": "inv-1",
    "period": "2026-2",
    "unitId": "ing-industrial",
    "unitName": "Ingeniería Industrial",
    "documentId": "1020396093",
    "teacherName": "MEDINA JARAMILLO CAROLINA",
    "code": "10336",
    "activityName": "Desarrollo de Proyectos de Investigación (FODEIN + Externo)",
    "projectOrGroup": "Biopolímeros activos a partir de subproductos agroindustriales en Boyacá",
    "role": "Investigadora Principal",
    "sicddiLevel": null,
    "weeklyHours": 9,
    "monthlyHours": 36,
    "isSicddiLocked": false,
    "notes": "Aprobado por convocatoria FODEIN 2026."
  },
  {
    "id": "inv-2",
    "period": "2026-2",
    "unitId": "ing-industrial",
    "unitName": "Ingeniería Industrial",
    "documentId": "1020396093",
    "teacherName": "MEDINA JARAMILLO CAROLINA",
    "code": "10384",
    "activityName": "Docente Coordinador de Investigación de Facultad",
    "projectOrGroup": "Coordinación de Investigación - Ingeniería Industrial",
    "role": "Coordinadora Facultad",
    "sicddiLevel": null,
    "weeklyHours": 4,
    "monthlyHours": 16,
    "isSicddiLocked": false
  },
  {
    "id": "inv-3",
    "period": "2026-2",
    "unitId": "ing-industrial",
    "unitName": "Ingeniería Industrial",
    "documentId": "1002697950",
    "teacherName": "MARLY YASMIN HASTAMORIR DUARTE",
    "code": "10336",
    "activityName": "Desarrollo de Proyectos de Investigación",
    "projectOrGroup": "Modelo logístico humanitario y abastecimiento regional",
    "role": "Investigadora Principal",
    "sicddiLevel": null,
    "weeklyHours": 8,
    "monthlyHours": 32,
    "isSicddiLocked": false,
    "notes": "En v1 tenía 64h; verificado con ANEXO 7 corresponden 32h/mes."
  },
  {
    "id": "inv-4",
    "period": "2026-2",
    "unitId": "ing-mecanica",
    "unitName": "Ingeniería Mecánica",
    "documentId": "1032362640",
    "teacherName": "CARLOS ANDRES AGUIRRE RODRIGUEZ",
    "code": "10226",
    "activityName": "Docente Investigador Escalafonado SICDDI",
    "projectOrGroup": "Grupo GIMUP - Categoría A1 Minciencias",
    "role": "Investigador SICDDI Nivel II",
    "sicddiLevel": "Nivel II (80h)",
    "weeklyHours": 20,
    "monthlyHours": 80,
    "isSicddiLocked": true,
    "notes": "Acuerdo 3 del 19/03/2025: Horas fijas no editables por el decano."
  },
  {
    "id": "inv-5",
    "period": "2026-2",
    "unitId": "ing-mecanica",
    "unitName": "Ingeniería Mecánica",
    "documentId": "6775059",
    "teacherName": "JUAN RODRIGO SALAMANCA SARMIENTO",
    "code": "10226",
    "activityName": "Docente Investigador Escalafonado SICDDI",
    "projectOrGroup": "Grupo GIMUP - Categoría A1 Minciencias",
    "role": "Investigador SICDDI Nivel II",
    "sicddiLevel": "Nivel II (80h)",
    "weeklyHours": 20,
    "monthlyHours": 80,
    "isSicddiLocked": true,
    "notes": "Acuerdo 3 del 19/03/2025: Horas fijas no editables por el decano."
  }
];

export const INITIAL_AUDIT_LOGS_SEED: AuditLogEntry[] = [
  {
    "id": "b-1",
    "timestamp": "2026-07-08 16:40",
    "user": "Sandra Lizeth Parra Cruz",
    "role": "Directora de Enseñanza y Aprendizaje",
    "unitName": "Ingeniería Industrial",
    "teacherName": "QUINTERO NAVARRO GEIDER",
    "action": "Ajuste en jornada de revisión (v1 → v2)",
    "previousValue": "Total: 197 h (40104: 116 h, 30420: 16 h)",
    "newValue": "Total: 160 h (40104: 92 h, 30420: 8 h)",
    "reason": "Superaba la carga mensual de 160 h y el tope máximo de 8 h en Internacionalización (30420)."
  },
  {
    "id": "b-2",
    "timestamp": "2026-07-08 16:25",
    "user": "Sandra Lizeth Parra Cruz",
    "role": "Directora de Enseñanza y Aprendizaje",
    "unitName": "Ingeniería Industrial",
    "teacherName": "AGUILAR TOVAR CRISTIAN ALEJANDRO",
    "action": "Ajuste directo de PSE y CTeI (v1 → v2)",
    "previousValue": "Total: 178 h (PSE: 18 h, 10364: 16 h)",
    "newValue": "Total: 160 h (PSE: 16 h, 10364: 0 h)",
    "reason": "Ajuste autorizado por la Directora para cuadrar las 160 h del docente."
  },
  {
    "id": "b-3",
    "timestamp": "2026-07-07 09:40",
    "user": "Fr. Wilmar Yesid Ruiz Cortés, O.P.",
    "role": "Vicerrector Académico",
    "unitName": "Ingeniería Industrial",
    "teacherName": "TRUJILLO MANRIQUE JAIME",
    "action": "Pre-aval aprobado de código especial 20223",
    "previousValue": "Pendiente de aval (16 h)",
    "newValue": "Avalado (16 h - 8 proyectos empresariales)",
    "reason": "Cumple con aval del Comité Curricular Acta N° 014."
  }
];

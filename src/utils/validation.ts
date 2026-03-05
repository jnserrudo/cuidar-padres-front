const ubicaciones = [
  "Vicente López",
  "Olivos",
  "La Lucila",
  "San Isidro",
  "Acassuso",
  "Beccar",
  "Martínez",
  "Boulogne",
  "San Fernando",
  "Victoria",
  "Tigre",
  "General Pacheco",
  "El Talar",
  "Don Torcuato",
  "Rincón de Milberg",
  "Benavídez",
  "Troncos del Talar",
  "Nordelta",
  "Escobar",
  "Ingeniero Maschwitz",
  "Garín",
  "Pilar",
  "Belgrano",
  "Caballito",
  "Colegiales",
  "Coghlan",
  "Palermo",
  "Montserrat",
  "Nuñez",
  "Puerto Madero",
  "Recoleta",
  "San Nicolás",
  "Retiro",
  "Villa Crespo",
] as const;

export const provincias = ubicaciones;
export const zonasPersonaCuidada = ubicaciones;

export const necesidadesOptions = [
  { value: "contencion_emocional", label: "Contención emocional" },
  { value: "cuidadoras", label: "Cuidadoras" },
  { value: "cud_y_obras_sociales", label: "CUD y obras sociales" },
  { value: "residencias", label: "Residencias y centros de día" },
  { value: "medicos_especialidades", label: "Médicos y especialidades" },
  { value: "temas_generales", label: "Temas generales de cuidado" },
  {
    value: "mercado_de_cuidado",
    label: "Mercado artículos de cuidado (costos, pagos)",
  },
] as const;

export type Necesidad = (typeof necesidadesOptions)[number]["value"];

export type ApplicationInput = {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  provincia: string;
  zona_persona_cuidada: string;
  ofrece_servicios: string;
  tipo_servicio: string;
  necesidades: Necesidad[];
  motivacion: string;
  acepta_normas: boolean;
  sugerencias: string;
};

type RawApplicationPayload = Record<string, unknown>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const provinciasSet = new Set<string>(provincias);
const zonasSet = new Set<string>(zonasPersonaCuidada);
const necesidadesSet = new Set<string>(
  necesidadesOptions.map((item) => item.value)
);

const trimString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const asStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
    : [];

const asBoolean = (value: unknown) =>
  value === true || value === "true" || value === "on" || value === "1";

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const normalizePhone = (value: string) => value.replace(/\D/g, "");

export const normalizeDni = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const cleaned = trimmed.replace(/[.\s-]/g, "");
  return cleaned.replace(/\D/g, "");
};

type DniCheckResult = {
  normalized: string;
  isMissing: boolean;
  isValid: boolean;
};

export const evaluateDni = (value: string): DniCheckResult => {
  const normalized = normalizeDni(value);
  if (!normalized) {
    return { normalized: "", isMissing: true, isValid: true };
  }

  if (normalized.length < 6 || normalized.length > 9) {
    return { normalized, isMissing: false, isValid: false };
  }

  if (/^(\d)\1+$/.test(normalized)) {
    return { normalized, isMissing: false, isValid: false };
  }

  return { normalized, isMissing: false, isValid: true };
};

export function normalizeApplicationInput(payload: unknown) {
  const raw = (payload ?? {}) as RawApplicationPayload;

  const data: ApplicationInput = {
    nombre: trimString(raw.nombre),
    apellido: trimString(raw.apellido),
    dni: normalizeDni(trimString(raw.dni)),
    email: normalizeEmail(trimString(raw.email)),
    telefono: trimString(raw.telefono),
    provincia: trimString(raw.provincia),
    zona_persona_cuidada: trimString(raw.zona_persona_cuidada),
    ofrece_servicios: trimString(raw.ofrece_servicios),
    tipo_servicio: trimString(raw.tipo_servicio),
    necesidades: asStringArray(raw.necesidades) as Necesidad[],
    motivacion: trimString(raw.motivacion),
    acepta_normas: asBoolean(raw.acepta_normas),
    sugerencias: trimString(raw.sugerencias),
  };

  return {
    data,
    honeypot: trimString(raw.apodo),
    clientSubmissionId: trimString(raw.clientSubmissionId),
  };
}

export const isValidUuid = (value: string) => uuidRegex.test(value);

export function validateApplicationInput(data: ApplicationInput) {
  const errors: Partial<Record<keyof ApplicationInput, string>> = {};

  if (!data.nombre) {
    errors.nombre = "Contanos tu nombre.";
  }

  if (!data.apellido) {
    errors.apellido = "Contanos tu apellido.";
  }

  if (!data.dni) {
    errors.dni = "Ingresá tu DNI.";
  }

  // DNI format issues are handled as risk flags to avoid false rejections.

  const normalizedEmail = normalizeEmail(data.email);
  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    errors.email = "Ingresá un email válido.";
  }

  const phoneDigits = normalizePhone(data.telefono);
  if (!data.telefono || phoneDigits.length < 8) {
    errors.telefono = "Ingresá un teléfono válido con código de área.";
  }

  if (!data.provincia || !provinciasSet.has(data.provincia)) {
    errors.provincia = "Seleccioná la zona en la que vivís.";
  }

  if (!data.zona_persona_cuidada || !zonasSet.has(data.zona_persona_cuidada)) {
    errors.zona_persona_cuidada = "Seleccioná la zona de la persona cuidada.";
  }

  const ofreceServicios = data.ofrece_servicios.trim().toLowerCase();
  if (!ofreceServicios || !["si", "no"].includes(ofreceServicios)) {
    errors.ofrece_servicios = "Seleccioná si ofrecés servicios.";
  }

  if (ofreceServicios === "si" && data.tipo_servicio.trim().length < 3) {
    errors.tipo_servicio = "Contanos el tipo de servicio o institución.";
  }

  if (!data.necesidades.length) {
    errors.necesidades = "Elegí al menos una necesidad.";
  } else if (!data.necesidades.every((item) => necesidadesSet.has(item))) {
    errors.necesidades = "Seleccioná necesidades válidas.";
  }

  if (!data.motivacion || data.motivacion.length < 15) {
    errors.motivacion = "Contanos un poco más (mínimo 15 caracteres).";
  }

  if (!data.acepta_normas) {
    errors.acepta_normas = "Tenés que aceptar las normas.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

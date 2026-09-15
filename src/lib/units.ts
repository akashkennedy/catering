export const UNITS = ["gm", "kg", "litre", "piece"] as const;

export type Unit = (typeof UNITS)[number];

const UNIT_ALIASES: Record<string, Unit> = {
  g: "gm",
  gr: "gm",
  gm: "gm",
  gram: "gm",
  grams: "gm",
  kg: "kg",
  kgs: "kg",
  kilo: "kg",
  kilos: "kg",
  kilogram: "kg",
  kilograms: "kg",
  l: "litre",
  lt: "litre",
  ltr: "litre",
  ltrs: "litre",
  litre: "litre",
  litres: "litre",
  liter: "litre",
  liters: "litre",
  pc: "piece",
  pcs: "piece",
  piece: "piece",
  pieces: "piece",
  no: "piece",
  nos: "piece",
  number: "piece",
  numbers: "piece",
  item: "piece",
  items: "piece",
  unit: "piece",
  units: "piece",
};

export function normalizeUnit(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim().toLowerCase();
  return UNIT_ALIASES[trimmed] ?? trimmed;
}
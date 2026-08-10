export interface StageDef {
  id: string;
  start: number;
  rise: number;
  fall: number;
  gone: number;
}

const smooth = (x: number) => x * x * (3 - 2 * x);

export function ramp(p: number, s: StageDef): number {
  if (p <= s.start) return 0;
  const a = Math.min(1, (p - s.start) / (s.rise - s.start));
  const b = p <= s.fall ? 1 : Math.max(0, 1 - (p - s.fall) / (s.gone - s.fall));
  return smooth(Math.min(a, b));
}

export const CTA_STAGE: StageDef = { id: "cta", start: 0.975, rise: 1.005, fall: 1.1, gone: 1.2 };

export const STAGES: StageDef[] = [
  { id: "somewhere", start: 0.045, rise: 0.075, fall: 0.105, gone: 0.135 },
  { id: "places", start: 0.135, rise: 0.165, fall: 0.2, gone: 0.225 },
  { id: "notBecause", start: 0.195, rise: 0.225, fall: 0.26, gone: 0.285 },
  { id: "becauseWeWere", start: 0.28, rise: 0.31, fall: 0.35, gone: 0.38 },
  { id: "juniorHigh", start: 0.375, rise: 0.41, fall: 0.48, gone: 0.51 },
  { id: "neverLeave", start: 0.415, rise: 0.445, fall: 0.49, gone: 0.52 },
  { id: "makingMemories", start: 0.5, rise: 0.535, fall: 0.585, gone: 0.615 },
  { id: "livingThem", start: 0.545, rise: 0.575, fall: 0.6, gone: 0.63 },
  { id: "classrooms", start: 0.63, rise: 0.655, fall: 0.79, gone: 0.82 },
  { id: "laughter", start: 0.655, rise: 0.68, fall: 0.79, gone: 0.82 },
  { id: "people", start: 0.68, rise: 0.705, fall: 0.79, gone: 0.82 },
  { id: "ordinaryDays", start: 0.705, rise: 0.73, fall: 0.79, gone: 0.82 },
  { id: "feltOrdinary", start: 0.73, rise: 0.755, fall: 0.83, gone: 0.855 },
  { id: "becameMemories", start: 0.8, rise: 0.845, fall: 0.9, gone: 0.92 },
  { id: "somehow", start: 0.86, rise: 0.89, fall: 0.925, gone: 0.945 },
  { id: "wantToGoBack", start: 0.915, rise: 0.945, fall: 0.985, gone: 1.005 },
  { id: "oneMoreTime", start: 0.955, rise: 0.985, fall: 1.1, gone: 1.2 },
];

export function frameFromProgress(p: number, total = 151): number {
  const t = Math.min(1, p / 0.92);
  const e = -(Math.cos(Math.PI * t) - 1) / 2;
  return Math.round(e * (total - 1));
}

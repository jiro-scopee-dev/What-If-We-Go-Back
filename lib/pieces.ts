export const PIECE_COUNT = 192;

const pad = (n: number) => String(n).padStart(3, "0");

export const PIECE_THUMBS = Array.from({ length: PIECE_COUNT }, (_, i) => `/image/thumbs/piece-${pad(i + 1)}.webp`);
export const PIECE_LARGE = Array.from({ length: PIECE_COUNT }, (_, i) => `/image/large/piece-${pad(i + 1)}.webp`);

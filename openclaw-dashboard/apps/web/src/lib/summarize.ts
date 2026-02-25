export const compactNum = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : `${n}`;

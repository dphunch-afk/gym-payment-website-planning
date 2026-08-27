export function parseOptionalKg(raw: FormDataEntryValue | null) {
  const text = String(raw || '').trim();
  if (!text) return null;
  const value = Number(text);
  if (!Number.isFinite(value) || value <= 0 || value > 500) return null;
  return Math.round(value * 1000);
}

export function parseOptionalCm(raw: FormDataEntryValue | null) {
  const text = String(raw || '').trim();
  if (!text) return null;
  const value = Number(text);
  if (!Number.isFinite(value) || value <= 0 || value > 400) return null;
  return Math.round(value * 10);
}

export function formatWeight(grams?: number | null) {
  if (!grams) return '—';
  return `${(grams / 1000).toFixed(1)} kg`;
}

export function formatCm(mm?: number | null) {
  if (!mm) return '—';
  return `${(mm / 10).toFixed(1)} cm`;
}

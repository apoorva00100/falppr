export function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function isUsefulContent(value) {
  const text = normalizeWhitespace(value);
  return text.length >= 3 && /[a-z0-9]/i.test(text);
}

export function asIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function firstPresent(row, names) {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== null && String(row[name]).trim() !== "") {
      return row[name];
    }
  }
  return "";
}

export function stableId(parts) {
  return parts.filter(Boolean).map((part) => String(part).trim()).join(":");
}

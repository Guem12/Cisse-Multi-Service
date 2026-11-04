export function makeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueSlug(base, existing) {
  let slug = makeSlug(base);
  let i = 2;
  const set = new Set((existing || []).map((s) => s.toLowerCase()));
  while (set.has(slug)) {
    slug = `${makeSlug(base)}-${i}`;
    i++;
  }
  return slug;
}

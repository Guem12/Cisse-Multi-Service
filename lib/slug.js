export const slugify = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function uniqueSlug(Model, name) {
  const base = slugify(name) || "article";
  let slug = base;
  let n = 1;
  while (await Model.exists({ slug })) slug = `${base}-${++n}`;
  return slug;
}

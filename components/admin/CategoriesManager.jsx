
import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@/lib/astro-compat";
import { useConfirm } from "./ConfirmDialog";

function CategoryRow({ category, onDone, onError }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [active, setActive] = useState(category.active !== false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { confirm, dialog } = useConfirm();
  const currentImage = category.images?.[0]?.url || "";
  const [previewUrl, setPreviewUrl] = useState(currentImage);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(currentImage);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [currentImage, imageFile]);

  async function call(method, body) {
    onError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${category._id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body && JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        onError(json.error || "Une erreur est survenue.");
      } else {
        setEditing(false);
        onDone();
      }
    } catch {
      onError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    onError("");
    setLoading(true);
    try {
      let images = category.images || [];
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadResponse = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const uploadResult = await uploadResponse.json().catch(() => ({}));
        if (!uploadResponse.ok) throw new Error(uploadResult.error || "Impossible d’envoyer la photo.");
        images = [uploadResult];
      }

      const response = await fetch(`/api/admin/categories/${category._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), active, images }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Impossible de modifier la catégorie.");
      setEditing(false);
      setImageFile(null);
      onDone();
    } catch (error) {
      onError(error.message || "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  function cancelEditing() {
    setEditing(false);
    setName(category.name);
    setActive(category.active !== false);
    setImageFile(null);
  }

  return (
    <div className="group flex flex-col gap-4 border-b p-3 transition-colors last:border-b-0 hover:bg-black/[0.015] sm:flex-row sm:items-center sm:px-4" style={{ borderColor: "var(--border)" }}>
      {dialog}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={category.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ color: "var(--text-faint)" }}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M3.75 6.75h6l1.5 1.5h9v9a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-8.5a2 2 0 0 1 2-2Z" />
              </svg>
            </div>
          )}
        </div>
        {editing ? (
          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[minmax(160px,1fr)_minmax(180px,0.8fr)_auto] sm:items-center">
            <input
              aria-label={`Nom de la catégorie ${category.name}`}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-ocre focus:ring-2 focus:ring-ocre/40"
              style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={loading}
              autoFocus
            />
            <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-semibold" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              <span className="truncate">{imageFile?.name || (currentImage ? "Changer la photo" : "Ajouter une photo")}</span>
              <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} disabled={loading} className="sr-only" />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} disabled={loading} className="h-4 w-4 accent-emerald-600" />
              En ligne
            </label>
          </div>
        ) : (
          <div className="min-w-0">
            <h3 className="font-bold text-indigo-deep truncate" style={{ color: "var(--text-main)" }}>{category.name}</h3>
            <p className="mt-1 truncate text-xs" style={{ color: "var(--text-muted)" }}>/{category.slug}</p>
            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${category.active === false ? "bg-gray-500/10 text-gray-600 dark:text-gray-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>
              {category.active === false ? "Masquée" : "En ligne"}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {editing ? (
          <>
            <button
              onClick={saveChanges}
              disabled={loading || !name.trim()}
              className="rounded-lg px-3 py-2 text-xs font-bold text-white transition hover:brightness-105 disabled:opacity-50"
              style={{ backgroundColor: "#15803d" }}
            >
              Enregistrer
            </button>
            <button
              onClick={cancelEditing}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg font-medium text-xs transition-all hover:scale-[1.02]"
              style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}
            >
              Annuler
            </button>
          </>
        ) : (
          <>
            <Link
              href={`/catalogue?categorie=${category.slug}`}
              target="_blank"
              className="rounded-lg border p-2.5 transition hover:bg-black/5"
              style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}
              title="Voir sur le site"
              aria-label={`Voir ${category.name} sur le site`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-black/5"
              style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}
            >
              Modifier
            </button>
            <button
              onClick={async () => {
                const ok = await confirm({
                  title: "Supprimer cette catégorie ?",
                  message: `La catégorie « ${category.name} » sera supprimée. Les produits qu'elle contient ne le seront pas.`,
                  confirmLabel: "Supprimer",
                  tone: "danger",
                });
                if (ok) call("DELETE");
              }}
              disabled={loading}
              className="rounded-lg border px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-950/30"
              style={{ borderColor: "var(--border)" }}
            >
              Supprimer
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CategoriesManager({ categories }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState([{ id: 1, name: "", file: null }]);
  const [nextDraftId, setNextDraftId] = useState(2);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const previewUrls = useRef(new Map());

  const done = () => router.refresh();

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current.clear();
  }, []);

  function updateDraft(id, values) {
    setDrafts((current) => current.map((draft) => draft.id === id ? { ...draft, ...values } : draft));
  }

  function updateDraftFile(id, file) {
    const previousUrl = previewUrls.current.get(id);
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    if (file) previewUrls.current.set(id, URL.createObjectURL(file));
    else previewUrls.current.delete(id);
    updateDraft(id, { file });
  }

  function addDraft() {
    setDrafts((current) => [...current, { id: nextDraftId, name: "", file: null }]);
    setNextDraftId((id) => id + 1);
  }

  function removeDraft(id) {
    const previewUrl = previewUrls.current.get(id);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrls.current.delete(id);
    setDrafts((current) => current.filter((draft) => draft.id !== id));
  }

  async function add(e) {
    e.preventDefault();
    const entries = drafts.filter((draft) => draft.name.trim());
    if (!entries.length) {
      setError("Saisissez le nom d’au moins une catégorie.");
      return;
    }
    if (drafts.some((draft) => !draft.name.trim() && draft.file)) {
      setError("Ajoutez un nom à chaque catégorie qui a une photo.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const newCategories = [];
      for (const draft of entries) {
        let images = [];
        if (draft.file) {
          const formData = new FormData();
          formData.append("file", draft.file);
          const uploadResponse = await fetch("/api/admin/upload", { method: "POST", body: formData });
          const uploadResult = await uploadResponse.json().catch(() => ({}));
          if (!uploadResponse.ok) throw new Error(uploadResult.error || `Photo de « ${draft.name.trim()} » non envoyée.`);
          images = [uploadResult];
        }
        newCategories.push({ name: draft.name.trim(), images });
      }

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: newCategories }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Impossible d'ajouter les catégories.");
      } else {
        previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
        previewUrls.current.clear();
        setDrafts([{ id: nextDraftId, name: "", file: null }]);
        setNextDraftId((id) => id + 1);
        done();
      }
    } catch (requestError) {
      setError(requestError.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  const filteredCategories = categories.filter((category) =>
    `${category.name} ${category.slug}`.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr")),
  );
  const illustratedCount = categories.filter((category) => category.images?.[0]?.url).length;

  return (
    <div className="space-y-6" style={{ color: "var(--text-main)" }}>
      <header className="flex flex-col gap-5 border-b pb-5 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: "var(--border)" }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ocre">Catalogue</p>
          <h1 className="mt-1 font-titre text-2xl font-extrabold sm:text-3xl">Catégories</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Gérez les rayons et leurs photos.</p>
        </div>
        <div className="flex gap-6 text-sm">
          <div><p className="font-titre text-xl font-extrabold">{categories.length}</p><p style={{ color: "var(--text-muted)" }}>catégories</p></div>
          <div><p className="font-titre text-xl font-extrabold">{illustratedCount}</p><p style={{ color: "var(--text-muted)" }}>avec photo</p></div>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}>
        <div className="border-b px-5 py-4 sm:px-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-titre text-lg font-bold">Ajouter des catégories</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Ajoutez une ou plusieurs catégories, avec une photo si nécessaire.</p>
        </div>

        <form onSubmit={add} className="space-y-4 p-4 sm:p-6">
          {drafts.map((draft, index) => {
            const previewUrl = previewUrls.current.get(draft.id);
            return (
              <div key={draft.id} className="grid gap-4 rounded-xl border p-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)_auto] sm:items-end" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}>
                <div>
                  <label htmlFor={`category-name-${draft.id}`} className="mb-1.5 block text-xs font-bold" style={{ color: "var(--text-muted)" }}>Nom · {index + 1}</label>
                  <input id={`category-name-${draft.id}`} className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:border-ocre focus:ring-2 focus:ring-ocre/30" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-main)" }} placeholder="Ex. Ceintures cuir" value={draft.name} onChange={(event) => updateDraft(draft.id, { name: event.target.value })} disabled={loading} />
                </div>
                <div>
                  <label htmlFor={`category-image-${draft.id}`} className="mb-1.5 block text-xs font-bold" style={{ color: "var(--text-muted)" }}>Photo facultative</label>
                  <div className="flex min-h-[46px] items-center gap-3 rounded-xl border px-2" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}>
                    {previewUrl && <img src={previewUrl} alt="Aperçu de la photo" className="h-8 w-8 shrink-0 rounded-lg object-cover" />}
                    <label htmlFor={`category-image-${draft.id}`} className="min-w-0 flex-1 cursor-pointer truncate px-2 py-2.5 text-xs font-semibold text-indigo hover:text-ocre">
                      {draft.file?.name || "Choisir une image"}
                    </label>
                    <input id={`category-image-${draft.id}`} type="file" accept="image/*" onChange={(event) => updateDraftFile(draft.id, event.target.files?.[0] || null)} disabled={loading} className="sr-only" />
                    {draft.file && <button type="button" onClick={() => updateDraftFile(draft.id, null)} disabled={loading} className="rounded-md px-2 py-1 text-xs font-bold text-page-muted hover:text-red-600" aria-label="Retirer la photo">×</button>}
                  </div>
                </div>
                {drafts.length > 1 && <button type="button" onClick={() => removeDraft(draft.id)} disabled={loading} className="min-h-10 rounded-lg border px-3 text-xs font-semibold text-page-muted hover:text-red-600 disabled:opacity-50" style={{ borderColor: "var(--border)" }}>Retirer</button>}
              </div>
            );
          })}

          {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>}

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--border)" }}>
            <button type="button" onClick={addDraft} disabled={loading || drafts.length >= 20} className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg px-2 py-2 text-sm font-bold text-indigo transition hover:bg-indigo/5 disabled:opacity-50">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m7-7H5" /></svg>
              Ajouter une ligne
            </button>
            <button disabled={loading || !drafts.some((draft) => draft.name.trim())} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-indigo-deep transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: "#E0A030" }}>
              {loading ? "Enregistrement…" : `Ajouter ${drafts.filter((draft) => draft.name.trim()).length} catégorie${drafts.filter((draft) => draft.name.trim()).length > 1 ? "s" : ""}`}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}>
        <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="font-titre text-lg font-bold">Toutes les catégories</h2>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{filteredCategories.length} résultat{filteredCategories.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-faint)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" strokeWidth="1.8" /><path d="m16 16 4 4" strokeWidth="1.8" strokeLinecap="round" /></svg>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une catégorie" className="min-h-10 w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none focus:border-ocre focus:ring-2 focus:ring-ocre/30" style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)", color: "var(--text-main)" }} aria-label="Rechercher une catégorie" />
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-semibold">{categories.length ? "Aucun résultat" : "Aucune catégorie pour le moment"}</p>
            {categories.length > 0 && <button type="button" onClick={() => setSearch("")} className="mt-2 text-sm font-semibold text-indigo hover:underline">Effacer la recherche</button>}
          </div>
        ) : (
          <div>
            {filteredCategories.map((category) => <CategoryRow key={category._id} category={category} onDone={done} onError={setError} />)}
          </div>
        )}
      </section>
    </div>
  );
}

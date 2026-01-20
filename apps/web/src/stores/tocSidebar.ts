import { atom } from "nanostores"

// Safety: if bundling ever duplicates modules across islands,
// stash the store on globalThis to guarantee a single instance.
const g = globalThis as any

export const tocCollapsed =
  g.__tocCollapsedStore ?? (g.__tocCollapsedStore = atom(false))

// Keep your existing "toc-toggled" HTML class as a *projection* of state
const syncDom = (collapsed: boolean) => {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("toc-toggled", collapsed)
}

if (typeof window !== "undefined") {
  // Optional: initialize from existing DOM class (avoids hydration mismatch flashes)
  tocCollapsed.set(document.documentElement.classList.contains("toc-toggled"))

  // Subscribe once: every update syncs the DOM
  tocCollapsed.subscribe(syncDom)
}

export const setTocCollapsed = (v: boolean) => tocCollapsed.set(v)
export const toggleTocCollapsed = () => tocCollapsed.set(!tocCollapsed.get())

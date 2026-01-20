import { atom } from "nanostores"

// Safety: if bundling ever duplicates modules across islands,
// stash the store on globalThis to guarantee a single instance.
const g = globalThis as any

export const tocCollapsed =
  g.__tocCollapsedStore ?? (g.__tocCollapsedStore = atom(false))

export const setTocCollapsed = (v: boolean) => tocCollapsed.set(v)
export const toggleTocCollapsed = () => tocCollapsed.set(!tocCollapsed.get())

export interface OLResult {
  key: string
  title: string
  author: string
  pages: number | null
  coverUrl?: string
}

interface OLDoc {
  key: string
  title: string
  author_name?: string[]
  number_of_pages_median?: number
  cover_i?: number
}

/** Search Open Library (free, CORS-enabled, no key needed). */
export async function searchOpenLibrary(q: string, signal?: AbortSignal): Promise<OLResult[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8&fields=key,title,author_name,number_of_pages_median,cover_i`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Open Library said ${res.status}`)
  const data = (await res.json()) as { docs: OLDoc[] }
  return data.docs.map((d) => ({
    key: d.key,
    title: d.title,
    author: d.author_name?.[0] ?? 'Unknown author',
    pages: d.number_of_pages_median ?? null,
    coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : undefined,
  }))
}

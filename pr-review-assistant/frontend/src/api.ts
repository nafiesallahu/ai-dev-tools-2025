export type Severity = 'low' | 'medium' | 'high'

export type ReviewRequest = {
  title: string
  diff: string
}

export type Finding = {
  severity: Severity
  message: string
  suggestion?: string | null
}

export type ReviewResponse = {
  summary: string
  findings: Finding[]
  score: number
}

type HealthResponse = { status: string }

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

function joinUrl(base: string, path: string): string {
  // base can be "/api" or "https://example.com" (optionally ending with "/")
  // path is expected to start with "/"
  const b = base.endsWith('/') ? base.slice(0, -1) : base
  const p = path.startsWith('/') ? path : `/${path}`
  return `${b}${p}`
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(joinUrl(API_BASE, path), init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed (${res.status})`)
  }
  return (await res.json()) as T
}

export async function health(): Promise<HealthResponse> {
  return fetchJson<HealthResponse>('/health')
}

export async function reviewPR(payload: ReviewRequest): Promise<ReviewResponse> {
  return fetchJson<ReviewResponse>('/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}



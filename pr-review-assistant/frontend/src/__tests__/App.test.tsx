import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('PR Review Assistant UI', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('clicking "Review PR" calls fetch with POST /review', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ summary: 'ok', findings: [], score: 100 }),
    })
    // @ts-expect-error - test stub
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    await userEvent.type(screen.getByLabelText(/pr title/i), 'Update docs')
    await userEvent.type(screen.getByLabelText(/^diff/i), '+hello')
    await userEvent.click(screen.getByRole('button', { name: /review pr/i }))

    expect(fetchMock).toHaveBeenCalled()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/review')
    expect(init.method).toBe('POST')
  })

  it('renders the returned summary', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ summary: 'Found 1 issue', findings: [], score: 85 }),
    })
    // @ts-expect-error - test stub
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    await userEvent.type(screen.getByLabelText(/pr title/i), 'Change')
    await userEvent.type(screen.getByLabelText(/^diff/i), '+TODO: fix later')
    await userEvent.click(screen.getByRole('button', { name: /review pr/i }))

    expect(await screen.findByText('Found 1 issue')).toBeInTheDocument()
  })
})



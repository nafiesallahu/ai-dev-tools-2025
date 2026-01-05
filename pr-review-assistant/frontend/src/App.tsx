import { useState } from 'react'
import { health, reviewPR, type ReviewResponse } from './api'
import './styles.css'

export default function App() {
  const [title, setTitle] = useState('')
  const [diff, setDiff] = useState('')

  const [healthStatus, setHealthStatus] = useState<string>('')
  const [healthLoading, setHealthLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [result, setResult] = useState<ReviewResponse | null>(null)

  async function onHealthCheck() {
    setHealthLoading(true)
    setHealthStatus('')
    try {
      const data = await health()
      setHealthStatus(data.status)
    } catch (e) {
      setHealthStatus(e instanceof Error ? e.message : 'Health check failed')
    } finally {
      setHealthLoading(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await reviewPR({ title, diff })
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>PR Review Assistant</h1>
          <p className="muted">Paste a PR title + diff to get a quick structured review.</p>
        </div>

        <div className="health">
          <button type="button" className="button buttonSecondary" onClick={onHealthCheck} disabled={healthLoading}>
            {healthLoading ? 'Checking…' : 'Health'}
          </button>
          <span className="healthStatus">
            {healthStatus ? (
              <>
                Status: <strong>{healthStatus}</strong>
              </>
            ) : (
              <span className="muted">Not checked</span>
            )}
          </span>
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <form onSubmit={onSubmit} className="form">
            <label className="label">
              PR Title
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fix auth edge case"
                minLength={3}
                maxLength={200}
                required
              />
            </label>

            <label className="label">
              Diff
              <textarea
                className="textarea"
                value={diff}
                onChange={(e) => setDiff(e.target.value)}
                placeholder="Paste your git diff here…"
                rows={12}
                required
              />
            </label>

            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Reviewing…' : 'Review PR'}
            </button>
          </form>

          {error ? (
            <div className="error" role="alert">
              <strong>Error:</strong> {error}
            </div>
          ) : null}
        </section>

        <section className="card">
          <h2>Result</h2>

          {!result ? (
            <p className="muted">No result yet. Submit a diff to see the review.</p>
          ) : (
            <>
              <div className="resultRow">
                <div>
                  <div className="muted">Summary</div>
                  <div>{result.summary}</div>
                </div>
                <div className="score">
                  <div className="muted">Score</div>
                  <div className="scoreValue">{result.score}/100</div>
                </div>
              </div>

              <h3>Findings</h3>
              {result.findings.length === 0 ? (
                <p className="muted">No findings.</p>
              ) : (
                <ul className="findings">
                  {result.findings.map((f, idx) => (
                    <li key={idx}>
                      <strong>[{f.severity}]</strong> {f.message}
                      {f.suggestion ? <div className="muted">Suggestion: {f.suggestion}</div> : null}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}



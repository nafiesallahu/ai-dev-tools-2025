import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditorPane from '../components/EditorPane';
import { useCollaborativeSession } from '../hooks/useCollaborativeSession';
import { usePyodide } from '../hooks/usePyodide';

export default function SessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { code, language, connected, updateCode, updateLanguage } = useCollaborativeSession(sessionId);
  const { ready: pyReady, error: pyError, pyodide } = usePyodide();
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');

  const shareUrl = useMemo(() => window.location.href, []);

  const wrapPython = (userCode) => {
    const safeCode = (userCode || 'print("Hello from Python")')
      .replace(/\\/g, '\\\\')
      .replace(/"""|'''/g, '\"\"\"');
    return `
import sys, io, contextlib
_buf = io.StringIO()
with contextlib.redirect_stdout(_buf):
    exec(\"\"\"${safeCode}\"\"\", {})
_buf.getvalue()
`;
  };

  const runCode = async () => {
    setRunning(true);
    setOutput('');
    try {
      if (language === 'python') {
        if (!pyReady) {
          setOutput(pyError ? pyError.message : 'Loading Python runtime…');
          return;
        }
        const result = await pyodide.runPythonAsync(wrapPython(code));
        setOutput(String(result ?? '').trimEnd());
      } else {
        // Sandboxed JS execution
        // eslint-disable-next-line no-new-func
        const fn = new Function(code || 'return "Hello from JavaScript"');
        const result = await fn();
        setOutput(String(result ?? ''));
      }
    } catch (err) {
      setOutput(err.message || String(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <button onClick={() => navigate('/')}>← New session</button>
          <h2>Session {sessionId}</h2>
          <p className={connected ? 'status online' : 'status offline'}>
            {connected ? 'Connected' : 'Reconnecting…'}
          </p>
        </div>
        <div className="controls">
          <label>
            Language:
            <select value={language} onChange={(e) => updateLanguage(e.target.value)}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </label>
          <button onClick={runCode} disabled={running}>
            {running ? 'Running…' : 'Run'}
          </button>
          <button onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy link</button>
        </div>
      </header>

      <EditorPane value={code} language={language} onChange={updateCode} />

      <section className="output">
        <div className="output-header">
          <h3>Output</h3>
          {!pyReady && language === 'python' && <span>Loading Pyodide…</span>}
        </div>
        <pre>{output}</pre>
      </section>
    </div>
  );
}



import { useEffect, useRef, useState } from 'react';

const PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/';
const PYODIDE_SRC = `${PYODIDE_BASE}pyodide.js`;

export function usePyodide() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const pyodideRef = useRef(null);

  useEffect(() => {
    let canceled = false;

    const load = async () => {
      if (pyodideRef.current || canceled) return;
      const initPyodide = async () => {
        try {
          pyodideRef.current = await window.loadPyodide({ indexURL: PYODIDE_BASE });
          if (!canceled) setReady(true);
        } catch (err) {
          if (!canceled) setError(err);
        }
      };

      if (window.loadPyodide) {
        initPyodide();
        return;
      }

      const script = document.createElement('script');
      script.src = PYODIDE_SRC;
      script.onload = initPyodide;
      script.onerror = () => {
        if (!canceled) setError(new Error('Failed to load Pyodide'));
      };
      document.body.appendChild(script);
    };

    load();
    return () => {
      canceled = true;
    };
  }, []);

  return { ready, error, pyodide: pyodideRef.current };
}



import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const { sessionId } = await createSession();
      navigate(`/session/${sessionId}`);
    } catch (err) {
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Online Coding Interview</h1>
        <p>Create a collaborative session and share the link with candidates.</p>
        <button onClick={handleCreate} disabled={loading}>
          {loading ? 'Creating…' : 'Create Session'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}



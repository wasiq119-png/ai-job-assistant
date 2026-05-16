import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/'); 
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <>
      <div className="bg-orb-1"></div>
      <div className="bg-orb-2"></div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <form className="glass-panel" onSubmit={handleSubmit} style={{ padding: '50px 40px', width: '400px', display: 'flex', flexDirection: 'column', gap: '25px', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h1 className="gradient-text" style={{ margin: '0 0 10px 0', fontSize: '2.5rem', fontWeight: '800' }}>Welcome</h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>Sign in to continue to AI Job Assistant</p>
          </div>

          {error && <div style={{ color: '#f87171', textAlign: 'center', fontSize: '0.9rem', padding: '10px', background: 'rgba(248,113,113,0.1)', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.3)' }}>{error}</div>}
          
          <input 
            type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', fontSize: '1rem', transition: 'border 0.3s' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
          />
          
          <input 
            type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', fontSize: '1rem', transition: 'border 0.3s' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
          />
          
          <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '16px' }}>
            Log In
          </button>
          
          <div style={{ textAlign: 'center', fontSize: '0.95rem', color: '#94a3b8', marginTop: '10px' }}>
            Don't have an account? <Link to="/signup" className="gradient-text" style={{ textDecoration: 'none', fontWeight: '600', marginLeft: '5px' }}>Create one</Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;

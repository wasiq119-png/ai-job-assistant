import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Failed to sign up. Email might be taken.');
    }
  };

  return (
    <>
      <div className="bg-orbital-glow bg-orb-1"></div>
      <div className="bg-orbital-glow bg-orb-2"></div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', padding: '20px' }}>
        <form className="glass-panel" onSubmit={handleSubmit} style={{ padding: '50px 40px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '25px', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h1 className="gradient-text" style={{ margin: '0 0 10px 0', fontSize: '2.5rem', fontWeight: '800' }}>Get Started</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>Create a free account to continue</p>
          </div>

          {error && <div style={{ color: '#f87171', textAlign: 'center', fontSize: '0.9rem', padding: '10px', background: 'rgba(248,113,113,0.1)', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.3)' }}>{error}</div>}
          
          <input 
            type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', transition: 'border 0.3s' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
          />
          
          <input 
            type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', transition: 'border 0.3s' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
          />
          
          <input 
            type="password" placeholder="Create Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', backgroundColor: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', transition: 'border 0.3s' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
          />
          
          <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '16px' }}>
            Create Account
          </button>
          
          <div style={{ textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
            Already have an account? <Link to="/login" className="gradient-text" style={{ textDecoration: 'none', fontWeight: '600', marginLeft: '5px' }}>Log in</Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default Signup;

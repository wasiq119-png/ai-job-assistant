import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Markdown from 'react-markdown'
import '../App.css'
import api from '../api/axiosConfig'
import { AuthContext } from '../context/AuthContext'
import AnimatedLayout, { AnimatedItem, cardVariants, slideVariants, scaleVariants } from './AnimatedLayout'

// ─── Match Meter ───────────────────────────────────────────────────────────────
const MatchMeter = ({ score }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 14, delay: 0.2 }}
      style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0, filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.3))' }}
    >
      <svg width="150" height="150">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={score > 70 ? '#34d399' : score > 40 ? '#fbbf24' : '#f87171'} />
            <stop offset="100%" stopColor={score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#ef4444'} />
          </linearGradient>
        </defs>
        <circle cx="75" cy="75" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle
          cx="75" cy="75" r={radius}
          fill="transparent"
          stroke="url(#scoreGradient)"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '2rem', fontWeight: '800',
        color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)'
      }}>
        {score}%
      </div>
    </motion.div>
  );
};

// ─── Jarvis Chat ───────────────────────────────────────────────────────────────
const JarvisChat = ({ resumeFile }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askJarvis = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const formData = new FormData();
      formData.append('message', query);
      if (resumeFile) formData.append('resumeFile', resumeFile);
      const res = await api.post('/ai/chat', formData);
      setResponse(res.data);
    } catch {
      setResponse('System offline. Please check your network connection protocols.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ height: '100%', padding: '25px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
        <motion.div
          animate={{ boxShadow: ['0 0 15px rgba(56,189,248,0.4)', '0 0 25px rgba(99,102,241,0.6)', '0 0 15px rgba(56,189,248,0.4)'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ fontSize: '1.2rem' }}>🤖</span>
        </motion.div>
        <h2 className="gradient-text" style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>J.A.R.V.I.S. Protocol</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: '150px', maxHeight: '250px', paddingRight: '10px', marginBottom: '15px', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                  style={{ width: '8px', height: '8px', background: 'var(--accent-blue)', borderRadius: '50%' }}
                />
              ))}
              <span>Analyzing query parameters...</span>
            </motion.div>
          ) : response ? (
            <motion.div key="response" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Markdown>{response}</Markdown>
            </motion.div>
          ) : (
            <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Awaiting input. Ask me about interview strategies, salary negotiations, or ATS optimization.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={askJarvis} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Ask a career question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--glass-border)', backgroundColor: 'rgba(0,0,0,0.15)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem', transition: 'all 0.3s' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
        />
        <button type="submit" className="btn-primary" disabled={loading || !query.trim()} style={{ padding: '0 20px', fontSize: '0.95rem' }}>
          Ask
        </button>
      </form>
    </div>
  );
};

// ─── File Upload Box ───────────────────────────────────────────────────────────
const FileUploadBox = ({ label, file, onFileChange, accept }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragIn = (e) => { handleDrag(e); if (e.dataTransfer.items?.length > 0) setIsDragging(true); };
  const handleDragOut = (e) => { handleDrag(e); setIsDragging(false); };
  const handleDrop = (e) => {
    handleDrag(e); setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) { onFileChange(e.dataTransfer.files[0]); e.dataTransfer.clearData(); }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h3 style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{label}</h3>
      <motion.label
        className="glass-panel"
        animate={{
          borderColor: isDragging ? 'var(--accent-blue)' : file ? 'var(--accent-green)' : 'var(--glass-border)',
          boxShadow: isDragging ? '0 0 20px rgba(56,189,248,0.25)' : file ? '0 0 12px rgba(52,211,153,0.15)' : 'none',
          backgroundColor: isDragging ? 'rgba(56,189,248,0.06)' : 'rgba(0,0,0,0.05)',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '110px',
          border: `1.5px dashed ${isDragging ? 'var(--accent-blue)' : file ? 'var(--accent-green)' : 'var(--glass-border)'}`,
          cursor: 'pointer',
          color: file ? 'var(--accent-green)' : 'var(--text-secondary)',
        }}
        onDragEnter={handleDragIn} onDragOver={handleDrag} onDragLeave={handleDragOut} onDrop={handleDrop}
      >
        <motion.span
          animate={{ scale: isDragging ? 1.3 : 1, rotate: isDragging ? [0, -10, 10, 0] : 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ fontSize: '2rem', marginBottom: '5px' }}
        >
          {file ? '✅' : isDragging ? '📥' : '📄'}
        </motion.span>
        <span style={{ fontSize: '0.8rem', textAlign: 'center', padding: '0 10px', fontWeight: isDragging ? '600' : '400', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
          {file ? file.name : isDragging ? 'Drop to Upload' : 'Drag & Drop'}
        </span>
        <input type="file" accept={accept} style={{ display: 'none' }} onChange={e => onFileChange(e.target.files[0] || null)} />
      </motion.label>
    </div>
  );
};

// ─── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = ({ color }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    style={{ width: '40px', height: '40px', border: `4px solid ${color}22`, borderTopColor: color, borderRadius: '50%' }}
  />
);

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon, text }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15, duration: 0.4 }}
    style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}
  >
    <motion.span
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{ fontSize: '3rem', filter: 'grayscale(1)', opacity: 0.45 }}
    >
      {icon}
    </motion.span>
    {text}
  </motion.div>
);

// ─── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [jobFile, setJobFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [currentReportId, setCurrentReportId] = useState(null);
  const [matchScore, setMatchScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [letterLoading, setLetterLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [liveJobs, setLiveJobs] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('analysis');

  const fetchHistory = async () => {
    try {
      const response = await api.get('/ai/history');
      setHistory(response.data.reverse());
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  useEffect(() => {
    const stopDefault = (e) => { e.preventDefault(); e.stopPropagation(); };
    window.addEventListener('dragover', stopDefault);
    window.addEventListener('drop', stopDefault);
    return () => { window.removeEventListener('dragover', stopDefault); window.removeEventListener('drop', stopDefault); };
  }, []);

  const deleteHistoryItem = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Permanently delete this scan?')) {
      try {
        await api.delete(`/ai/history/${id}`);
        fetchHistory();
        if (currentReportId === id) { setAnalysis(''); setMatchScore(0); setCoverLetter(''); }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const analyzeMatch = async () => {
    if (!jobFile || !resumeFile) return;
    setActiveTab('analysis'); setLoading(true); setAnalysis('Thinking...');
    try {
      const formData = new FormData();
      formData.append('jobFile', jobFile);
      formData.append('resumeFile', resumeFile);
      const response = await api.post('/ai/analyze', formData);
      const data = response.data;
      if (typeof data === 'string' && data.startsWith('Error')) {
        setAnalysis(data);
      } else {
        setAnalysis(data.missingSkills);
        setCurrentReportId(data.id);
        setMatchScore(data.matchScore);
        setCoverLetter(data.coverLetter || '');
      }
      fetchHistory();
    } catch (error) {
      setAnalysis(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateCoverLetter = async () => {
    if (!jobFile || !resumeFile) return;
    setActiveTab('letter'); setLetterLoading(true); setCoverLetter('');
    try {
      const formData = new FormData();
      formData.append('jobFile', jobFile);
      formData.append('resumeFile', resumeFile);
      const urlParams = new URLSearchParams();
      if (currentReportId) urlParams.append('reportId', currentReportId);
      const response = await api.post(`/ai/cover-letter?${urlParams.toString()}`, formData);
      setCoverLetter(response.data);
      fetchHistory();
    } catch (error) {
      setAnalysis(`Letter Error: ${error.message}`);
    } finally {
      setLetterLoading(false);
    }
  };

  const findLiveJobs = async () => {
    if (!resumeFile) { alert('Please upload your resume first!'); return; }
    setActiveTab('jobs'); setJobsLoading(true); setLiveJobs(null);
    try {
      const formData = new FormData();
      formData.append('resumeFile', resumeFile);
      const response = await api.post('/ai/find-jobs', formData);
      let data = response.data;
      if (typeof data === 'string') { try { data = JSON.parse(data); } catch (e) {} }
      setLiveJobs(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error(error);
      setLiveJobs([{ error: 'Network error occurred fetching jobs.' }]);
    } finally {
      setJobsLoading(false);
    }
  };

  const tabs = [
    { id: 'analysis', label: '📊 Match Analysis' },
    { id: 'letter', label: '✍️ Tailored Cover Letter' },
    { id: 'jobs', label: '🌐 Live Job Matches' },
  ];

  return (
    <>
      <div className="bg-orbital-glow bg-orb-1" />
      <div className="bg-orbital-glow bg-orb-2" />

      <AnimatedLayout
        className="main-content-layout"
        layoutKey="dashboard"
        style={{ display: 'flex', height: '100vh', width: '100vw', color: 'var(--text-primary)', overflow: 'hidden', paddingBottom: '20px' }}
      >
        {/* ── SIDEBAR ── */}
        <AnimatedItem
          className="glass-panel"
          style={{ width: '280px', flexShrink: 0, margin: '0 0 0 20px', padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', zIndex: 10 }}
        >
          <h2 className="gradient-text" style={{ fontSize: '1.3rem', margin: '0 0 24px 0', fontWeight: '800' }}>Analysis History</h2>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
            {history.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px', fontSize: '0.9rem' }}>No history yet.</p>
            )}

            <AnimatePresence>
              {history.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.06, type: 'spring', stiffness: 120, damping: 16 } }}
                  exit={{ opacity: 0, x: -30, scale: 0.95, transition: { duration: 0.2 } }}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  onClick={() => { setAnalysis(item.missingSkills); setCoverLetter(item.coverLetter || ''); setCurrentReportId(item.id); setMatchScore(item.matchScore); setActiveTab('analysis'); }}
                  className="glass-panel"
                  style={{
                    position: 'relative', padding: '14px', marginBottom: '12px', cursor: 'pointer',
                    borderLeft: `4px solid ${item.matchScore > 50 ? 'var(--accent-green)' : '#fbbf24'}`,
                    backgroundColor: currentReportId === item.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  <motion.button
                    onClick={(e) => deleteHistoryItem(e, item.id)}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}
                    whileHover={{ color: '#ef4444', scale: 1.2 }}
                    whileTap={{ scale: 0.85 }}
                  >✕</motion.button>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '8px', paddingRight: '20px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.jobTitle || 'Untitled Job'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>Score: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{item.matchScore}%</span></div>
                    {item.coverLetter && (
                      <span style={{ fontSize: '0.65rem', background: 'rgba(56,189,248,0.15)', color: 'var(--accent-blue)', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid rgba(56,189,248,0.3)' }}>
                        LETTER
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>🛡️ Assistant Core</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1], boxShadow: ['0 0 4px var(--accent-green)', '0 0 12px var(--accent-green)', '0 0 4px var(--accent-green)'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-green)', borderRadius: '50%', display: 'inline-block' }}
              />
              SECURE SESSION
            </span>
          </div>
        </AnimatedItem>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, padding: '0 40px 0 20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

          {/* TOP HEADER */}
          <AnimatedItem style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexShrink: 0 }}>
            <h1 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
              AI Job Assistant
            </h1>
            <motion.div
              className="glass-panel"
              animate={{ boxShadow: ['0 0 0px transparent', '0 0 15px rgba(52,211,153,0.2)', '0 0 0px transparent'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ padding: '8px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <motion.div
                animate={{ opacity: [1, 0.4, 1], scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '50%' }}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600' }}>System Online</span>
            </motion.div>
          </AnimatedItem>

          {/* GRID ROW 1 */}
          <AnimatedItem style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', marginBottom: '25px', flexShrink: 0 }}>
            {/* Control Center */}
            <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🎛️</span>
                  <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)', fontWeight: '600' }}>Operation Center</h2>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <FileUploadBox label="Target Job Description" file={jobFile} onFileChange={setJobFile} accept=".pdf,.doc,.docx" />
                  <FileUploadBox label="Your Resume" file={resumeFile} onFileChange={setResumeFile} accept=".pdf,.doc,.docx" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                {[
                  { label: loading ? 'Analyzing...' : '✨ Run Analysis', onClick: analyzeMatch, disabled: loading || !jobFile || !resumeFile, style: {} },
                  { label: letterLoading ? 'Writing...' : '📝 Generate Letter', onClick: generateCoverLetter, disabled: letterLoading || !jobFile || !resumeFile, style: { background: 'rgba(56,189,248,0.1)', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)', boxShadow: 'none' } },
                  { label: jobsLoading ? 'Hunting...' : '🌐 Find Live Jobs', onClick: findLiveJobs, disabled: jobsLoading || !resumeFile, style: { background: 'rgba(52,211,153,0.1)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', boxShadow: 'none' } },
                ].map(({ label, onClick, disabled, style: btnStyle }) => (
                  <motion.button
                    key={label}
                    className="btn-primary"
                    onClick={onClick}
                    disabled={disabled}
                    style={{ flex: 1, padding: '12px 10px', fontSize: '0.9rem', ...btnStyle }}
                    whileHover={!disabled ? { scale: 1.04, y: -2 } : {}}
                    whileTap={!disabled ? { scale: 0.97 } : {}}
                  >
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>

            <JarvisChat resumeFile={resumeFile} />
          </AnimatedItem>

          {/* GRID ROW 2: TABS */}
          <AnimatedItem className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: '600px', marginBottom: '40px' }}>

            {/* Tab Bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.05)', padding: '0 10px', position: 'relative' }}>
              {tabs.map(({ id, label }) => (
                <motion.button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    padding: '16px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
                    color: activeTab === id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: activeTab === id ? '600' : '400',
                    fontSize: '0.95rem', position: 'relative',
                    borderBottom: '3px solid transparent',
                  }}
                  whileHover={{ color: 'var(--text-primary)' }}
                  animate={{ color: activeTab === id ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  {label}
                  {activeTab === id && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      style={{
                        position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '3px',
                        background: id === 'jobs' ? 'var(--accent-green)' : 'var(--accent-blue)',
                        borderRadius: '3px 3px 0 0',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '30px', flex: 1 }}>
              <AnimatePresence mode="wait">

                {/* ANALYSIS TAB */}
                {activeTab === 'analysis' && (
                  <motion.div key="analysis"
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                  >
                    {!analysis ? (
                      <EmptyState icon="📊" text="Upload your documents and run an analysis to generate your match report." />
                    ) : analysis === 'Thinking...' ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', color: 'var(--accent-blue)', padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <Spinner color="var(--accent-blue)" />
                        Analyzing skill overlap and ATS compatibility...
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                        style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}
                      >
                        <MatchMeter score={matchScore} />
                        <div style={{ flex: 1, color: 'var(--text-primary)', lineHeight: '1.8', fontSize: '1rem', background: 'rgba(0,0,0,0.05)', padding: '25px', borderRadius: '16px' }}>
                          <Markdown>{analysis}</Markdown>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* COVER LETTER TAB */}
                {activeTab === 'letter' && (
                  <motion.div key="letter"
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                  >
                    {!coverLetter && !letterLoading ? (
                      <EmptyState icon="✍️" text="Generate a custom cover letter based on your specific match profile." />
                    ) : letterLoading ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', color: 'var(--accent-purple)', padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <Spinner color="var(--accent-purple)" />
                        Drafting highly tailored cover letter...
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                          <motion.button
                            className="btn-primary"
                            onClick={() => { navigator.clipboard.writeText(coverLetter); alert('Copied!'); }}
                            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          >
                            Copy to Clipboard 📋
                          </motion.button>
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.8', background: 'rgba(0,0,0,0.05)', padding: '40px', borderRadius: '16px' }}>
                          <Markdown>{coverLetter}</Markdown>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* LIVE JOBS TAB */}
                {activeTab === 'jobs' && (
                  <motion.div key="jobs"
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                  >
                    {!liveJobs && !jobsLoading ? (
                      <EmptyState icon="🌐" text='Click "Find Live Jobs" to query LinkedIn, Stepstone, and Indeed via Google Jobs API.' />
                    ) : jobsLoading ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', color: 'var(--accent-green)', padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <Spinner color="var(--accent-green)" />
                        Scraping external platforms and processing AI matches...
                      </motion.div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ textAlign: 'right', marginBottom: '5px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '8px' }}>Targeted Search Results</span>
                        </div>
                        {liveJobs.map((job, idx) => (
                          job.error ? (
                            <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#f87171', padding: '20px', background: 'rgba(248,113,113,0.1)', borderRadius: '12px', border: '1px solid rgba(248,113,113,0.3)' }}>
                              Error: {job.error}
                            </motion.div>
                          ) : (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.08, type: 'spring', stiffness: 110, damping: 16 } }}
                              whileHover={{ x: 6 }}
                              transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                              style={{ padding: '25px', borderLeft: '4px solid var(--accent-green)', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '0 12px 12px 0' }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                  <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '1.25rem' }}>{job.title}</h3>
                                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '15px' }}>
                                    <span style={{ color: 'var(--accent-blue)' }}>🏢 {job.company}</span> • 📍 {job.location}
                                  </div>
                                </div>
                                <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', padding: '6px 14px', borderRadius: '20px', color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                  {job.match_score}% Match
                                </div>
                              </div>
                              <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', margin: '0 0 20px 0', fontSize: '0.95rem' }}>{job.match_reason}</p>
                              <motion.a
                                href={job.url} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-block', padding: '10px 24px', background: 'linear-gradient(135deg, var(--accent-green), #059669)', color: 'var(--bg-canvas)', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}
                                whileHover={{ scale: 1.05, y: -2, boxShadow: '0 8px 22px rgba(52,211,153,0.4)' }}
                                whileTap={{ scale: 0.97 }}
                              >
                                Apply Now ↗
                              </motion.a>
                            </motion.div>
                          )
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </AnimatedItem>

        </div>
      </AnimatedLayout>
    </>
  );
};

export default Dashboard;
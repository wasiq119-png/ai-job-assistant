import { useState, useEffect, useContext } from 'react'
import Markdown from 'react-markdown'
import '../App.css'
import api from '../api/axiosConfig'
import { AuthContext } from '../context/AuthContext'

const MatchMeter = ({ score }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0, filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.3))' }}>
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
    </div>
  );
};

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
      if (resumeFile) {
        formData.append('resumeFile', resumeFile);
      }
      const res = await api.post('/ai/chat', formData);
      setResponse(res.data);
    } catch (err) {
      setResponse("System offline. Please check your network connection protocols.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ height: '100%', padding: '25px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(56, 189, 248, 0.6)' }}>
          <span style={{ fontSize: '1.2rem' }}>🤖</span>
        </div>
        <h2 className="gradient-text" style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>J.A.R.V.I.S. Protocol</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: '150px', maxHeight: '250px', paddingRight: '10px', marginBottom: '15px', color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6' }}>
        {loading ? (
          <div style={{ color: 'var(--accent-blue)', animation: 'pulse 1.5s infinite', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--accent-blue)', borderRadius: '50%' }}></div>
            Analyzing query parameters...
          </div>
        ) : response ? (
          <Markdown>{response}</Markdown>
        ) : (
          <p style={{ color: '#94a3b8', margin: 0 }}>Awaiting input. Ask me about interview strategies, salary negotiations, or ATS optimization.</p>
        )}
      </div>

      <form onSubmit={askJarvis} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Ask a career question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--glass-border)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', fontSize: '0.95rem', transition: 'all 0.3s' }}
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

const FileUploadBox = ({ label, file, onFileChange, accept }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragIn = (e) => { handleDrag(e); if (e.dataTransfer.items?.length > 0) setIsDragging(true); };
  const handleDragOut = (e) => { handleDrag(e); setIsDragging(false); };
  const handleDrop = (e) => {
    handleDrag(e); setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h3 style={{ margin: 0, fontWeight: '600', color: '#e2e8f0', fontSize: '0.95rem' }}>{label}</h3>
      <label
        className="glass-panel"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '110px', 
          border: `1.5px dashed ${isDragging ? 'var(--accent-blue)' : (file ? 'var(--accent-green)' : 'rgba(255,255,255,0.2)')}`,
          cursor: 'pointer', 
          backgroundColor: isDragging ? 'rgba(56,189,248,0.05)' : 'rgba(0,0,0,0.2)', 
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          boxShadow: isDragging ? '0 0 15px rgba(56, 189, 248, 0.2)' : 'none',
          color: file ? 'var(--accent-green)' : '#94a3b8',
        }}
        onDragEnter={handleDragIn} onDragOver={handleDrag} onDragLeave={handleDragOut} onDrop={handleDrop}
      >
        <span style={{ fontSize: '2rem', marginBottom: '5px' }}>
          {file ? '✅' : (isDragging ? '📥' : '📄')}
        </span>
        <span style={{ fontSize: '0.8rem', textAlign: 'center', padding: '0 10px', fontWeight: isDragging ? '600' : '400', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
          {file ? file.name : (isDragging ? 'Drop to Upload' : 'Drag & Drop')}
        </span>
        <input type="file" accept={accept} style={{ display: 'none' }} onChange={e => onFileChange(e.target.files[0] || null)} />
      </label>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
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
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis', 'letter', 'jobs'

  const fetchHistory = async () => {
    try {
      const response = await api.get('/ai/history');
      setHistory(response.data.reverse());
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleGlobalDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
    window.addEventListener('dragover', handleGlobalDrag);
    window.addEventListener('drop', handleGlobalDrag);
    return () => {
      window.removeEventListener('dragover', handleGlobalDrag);
      window.removeEventListener('drop', handleGlobalDrag);
    };
  }, []);

  const deleteHistoryItem = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Permanently delete this scan?")) {
      try {
        await api.delete(`/ai/history/${id}`);
        fetchHistory();
        if (currentReportId === id) {
          setAnalysis('');
          setMatchScore(0);
          setCoverLetter('');
        }
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const analyzeMatch = async () => {
    if (!jobFile || !resumeFile) return;
    setActiveTab('analysis');
    setLoading(true);
    setAnalysis("Thinking...");
    try {
      const formData = new FormData();
      formData.append('jobFile', jobFile);
      formData.append('resumeFile', resumeFile);

      const response = await api.post('/ai/analyze', formData);
      const data = response.data;
      if (typeof data === 'string' && data.startsWith("Error")) {
          setAnalysis(data);
      } else {
          setAnalysis(data.missingSkills);
          setCurrentReportId(data.id);
          setMatchScore(data.matchScore);
          setCoverLetter(data.coverLetter || "");
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
    setActiveTab('letter');
    setLetterLoading(true);
    setCoverLetter("");
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
    if (!resumeFile) {
      alert("Please upload your resume first!");
      return;
    }
    setActiveTab('jobs');
    setJobsLoading(true);
    setLiveJobs(null);
    try {
      const formData = new FormData();
      formData.append('resumeFile', resumeFile);
      const response = await api.post('/ai/find-jobs', formData);
      let data = response.data;
      if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch(e) {}
      }
      setLiveJobs(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error(error);
      setLiveJobs([{ error: "Network error occurred fetching jobs." }]);
    } finally {
      setJobsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-orb-1"></div>
      <div className="bg-orb-2"></div>
      
      <div style={{ display: 'flex', height: '100vh', width: '100vw', color: 'white', overflow: 'hidden' }}>
        
        {/* --- SIDEBAR --- */}
        <div className="glass-panel" style={{ 
          width: '280px', flexShrink: 0, margin: '20px', padding: '24px', 
          display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)', zIndex: 10 
        }}>
          <h2 className="gradient-text" style={{ fontSize: '1.3rem', margin: '0 0 24px 0', fontWeight: '800' }}>Analysis History</h2>
          
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
            {history.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', marginTop: '40px', fontSize: '0.9rem' }}>No history yet.</p>}
            
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setAnalysis(item.missingSkills);
                  setCoverLetter(item.coverLetter || "");
                  setCurrentReportId(item.id);
                  setMatchScore(item.matchScore);
                  setActiveTab('analysis');
                }}
                className="glass-panel"
                style={{
                  position: 'relative', padding: '14px', marginBottom: '12px', cursor: 'pointer',
                  borderLeft: `4px solid ${item.matchScore > 50 ? 'var(--accent-green)' : '#fbbf24'}`,
                  transition: 'transform 0.2s, background 0.2s',
                  backgroundColor: currentReportId === item.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)'
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateX(5px)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; }}
              >
                <button
                  onClick={(e) => deleteHistoryItem(e, item.id)}
                  style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'transparent', border: 'none', color: '#64748b',
                    cursor: 'pointer', fontSize: '14px', transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#ef4444'}
                  onMouseOut={(e) => e.target.style.color = '#64748b'}
                >
                  ✕
                </button>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '8px', paddingRight: '20px', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.jobTitle || "Untitled Job"}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>Score: <span style={{ color: 'white', fontWeight: 'bold' }}>{item.matchScore}%</span></div>
                  {item.coverLetter && (
                    <span style={{ fontSize: '0.65rem', background: 'rgba(56,189,248,0.15)', color: 'var(--accent-blue)', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid rgba(56,189,248,0.3)' }}>
                      LETTER
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
              👤 {user?.email}
            </span>
            <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              Logout
            </button>
          </div>
        </div>

        {/* --- MAIN DASHBOARD CONTENT --- */}
        <div style={{ flex: 1, padding: '30px 40px 30px 20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          {/* TOP HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexShrink: 0 }}>
            <h1 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
              AI Job Assistant
            </h1>
            <div className="glass-panel" style={{ padding: '8px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-green)' }}></div>
              <span style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: '600' }}>System Online</span>
            </div>
          </div>

          {/* GRID ROW 1: CONTROLS & JARVIS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', marginBottom: '25px', flexShrink: 0 }}>
            
            {/* Control Center */}
            <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🎛️</span>
                  <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#f8fafc', fontWeight: '600' }}>Operation Center</h2>
                </div>
                
                <div style={{ display: 'flex', gap: '20px' }}>
                  <FileUploadBox label="Target Job Description" file={jobFile} onFileChange={setJobFile} accept=".pdf,.doc,.docx" />
                  <FileUploadBox label="Your Resume" file={resumeFile} onFileChange={setResumeFile} accept=".pdf,.doc,.docx" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button className="btn-primary" onClick={analyzeMatch} disabled={loading || !jobFile || !resumeFile} style={{ flex: 1, padding: '12px 10px', fontSize: '0.9rem' }}>
                  {loading ? 'Analyzing...' : '✨ Run Analysis'}
                </button>
                <button className="btn-primary" onClick={generateCoverLetter} disabled={letterLoading || !jobFile || !resumeFile} style={{ flex: 1, padding: '12px 10px', fontSize: '0.9rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)', boxShadow: 'none' }}>
                  {letterLoading ? 'Writing...' : '📝 Generate Letter'}
                </button>
                <button className="btn-primary" onClick={findLiveJobs} disabled={jobsLoading || !resumeFile} style={{ flex: 1, padding: '12px 10px', fontSize: '0.9rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', boxShadow: 'none' }}>
                  {jobsLoading ? 'Hunting...' : '🌐 Find Live Jobs'}
                </button>
              </div>
            </div>

            {/* Jarvis Widget */}
            <JarvisChat resumeFile={resumeFile} />
          </div>

          {/* GRID ROW 2: TABS INTERFACE */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: '600px', marginBottom: '40px' }}>
            
            {/* Tabs Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', padding: '0 10px' }}>
              {['analysis', 'letter', 'jobs'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '16px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
                    color: activeTab === tab ? '#f8fafc' : '#64748b',
                    borderBottom: activeTab === tab ? `3px solid ${tab === 'jobs' ? 'var(--accent-green)' : 'var(--accent-blue)'}` : '3px solid transparent',
                    fontWeight: activeTab === tab ? '600' : '400',
                    fontSize: '0.95rem', transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  {tab === 'analysis' && '📊 Match Analysis'}
                  {tab === 'letter' && '✍️ Tailored Cover Letter'}
                  {tab === 'jobs' && '🌐 Live Job Matches'}
                </button>
              ))}
            </div>

            {/* Tabs Content */}
            <div style={{ padding: '30px', flex: 1 }}>
              
              {/* --- ANALYSIS TAB --- */}
              {activeTab === 'analysis' && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  {!analysis ? (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '3rem', filter: 'grayscale(1)', opacity: 0.5 }}>📊</span>
                      Upload your documents and run an analysis to generate your match report.
                    </div>
                  ) : analysis === "Thinking..." ? (
                    <div style={{ textAlign: 'center', color: 'var(--accent-blue)', padding: '60px', animation: 'pulse 1.5s infinite', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', border: '4px solid rgba(56,189,248,0.3)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      Analyzing skill overlap and ATS compatibility...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                      <MatchMeter score={matchScore} />
                      <div style={{ flex: 1, color: '#e2e8f0', lineHeight: '1.8', fontSize: '1rem', background: 'rgba(0,0,0,0.2)', padding: '25px', borderRadius: '16px' }}>
                        <Markdown>{analysis}</Markdown>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- COVER LETTER TAB --- */}
              {activeTab === 'letter' && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  {!coverLetter && !letterLoading ? (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '3rem', filter: 'grayscale(1)', opacity: 0.5 }}>✍️</span>
                      Generate a custom cover letter based on your specific match profile.
                    </div>
                  ) : letterLoading ? (
                    <div style={{ textAlign: 'center', color: 'var(--accent-purple)', padding: '60px', animation: 'pulse 1.5s infinite', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', border: '4px solid rgba(129,140,248,0.3)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      Drafting highly tailored cover letter...
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                        <button className="btn-primary" onClick={() => { navigator.clipboard.writeText(coverLetter); alert("Copied!"); }} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                          Copy to Clipboard 📋
                        </button>
                      </div>
                      <div style={{ color: '#f8fafc', fontSize: '1rem', lineHeight: '1.8', background: 'rgba(0,0,0,0.2)', padding: '40px', borderRadius: '16px' }}>
                        <Markdown>{coverLetter}</Markdown>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- LIVE JOBS TAB --- */}
              {activeTab === 'jobs' && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  {!liveJobs && !jobsLoading ? (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '3rem', filter: 'grayscale(1)', opacity: 0.5 }}>🌐</span>
                      Click "Find Live Jobs" to query LinkedIn, Stepstone, and Indeed via Google Jobs API.
                    </div>
                  ) : jobsLoading ? (
                    <div style={{ textAlign: 'center', color: 'var(--accent-green)', padding: '60px', animation: 'pulse 1.5s infinite', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                       <div style={{ width: '40px', height: '40px', border: '4px solid rgba(52,211,153,0.3)', borderTopColor: 'var(--accent-green)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      Scraping external platforms and processing AI matches...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ textAlign: 'right', marginBottom: '5px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '8px' }}>Powered by Google Jobs (SerpApi)</span>
                      </div>
                      {liveJobs.map((job, idx) => (
                        job.error ? (
                          <div key={idx} style={{ color: '#f87171', padding: '20px', background: 'rgba(248,113,113,0.1)', borderRadius: '12px', border: '1px solid rgba(248,113,113,0.3)' }}>
                            Error: {job.error}
                          </div>
                        ) : (
                          <div key={idx} style={{ padding: '25px', borderLeft: '4px solid var(--accent-green)', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '0 12px 12px 0', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='translateX(5px)'} onMouseOut={e => e.currentTarget.style.transform='none'}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                              <div>
                                <h3 style={{ margin: '0 0 8px 0', color: '#f8fafc', fontSize: '1.25rem' }}>{job.title}</h3>
                                <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '15px' }}>
                                  <span style={{ color: 'var(--accent-blue)' }}>🏢 {job.company}</span> • 📍 {job.location}
                                </div>
                              </div>
                              <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '6px 14px', borderRadius: '20px', color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 0 10px rgba(52, 211, 153, 0.1)' }}>
                                {job.match_score}% Match
                              </div>
                            </div>
                            <p style={{ color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 20px 0', fontSize: '0.95rem' }}>{job.match_reason}</p>
                            <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 24px', background: 'linear-gradient(135deg, var(--accent-green), #059669)', color: '#020617', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(52, 211, 153, 0.2)' }} onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(52, 211, 153, 0.4)'; }} onMouseOut={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 15px rgba(52, 211, 153, 0.2)'; }}>
                              Apply Now ↗
                            </a>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default Dashboard
import { useState, useEffect } from 'react';
import ContactForm from './components/ContactForm';
import { Upload, Download, LogOut, FileText, Building2, Zap, Construction, Calculator, Trash2, Share2 } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface User {
  email: string;
  password: string;
  name: string;
}

interface FileData {
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  department: string;
}

interface FilesState {
  [key: string]: FileData[];
}

const DEPARTMENTS: Department[] = [
  { id: 'electrical',  name: 'Electrical',          icon: Zap,          color: 'bg-yellow-500' },
  { id: 'building',   name: 'Building Structures',  icon: Building2,    color: 'bg-blue-500'   },
  { id: 'structural', name: 'Structural',            icon: Construction, color: 'bg-green-500'  },
  { id: 'quantity',   name: 'Quantity Surveying',    icon: Calculator,   color: 'bg-purple-500' },
];

const DEPT_PASSWORDS: { [key: string]: string } = {
  electrical: 'elec2026',
  building:   'build2026',
  structural: 'struct2026',
  quantity:   'qty2026',
};

const storage = {
  get: (key: string): { key: string; value: string } | null => {
    const value = localStorage.getItem(key);
    return value ? { key, value } : null;
  },
  set: (key: string, value: string): { key: string; value: string } => {
    localStorage.setItem(key, value);
    return { key, value };
  },
  delete: (key: string): { key: string; deleted: boolean } => {
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
  list: (prefix?: string): { keys: string[] } => {
    const keys = Object.keys(localStorage);
    return { keys: prefix ? keys.filter(k => k.startsWith(prefix)) : keys };
  },
};

// ─── Blueprint Animated Background ───────────────────────────────────────────
function BlueprintBackground() {
  return (
    <>
      <style>{`
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.15; }
          50%       { opacity: 0.7;  }
        }
        @keyframes draw-h {
          from { stroke-dashoffset: 2000; }
          to   { stroke-dashoffset: 0;    }
        }
        @keyframes draw-v {
          from { stroke-dashoffset: 2000; }
          to   { stroke-dashoffset: 0;    }
        }
        @keyframes fade-in-blueprint {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 2px  #60b8ff88); }
          50%       { filter: drop-shadow(0 0 10px #60b8ffcc); }
        }
        @keyframes ticker {
          0%   { transform: translateX(0);    }
          100% { transform: translateX(-50%); }
        }

        .bp-container {
          position: fixed; inset: 0;
          background: #03111f;
          overflow: hidden; z-index: 0;
        }
        .bp-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(50,140,220,0.10) 1px, transparent 1px),
            linear-gradient(90deg, rgba(50,140,220,0.10) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        @media (max-width: 480px) { .bp-grid { background-size: 24px 24px; } }

        .bp-grid-large {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(50,140,220,0.22) 1px, transparent 1px),
            linear-gradient(90deg, rgba(50,140,220,0.22) 1px, transparent 1px);
          background-size: 200px 200px;
        }
        @media (max-width: 480px) { .bp-grid-large { background-size: 100px 100px; } }

        .bp-scanline {
          position: absolute; left: 0; right: 0; height: 3px;
          background: linear-gradient(to bottom,
            transparent,
            rgba(96,184,255,0.18) 40%,
            rgba(96,184,255,0.38) 50%,
            rgba(96,184,255,0.18) 60%,
            transparent);
          animation: scanline 6s linear infinite;
          pointer-events: none;
        }
        .bp-svg {
          position: absolute; inset: 0; width: 100%; height: 100%;
          animation: fade-in-blueprint 2s ease forwards;
        }
        .bp-line-h {
          stroke: rgba(96,184,255,0.45); stroke-width: 1;
          stroke-dasharray: 2000; stroke-dashoffset: 2000;
          animation: draw-h 5s ease forwards;
        }
        .bp-line-v {
          stroke: rgba(96,184,255,0.45); stroke-width: 1;
          stroke-dasharray: 2000; stroke-dashoffset: 2000;
          animation: draw-v 5s ease forwards;
        }
        .bp-line-h:nth-child(2) { animation-delay: 0.4s; }
        .bp-line-h:nth-child(3) { animation-delay: 0.8s; }
        .bp-line-h:nth-child(4) { animation-delay: 1.2s; }
        .bp-line-v:nth-child(5) { animation-delay: 0.6s; }
        .bp-line-v:nth-child(6) { animation-delay: 1.0s; }
        .bp-line-v:nth-child(7) { animation-delay: 1.4s; }
        .bp-circle {
          fill: none; stroke: rgba(96,184,255,0.35); stroke-width: 1;
          stroke-dasharray: 1500; stroke-dashoffset: 1500;
          animation: draw-h 7s ease forwards 1s;
        }
        .bp-circle-2 {
          fill: none; stroke: rgba(96,184,255,0.2); stroke-width: 1;
          stroke-dasharray: 800; stroke-dashoffset: 800;
          animation: draw-h 5s ease forwards 1.5s;
        }
        .bp-dim {
          stroke: rgba(96,184,255,0.5); stroke-width: 0.8; fill: none;
          stroke-dasharray: 400; stroke-dashoffset: 400;
          animation: draw-h 4s ease forwards 2s;
        }
        .bp-dot {
          fill: rgba(96,184,255,0.7);
          animation: pulse-dot 3s ease-in-out infinite;
        }
        .bp-dot:nth-child(2) { animation-delay: 0.8s; }
        .bp-dot:nth-child(3) { animation-delay: 1.6s; }
        .bp-dot:nth-child(4) { animation-delay: 2.4s; }
        .bp-compass { transform-origin: center; animation: glow-pulse 4s ease-in-out infinite; }
        .bp-corner {
          stroke: rgba(96,184,255,0.55); stroke-width: 1.5; fill: none;
          stroke-dasharray: 200; stroke-dashoffset: 200;
          animation: draw-h 3s ease forwards 0.5s;
        }
        .bp-ticker-wrap {
          position: absolute; bottom: 0; left: 0; right: 0; height: 28px;
          overflow: hidden; border-top: 1px solid rgba(96,184,255,0.2);
          background: rgba(3,17,31,0.7);
        }
        .bp-ticker {
          display: flex; white-space: nowrap;
          animation: ticker 30s linear infinite;
          font-family: 'Courier New', monospace; font-size: 11px;
          color: rgba(96,184,255,0.6); line-height: 28px;
          padding: 0 20px; letter-spacing: 0.05em;
        }
        .bp-overlay {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 40%,
            rgba(3,17,31,0.3) 0%, rgba(3,17,31,0.65) 100%);
        }

        /* ── Responsive helpers ── */
        .bp-input::placeholder { color: rgba(96,184,255,0.35); }

        /* Stack file rows on phones */
        @media (max-width: 560px) {
          .file-row   { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .file-info  { width: 100%; }
          .file-actions { width: 100%; justify-content: flex-start !important; flex-wrap: wrap; }
        }
        /* Wrap header on phones */
        @media (max-width: 560px) {
          .hdr-wrap { flex-wrap: wrap; gap: 8px; }
          .hdr-actions { width: 100%; justify-content: flex-end; }
        }
      `}</style>

      <div className="bp-container">
        <div className="bp-grid" />
        <div className="bp-grid-large" />
        <svg className="bp-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <line className="bp-line-h" x1="0"   y1="180" x2="1440" y2="180" />
          <line className="bp-line-h" x1="0"   y1="450" x2="1440" y2="450" />
          <line className="bp-line-h" x1="0"   y1="700" x2="1440" y2="700" />
          <line className="bp-line-h" x1="200" y1="80"  x2="900"  y2="80"  />
          <line className="bp-line-v" x1="320"  y1="0" x2="320"  y2="900" />
          <line className="bp-line-v" x1="850"  y1="0" x2="850"  y2="900" />
          <line className="bp-line-v" x1="1200" y1="0" x2="1200" y2="900" />
          <circle className="bp-circle"   cx="720" cy="450" r="320" />
          <circle className="bp-circle-2" cx="720" cy="450" r="200" />
          <circle className="bp-circle-2" cx="720" cy="450" r="420" />
          <rect x="430" y="220" width="580" height="340" fill="none"
            stroke="rgba(96,184,255,0.22)" strokeWidth="1"
            strokeDasharray="1600" strokeDashoffset="1600"
            style={{ animation: 'draw-h 6s ease forwards 1s' }} />
          <rect x="480" y="260" width="480" height="260" fill="none"
            stroke="rgba(96,184,255,0.15)" strokeWidth="0.8"
            strokeDasharray="1400" strokeDashoffset="1400"
            style={{ animation: 'draw-h 6s ease forwards 1.5s' }} />
          <line stroke="rgba(96,184,255,0.2)" strokeWidth="0.8" x1="620" y1="260" x2="620" y2="520"
            strokeDasharray="300" strokeDashoffset="300"
            style={{ animation: 'draw-v 4s ease forwards 2s' }} />
          <line stroke="rgba(96,184,255,0.2)" strokeWidth="0.8" x1="480" y1="370" x2="960" y2="370"
            strokeDasharray="500" strokeDashoffset="500"
            style={{ animation: 'draw-h 4s ease forwards 2.2s' }} />
          <line className="bp-dim" x1="430"  y1="200" x2="1010" y2="200" />
          <line className="bp-dim" x1="430"  y1="196" x2="430"  y2="204" />
          <line className="bp-dim" x1="1010" y1="196" x2="1010" y2="204" />
          <line className="bp-dim" x1="410"  y1="220" x2="410"  y2="560" />
          <line className="bp-dim" x1="406"  y1="220" x2="414"  y2="220" />
          <line className="bp-dim" x1="406"  y1="560" x2="414"  y2="560" />
          <polyline className="bp-corner" points="40,30 40,80 90,80" />
          <polyline className="bp-corner" points="1400,30 1400,80 1350,80"    style={{ animationDelay: '0.3s' }} />
          <polyline className="bp-corner" points="40,870 40,820 90,820"       style={{ animationDelay: '0.6s' }} />
          <polyline className="bp-corner" points="1400,870 1400,820 1350,820" style={{ animationDelay: '0.9s' }} />
          <g className="bp-compass" transform="translate(1340,130)">
            <circle cx="0" cy="0" r="40" fill="none" stroke="rgba(96,184,255,0.3)" strokeWidth="1" />
            <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(96,184,255,0.2)" strokeWidth="0.7" />
            <line x1="0" y1="-40" x2="0"  y2="40"  stroke="rgba(96,184,255,0.5)" strokeWidth="1" />
            <line x1="-40" y1="0" x2="40" y2="0"   stroke="rgba(96,184,255,0.5)" strokeWidth="1" />
            <polygon points="0,-38 4,-10 0,-18 -4,-10" fill="rgba(96,184,255,0.8)" />
            <text x="0" y="-46" textAnchor="middle" fontSize="10" fill="rgba(96,184,255,0.8)" fontFamily="Courier New">N</text>
          </g>
          <circle className="bp-dot" cx="320" cy="180" r="3" />
          <circle className="bp-dot" cx="850" cy="180" r="3" />
          <circle className="bp-dot" cx="320" cy="450" r="3" />
          <circle className="bp-dot" cx="850" cy="450" r="3" />
          <circle className="bp-dot" cx="720" cy="450" r="4" />
          <rect x="55"   y="170" width="80" height="20" fill="rgba(3,17,31,0.7)" stroke="rgba(96,184,255,0.4)" strokeWidth="0.8" rx="2" />
          <text x="95"   y="184" textAnchor="middle" fontSize="8" fill="rgba(96,184,255,0.7)" fontFamily="Courier New">ELEV. +0.00</text>
          <rect x="1100" y="440" width="90" height="20" fill="rgba(3,17,31,0.7)" stroke="rgba(96,184,255,0.4)" strokeWidth="0.8" rx="2" />
          <text x="1145" y="454" textAnchor="middle" fontSize="8" fill="rgba(96,184,255,0.7)" fontFamily="Courier New">GRID REF: B4</text>
          <rect x="55"   y="440" width="80" height="20" fill="rgba(3,17,31,0.7)" stroke="rgba(96,184,255,0.4)" strokeWidth="0.8" rx="2" />
          <text x="95"   y="454" textAnchor="middle" fontSize="8" fill="rgba(96,184,255,0.7)" fontFamily="Courier New">SCALE 1:100</text>
          <rect x="1100" y="800" width="300" height="70" fill="rgba(3,17,31,0.8)" stroke="rgba(96,184,255,0.4)" strokeWidth="1" />
          <line x1="1100" y1="820" x2="1400" y2="820" stroke="rgba(96,184,255,0.3)" strokeWidth="0.8" />
          <line x1="1100" y1="840" x2="1400" y2="840" stroke="rgba(96,184,255,0.3)" strokeWidth="0.8" />
          <line x1="1250" y1="820" x2="1250" y2="870" stroke="rgba(96,184,255,0.3)" strokeWidth="0.8" />
          <text x="1200" y="813" textAnchor="middle" fontSize="7" fill="rgba(96,184,255,0.5)" fontFamily="Courier New">PROJECT</text>
          <text x="1200" y="833" textAnchor="middle" fontSize="8" fill="rgba(96,184,255,0.8)" fontFamily="Courier New">AESL</text>
          <text x="1325" y="813" textAnchor="middle" fontSize="7" fill="rgba(96,184,255,0.5)" fontFamily="Courier New">DRAWN BY</text>
          <text x="1325" y="833" textAnchor="middle" fontSize="8" fill="rgba(96,184,255,0.7)" fontFamily="Courier New">AESL ENG.</text>
          <text x="1200" y="853" textAnchor="middle" fontSize="7" fill="rgba(96,184,255,0.5)" fontFamily="Courier New">DWG NO.</text>
          <text x="1325" y="853" textAnchor="middle" fontSize="7" fill="rgba(96,184,255,0.5)" fontFamily="Courier New">REV. A</text>
          <text x="1200" y="864" textAnchor="middle" fontSize="7" fill="rgba(96,184,255,0.6)" fontFamily="Courier New">A-101</text>
        </svg>
        <div className="bp-scanline" />
        <div className="bp-overlay" />
        <div className="bp-ticker-wrap">
          <div className="bp-ticker">
            {'AESL DOCUMENT MANAGEMENT SYSTEM  ·  STRUCTURAL ANALYSIS  ·  ELECTRICAL LAYOUT  ·  BUILDING STRUCTURES  ·  QUANTITY SURVEYING  ·  DWG REV-A  ·  SCALE 1:100  ·  GRID REF B4  ·  ELEV +0.00  ·  COORD SYS WGS84  ·  AESL DOCUMENT MANAGEMENT SYSTEM  ·  STRUCTURAL ANALYSIS  ·  ELECTRICAL LAYOUT  ·  BUILDING STRUCTURES  ·  QUANTITY SURVEYING  ·  DWG REV-A  ·  SCALE 1:100  ·  GRID REF B4  ·  '}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Glass Card ───────────────────────────────────────────────────────────────
function GlassCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl ${className}`}
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', ...style }}>
      {children}
    </div>
  );
}

// ─── Style tokens ─────────────────────────────────────────────────────────────
const mono: React.CSSProperties = { fontFamily: 'Courier New, monospace' };

const inputStyle: React.CSSProperties = {
  ...mono,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(96,184,255,0.3)',
  color: 'white',
  fontSize: 'clamp(11px, 3vw, 13px)',
  letterSpacing: '0.1em',
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  outline: 'none',
};

const mkBtn = (bg: string, border: string, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  ...mono,
  background: bg, border, color,
  fontSize: 'clamp(10px, 2.5vw, 12px)',
  letterSpacing: '0.08em',
  padding: '8px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '4px',
  ...extra,
});

const btnBlue  = (e?: React.CSSProperties) => mkBtn('rgba(96,184,255,0.2)', '1px solid rgba(96,184,255,0.5)', '#60b8ff', e);
const btnGhost = (e?: React.CSSProperties) => mkBtn('rgba(255,255,255,0.05)', '1px solid rgba(255,255,255,0.2)', 'rgba(255,255,255,0.7)', e);
const btnRed   = (e?: React.CSSProperties) => mkBtn('rgba(255,80,80,0.15)', '1px solid rgba(255,80,80,0.4)', '#ff6060', e);
const btnGreen = (e?: React.CSSProperties) => mkBtn('rgba(80,200,120,0.15)', '1px solid rgba(80,200,120,0.4)', '#50c878', e);

const sectionTitle: React.CSSProperties = {
  ...mono,
  color: 'rgba(96,184,255,0.8)',
  fontSize: 'clamp(10px, 2.5vw, 13px)',
  letterSpacing: '0.15em',
  borderBottom: '1px solid rgba(96,184,255,0.2)',
  paddingBottom: '10px',
  marginBottom: '16px',
};

export default function App() {
  const [user,                  setUser]                  = useState<User | null>(null);
  const [isLogin,               setIsLogin]               = useState(true);
  const [formData,              setFormData]              = useState({ email: '', password: '', name: '' });
  const [selectedDept,          setSelectedDept]          = useState<string | null>(null);
  const [files,                 setFiles]                 = useState<FilesState>({});
  const [showShareMenu,         setShowShareMenu]         = useState<number | null>(null);
  const [showContactForm,       setShowContactForm]       = useState(false);
  const [showPasswordPrompt,    setShowPasswordPrompt]    = useState(false);
  const [selectedDeptForAccess, setSelectedDeptForAccess] = useState<string | null>(null);
  const [deptPassword,          setDeptPassword]          = useState('');

  useEffect(() => {
    try {
      const u = storage.get('user');  if (u) setUser(JSON.parse(u.value));
      const f = storage.get('files'); if (f) setFiles(JSON.parse(f.value));
    } catch { /* nothing stored yet */ }
  }, []);

  const saveUser  = (d: User)       => storage.set('user',  JSON.stringify(d));
  const saveFiles = (d: FilesState) => storage.set('files', JSON.stringify(d));

  const handleAuth = () => {
    if (!formData.email || !formData.password) { alert('Please fill in email and password'); return; }
    if (isLogin) {
      try {
        const s = storage.get(`user_${formData.email}`);
        if (s) {
          const u: User = JSON.parse(s.value);
          if (u.password === formData.password) { setUser(u); saveUser(u); setFormData({ email: '', password: '', name: '' }); }
          else alert('Invalid credentials');
        } else alert('User not found');
      } catch { alert('User not found'); }
    } else {
      if (!formData.name) { alert('Please fill all fields'); return; }
      const nu: User = { email: formData.email, password: formData.password, name: formData.name };
      storage.set(`user_${formData.email}`, JSON.stringify(nu));
      setUser(nu); saveUser(nu); setFormData({ email: '', password: '', name: '' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDept || !user) return;
    const allowed = ['.dwg','.pdf','.doc','.docx','.xls','.xlsx'];
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowed.includes(ext)) { alert('Only .dwg, .pdf, .doc, .docx, .xls, .xlsx files are allowed'); return; }
    const fd: FileData = { name: file.name, size: file.size, uploadedBy: user.name, uploadedAt: new Date().toISOString(), department: selectedDept };
    const nf = { ...files };
    if (!nf[selectedDept]) nf[selectedDept] = [];
    nf[selectedDept].push(fd);
    setFiles(nf); saveFiles(nf);
    e.target.value = '';
    alert('File uploaded successfully!');
  };

  const handleDownload    = (file: FileData) => alert(`Downloading: ${file.name}\nSize: ${(file.size/1024).toFixed(2)} KB`);
  const handleDelete      = (i: number) => {
    if (!selectedDept || !confirm('Are you sure you want to delete this file?')) return;
    const nf = { ...files };
    nf[selectedDept] = nf[selectedDept].filter((_, idx) => idx !== i);
    setFiles(nf); saveFiles(nf);
    alert('File deleted successfully!');
  };
  const handleShare       = (file: FileData, platform: string) => {
    const txt = encodeURIComponent(`Check out this file: ${file.name} (${(file.size/1024).toFixed(2)} KB)`);
    const urls: Record<string,string> = {
      whatsapp: `https://wa.me/?text=${txt}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${txt}`,
      twitter:  `https://twitter.com/intent/tweet?text=${txt}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      email:    `mailto:?subject=File Share&body=${txt}`,
    };
    if (urls[platform]) { window.open(urls[platform], '_blank'); setShowShareMenu(null); }
  };
  const handleLogout           = () => { setUser(null); setSelectedDept(null); };
  const handleDepartmentClick  = (id: string) => { setSelectedDeptForAccess(id); setShowPasswordPrompt(true); setDeptPassword(''); };
  const handleCancelPassword   = () => { setShowPasswordPrompt(false); setDeptPassword(''); setSelectedDeptForAccess(null); };
  const handlePasswordSubmit   = () => {
    if (!selectedDeptForAccess) return;
    if (deptPassword === DEPT_PASSWORDS[selectedDeptForAccess]) {
      setSelectedDept(selectedDeptForAccess); setShowPasswordPrompt(false);
      setDeptPassword(''); setSelectedDeptForAccess(null);
    } else { alert('Incorrect password! Please try again.'); setDeptPassword(''); }
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  LOGIN
  // ══════════════════════════════════════════════════════════════════════════
  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <BlueprintBackground />
        <div className="relative z-10 w-full" style={{ maxWidth: 440 }}>
          <GlassCard className="p-5 sm:p-8">

            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-block mb-4">
  <img
    src="public/aesl_logo.jpg"
    alt="AESL Logo"
    onError={(e) => {
      const target = e.currentTarget;
      target.style.display = 'none';
      const fallback = target.nextElementSibling as HTMLElement;
      if (fallback) fallback.style.display = 'flex';
    }}
    style={{
      width: 80,
      height: 80,
      objectFit: 'contain',
      borderRadius: '12px',
    }}
  />
  {/* Fallback placeholder shown until real image is added */}
  <div style={{
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: '12px',
    background: 'rgba(96,184,255,0.15)',
    border: '2px dashed rgba(96,184,255,0.5)',
    color: 'rgba(96,184,255,0.7)',
    fontFamily: 'Courier New, monospace',
    fontSize: 10,
    letterSpacing: '0.05em',
    flexDirection: 'column',
    gap: 4,
  }}>
    <span style={{ fontSize: 22 }}>🏗️</span>
    <span>LOGO</span>
  </div>
  </div>
              <h1 style={{ ...mono, color: 'white', fontWeight: 700,
                fontSize: 'clamp(22px, 7vw, 32px)', letterSpacing: '0.15em',
                textShadow: '0 0 20px rgba(96,184,255,0.5)' }}>
                AESL
              </h1>
              <p style={{ ...mono, color: 'rgba(96,184,255,0.7)',
                fontSize: 'clamp(8px, 2.5vw, 12px)', letterSpacing: '0.2em' }}>
                DOCUMENT MANAGEMENT SYSTEM
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              {(['LOGIN','SIGN UP'] as const).map((label, i) => {
                const active = i === 0 ? isLogin : !isLogin;
                return (
                  <button key={label} onClick={() => setIsLogin(i === 0)}
                    className="flex-1 py-2 rounded-lg transition-all"
                    style={{ ...mono,
                      background: active ? 'rgba(96,184,255,0.2)' : 'transparent',
                      border: active ? '1px solid rgba(96,184,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
                      color: active ? '#60b8ff' : 'rgba(255,255,255,0.45)',
                      fontSize: 'clamp(10px,3vw,13px)', letterSpacing: '0.1em', cursor: 'pointer',
                    }}>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Fields */}
            <div className="space-y-3">
              {!isLogin && (
                <input type="text" placeholder="FULL NAME" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="bp-input" style={inputStyle} />
              )}
              <input type="email" placeholder="EMAIL ADDRESS" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="bp-input" style={inputStyle} />
              <input type="password" placeholder="PASSWORD" value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                onKeyPress={e => e.key === 'Enter' && handleAuth()}
                className="bp-input" style={inputStyle} />
              <button onClick={handleAuth}
                className="w-full py-3 rounded-lg transition-all hover:scale-[1.02]"
                style={{ ...mono,
                  background: 'linear-gradient(135deg,rgba(96,184,255,0.3),rgba(96,184,255,0.15))',
                  border: '1px solid rgba(96,184,255,0.6)', color: '#60b8ff',
                  fontSize: 'clamp(11px,3vw,13px)', letterSpacing: '0.15em',
                  boxShadow: '0 0 20px rgba(96,184,255,0.2)', cursor: 'pointer',
                }}>
                {isLogin ? '[ AUTHENTICATE ]' : '[ CREATE ACCOUNT ]'}
              </button>
            </div>

          </GlassCard>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  DEPARTMENT SELECTION
  // ══════════════════════════════════════════════════════════════════════════
  if (!selectedDept) {
    return (
      <div className="relative min-h-screen p-3 sm:p-5 lg:p-6 pb-10">
        <BlueprintBackground />
        <div className="relative z-10 max-w-6xl mx-auto">

          {/* Header */}
          <GlassCard className="p-4 sm:p-5 mb-4">
            <div className="flex items-center justify-between hdr-wrap">
              <div>
                <h1 style={{ ...mono, color: 'white', fontWeight: 700,
                  fontSize: 'clamp(13px,4vw,22px)', letterSpacing: '0.1em',
                  textShadow: '0 0 15px rgba(96,184,255,0.4)' }}>
                  AESL DOCUMENT SYSTEM
                </h1>
                <p style={{ ...mono, color: 'rgba(96,184,255,0.6)',
                  fontSize: 'clamp(8px,2.2vw,11px)', letterSpacing: '0.08em' }}>
                  OPERATOR: {user.name.toUpperCase()}
                </p>
              </div>
              <div className="flex items-center gap-2 hdr-actions flex-wrap">
                <button onClick={() => setShowContactForm(true)} style={btnBlue()}>CONTACT</button>
                <button onClick={handleLogout} style={btnRed()}>
                  <LogOut className="w-3 h-3" /> LOGOUT
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Dept cards */}
          <GlassCard className="p-4 sm:p-6">
            <h2 style={sectionTitle}>SELECT DEPARTMENT</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {DEPARTMENTS.map(dept => {
                const Icon  = dept.icon;
                const count = files[dept.id]?.length || 0;
                return (
                  <button key={dept.id} onClick={() => handleDepartmentClick(dept.id)}
                    className="p-4 sm:p-5 rounded-xl text-left transition-all hover:scale-[1.01]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(96,184,255,0.2)', cursor: 'pointer' }}
                    onMouseEnter={e => { const b=e.currentTarget; b.style.border='1px solid rgba(96,184,255,0.6)'; b.style.background='rgba(96,184,255,0.08)'; }}
                    onMouseLeave={e => { const b=e.currentTarget; b.style.border='1px solid rgba(96,184,255,0.2)'; b.style.background='rgba(255,255,255,0.04)'; }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${dept.color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h3 style={{ ...mono, color: 'white', fontWeight: 600,
                          fontSize: 'clamp(11px,3vw,14px)', letterSpacing: '0.06em', marginBottom: 4 }}>
                          {dept.name.toUpperCase()}
                        </h3>
                        <p style={{ ...mono, color: 'rgba(96,184,255,0.6)', fontSize: 'clamp(9px,2vw,11px)' }}>
                          {count} FILES AVAILABLE
                        </p>
                        <p style={{ ...mono, color: 'rgba(255,200,80,0.7)', fontSize: 'clamp(8px,1.8vw,10px)', marginTop: 5 }}>
                          🔒 RESTRICTED ACCESS
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Password Modal */}
        {showPasswordPrompt && selectedDeptForAccess && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
            <GlassCard className="p-6 sm:p-8 w-full" style={{ maxWidth: 420 }}>
              <h2 style={{ ...mono, color: '#60b8ff', fontWeight: 700,
                fontSize: 'clamp(14px,4vw,20px)', letterSpacing: '0.1em',
                textShadow: '0 0 10px rgba(96,184,255,0.4)', marginBottom: 8 }}>
                ACCESS CONTROL
              </h2>
              <p style={{ ...mono, color: 'rgba(255,255,255,0.55)',
                fontSize: 'clamp(9px,2.5vw,12px)', marginBottom: 18 }}>
                CLEARANCE REQUIRED: {DEPARTMENTS.find(d => d.id === selectedDeptForAccess)?.name.toUpperCase()}
              </p>
              <input type="password" value={deptPassword}
                onChange={e => setDeptPassword(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="ENTER ACCESS CODE"
                className="bp-input"
                style={{ ...inputStyle, letterSpacing: '0.2em', marginBottom: 14 }}
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={handleCancelPassword} style={{ ...btnGhost(), flex: 1, justifyContent: 'center', padding: '12px' }}>
                  CANCEL
                </button>
                <button onClick={handlePasswordSubmit} style={{ ...btnBlue(), flex: 1, justifyContent: 'center', padding: '12px' }}>
                  AUTHENTICATE
                </button>
              </div>
              <div className="mt-4 p-3 rounded-lg"
                style={{ background: 'rgba(255,200,80,0.05)', border: '1px solid rgba(255,200,80,0.2)' }}>
                <p style={{ ...mono, color: 'rgba(255,200,80,0.7)', fontSize: 'clamp(8px,2vw,10px)' }}>
                  DEMO CODES: elec2026 · build2026 · struct2026 · qty2026
                </p>
              </div>
            </GlassCard>
          </div>
        )}

        {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  FILE VIEW
  // ══════════════════════════════════════════════════════════════════════════
  const currentDept = DEPARTMENTS.find(d => d.id === selectedDept);
  if (!currentDept) return null;
  const Icon      = currentDept.icon;
  const deptFiles = files[selectedDept] || [];

  return (
    <div className="relative min-h-screen p-3 sm:p-5 lg:p-6 pb-10">
      <BlueprintBackground />
      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <GlassCard className="p-4 sm:p-5 mb-4">
          <div className="flex items-center justify-between hdr-wrap">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button onClick={() => setSelectedDept(null)} style={btnGhost()}>← BACK</button>
              <div className={`${currentDept.color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 style={{ ...mono, color: 'white', fontWeight: 700,
                  fontSize: 'clamp(12px,3.5vw,20px)', letterSpacing: '0.1em',
                  textShadow: '0 0 12px rgba(96,184,255,0.3)' }}>
                  {currentDept.name.toUpperCase()}
                </h1>
                <p style={{ ...mono, color: 'rgba(96,184,255,0.6)', fontSize: 'clamp(8px,2vw,11px)' }}>
                  {deptFiles.length} FILES IN REPOSITORY
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 hdr-actions flex-wrap">
              <button onClick={() => setShowContactForm(true)} style={btnBlue()}>CONTACT</button>
              <button onClick={handleLogout} style={btnRed()}>
                <LogOut className="w-3 h-3" /> LOGOUT
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Upload */}
        <GlassCard className="p-4 sm:p-5 mb-4">
          <h2 style={sectionTitle}>UPLOAD DOCUMENT</h2>
          <div className="flex items-center gap-3">
            <input type="file" accept=".dwg,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileUpload}
              className="flex-1 rounded-lg outline-none bp-input"
              style={{ ...inputStyle, fontSize: 'clamp(10px,2.5vw,12px)' }} />
            <Upload className="w-5 h-5 flex-shrink-0" style={{ color: '#60b8ff' }} />
          </div>
          <p style={{ ...mono, color: 'rgba(96,184,255,0.4)', fontSize: 'clamp(8px,2vw,10px)', marginTop: 8 }}>
            ACCEPTED: .dwg · .pdf · .doc · .docx · .xls · .xlsx
          </p>
        </GlassCard>

        {/* File list */}
        <GlassCard className="p-4 sm:p-5">
          <h2 style={sectionTitle}>DOCUMENT REPOSITORY</h2>

          {deptFiles.length === 0 ? (
            <div className="text-center py-10 sm:py-14">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: 'rgba(96,184,255,0.2)' }} />
              <p style={{ ...mono, color: 'rgba(96,184,255,0.4)', fontSize: 'clamp(10px,2.5vw,12px)', letterSpacing: '0.1em' }}>
                NO FILES IN REPOSITORY
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {deptFiles.map((file, idx) => (
                <div key={idx}
                  className="file-row flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(96,184,255,0.15)' }}
                  onMouseEnter={e => { const el=e.currentTarget; el.style.border='1px solid rgba(96,184,255,0.4)'; el.style.background='rgba(96,184,255,0.05)'; }}
                  onMouseLeave={e => { const el=e.currentTarget; el.style.border='1px solid rgba(96,184,255,0.15)'; el.style.background='rgba(255,255,255,0.03)'; }}
                >
                  {/* Info */}
                  <div className="file-info flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" style={{ color: '#60b8ff' }} />
                    <div className="min-w-0">
                      <h3 className="truncate" style={{ ...mono, color: 'white', fontWeight: 600,
                        fontSize: 'clamp(10px,2.8vw,13px)' }}>
                        {file.name}
                      </h3>
                      <p style={{ ...mono, color: 'rgba(96,184,255,0.5)', fontSize: 'clamp(8px,2vw,10px)' }}>
                        {file.uploadedBy.toUpperCase()} · {new Date(file.uploadedAt).toLocaleDateString()} · {(file.size/1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="file-actions flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button onClick={() => handleDownload(file)} style={btnBlue()}>
                      <Download className="w-3 h-3" />
                      <span className="hidden sm:inline">DL</span>
                    </button>

                    <div className="relative">
                      <button onClick={() => setShowShareMenu(showShareMenu === idx ? null : idx)} style={btnGreen()}>
                        <Share2 className="w-3 h-3" />
                        <span className="hidden sm:inline">SHARE</span>
                      </button>
                      {showShareMenu === idx && (
                        <div className="absolute right-0 mt-2 w-40 sm:w-44 rounded-lg z-20 overflow-hidden"
                          style={{ background: 'rgba(3,17,31,0.97)', border: '1px solid rgba(96,184,255,0.3)', backdropFilter: 'blur(10px)' }}>
                          {[['whatsapp','📱 WhatsApp'],['facebook','📘 Facebook'],['twitter','🐦 Twitter'],['linkedin','💼 LinkedIn'],['email','✉️ Email']].map(([p, l]) => (
                            <button key={p} onClick={() => handleShare(file, p)}
                              className="w-full text-left px-3 py-2 transition-all"
                              style={{ ...mono, color: 'rgba(96,184,255,0.8)', fontSize: 'clamp(10px,2.5vw,12px)' }}
                              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='rgba(96,184,255,0.1)'}
                              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='transparent'}>
                              {l}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button onClick={() => handleDelete(idx)} style={btnRed()}>
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden sm:inline">DEL</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
    </div>
  );
} 
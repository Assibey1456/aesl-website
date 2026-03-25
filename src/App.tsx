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
  { id: 'electrical', name: 'Electrical', icon: Zap, color: 'bg-yellow-500' },
  { id: 'building', name: 'Building Structures', icon: Building2, color: 'bg-blue-500' },
  { id: 'structural', name: 'Structural', icon: Construction, color: 'bg-green-500' },
  { id: 'quantity', name: 'Quantity Surveying', icon: Calculator, color: 'bg-purple-500' }
];

const DEPT_PASSWORDS: { [key: string]: string } = {
  electrical: 'elec2026',
  building: 'build2026',
  structural: 'struct2026',
  quantity: 'qty2026'
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
  }
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
          50%       { opacity: 0.7; }
        }
        @keyframes draw-h {
          from { stroke-dashoffset: 2000; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes draw-v {
          from { stroke-dashoffset: 2000; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes fade-in-blueprint {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 2px #60b8ff88); }
          50%       { filter: drop-shadow(0 0 10px #60b8ffcc); }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
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
        .bp-grid-large {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(50,140,220,0.22) 1px, transparent 1px),
            linear-gradient(90deg, rgba(50,140,220,0.22) 1px, transparent 1px);
          background-size: 200px 200px;
        }
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

        /* ── Global box-sizing fix ── */
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Shared input placeholder ── */
        .bp-input::placeholder { color: rgba(96,184,255,0.35); }

        /* ════════════════════════════════════════
           HEADER  — stacks on mobile
        ════════════════════════════════════════ */
        .hdr-outer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;          /* wraps to next line on small screens */
        }
        .hdr-left  { min-width: 0; flex: 1 1 auto; }
        .hdr-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        /* On very small phones, right side fills full width */
        @media (max-width: 400px) {
          .hdr-outer  { flex-direction: column; align-items: flex-start; }
          .hdr-right  { width: 100%; justify-content: flex-end; }
          .hdr-right button { flex: 1; justify-content: center; }
        }

        /* ════════════════════════════════════════
           DEPARTMENT CARDS — single column <480px
        ════════════════════════════════════════ */
        .dept-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 540px) {
          .dept-grid { grid-template-columns: 1fr; gap: 12px; }
        }

        /* ════════════════════════════════════════
           FILE ROWS — stack on mobile
        ════════════════════════════════════════ */
        .file-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px;
          border-radius: 10px;
          transition: all 0.15s ease;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(96,184,255,0.15);
        }
        .file-row:hover {
          border-color: rgba(96,184,255,0.4);
          background: rgba(96,184,255,0.05);
        }
        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }
        .file-info-text { min-width: 0; }
        .file-info-text h3 {
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Courier New', monospace;
          font-size: clamp(10px, 2.8vw, 13px);
          color: white;
          font-weight: 600;
        }
        .file-info-text p {
          margin: 2px 0 0;
          font-family: 'Courier New', monospace;
          font-size: clamp(8px, 2vw, 10px);
          color: rgba(96,184,255,0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .file-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        /* Stack file rows on phones */
        @media (max-width: 580px) {
          .file-row     { flex-direction: column; align-items: flex-start; }
          .file-info    { width: 100%; }
          .file-actions { width: 100%; flex-wrap: wrap; }
          .file-actions button { flex: 1; justify-content: center; min-width: 64px; }
        }

        /* ════════════════════════════════════════
           ACTION BUTTONS — shared base
        ════════════════════════════════════════ */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Courier New', monospace;
          font-size: clamp(10px, 2.4vw, 12px);
          letter-spacing: 0.06em;
          white-space: nowrap;
          transition: opacity 0.15s;
        }
        .btn:hover { opacity: 0.85; }
        .btn-blue  { background: rgba(96,184,255,0.18); border: 1px solid rgba(96,184,255,0.5);  color: #60b8ff; }
        .btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); }
        .btn-red   { background: rgba(255,80,80,0.15);  border: 1px solid rgba(255,80,80,0.4);   color: #ff6060; }
        .btn-green { background: rgba(80,200,120,0.15); border: 1px solid rgba(80,200,120,0.4);  color: #50c878; }

        /* ════════════════════════════════════════
           LOGIN CARD — responsive padding
        ════════════════════════════════════════ */
        .login-card-inner {
          padding: clamp(16px, 5vw, 32px);
        }

        /* ════════════════════════════════════════
           SECTION CARDS — responsive padding
        ════════════════════════════════════════ */
        .section-card {
          padding: clamp(14px, 3vw, 24px);
        }

        /* ════════════════════════════════════════
           TYPOGRAPHY helpers
        ════════════════════════════════════════ */
        .mono { font-family: 'Courier New', monospace; }
        .section-label {
          font-family: 'Courier New', monospace;
          color: rgba(96,184,255,0.8);
          font-size: clamp(10px, 2.5vw, 13px);
          letter-spacing: 0.15em;
          border-bottom: 1px solid rgba(96,184,255,0.2);
          padding-bottom: 10px;
          margin-bottom: 16px;
          font-weight: 700;
        }

        /* ════════════════════════════════════════
           FORM INPUTS
        ════════════════════════════════════════ */
        .bp-field {
          width: 100%;
          padding: 11px 14px;
          border-radius: 8px;
          outline: none;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(96,184,255,0.3);
          color: white;
          font-family: 'Courier New', monospace;
          font-size: clamp(11px, 3vw, 13px);
          letter-spacing: 0.08em;
          transition: border-color 0.15s;
        }
        .bp-field:focus { border-color: rgba(96,184,255,0.7); }

        /* ════════════════════════════════════════
           PAGE LAYOUT
        ════════════════════════════════════════ */
        .page-wrap {
          position: relative;
          min-height: 100svh;            /* svh = small viewport height — safe on mobile */
          padding: clamp(10px, 3vw, 24px);
          padding-bottom: 48px;           /* clear the ticker tape */
        }
        .page-inner {
          position: relative;
          z-index: 10;
          max-width: 960px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: clamp(10px, 2vw, 20px);
        }
      `}</style>

      <div className="bp-container">
        <div className="bp-grid" />
        <div className="bp-grid-large" />
        <svg className="bp-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <line className="bp-line-h" x1="0" y1="180" x2="1440" y2="180" />
          <line className="bp-line-h" x1="0" y1="450" x2="1440" y2="450" />
          <line className="bp-line-h" x1="0" y1="700" x2="1440" y2="700" />
          <line className="bp-line-h" x1="200" y1="80" x2="900" y2="80" />
          <line className="bp-line-v" x1="320" y1="0" x2="320" y2="900" />
          <line className="bp-line-v" x1="850" y1="0" x2="850" y2="900" />
          <line className="bp-line-v" x1="1200" y1="0" x2="1200" y2="900" />
          <circle className="bp-circle" cx="720" cy="450" r="320" />
          <circle className="bp-circle-2" cx="720" cy="450" r="200" />
          <circle className="bp-circle-2" cx="720" cy="450" r="420" />
          <rect x="430" y="220" width="580" height="340" fill="none" stroke="rgba(96,184,255,0.22)" strokeWidth="1" strokeDasharray="1600" strokeDashoffset="1600" style={{ animation: 'draw-h 6s ease forwards 1s' }} />
          <rect x="480" y="260" width="480" height="260" fill="none" stroke="rgba(96,184,255,0.15)" strokeWidth="0.8" strokeDasharray="1400" strokeDashoffset="1400" style={{ animation: 'draw-h 6s ease forwards 1.5s' }} />
          <line stroke="rgba(96,184,255,0.2)" strokeWidth="0.8" x1="620" y1="260" x2="620" y2="520" strokeDasharray="300" strokeDashoffset="300" style={{ animation: 'draw-v 4s ease forwards 2s' }} />
          <line stroke="rgba(96,184,255,0.2)" strokeWidth="0.8" x1="480" y1="370" x2="960" y2="370" strokeDasharray="500" strokeDashoffset="500" style={{ animation: 'draw-h 4s ease forwards 2.2s' }} />
          <line className="bp-dim" x1="430" y1="200" x2="1010" y2="200" />
          <line className="bp-dim" x1="430" y1="196" x2="430" y2="204" />
          <line className="bp-dim" x1="1010" y1="196" x2="1010" y2="204" />
          <line className="bp-dim" x1="410" y1="220" x2="410" y2="560" />
          <line className="bp-dim" x1="406" y1="220" x2="414" y2="220" />
          <line className="bp-dim" x1="406" y1="560" x2="414" y2="560" />
          <polyline className="bp-corner" points="40,30 40,80 90,80" />
          <polyline className="bp-corner" points="1400,30 1400,80 1350,80" style={{ animationDelay: '0.3s' }} />
          <polyline className="bp-corner" points="40,870 40,820 90,820" style={{ animationDelay: '0.6s' }} />
          <polyline className="bp-corner" points="1400,870 1400,820 1350,820" style={{ animationDelay: '0.9s' }} />
          <g className="bp-compass" transform="translate(1340,130)">
            <circle cx="0" cy="0" r="40" fill="none" stroke="rgba(96,184,255,0.3)" strokeWidth="1" />
            <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(96,184,255,0.2)" strokeWidth="0.7" />
            <line x1="0" y1="-40" x2="0" y2="40" stroke="rgba(96,184,255,0.5)" strokeWidth="1" />
            <line x1="-40" y1="0" x2="40" y2="0" stroke="rgba(96,184,255,0.5)" strokeWidth="1" />
            <polygon points="0,-38 4,-10 0,-18 -4,-10" fill="rgba(96,184,255,0.8)" />
            <text x="0" y="-46" textAnchor="middle" fontSize="10" fill="rgba(96,184,255,0.8)" fontFamily="Courier New">N</text>
          </g>
          <circle className="bp-dot" cx="320" cy="180" r="3" />
          <circle className="bp-dot" cx="850" cy="180" r="3" />
          <circle className="bp-dot" cx="320" cy="450" r="3" />
          <circle className="bp-dot" cx="850" cy="450" r="3" />
          <circle className="bp-dot" cx="720" cy="450" r="4" />
          <rect x="55" y="170" width="80" height="20" fill="rgba(3,17,31,0.7)" stroke="rgba(96,184,255,0.4)" strokeWidth="0.8" rx="2" />
          <text x="95" y="184" textAnchor="middle" fontSize="8" fill="rgba(96,184,255,0.7)" fontFamily="Courier New">ELEV. +0.00</text>
          <rect x="1100" y="440" width="90" height="20" fill="rgba(3,17,31,0.7)" stroke="rgba(96,184,255,0.4)" strokeWidth="0.8" rx="2" />
          <text x="1145" y="454" textAnchor="middle" fontSize="8" fill="rgba(96,184,255,0.7)" fontFamily="Courier New">GRID REF: B4</text>
          <rect x="55" y="440" width="80" height="20" fill="rgba(3,17,31,0.7)" stroke="rgba(96,184,255,0.4)" strokeWidth="0.8" rx="2" />
          <text x="95" y="454" textAnchor="middle" fontSize="8" fill="rgba(96,184,255,0.7)" fontFamily="Courier New">SCALE 1:100</text>
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
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl ${className}`}
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}
    >
      {children}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [files, setFiles] = useState<FilesState>({});
  const [showShareMenu, setShowShareMenu] = useState<number | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [selectedDeptForAccess, setSelectedDeptForAccess] = useState<string | null>(null);
  const [deptPassword, setDeptPassword] = useState('');

  useEffect(() => {
    try {
      const userData = storage.get('user');
      if (userData) setUser(JSON.parse(userData.value));
      const filesData = storage.get('files');
      if (filesData) setFiles(JSON.parse(filesData.value));
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
          if (u.password === formData.password) {
            setUser(u); saveUser(u); setFormData({ email: '', password: '', name: '' });
          } else { alert('Invalid credentials'); }
        } else { alert('User not found'); }
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
    const allowed = ['.dwg', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
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

  const handleDownload = (file: FileData) =>
    alert(`Downloading: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB`);

  const handleDelete = (i: number) => {
    if (!selectedDept || !confirm('Are you sure you want to delete this file?')) return;
    const nf = { ...files };
    nf[selectedDept] = nf[selectedDept].filter((_, idx) => idx !== i);
    setFiles(nf); saveFiles(nf);
    alert('File deleted successfully!');
  };

  const handleShare = (file: FileData, platform: string) => {
    const txt = encodeURIComponent(`Check out this file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${txt}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${txt}`,
      twitter:  `https://twitter.com/intent/tweet?text=${txt}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      email:    `mailto:?subject=File Share&body=${txt}`,
    };
    if (urls[platform]) { window.open(urls[platform], '_blank'); setShowShareMenu(null); }
  };

  const handleLogout          = () => { setUser(null); setSelectedDept(null); };
  const handleDepartmentClick = (id: string) => { setSelectedDeptForAccess(id); setShowPasswordPrompt(true); setDeptPassword(''); };
  const handleCancelPassword  = () => { setShowPasswordPrompt(false); setDeptPassword(''); setSelectedDeptForAccess(null); };
  const handlePasswordSubmit  = () => {
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
      <div className="relative min-h-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(12px,4vw,24px)' }}>
        <BlueprintBackground />
        <div className="relative" style={{ zIndex: 10, width: '100%', maxWidth: 440 }}>
          <GlassCard>
            <div className="login-card-inner">

              {/* Logo */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ display: 'inline-block', marginBottom: 14 }}>
                  <img
                    src="/aesl_logo.jpg"
                    alt="AESL Logo"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fb = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fb) fb.style.display = 'flex';
                    }}
                    style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 12, display: 'block' }}
                  />
                  {/* Fallback — hidden until img fails */}
                  <div style={{
                    display: 'none', alignItems: 'center', justifyContent: 'center',
                    width: 80, height: 80, borderRadius: 12,
                    background: 'rgba(96,184,255,0.15)', border: '2px dashed rgba(96,184,255,0.5)',
                    color: 'rgba(96,184,255,0.7)', fontFamily: 'Courier New, monospace',
                    fontSize: 10, flexDirection: 'column', gap: 4,
                  }}>
                    <span style={{ fontSize: 22 }}>🏗️</span>
                    <span>LOGO</span>
                  </div>
                </div>
                <h1 style={{
                  fontFamily: 'Courier New, monospace', color: 'white', fontWeight: 700,
                  fontSize: 'clamp(24px, 7vw, 34px)', letterSpacing: '0.15em', margin: 0,
                  textShadow: '0 0 20px rgba(96,184,255,0.5)',
                }}>AESL</h1>
                <p style={{
                  fontFamily: 'Courier New, monospace', color: 'rgba(96,184,255,0.7)',
                  fontSize: 'clamp(8px, 2.5vw, 12px)', letterSpacing: '0.2em', margin: '4px 0 0',
                }}>DOCUMENT MANAGEMENT SYSTEM</p>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {(['LOGIN', 'SIGN UP'] as const).map((label, i) => {
                  const active = i === 0 ? isLogin : !isLogin;
                  return (
                    <button key={label} onClick={() => setIsLogin(i === 0)}
                      style={{
                        flex: 1, padding: '9px 4px', borderRadius: 8,
                        fontFamily: 'Courier New, monospace',
                        fontSize: 'clamp(10px, 3vw, 13px)', letterSpacing: '0.1em',
                        cursor: 'pointer',
                        background: active ? 'rgba(96,184,255,0.2)' : 'transparent',
                        border: active ? '1px solid rgba(96,184,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
                        color: active ? '#60b8ff' : 'rgba(255,255,255,0.45)',
                      }}>
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {!isLogin && (
                  <input className="bp-field bp-input" type="text" placeholder="FULL NAME"
                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                )}
                <input className="bp-field bp-input" type="email" placeholder="EMAIL ADDRESS"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                <input className="bp-field bp-input" type="password" placeholder="PASSWORD"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  onKeyPress={e => e.key === 'Enter' && handleAuth()} />
                <button onClick={handleAuth} style={{
                  width: '100%', padding: '12px', borderRadius: 8,
                  background: 'linear-gradient(135deg, rgba(96,184,255,0.3), rgba(96,184,255,0.15))',
                  border: '1px solid rgba(96,184,255,0.6)', color: '#60b8ff',
                  fontFamily: 'Courier New, monospace', fontSize: 'clamp(11px,3vw,13px)',
                  letterSpacing: '0.15em', boxShadow: '0 0 20px rgba(96,184,255,0.2)', cursor: 'pointer',
                }}>
                  {isLogin ? '[ AUTHENTICATE ]' : '[ CREATE ACCOUNT ]'}
                </button>
              </div>

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
      <div className="page-wrap">
        <BlueprintBackground />
        <div className="page-inner">

          {/* Header */}
          <GlassCard>
            <div className="section-card">
              <div className="hdr-outer">
                <div className="hdr-left">
                  <h1 style={{
                    fontFamily: 'Courier New, monospace', color: 'white', fontWeight: 700,
                    fontSize: 'clamp(14px, 4vw, 22px)', letterSpacing: '0.1em', margin: 0,
                    textShadow: '0 0 15px rgba(96,184,255,0.4)',
                  }}>AESL DOCUMENT SYSTEM</h1>
                  <p style={{
                    fontFamily: 'Courier New, monospace', color: 'rgba(96,184,255,0.6)',
                    fontSize: 'clamp(9px, 2.2vw, 11px)', letterSpacing: '0.08em', margin: '3px 0 0',
                  }}>OPERATOR: {user.name.toUpperCase()}</p>
                </div>
                <div className="hdr-right">
                  <button className="btn btn-blue" onClick={() => setShowContactForm(true)}>CONTACT</button>
                  <button className="btn btn-red" onClick={handleLogout}>
                    <LogOut style={{ width: 13, height: 13 }} /> LOGOUT
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Department Cards */}
          <GlassCard>
            <div className="section-card">
              <h2 className="section-label">SELECT DEPARTMENT</h2>
              <div className="dept-grid">
                {DEPARTMENTS.map(dept => {
                  const Icon = dept.icon;
                  const count = files[dept.id]?.length || 0;
                  return (
                    <button key={dept.id} onClick={() => handleDepartmentClick(dept.id)}
                      style={{
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(96,184,255,0.2)',
                        borderRadius: 12, padding: 'clamp(12px,3vw,20px)',
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { const b = e.currentTarget; b.style.border = '1px solid rgba(96,184,255,0.6)'; b.style.background = 'rgba(96,184,255,0.08)'; }}
                      onMouseLeave={e => { const b = e.currentTarget; b.style.border = '1px solid rgba(96,184,255,0.2)'; b.style.background = 'rgba(255,255,255,0.04)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div className={dept.color} style={{ padding: 10, borderRadius: 8, flexShrink: 0, boxShadow: '0 0 12px rgba(96,184,255,0.2)' }}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{
                            fontFamily: 'Courier New, monospace', color: 'white', fontWeight: 600,
                            fontSize: 'clamp(11px, 2.8vw, 14px)', letterSpacing: '0.06em', margin: '0 0 4px',
                          }}>{dept.name.toUpperCase()}</h3>
                          <p style={{ fontFamily: 'Courier New, monospace', color: 'rgba(96,184,255,0.6)', fontSize: 'clamp(9px,2vw,11px)', margin: 0 }}>
                            {count} FILES AVAILABLE
                          </p>
                          <p style={{ fontFamily: 'Courier New, monospace', color: 'rgba(255,200,80,0.7)', fontSize: 'clamp(8px,1.8vw,10px)', margin: '5px 0 0' }}>
                            🔒 RESTRICTED ACCESS
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Password Modal */}
        {showPasswordPrompt && selectedDeptForAccess && (
          <div style={{
            position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, zIndex: 50, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          }}>
            <GlassCard>
              <div style={{ padding: 'clamp(20px,5vw,32px)', width: '100%', maxWidth: 420 }}>
                <h2 style={{
                  fontFamily: 'Courier New, monospace', color: '#60b8ff', fontWeight: 700,
                  fontSize: 'clamp(14px,4vw,20px)', letterSpacing: '0.1em',
                  textShadow: '0 0 10px rgba(96,184,255,0.4)', margin: '0 0 8px',
                }}>ACCESS CONTROL</h2>
                <p style={{
                  fontFamily: 'Courier New, monospace', color: 'rgba(255,255,255,0.55)',
                  fontSize: 'clamp(9px,2.5vw,12px)', margin: '0 0 18px',
                }}>
                  CLEARANCE REQUIRED: {DEPARTMENTS.find(d => d.id === selectedDeptForAccess)?.name.toUpperCase()}
                </p>
                <input
                  className="bp-field bp-input"
                  type="password" value={deptPassword} autoFocus
                  onChange={e => setDeptPassword(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="ENTER ACCESS CODE"
                  style={{ letterSpacing: '0.2em', marginBottom: 14 }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost" onClick={handleCancelPassword}
                    style={{ flex: 1, justifyContent: 'center', padding: '11px' }}>CANCEL</button>
                  <button className="btn btn-blue" onClick={handlePasswordSubmit}
                    style={{ flex: 1, justifyContent: 'center', padding: '11px' }}>AUTHENTICATE</button>
                </div>
                <div style={{
                  marginTop: 14, padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(255,200,80,0.05)', border: '1px solid rgba(255,200,80,0.2)',
                }}>
                  <p style={{ fontFamily: 'Courier New, monospace', color: 'rgba(255,200,80,0.7)', fontSize: 'clamp(8px,2vw,10px)', margin: 0 }}>
                    DEMO CODES: elec2026 · build2026 · struct2026 · qty2026
                  </p>
                </div>
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
  const Icon = currentDept.icon;
  const deptFiles = files[selectedDept] || [];

  return (
    <div className="page-wrap">
      <BlueprintBackground />
      <div className="page-inner">

        {/* Header */}
        <GlassCard>
          <div className="section-card">
            <div className="hdr-outer">
              <div className="hdr-left" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minWidth: 0 }}>
                <button className="btn btn-ghost" onClick={() => setSelectedDept(null)}>← BACK</button>
                <div className={currentDept.color} style={{ padding: 8, borderRadius: 8, flexShrink: 0, boxShadow: '0 0 12px rgba(96,184,255,0.2)' }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h1 style={{
                    fontFamily: 'Courier New, monospace', color: 'white', fontWeight: 700,
                    fontSize: 'clamp(12px,3.5vw,20px)', letterSpacing: '0.1em', margin: 0,
                    textShadow: '0 0 12px rgba(96,184,255,0.3)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{currentDept.name.toUpperCase()}</h1>
                  <p style={{
                    fontFamily: 'Courier New, monospace', color: 'rgba(96,184,255,0.6)',
                    fontSize: 'clamp(8px,2vw,11px)', margin: '2px 0 0',
                  }}>{deptFiles.length} FILES IN REPOSITORY</p>
                </div>
              </div>
              <div className="hdr-right">
                <button className="btn btn-blue" onClick={() => setShowContactForm(true)}>CONTACT</button>
                <button className="btn btn-red" onClick={handleLogout}>
                  <LogOut style={{ width: 13, height: 13 }} /> LOGOUT
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Upload */}
        <GlassCard>
          <div className="section-card">
            <h2 className="section-label">UPLOAD DOCUMENT</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                className="bp-field bp-input"
                type="file" accept=".dwg,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
                style={{ flex: 1, fontSize: 'clamp(10px,2.5vw,12px)', cursor: 'pointer' }}
              />
              <Upload style={{ color: '#60b8ff', width: 18, height: 18, flexShrink: 0 }} />
            </div>
            <p style={{
              fontFamily: 'Courier New, monospace', color: 'rgba(96,184,255,0.4)',
              fontSize: 'clamp(8px,2vw,10px)', margin: '8px 0 0',
            }}>ACCEPTED: .dwg · .pdf · .doc · .docx · .xls · .xlsx</p>
          </div>
        </GlassCard>

        {/* File List */}
        <GlassCard>
          <div className="section-card">
            <h2 className="section-label">DOCUMENT REPOSITORY</h2>

            {deptFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <FileText style={{ width: 56, height: 56, color: 'rgba(96,184,255,0.2)', margin: '0 auto 12px' }} />
                <p style={{
                  fontFamily: 'Courier New, monospace', color: 'rgba(96,184,255,0.4)',
                  fontSize: 'clamp(10px,2.5vw,12px)', letterSpacing: '0.1em', margin: 0,
                }}>NO FILES IN REPOSITORY</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {deptFiles.map((file, idx) => (
                  <div key={idx} className="file-row">

                    {/* File info */}
                    <div className="file-info">
                      <FileText style={{ color: '#60b8ff', width: 28, height: 28, flexShrink: 0 }} />
                      <div className="file-info-text">
                        <h3>{file.name}</h3>
                        <p>{file.uploadedBy.toUpperCase()} · {new Date(file.uploadedAt).toLocaleDateString()} · {(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="file-actions">
                      <button className="btn btn-blue" onClick={() => handleDownload(file)}>
                        <Download style={{ width: 12, height: 12 }} /> DL
                      </button>

                      <div style={{ position: 'relative' }}>
                        <button className="btn btn-green" onClick={() => setShowShareMenu(showShareMenu === idx ? null : idx)}>
                          <Share2 style={{ width: 12, height: 12 }} /> SHARE
                        </button>
                        {showShareMenu === idx && (
                          <div style={{
                            position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                            width: 170, borderRadius: 10, zIndex: 20, overflow: 'hidden',
                            background: 'rgba(3,17,31,0.97)', border: '1px solid rgba(96,184,255,0.3)',
                            backdropFilter: 'blur(10px)',
                          }}>
                            {[['whatsapp','📱 WhatsApp'],['facebook','📘 Facebook'],['twitter','🐦 Twitter'],['linkedin','💼 LinkedIn'],['email','✉️ Email']].map(([p, l]) => (
                              <button key={p} onClick={() => handleShare(file, p)}
                                style={{
                                  width: '100%', textAlign: 'left', padding: '9px 14px',
                                  background: 'transparent', border: 'none', cursor: 'pointer',
                                  fontFamily: 'Courier New, monospace', color: 'rgba(96,184,255,0.8)',
                                  fontSize: 'clamp(10px,2.5vw,12px)',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(96,184,255,0.1)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                {l}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button className="btn btn-red" onClick={() => handleDelete(idx)}>
                        <Trash2 style={{ width: 12, height: 12 }} /> DEL
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

      </div>

      {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
    </div>
  );
}
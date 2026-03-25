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
        @keyframes rotate-compass {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .bp-container {
          position: fixed;
          inset: 0;
          background: #03111f;
          overflow: hidden;
          z-index: 0;
        }

        /* Fine grid */
        .bp-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(50, 140, 220, 0.10) 1px, transparent 1px),
            linear-gradient(90deg, rgba(50, 140, 220, 0.10) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Large grid overlay */
        .bp-grid-large {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(50, 140, 220, 0.22) 1px, transparent 1px),
            linear-gradient(90deg, rgba(50, 140, 220, 0.22) 1px, transparent 1px);
          background-size: 200px 200px;
        }

        /* Scanline sweep */
        .bp-scanline {
          position: absolute;
          left: 0; right: 0;
          height: 3px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(96, 184, 255, 0.18) 40%,
            rgba(96, 184, 255, 0.38) 50%,
            rgba(96, 184, 255, 0.18) 60%,
            transparent
          );
          animation: scanline 6s linear infinite;
          pointer-events: none;
        }

        /* SVG drawing lines */
        .bp-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          animation: fade-in-blueprint 2s ease forwards;
        }

        .bp-line-h {
          stroke: rgba(96, 184, 255, 0.45);
          stroke-width: 1;
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: draw-h 5s ease forwards;
        }
        .bp-line-v {
          stroke: rgba(96, 184, 255, 0.45);
          stroke-width: 1;
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: draw-v 5s ease forwards;
        }
        .bp-line-h:nth-child(2) { animation-delay: 0.4s; }
        .bp-line-h:nth-child(3) { animation-delay: 0.8s; }
        .bp-line-h:nth-child(4) { animation-delay: 1.2s; }
        .bp-line-v:nth-child(5) { animation-delay: 0.6s; }
        .bp-line-v:nth-child(6) { animation-delay: 1.0s; }
        .bp-line-v:nth-child(7) { animation-delay: 1.4s; }

        .bp-circle {
          fill: none;
          stroke: rgba(96, 184, 255, 0.35);
          stroke-width: 1;
          stroke-dasharray: 1500;
          stroke-dashoffset: 1500;
          animation: draw-h 7s ease forwards 1s;
        }
        .bp-circle-2 {
          fill: none;
          stroke: rgba(96, 184, 255, 0.2);
          stroke-width: 1;
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: draw-h 5s ease forwards 1.5s;
        }

        /* Dimension arrows */
        .bp-dim {
          stroke: rgba(96, 184, 255, 0.5);
          stroke-width: 0.8;
          fill: none;
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: draw-h 4s ease forwards 2s;
        }

        /* Crosshair dots */
        .bp-dot {
          fill: rgba(96, 184, 255, 0.7);
          animation: pulse-dot 3s ease-in-out infinite;
        }
        .bp-dot:nth-child(2) { animation-delay: 0.8s; }
        .bp-dot:nth-child(3) { animation-delay: 1.6s; }
        .bp-dot:nth-child(4) { animation-delay: 2.4s; }

        /* Compass rose */
        .bp-compass {
          transform-origin: center;
          animation: glow-pulse 4s ease-in-out infinite;
        }

        /* Corner brackets */
        .bp-corner {
          stroke: rgba(96, 184, 255, 0.55);
          stroke-width: 1.5;
          fill: none;
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: draw-h 3s ease forwards 0.5s;
        }

        /* Ticker tape at bottom */
        .bp-ticker-wrap {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 28px;
          overflow: hidden;
          border-top: 1px solid rgba(96, 184, 255, 0.2);
          background: rgba(3, 17, 31, 0.7);
        }
        .bp-ticker {
          display: flex;
          white-space: nowrap;
          animation: ticker 30s linear infinite;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: rgba(96, 184, 255, 0.6);
          line-height: 28px;
          padding: 0 20px;
          letter-spacing: 0.05em;
        }

        /* Overall dim overlay so content cards pop */
        .bp-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 40%, rgba(3,17,31,0.3) 0%, rgba(3,17,31,0.65) 100%);
        }
      `}</style>

      <div className="bp-container">
        <div className="bp-grid" />
        <div className="bp-grid-large" />

        {/* Animated SVG blueprint drawing */}
        <svg className="bp-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

          {/* Horizontal dimension lines */}
          <line className="bp-line-h" x1="0" y1="180" x2="1440" y2="180" />
          <line className="bp-line-h" x1="0" y1="450" x2="1440" y2="450" />
          <line className="bp-line-h" x1="0" y1="700" x2="1440" y2="700" />
          <line className="bp-line-h" x1="200" y1="80" x2="900" y2="80" />

          {/* Vertical lines */}
          <line className="bp-line-v" x1="320" y1="0" x2="320" y2="900" />
          <line className="bp-line-v" x1="850" y1="0" x2="850" y2="900" />
          <line className="bp-line-v" x1="1200" y1="0" x2="1200" y2="900" />

          {/* Large outer circles — building plan rings */}
          <circle className="bp-circle" cx="720" cy="450" r="320" />
          <circle className="bp-circle-2" cx="720" cy="450" r="200" />
          <circle className="bp-circle-2" cx="720" cy="450" r="420" />

          {/* Floor plan rectangle */}
          <rect x="430" y="220" width="580" height="340"
            fill="none" stroke="rgba(96,184,255,0.22)" strokeWidth="1"
            strokeDasharray="1600" strokeDashoffset="1600"
            style={{ animation: 'draw-h 6s ease forwards 1s' }}
          />
          <rect x="480" y="260" width="480" height="260"
            fill="none" stroke="rgba(96,184,255,0.15)" strokeWidth="0.8"
            strokeDasharray="1400" strokeDashoffset="1400"
            style={{ animation: 'draw-h 6s ease forwards 1.5s' }}
          />

          {/* Interior room dividers */}
          <line stroke="rgba(96,184,255,0.2)" strokeWidth="0.8" x1="620" y1="260" x2="620" y2="520"
            strokeDasharray="300" strokeDashoffset="300"
            style={{ animation: 'draw-v 4s ease forwards 2s' }}
          />
          <line stroke="rgba(96,184,255,0.2)" strokeWidth="0.8" x1="480" y1="370" x2="960" y2="370"
            strokeDasharray="500" strokeDashoffset="500"
            style={{ animation: 'draw-h 4s ease forwards 2.2s' }}
          />

          {/* Dimension arrows */}
          <line className="bp-dim" x1="430" y1="200" x2="1010" y2="200" />
          <line className="bp-dim" x1="430" y1="196" x2="430" y2="204" />
          <line className="bp-dim" x1="1010" y1="196" x2="1010" y2="204" />
          <line className="bp-dim" x1="410" y1="220" x2="410" y2="560" />
          <line className="bp-dim" x1="406" y1="220" x2="414" y2="220" />
          <line className="bp-dim" x1="406" y1="560" x2="414" y2="560" />

          {/* Corner brackets — top left */}
          <polyline className="bp-corner" points="40,30 40,80 90,80" />
          {/* top right */}
          <polyline className="bp-corner" points="1400,30 1400,80 1350,80" style={{ animationDelay: '0.3s' }} />
          {/* bottom left */}
          <polyline className="bp-corner" points="40,870 40,820 90,820" style={{ animationDelay: '0.6s' }} />
          {/* bottom right */}
          <polyline className="bp-corner" points="1400,870 1400,820 1350,820" style={{ animationDelay: '0.9s' }} />

          {/* Compass rose top-right */}
          <g className="bp-compass" transform="translate(1340, 130)">
            <circle cx="0" cy="0" r="40" fill="none" stroke="rgba(96,184,255,0.3)" strokeWidth="1" />
            <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(96,184,255,0.2)" strokeWidth="0.7" />
            <line x1="0" y1="-40" x2="0" y2="40" stroke="rgba(96,184,255,0.5)" strokeWidth="1" />
            <line x1="-40" y1="0" x2="40" y2="0" stroke="rgba(96,184,255,0.5)" strokeWidth="1" />
            <polygon points="0,-38 4,-10 0,-18 -4,-10" fill="rgba(96,184,255,0.8)" />
            <text x="0" y="-46" textAnchor="middle" fontSize="10" fill="rgba(96,184,255,0.8)" fontFamily="Courier New">N</text>
          </g>

          {/* Pulsing crosshair dots */}
          <circle className="bp-dot" cx="320" cy="180" r="3" />
          <circle className="bp-dot" cx="850" cy="180" r="3" />
          <circle className="bp-dot" cx="320" cy="450" r="3" />
          <circle className="bp-dot" cx="850" cy="450" r="3" />
          <circle className="bp-dot" cx="720" cy="450" r="4" />

          {/* Small technical annotation boxes */}
          <rect x="55" y="170" width="80" height="20" fill="rgba(3,17,31,0.7)" stroke="rgba(96,184,255,0.4)" strokeWidth="0.8" rx="2" />
          <text x="95" y="184" textAnchor="middle" fontSize="8" fill="rgba(96,184,255,0.7)" fontFamily="Courier New">ELEV. +0.00</text>

          <rect x="1100" y="440" width="90" height="20" fill="rgba(3,17,31,0.7)" stroke="rgba(96,184,255,0.4)" strokeWidth="0.8" rx="2" />
          <text x="1145" y="454" textAnchor="middle" fontSize="8" fill="rgba(96,184,255,0.7)" fontFamily="Courier New">GRID REF: B4</text>

          <rect x="55" y="440" width="80" height="20" fill="rgba(3,17,31,0.7)" stroke="rgba(96,184,255,0.4)" strokeWidth="0.8" rx="2" />
          <text x="95" y="454" textAnchor="middle" fontSize="8" fill="rgba(96,184,255,0.7)" fontFamily="Courier New">SCALE 1:100</text>

          {/* Title block bottom right */}
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

        {/* Scanline sweep */}
        <div className="bp-scanline" />

        {/* Radial vignette */}
        <div className="bp-overlay" />

        {/* Ticker at bottom */}
        <div className="bp-ticker-wrap">
          <div className="bp-ticker">
            {'AESL DOCUMENT MANAGEMENT SYSTEM  ·  STRUCTURAL ANALYSIS  ·  ELECTRICAL LAYOUT  ·  BUILDING STRUCTURES  ·  QUANTITY SURVEYING  ·  DWG REV-A  ·  SCALE 1:100  ·  GRID REF B4  ·  ELEV +0.00  ·  COORD SYS WGS84  ·  AESL DOCUMENT MANAGEMENT SYSTEM  ·  STRUCTURAL ANALYSIS  ·  ELECTRICAL LAYOUT  ·  BUILDING STRUCTURES  ·  QUANTITY SURVEYING  ·  DWG REV-A  ·  SCALE 1:100  ·  GRID REF B4  ·  '}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Shared glass card wrapper ────────────────────────────────────────────────
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl ${className}`}
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
      {children}
    </div>
  );
}

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
    const loadData = () => {
      try {
        const userData = storage.get('user');
        if (userData) setUser(JSON.parse(userData.value));
        const filesData = storage.get('files');
        if (filesData) setFiles(JSON.parse(filesData.value));
      } catch {
        console.log('No stored data found');
      }
    };
    loadData();
  }, []);

  const saveUser = (userData: User) => storage.set('user', JSON.stringify(userData));
  const saveFiles = (filesData: FilesState) => storage.set('files', JSON.stringify(filesData));

  const handleAuth = () => {
    if (!formData.email || !formData.password) { alert('Please fill in email and password'); return; }
    if (isLogin) {
      try {
        const storedUser = storage.get(`user_${formData.email}`);
        if (storedUser) {
          const userData: User = JSON.parse(storedUser.value);
          if (userData.password === formData.password) {
            setUser(userData); saveUser(userData);
            setFormData({ email: '', password: '', name: '' });
          } else { alert('Invalid credentials'); }
        } else { alert('User not found'); }
      } catch { alert('User not found'); }
    } else {
      if (!formData.name) { alert('Please fill all fields'); return; }
      const newUser: User = { email: formData.email, password: formData.password, name: formData.name };
      storage.set(`user_${formData.email}`, JSON.stringify(newUser));
      setUser(newUser); saveUser(newUser);
      setFormData({ email: '', password: '', name: '' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDept || !user) return;
    const allowedExtensions = ['.dwg', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) { alert('Only .dwg, .pdf, .doc, .docx, .xls, and .xlsx files are allowed'); return; }
    const fileData: FileData = { name: file.name, size: file.size, uploadedBy: user.name, uploadedAt: new Date().toISOString(), department: selectedDept };
    const newFiles = { ...files };
    if (!newFiles[selectedDept]) newFiles[selectedDept] = [];
    newFiles[selectedDept].push(fileData);
    setFiles(newFiles); saveFiles(newFiles);
    e.target.value = '';
    alert('File uploaded successfully!');
  };

  const handleDownload = (file: FileData) => alert(`Downloading: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB`);

  const handleDelete = (fileIndex: number) => {
    if (!selectedDept) return;
    if (confirm('Are you sure you want to delete this file?')) {
      const newFiles = { ...files };
      newFiles[selectedDept] = newFiles[selectedDept].filter((_, idx) => idx !== fileIndex);
      setFiles(newFiles); saveFiles(newFiles);
      alert('File deleted successfully!');
    }
  };

  const handleShare = (file: FileData, platform: string) => {
    const fileInfo = `Check out this file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    const encodedText = encodeURIComponent(fileInfo);
    const shareUrls: { [key: string]: string } = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      email: `mailto:?subject=File Share&body=${encodedText}`
    };
    if (shareUrls[platform]) { window.open(shareUrls[platform], '_blank'); setShowShareMenu(null); }
  };

  const handleLogout = () => { setUser(null); setSelectedDept(null); };

  const handleDepartmentClick = (deptId: string) => {
    setSelectedDeptForAccess(deptId); setShowPasswordPrompt(true); setDeptPassword('');
  };

  const handlePasswordSubmit = () => {
    if (!selectedDeptForAccess) return;
    if (deptPassword === DEPT_PASSWORDS[selectedDeptForAccess]) {
      setSelectedDept(selectedDeptForAccess); setShowPasswordPrompt(false);
      setDeptPassword(''); setSelectedDeptForAccess(null);
    } else { alert('Incorrect password! Please try again.'); setDeptPassword(''); }
  };

  const handleCancelPassword = () => {
    setShowPasswordPrompt(false); setDeptPassword(''); setSelectedDeptForAccess(null);
  };

  // ── LOGIN SCREEN ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <BlueprintBackground />
        <div className="relative z-10 w-full max-w-md">
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <div className="inline-block p-3 rounded-full mb-4"
                style={{ background: 'rgba(96,184,255,0.15)', border: '1px solid rgba(96,184,255,0.4)' }}>
                <FileText className="w-8 h-8" style={{ color: '#60b8ff' }} />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-widest" style={{ fontFamily: 'Courier New, monospace', textShadow: '0 0 20px rgba(96,184,255,0.5)' }}>
                AESL
              </h1>
              <p style={{ color: 'rgba(96,184,255,0.7)', fontFamily: 'Courier New, monospace', fontSize: '12px', letterSpacing: '0.2em' }}>
                DOCUMENT MANAGEMENT SYSTEM
              </p>
            </div>

            <div className="flex gap-2 mb-6">
              <button onClick={() => setIsLogin(true)}
                className="flex-1 py-2 rounded-lg font-medium transition-all"
                style={{
                  background: isLogin ? 'rgba(96,184,255,0.2)' : 'transparent',
                  border: isLogin ? '1px solid rgba(96,184,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
                  color: isLogin ? '#60b8ff' : 'rgba(255,255,255,0.5)',
                  fontFamily: 'Courier New, monospace', fontSize: '13px', letterSpacing: '0.1em'
                }}>
                LOGIN
              </button>
              <button onClick={() => setIsLogin(false)}
                className="flex-1 py-2 rounded-lg font-medium transition-all"
                style={{
                  background: !isLogin ? 'rgba(96,184,255,0.2)' : 'transparent',
                  border: !isLogin ? '1px solid rgba(96,184,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
                  color: !isLogin ? '#60b8ff' : 'rgba(255,255,255,0.5)',
                  fontFamily: 'Courier New, monospace', fontSize: '13px', letterSpacing: '0.1em'
                }}>
                SIGN UP
              </button>
            </div>

            <div className="space-y-4">
              {!isLogin && (
                <input type="text" placeholder="FULL NAME"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(96,184,255,0.3)',
                    color: 'white', fontFamily: 'Courier New, monospace', fontSize: '13px', letterSpacing: '0.1em'
                  }}
                />
              )}
              <input type="email" placeholder="EMAIL ADDRESS"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(96,184,255,0.3)',
                  color: 'white', fontFamily: 'Courier New, monospace', fontSize: '13px', letterSpacing: '0.1em'
                }}
              />
              <input type="password" placeholder="PASSWORD"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(96,184,255,0.3)',
                  color: 'white', fontFamily: 'Courier New, monospace', fontSize: '13px', letterSpacing: '0.1em'
                }}
              />
              <button onClick={handleAuth}
                className="w-full py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(96,184,255,0.3), rgba(96,184,255,0.15))',
                  border: '1px solid rgba(96,184,255,0.6)', color: '#60b8ff',
                  fontFamily: 'Courier New, monospace', letterSpacing: '0.15em',
                  boxShadow: '0 0 20px rgba(96,184,255,0.2)'
                }}>
                {isLogin ? '[ AUTHENTICATE ]' : '[ CREATE ACCOUNT ]'}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ── DEPARTMENT SELECTION ────────────────────────────────────────────────────
  if (!selectedDept) {
    return (
      <div className="relative min-h-screen p-6">
        <BlueprintBackground />
        <div className="relative z-10 max-w-6xl mx-auto">

          <GlassCard className="p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-widest"
                  style={{ fontFamily: 'Courier New, monospace', textShadow: '0 0 15px rgba(96,184,255,0.4)' }}>
                  AESL DOCUMENT SYSTEM
                </h1>
                <p style={{ color: 'rgba(96,184,255,0.6)', fontFamily: 'Courier New, monospace', fontSize: '12px', letterSpacing: '0.1em' }}>
                  OPERATOR: {user.name.toUpperCase()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowContactForm(true)}
                  className="px-4 py-2 rounded-lg transition-all"
                  style={{ background: 'rgba(96,184,255,0.1)', border: '1px solid rgba(96,184,255,0.3)', color: '#60b8ff', fontFamily: 'Courier New, monospace', fontSize: '12px' }}>
                  CONTACT
                </button>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                  style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', color: '#ff6060', fontFamily: 'Courier New, monospace', fontSize: '12px' }}>
                  <LogOut className="w-4 h-4" />
                  LOGOUT
                </button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-lg font-bold mb-6 tracking-widest"
              style={{ color: 'rgba(96,184,255,0.8)', fontFamily: 'Courier New, monospace', borderBottom: '1px solid rgba(96,184,255,0.2)', paddingBottom: '12px' }}>
              SELECT DEPARTMENT
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEPARTMENTS.map(dept => {
                const Icon = dept.icon;
                const fileCount = files[dept.id]?.length || 0;
                return (
                  <button key={dept.id} onClick={() => handleDepartmentClick(dept.id)}
                    className="p-6 rounded-xl text-left group transition-all hover:scale-[1.02]"
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(96,184,255,0.2)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(96,184,255,0.6)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(96,184,255,0.08)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(96,184,255,0.2)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${dept.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}
                        style={{ boxShadow: '0 0 12px rgba(96,184,255,0.2)' }}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1 tracking-wider"
                          style={{ fontFamily: 'Courier New, monospace', fontSize: '14px' }}>
                          {dept.name.toUpperCase()}
                        </h3>
                        <p style={{ color: 'rgba(96,184,255,0.6)', fontFamily: 'Courier New, monospace', fontSize: '11px' }}>
                          {fileCount} FILES AVAILABLE
                        </p>
                        <p style={{ color: 'rgba(255,200,80,0.7)', fontFamily: 'Courier New, monospace', fontSize: '10px', marginTop: '6px' }}>
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

        {/* Password Prompt Modal */}
        {showPasswordPrompt && selectedDeptForAccess && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
            <GlassCard className="p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 tracking-widest"
                style={{ color: '#60b8ff', fontFamily: 'Courier New, monospace', textShadow: '0 0 10px rgba(96,184,255,0.4)' }}>
                ACCESS CONTROL
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Courier New, monospace', fontSize: '12px', marginBottom: '20px' }}>
                CLEARANCE REQUIRED: {DEPARTMENTS.find(d => d.id === selectedDeptForAccess)?.name.toUpperCase()}
              </p>
              <input type="password" value={deptPassword}
                onChange={(e) => setDeptPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="ENTER ACCESS CODE"
                className="w-full px-4 py-3 rounded-lg outline-none mb-4"
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(96,184,255,0.4)',
                  color: 'white', fontFamily: 'Courier New, monospace', fontSize: '13px', letterSpacing: '0.2em'
                }}
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={handleCancelPassword}
                  className="flex-1 px-4 py-3 rounded-lg transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Courier New, monospace', fontSize: '12px' }}>
                  CANCEL
                </button>
                <button onClick={handlePasswordSubmit}
                  className="flex-1 px-4 py-3 rounded-lg transition-all"
                  style={{ background: 'rgba(96,184,255,0.2)', border: '1px solid rgba(96,184,255,0.5)', color: '#60b8ff', fontFamily: 'Courier New, monospace', fontSize: '12px' }}>
                  AUTHENTICATE
                </button>
              </div>
              <div className="mt-4 p-3 rounded-lg"
                style={{ background: 'rgba(255,200,80,0.05)', border: '1px solid rgba(255,200,80,0.2)' }}>
                <p style={{ color: 'rgba(255,200,80,0.7)', fontFamily: 'Courier New, monospace', fontSize: '10px' }}>
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

  // ── DEPARTMENT FILE VIEW ────────────────────────────────────────────────────
  const currentDept = DEPARTMENTS.find(d => d.id === selectedDept);
  if (!currentDept) return null;
  const Icon = currentDept.icon;
  const deptFiles = files[selectedDept] || [];

  return (
    <div className="relative min-h-screen p-6">
      <BlueprintBackground />
      <div className="relative z-10 max-w-6xl mx-auto">

        <GlassCard className="p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedDept(null)}
                className="px-4 py-2 rounded-lg transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', fontFamily: 'Courier New, monospace', fontSize: '12px' }}>
                ← BACK
              </button>
              <div className={`${currentDept.color} p-3 rounded-lg`} style={{ boxShadow: '0 0 12px rgba(96,184,255,0.2)' }}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-widest"
                  style={{ fontFamily: 'Courier New, monospace', textShadow: '0 0 12px rgba(96,184,255,0.3)' }}>
                  {currentDept.name.toUpperCase()}
                </h1>
                <p style={{ color: 'rgba(96,184,255,0.6)', fontFamily: 'Courier New, monospace', fontSize: '11px' }}>
                  {deptFiles.length} FILES IN REPOSITORY
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowContactForm(true)}
                className="px-4 py-2 rounded-lg"
                style={{ background: 'rgba(96,184,255,0.1)', border: '1px solid rgba(96,184,255,0.3)', color: '#60b8ff', fontFamily: 'Courier New, monospace', fontSize: '12px' }}>
                CONTACT
              </button>
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', color: '#ff6060', fontFamily: 'Courier New, monospace', fontSize: '12px' }}>
                <LogOut className="w-4 h-4" />
                LOGOUT
              </button>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 mb-6">
          <h2 className="text-sm font-bold mb-4 tracking-widest"
            style={{ color: 'rgba(96,184,255,0.8)', fontFamily: 'Courier New, monospace', borderBottom: '1px solid rgba(96,184,255,0.2)', paddingBottom: '10px' }}>
            UPLOAD DOCUMENT
          </h2>
          <div className="flex items-center gap-4">
            <input type="file" accept=".dwg,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileUpload}
              className="flex-1 px-4 py-2 rounded-lg outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(96,184,255,0.3)',
                color: 'rgba(255,255,255,0.7)', fontFamily: 'Courier New, monospace', fontSize: '12px'
              }}
            />
            <Upload className="w-5 h-5" style={{ color: '#60b8ff' }} />
          </div>
          <p style={{ color: 'rgba(96,184,255,0.4)', fontFamily: 'Courier New, monospace', fontSize: '10px', marginTop: '8px' }}>
            ACCEPTED: .dwg · .pdf · .doc · .docx · .xls · .xlsx
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-sm font-bold mb-4 tracking-widest"
            style={{ color: 'rgba(96,184,255,0.8)', fontFamily: 'Courier New, monospace', borderBottom: '1px solid rgba(96,184,255,0.2)', paddingBottom: '10px' }}>
            DOCUMENT REPOSITORY
          </h2>
          {deptFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(96,184,255,0.2)' }} />
              <p style={{ color: 'rgba(96,184,255,0.4)', fontFamily: 'Courier New, monospace', fontSize: '12px', letterSpacing: '0.1em' }}>
                NO FILES IN REPOSITORY
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {deptFiles.map((file, idx) => (
                <div key={idx}
                  className="flex items-center justify-between p-4 rounded-lg transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(96,184,255,0.15)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(96,184,255,0.4)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(96,184,255,0.05)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(96,184,255,0.15)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8" style={{ color: '#60b8ff' }} />
                    <div>
                      <h3 className="font-semibold text-white" style={{ fontFamily: 'Courier New, monospace', fontSize: '13px' }}>
                        {file.name}
                      </h3>
                      <p style={{ color: 'rgba(96,184,255,0.5)', fontFamily: 'Courier New, monospace', fontSize: '10px' }}>
                        {file.uploadedBy.toUpperCase()} · {new Date(file.uploadedAt).toLocaleDateString()} · {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDownload(file)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                      style={{ background: 'rgba(96,184,255,0.15)', border: '1px solid rgba(96,184,255,0.4)', color: '#60b8ff', fontFamily: 'Courier New, monospace', fontSize: '11px' }}>
                      <Download className="w-3 h-3" /> DL
                    </button>
                    <div className="relative">
                      <button onClick={() => setShowShareMenu(showShareMenu === idx ? null : idx)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                        style={{ background: 'rgba(80,200,120,0.15)', border: '1px solid rgba(80,200,120,0.4)', color: '#50c878', fontFamily: 'Courier New, monospace', fontSize: '11px' }}>
                        <Share2 className="w-3 h-3" /> SHARE
                      </button>
                      {showShareMenu === idx && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg z-10 overflow-hidden"
                          style={{ background: 'rgba(3,17,31,0.95)', border: '1px solid rgba(96,184,255,0.3)', backdropFilter: 'blur(10px)' }}>
                          {[['whatsapp','📱 WhatsApp'],['facebook','📘 Facebook'],['twitter','🐦 Twitter'],['linkedin','💼 LinkedIn'],['email','✉️ Email']].map(([platform, label]) => (
                            <button key={platform} onClick={() => handleShare(file, platform)}
                              className="w-full text-left px-4 py-2 transition-all"
                              style={{ color: 'rgba(96,184,255,0.8)', fontFamily: 'Courier New, monospace', fontSize: '12px' }}
                              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(96,184,255,0.1)'}
                              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleDelete(idx)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                      style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', color: '#ff6060', fontFamily: 'Courier New, monospace', fontSize: '11px' }}>
                      <Trash2 className="w-3 h-3" /> DEL
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
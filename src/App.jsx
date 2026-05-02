import React, { useState, useEffect, useRef } from 'react';

// --- JSON DATABASE UTILITY ---
const Database = {
  // User management
  getAllUsers: () => {
    const users = localStorage.getItem('wardenUsers');
    return users ? JSON.parse(users) : [];
  },
  
  getUserByUsername: (username) => {
    const users = Database.getAllUsers();
    return users.find(u => u.username === username);
  },
  
  registerUser: (username, role) => {
    const users = Database.getAllUsers();
    if (Database.getUserByUsername(username)) {
      return { success: false, message: 'Username already exists' };
    }
    const newUser = { id: Date.now(), username, role, createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('wardenUsers', JSON.stringify(users));
    return { success: true, user: newUser };
  },
  
  // Session management
  getAllSessions: () => {
    const sessions = localStorage.getItem('wardenSessions');
    return sessions ? JSON.parse(sessions) : [];
  },
  
  createSession: (adminUsername) => {
    const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessions = Database.getAllSessions();
    const newSession = {
      id: sessionId,
      adminUsername,
      createdAt: new Date().toISOString(),
      participants: [adminUsername],
      isActive: true
    };
    sessions.push(newSession);
    localStorage.setItem('wardenSessions', JSON.stringify(sessions));
    return newSession;
  },
  
  getSessionById: (sessionId) => {
    const sessions = Database.getAllSessions();
    return sessions.find(s => s.id === sessionId);
  },
  
  joinSession: (sessionId, username) => {
    const sessions = Database.getAllSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      return { success: false, message: 'Session not found' };
    }
    if (!session.participants.includes(username)) {
      session.participants.push(username);
      localStorage.setItem('wardenSessions', JSON.stringify(sessions));
    }
    return { success: true, session };
  },
  
  getSessionByUsername: (username) => {
    const sessions = Database.getAllSessions();
    return sessions.find(s => s.participants.includes(username) && s.isActive);
  }
};

// --- EVADING MESSAGE COMPONENT ---
const EvadingMessage = ({ children }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const messageRef = useRef(null);
  const evasionDistance = 100; // Distance at which message starts to evade
  const evasionStrength = 15; // How far the message moves

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!messageRef.current) return;

      const rect = messageRef.current.getBoundingClientRect();
      const messageCenterX = rect.left + rect.width / 2;
      const messageCenterY = rect.top + rect.height / 2;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const distX = messageCenterX - mouseX;
      const distY = messageCenterY - mouseY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < evasionDistance && distance > 0) {
        // Calculate angle and apply evasion
        const angle = Math.atan2(distY, distX);
        const evasionAmount = (1 - distance / evasionDistance) * evasionStrength;
        
        setOffset({
          x: Math.cos(angle) * evasionAmount,
          y: Math.sin(angle) * evasionAmount,
        });
      } else {
        setOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={messageRef}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: 'transform 50ms ease-out',
      }}
    >
      {children}
    </div>
  );
};

// --- SHARED COMPONENTS ---

const WardenHUD = ({ isSlacking }) => (
  <div className={`fixed inset-0 pointer-events-none border transition-colors duration-200 z-[100] ${isSlacking ? 'border-warden shadow-[inset_0px_0px_30px_rgba(189,0,255,0.4)]' : 'border-transparent'}`} />
);

const TopAppBar = ({ activeTab, setActiveTab, currentUser, onLogout, currentSession, onCreateSession }) => {
  const tabs = ['session', 'dashboard', 'leaderboard'];
  return (
    <header className="bg-background text-primary font-grotesk uppercase tracking-widest text-sm fixed top-0 border-b border-outline flex justify-between items-center w-full px-6 py-4 z-50">
      <div className="flex items-center gap-4">
        <div className="text-xl font-bold tracking-tighter text-primary uppercase">
          THE WARDEN
        </div>
        {currentSession && (
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-outline">
            <span className="material-symbols-outlined text-[16px]">group</span>
            <div className="text-[11px] font-inter">
              <div className="text-on-surface-muted uppercase tracking-[0.05em]">Session</div>
              <div className="text-primary font-bold">{currentSession.id}</div>
            </div>
          </div>
        )}
      </div>
      <nav className="hidden md:flex gap-8 items-center">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-1 border-b-2 transition-all duration-200 active:scale-95 uppercase ${activeTab === tab ? 'text-primary border-primary' : 'text-on-surface-muted border-transparent hover:text-warden'}`}>
            {tab}
          </button>
        ))}
        <span className="text-[10px] text-[#cfc4c5] opacity-40 lowercase tracking-tight ml-4 font-inter font-semibold italic shrink-0">
          you are NOT being watched 👀
        </span>
      </nav>
      <div className="flex items-center gap-4">
        {currentUser && (
          <div className="flex items-center gap-3 pl-4 border-l border-outline">
            <div className="text-right text-off-white">
              <div className="font-inter text-[11px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase">Operative</div>
              <div className="font-grotesk text-[12px] font-bold">{currentUser.username}</div>
              <div className={`font-inter text-[9px] uppercase tracking-[0.1em] ${currentUser.role === 'admin' ? 'text-warden' : 'text-primary'}`}>
                {currentUser.role}
              </div>
            </div>
            {currentUser.role === 'admin' && !currentSession && (
              <button
                onClick={onCreateSession}
                className="ml-2 p-2 hover:bg-warden/20 hover:text-warden transition-colors"
                title="Create Session"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="ml-2 p-2 hover:bg-outline/30 transition-colors"
              title="Logout"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        )}
        <span className="material-symbols-outlined hover:text-warden cursor-pointer transition-colors" title="Security">security</span>
        <span className="material-symbols-outlined hover:text-warden cursor-pointer transition-colors" title="Settings">settings</span>
      </div>
    </header>
  );
};

const BottomNavBar = ({ activeTab, setActiveTab }) => {
  const navItems =[
    { id: 'dashboard', icon: 'grid_view' },
    { id: 'session', icon: 'timer' },
    { id: 'leaderboard', icon: 'leaderboard' }
  ];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 bg-background border-t border-outline">
      {navItems.map((item) => (
        <button key={item.id} onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center pt-2 transition-all active:scale-90 duration-100 w-full h-full border-t-2 ${activeTab === item.id ? 'text-primary border-warden shadow-[0px_-4px_15px_rgba(189,0,255,0.3)]' : 'text-on-surface-muted border-transparent hover:text-primary'}`}>
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="font-grotesk text-[10px] font-bold uppercase mt-1">{item.id}</span>
        </button>
      ))}
    </nav>
  );
};

const DecorativeElements = () => (
  <>
    <div className="fixed top-24 right-8 hidden lg:block opacity-20 rotate-90 origin-right pointer-events-none">
      <div className="font-inter text-[14px] font-semibold tracking-[0.5em] text-warden uppercase">Surveillance Status: Active</div>
    </div>
    <div className="fixed bottom-24 left-8 hidden lg:block opacity-20 -rotate-90 origin-left pointer-events-none">
      <div className="font-inter text-[14px] font-semibold tracking-[0.5em] text-warden uppercase">Correction Protocol: Ready</div>
    </div>
  </>
);

// --- LOGIN & SESSION VIEW ---
const AuthView = ({ onLogin, onSessionJoin }) => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'joinSession'
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [sessionCode, setSessionCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = () => {
    setError('');
    setSuccess('');
    if (!username.trim()) {
      setError('Username required');
      return;
    }
    const result = Database.registerUser(username, selectedRole);
    if (result.success) {
      setSuccess('Registration successful! Now logging in...');
      setTimeout(() => onLogin(username, selectedRole), 1500);
    } else {
      setError(result.message);
    }
  };

  const handleLogin = () => {
    setError('');
    if (!username.trim()) {
      setError('Username required');
      return;
    }
    const user = Database.getUserByUsername(username);
    if (!user) {
      setError('User not found. Please register first.');
      return;
    }
    onLogin(username, user.role);
  };

  const handleJoinSession = () => {
    setError('');
    setSuccess('');
    if (!username.trim()) {
      setError('Username required');
      return;
    }
    if (!sessionCode.trim()) {
      setError('Session code required');
      return;
    }
    const result = Database.joinSession(sessionCode.toUpperCase(), username);
    if (result.success) {
      const user = Database.getUserByUsername(username);
      setSuccess('Joined session! Logging in...');
      setTimeout(() => onSessionJoin(username, user.role, sessionCode.toUpperCase()), 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/95 z-[200] overflow-y-auto py-8">
      <div className="w-full max-w-[500px] mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="font-grotesk text-[48px] font-bold tracking-[-0.02em] text-primary uppercase mb-4">
            THE WARDEN
          </h1>
          <p className="font-inter text-[14px] text-on-surface-muted uppercase tracking-widest">
            {mode === 'login' ? 'Authentication' : mode === 'register' ? 'Create Account' : 'Join Session'}
          </p>
        </div>

        <div className="space-y-6 bg-surface border border-outline p-8">
          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'login', label: 'Login' },
              { id: 'register', label: 'Register' },
              { id: 'joinSession', label: 'Join Session' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 font-grotesk text-[12px] font-bold uppercase tracking-[0.05em] border transition-all ${
                  mode === m.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline text-on-surface-muted hover:border-primary'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-warden/20 border border-warden text-warden text-[12px] font-inter uppercase tracking-widest">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-primary/20 border border-primary text-primary text-[12px] font-inter uppercase tracking-widest">
              ✓ {success}
            </div>
          )}

          {/* Username Input (for login and register) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="space-y-2">
              <label className="font-inter text-[12px] font-semibold uppercase tracking-[0.05em] text-on-surface-muted">
                Operative ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (mode === 'register' ? handleRegister() : handleLogin())}
                placeholder="Enter username"
                className="w-full px-4 py-3 bg-background border border-outline text-primary font-inter text-[14px] placeholder-on-surface-muted focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Join Session Inputs */}
          {mode === 'joinSession' && (
            <>
              <div className="space-y-2">
                <label className="font-inter text-[12px] font-semibold uppercase tracking-[0.05em] text-on-surface-muted">
                  Operative ID
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  className="w-full px-4 py-3 bg-background border border-outline text-primary font-inter text-[14px] placeholder-on-surface-muted focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="font-inter text-[12px] font-semibold uppercase tracking-[0.05em] text-on-surface-muted">
                  Session Code
                </label>
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
                  placeholder="e.g., ABC123"
                  maxLength="6"
                  className="w-full px-4 py-3 bg-background border border-outline text-primary font-inter text-[14px] placeholder-on-surface-muted focus:border-primary focus:outline-none transition-colors uppercase"
                />
              </div>
            </>
          )}

          {/* Role Selection (for register only) */}
          {mode === 'register' && (
            <div className="space-y-3">
              <label className="font-inter text-[12px] font-semibold uppercase tracking-[0.05em] text-on-surface-muted block">
                Access Level
              </label>
              <div className="space-y-2">
                {[
                  { id: 'admin', label: 'Admin', description: 'Create & manage sessions' },
                  { id: 'user', label: 'User', description: 'Join existing sessions' },
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full p-4 border-2 text-left transition-all ${
                      selectedRole === role.id
                        ? 'border-warden bg-warden/10'
                        : 'border-outline hover:border-primary'
                    }`}
                  >
                    <div className="font-grotesk font-bold uppercase text-primary">{role.label}</div>
                    <div className="font-inter text-[12px] text-on-surface-muted uppercase tracking-widest mt-1">
                      {role.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={
              mode === 'register' ? handleRegister :
              mode === 'joinSession' ? handleJoinSession :
              handleLogin
            }
            className={`w-full py-4 font-grotesk text-[16px] font-bold uppercase tracking-[0.05em] transition-all ${
              (mode === 'register' || mode === 'joinSession' ? username.trim() && (mode === 'joinSession' ? sessionCode.trim() : true) : username.trim())
                ? 'bg-primary text-background hover:scale-[0.98] active:scale-95'
                : 'bg-outline text-on-surface-muted cursor-not-allowed opacity-50'
            }`}
          >
            {mode === 'register' ? 'CREATE ACCOUNT' : mode === 'joinSession' ? 'JOIN SESSION' : 'LOGIN'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- TAB VIEWS ---

const SessionView = ({ isArmed, setIsArmed, isSlacking, sessionTime, logs, terminateSession, currentUser, currentSession }) => {
  
  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const isAdmin = currentUser?.role === 'admin';
  const canDisarm = isAdmin;

  return (
    <div className="animate-in fade-in duration-500 min-h-[600px]">
      
      {/* SESSION PARTICIPANTS (if in session) */}
      {currentSession && (
        <div className="mb-6 p-4 bg-surface border border-primary/30 space-y-3">
          <div className="flex items-center gap-2 font-inter text-[12px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase">
            <span className="material-symbols-outlined text-[16px]">group</span>
            Session Participants ({currentSession.participants.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {currentSession.participants.map((participant, idx) => (
              <div key={idx} className="px-3 py-1 bg-background border border-outline text-primary font-inter text-[11px] font-semibold uppercase">
                {participant} {currentSession.adminUsername === participant && <span className="text-warden ml-1">👑</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* VIOLATION ALERT */}
      <div className={`mb-12 text-center transition-all duration-300 ${isSlacking ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden m-0'}`}>
        <div className="inline-flex items-center gap-2 px-4 py-1 text-warden font-grotesk text-xs tracking-widest punishment-glow mb-4">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          FOCUS BREACH DETECTED
        </div>
        <EvadingMessage>
          <h1 className="font-grotesk text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-warden uppercase mb-2">
            SLACKING OFF
          </h1>
        </EvadingMessage>
        <p className="font-inter text-[16px] text-warden opacity-80 uppercase tracking-widest leading-[1.6]">
          Immediate correction required
        </p>
      </div>

      {/* TIMER & CONTROLS */}
      <div className={`flex flex-col items-center justify-center space-y-12 ${!isSlacking ? 'mt-12' : ''}`}>
        <div className={`relative w-full aspect-square max-w-[400px] flex items-center justify-center border bg-surface transition-colors duration-300 ${isSlacking ? 'border-warden' : 'border-outline'}`}>
          {isArmed && (
             <div className={`absolute inset-4 border-2 animate-pulse ${isSlacking ? 'border-warden punishment-glow opacity-30' : 'border-primary opacity-10'}`} />
          )}
          <div className="text-center z-10">
            <div className={`font-grotesk text-[80px] font-bold leading-none tracking-[-0.02em] mb-2 transition-colors duration-300 ${isSlacking ? 'text-warden' : 'text-primary'}`}>
              {formatTime(sessionTime)}
            </div>
            <div className={`font-grotesk text-[14px] font-normal tracking-[0.1em] uppercase transition-colors duration-300 ${isSlacking ? 'text-warden' : 'text-on-surface-muted'}`}>
              {isArmed ? 'Current Session' : 'System Offline'}
            </div>
          </div>
        </div>
        
        <div className="w-full flex flex-col gap-4">
          {!isArmed ? (
            <button 
              onClick={() => setIsArmed(true)}
              className="w-full py-6 bg-warden text-background font-grotesk text-[24px] font-bold leading-[1.2] uppercase tracking-[0.05em] punishment-glow hover:scale-[0.98] active:scale-95 transition-transform">
              ARM THE SYSTEM
            </button>
          ) : (
            <button 
              onClick={() => canDisarm && setIsArmed(false)}
              disabled={!canDisarm}
              title={!canDisarm ? 'Only admin can disarm the system' : ''}
              className={`w-full py-6 bg-transparent border-2 font-grotesk text-[24px] font-bold leading-[1.2] uppercase tracking-[0.05em] hover:scale-[0.98] active:scale-95 transition-all ${
                isSlacking ? 'border-warden text-warden punishment-glow' : 'border-primary text-primary'
              } ${!canDisarm ? 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100' : ''}`}>
              {canDisarm ? 'DISARM SYSTEM' : 'ADMIN ONLY - LOCKED'}
            </button>
          )}

          <button onClick={terminateSession} className="w-full py-4 border border-outline text-on-surface-muted font-inter text-[14px] font-semibold tracking-[0.05em] uppercase hover:text-primary hover:border-primary transition-colors active:scale-95">
            TERMINATE SESSION
          </button>
        </div>
      </div>

      {/* ADMIN NOTICE */}
      {!isAdmin && isArmed && (
        <div className="mt-8 p-4 bg-warden/10 border border-warden text-warden font-inter text-[12px] uppercase tracking-widest text-center">
          ⚠️ Only administrators can disarm this system while armed
        </div>
      )}

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-20">
        <div className="bg-surface border border-outline p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-inter text-[14px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase">Active Inhibitor</span>
            <span className="material-symbols-outlined text-warden">lock</span>
          </div>
          <div className="font-grotesk text-[24px] font-medium leading-[1.2] text-primary uppercase">Browser Focus</div>
          <div className="h-1 bg-outline w-full relative">
            <div className={`absolute top-0 left-0 h-full w-full transition-colors duration-300 ${isArmed ? 'bg-warden punishment-glow' : 'bg-outline'}`} />
          </div>
          <div className="flex justify-between font-grotesk text-[10px] tracking-[0.1em] text-on-surface-muted uppercase">
            <span>{isArmed ? 'MONITORING ACTIVE' : 'MONITORING OFFLINE'}</span>
            <span>THREAT LEVEL: HIGH</span>
          </div>
        </div>
        <div className="bg-surface border border-outline p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-inter text-[14px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase">Efficiency Index</span>
            <span className="material-symbols-outlined text-warden" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <div className="font-grotesk text-[24px] font-medium leading-[1.2] text-primary">82.4%</div>
          <div className="flex items-center gap-2">
            <div className="flex-grow h-8 bg-background flex gap-1 p-1">
              <div className="h-full w-4 bg-warden opacity-20" />
              <div className="h-full w-4 bg-warden opacity-40" />
              <div className="h-full w-4 bg-warden opacity-60" />
              <div className="h-full w-4 bg-warden opacity-80" />
              <div className="h-full w-4 bg-warden punishment-glow" />
              <div className="h-full w-4 bg-outline" />
              <div className="h-full w-4 bg-outline" />
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC INFRACTION LOGS */}
      <div className="mt-8 border border-outline bg-surface overflow-hidden">
        <div className="p-4 border-b border-outline font-inter text-[14px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase bg-surface-container flex justify-between">
          <span>Infraction Logs</span>
          <span>{logs.length} EVENTS</span>
        </div>
        <div className="divide-y divide-outline max-h-[300px] overflow-y-auto">
          {logs.map((log, idx) => (
            <div key={idx} className="p-4 flex justify-between items-center bg-background/40">
              <div className="flex items-center gap-4">
                <span className="font-inter text-[14px] font-semibold tracking-[0.05em] text-on-surface-muted">{log.time}</span>
                <span className="font-inter text-[16px] text-primary uppercase">{log.event}</span>
              </div>
              <span className={`font-inter text-[12px] font-semibold tracking-[0.05em] uppercase ${log.isSafe ? 'text-on-surface-muted' : 'text-warden'}`}>
                {log.filter}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
             <div className="p-6 text-center font-inter text-[14px] text-on-surface-muted uppercase tracking-widest">
               No logs recorded yet.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ sessionTime, logs, isArmed, currentUser }) => {
  const infractions = logs.filter(log => !log.isSafe).length;
  const totalEvents = logs.length;
  const focusViolations = logs.filter(log => log.event === 'Focus Lost').length;
  const efficiencyScore = Math.max(0, 100 - (infractions * 5));
  
  const formatSessionTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <span className="material-symbols-outlined text-[48px] mb-4 text-primary">analytics</span>
        <h2 className="font-grotesk text-[32px] text-primary uppercase tracking-widest">Session Analytics</h2>
        <p className="font-inter text-[12px] text-on-surface-muted uppercase tracking-widest mt-2">Real-time Operation Data</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface border border-outline p-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-inter text-[12px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase">Session Duration</span>
            <span className="material-symbols-outlined text-primary">schedule</span>
          </div>
          <div className="font-grotesk text-[32px] font-bold text-primary">{formatSessionTime(sessionTime)}</div>
          <div className="text-[11px] text-on-surface-muted uppercase tracking-widest">Current Session Active</div>
        </div>

        <div className="bg-surface border border-outline p-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-inter text-[12px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase">Efficiency Score</span>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>grade</span>
          </div>
          <div className={`font-grotesk text-[32px] font-bold ${efficiencyScore > 80 ? 'text-primary' : efficiencyScore > 50 ? 'text-yellow-400' : 'text-warden'}`}>
            {efficiencyScore}%
          </div>
          <div className="h-2 bg-outline w-full">
            <div className={`h-full transition-all duration-300 ${efficiencyScore > 80 ? 'bg-primary' : efficiencyScore > 50 ? 'bg-yellow-400' : 'bg-warden'}`} style={{ width: `${efficiencyScore}%` }} />
          </div>
        </div>

        <div className="bg-surface border border-outline p-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-inter text-[12px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase">Total Events</span>
            <span className="material-symbols-outlined text-primary">history</span>
          </div>
          <div className="font-grotesk text-[32px] font-bold text-primary">{totalEvents}</div>
          <div className="text-[11px] text-on-surface-muted uppercase tracking-widest">Logged Activities</div>
        </div>

        <div className="bg-surface border border-outline p-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-inter text-[12px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase">Infractions</span>
            <span className="material-symbols-outlined text-warden" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
          <div className={`font-grotesk text-[32px] font-bold ${infractions > 0 ? 'text-warden punishment-glow' : 'text-primary'}`}>
            {infractions}
          </div>
          <div className="text-[11px] text-on-surface-muted uppercase tracking-widest">Focus Violations</div>
        </div>
      </div>

      {/* SYSTEM STATUS */}
      <div className="bg-surface border border-outline p-6">
        <div className="font-inter text-[12px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase mb-4">System Status</div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-inter text-[14px] text-primary">Monitoring Status</span>
            <span className={`font-grotesk font-bold uppercase text-[12px] ${isArmed ? 'text-green-400' : 'text-on-surface-muted'}`}>
              {isArmed ? '● ACTIVE' : '● OFFLINE'}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-outline">
            <span className="font-inter text-[14px] text-primary">Current User</span>
            <span className="font-grotesk font-bold text-primary">{currentUser?.username}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-outline">
            <span className="font-inter text-[14px] text-primary">Access Level</span>
            <span className={`font-grotesk font-bold uppercase text-[12px] ${currentUser?.role === 'admin' ? 'text-warden' : 'text-primary'}`}>
              {currentUser?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeaderboardView = ({ sessionTime, logs, currentUser, isArmed }) => {
  const infractions = logs.filter(log => !log.isSafe).length;
  const userEfficiency = Math.max(0, 100 - (infractions * 5));
  
  const staticLeaderboard = [
    { rank: '01', name: 'SYS_ADMIN_01', score: 99.9, status: 'elite' },
    { rank: '02', name: 'OPERATIVE_44', score: 98.2, status: 'excellent' },
    { rank: '03', name: 'USER_8921', score: 94.5, status: 'excellent' },
    { rank: '04', name: currentUser?.username || 'CURRENT_OP', score: userEfficiency, status: userEfficiency > 80 ? 'excellent' : userEfficiency > 50 ? 'good' : 'poor', isCurrentUser: true },
    { rank: '05', name: 'GUEST_009', score: 81.1, status: 'good' },
  ];

  const leaderboard = staticLeaderboard
    .sort((a, b) => b.score - a.score)
    .map((u, i) => ({ ...u, rank: String(i + 1).padStart(2, '0') }));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <span className="material-symbols-outlined text-[48px] mb-4 text-primary">military_tech</span>
        <h2 className="font-grotesk text-[32px] text-primary uppercase tracking-widest">Global Efficiency Ranking</h2>
        <p className="font-inter text-[12px] text-on-surface-muted uppercase tracking-widest mt-2">Network-Wide Performance Index</p>
      </div>

      {/* LEADERBOARD */}
      <div className="border border-outline bg-surface overflow-hidden">
        <div className="p-4 border-b border-outline font-inter text-[14px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase bg-surface-container flex justify-between">
          <span className="flex-1">Rank</span>
          <span className="flex-1">Operative</span>
          <span className="flex-1 text-right">Efficiency</span>
        </div>
        <div className="divide-y divide-outline">
          {leaderboard.map((u, i) => {
            const statusColor = 
              u.status === 'elite' ? 'text-green-400' :
              u.status === 'excellent' ? 'text-primary' :
              u.status === 'good' ? 'text-yellow-400' :
              'text-warden';
            
            return (
              <div 
                key={i} 
                className={`p-4 flex justify-between items-center transition-all ${
                  u.isCurrentUser 
                    ? 'bg-primary/10 border-l-2 border-primary' 
                    : 'bg-background/40 hover:bg-outline/20'
                }`}
              >
                <div className="flex-1 flex items-center gap-3">
                  <span className="font-grotesk text-[16px] font-bold text-on-surface-muted w-12">#{u.rank}</span>
                  <div>
                    <span className="font-inter text-[14px] font-semibold text-primary uppercase tracking-widest">{u.name}</span>
                    {u.isCurrentUser && <div className="text-[10px] text-on-surface-muted mt-1">You</div>}
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <span className={`font-grotesk text-[18px] font-bold ${statusColor}`}>
                    {u.score.toFixed(1)}%
                  </span>
                  <div className="text-[10px] text-on-surface-muted mt-1 uppercase tracking-widest">
                    {u.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* YOUR STATS */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-primary/30 p-4">
          <div className="font-inter text-[11px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase mb-2">Your Current Position</div>
          <div className="font-grotesk text-[24px] font-bold text-primary">#{leaderboard.findIndex(u => u.isCurrentUser) + 1}</div>
        </div>
        <div className="bg-surface border border-primary/30 p-4">
          <div className="font-inter text-[11px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase mb-2">Session Infractions</div>
          <div className={`font-grotesk text-[24px] font-bold ${logs.filter(l => !l.isSafe).length > 0 ? 'text-warden' : 'text-primary'}`}>
            {logs.filter(l => !l.isSafe).length}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [activeTab, setActiveTab] = useState('session');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  
  // App Core State
  const[isArmed, setIsArmed] = useState(false);
  const [isSlacking, setIsSlacking] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const[logs, setLogs] = useState([]);

  // Reference to our custom audio element
  const alarmAudioRef = useRef(null);

  // Use refs so event listeners always have the latest state values
  const isArmedRef = useRef(isArmed);
  const isSlackingRef = useRef(isSlacking);
  
  useEffect(() => { isArmedRef.current = isArmed; }, [isArmed]);
  useEffect(() => { isSlackingRef.current = isSlacking; }, [isSlacking]);

  // Handle login
  const handleLogin = (username, role) => {
    setCurrentUser({ username, role });
    const session = Database.getSessionByUsername(username);
    if (session) {
      setCurrentSession(session);
    }
    addLog(`${role.toUpperCase()} LOGIN: ${username}`, 'Auth', true);
  };

  // Handle session join
  const handleSessionJoin = (username, role, sessionId) => {
    setCurrentUser({ username, role });
    const session = Database.getSessionById(sessionId);
    setCurrentSession(session);
    addLog(`JOINED SESSION: ${sessionId}`, 'Session', true);
  };

  // Create new session (admin only)
  const handleCreateSession = () => {
    if (currentUser?.role !== 'admin') return;
    const newSession = Database.createSession(currentUser.username);
    setCurrentSession(newSession);
    setShowCreateSession(false);
    addLog(`SESSION CREATED: ${newSession.id}`, 'Session', true);
  };

  // Handle logout
  const handleLogout = () => {
    const prevUser = currentUser.username;
    setCurrentUser(null);
    setCurrentSession(null);
    setIsArmed(false);
    setIsSlacking(false);
    setSessionTime(0);
    addLog(`LOGOUT: ${prevUser}`, 'Auth', true);
  };

  // Utility to generate timestamp
  const getTimestamp = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  const addLog = (event, filter, isSafe = false) => {
    setLogs(prev =>[{ time: getTimestamp(), event, filter, isSafe }, ...prev]);
  };

  // 1. Timer Logic
  useEffect(() => {
    let interval;
    if (isArmed) {
      interval = setInterval(() => setSessionTime(prev => prev + 1), 1000);
      addLog("System Armed", "Status", true);
    } else {
      if (sessionTime > 0) addLog("System Disarmed", "Status", true);
      setIsSlacking(false); 
    }
    return () => clearInterval(interval);
  }, [isArmed]);

  // 2. Focus Tracking Logic
  useEffect(() => {
    const handleBlur = () => {
      // If armed and not already slacking, trigger breach!
      if (isArmedRef.current && !isSlackingRef.current) {
        setIsSlacking(true);
        addLog("Focus Lost", "Window_Blur");
      }
    };

    const handleFocus = () => {
      // If returning to window while armed, stop alarm
      if (isArmedRef.current && isSlackingRef.current) {
        setIsSlacking(false);
        addLog("Focus Regained", "User_Returned", true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleBlur();
      else handleFocus();
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  },[]);

  // 3. Audio Alarm Logic (Custom File)
  useEffect(() => {
    const audioEl = alarmAudioRef.current;
    if (!audioEl) return;

    if (isSlacking) {
      // Reset to beginning in case it was paused midway
      audioEl.currentTime = 0; 
      // Play the audio
      audioEl.play().catch(error => {
        console.log("Browser blocked auto-play:", error);
      });
    } else {
      // Pause when focus returns or system disarmed
      audioEl.pause();
    }
  },[isSlacking]);

  const handleTerminate = () => {
    setIsArmed(false);
    setIsSlacking(false);
    setSessionTime(0);
    setLogs([]);
  };

  // Show auth screen if not authenticated
  if (!currentUser) {
    return <AuthView onLogin={handleLogin} onSessionJoin={handleSessionJoin} />;
  }

  // Session creation modal (admin only)
  if (showCreateSession && currentUser.role === 'admin') {
    const newSession = Database.createSession(currentUser.username);
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/95 z-[200]">
        <div className="w-full max-w-[500px] mx-auto px-6 text-center">
          <h2 className="font-grotesk text-[32px] font-bold text-primary uppercase mb-4">Session Created</h2>
          <div className="bg-surface border-2 border-primary p-8 space-y-6">
            <div>
              <p className="font-inter text-[12px] text-on-surface-muted uppercase tracking-widest mb-2">Session Code</p>
              <div className="font-grotesk text-[48px] font-bold text-warden punishment-glow tracking-widest">
                {newSession.id}
              </div>
            </div>
            <p className="font-inter text-[14px] text-primary uppercase">
              Share this code with your team to join
            </p>
            <button
              onClick={() => {
                setCurrentSession(newSession);
                setShowCreateSession(false);
              }}
              className="w-full py-4 bg-primary text-background font-grotesk text-[16px] font-bold uppercase hover:scale-[0.98] active:scale-95 transition-transform"
            >
              Start Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Dynamic HUD Glow */}
      <WardenHUD isSlacking={isSlacking} />
      
      <TopAppBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        currentSession={currentSession}
        onCreateSession={() => setShowCreateSession(true)}
      />

      <main className="flex-grow w-full max-w-[800px] mx-auto px-6 pt-32 pb-32 z-10">
        {activeTab === 'session' && (
          <SessionView 
            isArmed={isArmed} 
            setIsArmed={setIsArmed}
            isSlacking={isSlacking}
            sessionTime={sessionTime}
            logs={logs}
            terminateSession={handleTerminate}
            currentUser={currentUser}
            currentSession={currentSession}
          />
        )}
        {activeTab === 'dashboard' && (
          <DashboardView 
            sessionTime={sessionTime} 
            logs={logs} 
            isArmed={isArmed} 
            currentUser={currentUser}
            currentSession={currentSession}
          />
        )}
        {activeTab === 'leaderboard' && (
          <LeaderboardView 
            sessionTime={sessionTime} 
            logs={logs} 
            currentUser={currentUser} 
            isArmed={isArmed}
            currentSession={currentSession}
          />
        )}
      </main>

      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <DecorativeElements />

      {/* 
        YOUR CUSTOM AUDIO FILE: 
        Ensure 'alarm.mp3' (or your chosen name) is inside your public/ folder 
        'loop' ensures it keeps ringing until they return.
      */}
      <audio 
        ref={alarmAudioRef} 
        src="/chicken-on-tree-screaming.mp3" 
        preload="auto" 
        loop
        className="hidden" 
      />
    </div>
  );
}
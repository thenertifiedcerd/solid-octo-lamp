import React, { useState, useEffect, useRef } from 'react';

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

const TopAppBar = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const tabs = ['session', 'dashboard', 'leaderboard'];
  return (
    <header className="bg-background text-primary font-grotesk uppercase tracking-widest text-sm fixed top-0 border-b border-outline flex justify-between items-center w-full px-6 py-4 z-50">
      <div className="text-xl font-bold tracking-tighter text-primary uppercase">
        THE WARDEN
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

// --- LOGIN VIEW ---
const LoginView = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');

  const handleLogin = () => {
    if (username.trim()) {
      onLogin(username, selectedRole);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/95 z-[200]">
      <div className="w-full max-w-[500px] mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="font-grotesk text-[48px] font-bold tracking-[-0.02em] text-primary uppercase mb-4">
            THE WARDEN
          </h1>
          <p className="font-inter text-[14px] text-on-surface-muted uppercase tracking-widest">
            Authentication Protocol
          </p>
        </div>

        <div className="space-y-6 bg-surface border border-outline p-8">
          {/* Username Input */}
          <div className="space-y-2">
            <label className="font-inter text-[12px] font-semibold uppercase tracking-[0.05em] text-on-surface-muted">
              Operative ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your operative ID"
              className="w-full px-4 py-3 bg-background border border-outline text-primary font-inter text-[14px] placeholder-on-surface-muted focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="font-inter text-[12px] font-semibold uppercase tracking-[0.05em] text-on-surface-muted block">
              Access Level
            </label>
            <div className="space-y-2">
              {[
                { id: 'admin', label: 'Admin', description: 'Full system control' },
                { id: 'user', label: 'User', description: 'Limited access' },
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

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={!username.trim()}
            className={`w-full py-4 font-grotesk text-[16px] font-bold uppercase tracking-[0.05em] transition-all ${
              username.trim()
                ? selectedRole === 'admin'
                  ? 'bg-warden text-background punishment-glow hover:scale-[0.98] active:scale-95'
                  : 'bg-primary text-background hover:scale-[0.98] active:scale-95'
                : 'bg-outline text-on-surface-muted cursor-not-allowed opacity-50'
            }`}
          >
            AUTHENTICATE
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="font-inter text-[11px] text-on-surface-muted uppercase tracking-widest opacity-50">
            Use demo credentials: any username, select role
          </p>
        </div>
      </div>
    </div>
  );
};

// --- TAB VIEWS ---

const SessionView = ({ isArmed, setIsArmed, isSlacking, sessionTime, logs, terminateSession, currentUser }) => {
  
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

const DashboardView = () => (
  <div className="flex flex-col items-center justify-center text-center mt-32 space-y-6">
    <span className="material-symbols-outlined text-[80px] text-outline mb-4">analytics</span>
    <h2 className="font-grotesk text-[32px] text-primary uppercase tracking-widest">Surveillance Dashboard</h2>
    <p className="font-inter text-[16px] text-on-surface-muted uppercase tracking-widest max-w-md leading-relaxed">
      Data aggregation currently offline. Maintain focus to generate analytics.
    </p>
  </div>
);

const LeaderboardView = () => {
  const users =[
    { rank: '01', name: 'SYS_ADMIN_01', score: '99.9%' },
    { rank: '02', name: 'OPERATIVE_44', score: '98.2%' },
    { rank: '03', name: 'USER_8921', score: '94.5%' },
    { rank: '04', name: 'GUEST_009', score: '81.1%', isThreat: true },
  ];
  return (
    <div className="mt-10">
      <div className="text-center mb-12 text-on-surface-muted">
         <span className="material-symbols-outlined text-[48px] mb-4">military_tech</span>
         <h2 className="font-grotesk text-[32px] text-primary uppercase tracking-widest">Global Efficiency</h2>
      </div>
      <div className="border border-outline bg-surface overflow-hidden">
        <div className="p-4 border-b border-outline font-inter text-[14px] font-semibold tracking-[0.05em] text-on-surface-muted uppercase bg-surface-container flex justify-between">
          <span>Operative</span>
          <span>Focus Index</span>
        </div>
        <div className="divide-y divide-outline">
          {users.map((u, i) => (
            <div key={i} className="p-4 flex justify-between items-center bg-background/40 hover:bg-outline/20 transition-colors">
              <div className="flex items-center gap-4">
                <span className="font-inter text-[14px] font-semibold text-on-surface-muted">{u.rank}</span>
                <span className="font-inter text-[16px] text-primary uppercase tracking-widest">{u.name}</span>
              </div>
              <span className={`font-grotesk text-[18px] tracking-wider font-bold ${u.isThreat ? 'text-warden punishment-glow px-2 py-1' : 'text-primary'}`}>
                {u.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [activeTab, setActiveTab] = useState('session');
  const [currentUser, setCurrentUser] = useState(null);
  
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
    addLog(`${role.toUpperCase()} LOGIN: ${username}`, 'Auth', true);
  };

  // Handle logout
  const handleLogout = () => {
    const prevUser = currentUser.username;
    setCurrentUser(null);
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

  // Show login screen if not authenticated
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Dynamic HUD Glow */}
      <WardenHUD isSlacking={isSlacking} />
      
      <TopAppBar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={handleLogout} />

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
          />
        )}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
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
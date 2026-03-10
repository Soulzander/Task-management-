import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, Upload, Save, User, Image as ImageIcon, Bell } from 'lucide-react';
import { safeJSONParse } from '../utils/storage';

interface UserProfile {
  name: string;
  description: string;
  image: string;
  notificationsEnabled: boolean;
}

const ANIME_AVATARS = [
  'https://picsum.photos/seed/anime1/200/200',
  'https://picsum.photos/seed/anime2/200/200',
  'https://picsum.photos/seed/anime3/200/200',
  'https://picsum.photos/seed/anime4/200/200',
  'https://picsum.photos/seed/anime5/200/200',
  'https://picsum.photos/seed/anime6/200/200',
  'https://picsum.photos/seed/anime7/200/200',
  'https://picsum.photos/seed/anime8/200/200',
];

export default function ProfileView() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const defaultProfile = { name: 'Kim', description: 'Productivity Architect', image: ANIME_AVATARS[0], notificationsEnabled: false };
    return safeJSONParse(localStorage.getItem('userProfile'), defaultProfile);
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    window.dispatchEvent(new Event('profileUpdated'));
  }, [profile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const exportData = () => {
    const data = {
      tasks: safeJSONParse(localStorage.getItem('tasks'), []),
      goals: safeJSONParse(localStorage.getItem('strategic_goals'), []),
      projects: safeJSONParse(localStorage.getItem('projects'), []),
      journal: safeJSONParse(localStorage.getItem('journal_entries'), []),
      userProfile: safeJSONParse(localStorage.getItem('userProfile'), {})
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.tasks) localStorage.setItem('tasks', JSON.stringify(data.tasks));
          if (data.goals) localStorage.setItem('strategic_goals', JSON.stringify(data.goals));
          if (data.projects) localStorage.setItem('projects', JSON.stringify(data.projects));
          if (data.journal) localStorage.setItem('journal_entries', JSON.stringify(data.journal));
          if (data.userProfile) localStorage.setItem('userProfile', JSON.stringify(data.userProfile));
          
          setImportStatus('success');
          setTimeout(() => setImportStatus('idle'), 3000);
          window.dispatchEvent(new Event('dataImported'));
        } catch (error) {
          console.error('Error importing data:', error);
          setImportStatus('error');
          setTimeout(() => setImportStatus('idle'), 3000);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-12 pb-32">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-white mb-4 anime-text-glow uppercase italic">
          Profile Settings
        </h1>
        <p className="text-anime-cyan font-mono text-xs tracking-[0.3em] uppercase opacity-80">Manage your identity and data.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Edit Section */}
        <section className="anime-card p-8 rounded-none space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-anime-cyan/5 rotate-45 translate-x-16 -translate-y-16" />
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 bg-anime-purple/20 flex items-center justify-center text-anime-cyan border border-anime-cyan/30 skew-x-[-10deg]">
              <User size={24} className="skew-x-[10deg]" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Identity</h2>
          </div>

          <div className="space-y-8 relative z-10">
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-anime-cyan ml-1">Select Avatar</label>
              <div className="grid grid-cols-4 gap-4">
                {ANIME_AVATARS.map((avatar, idx) => (
                  <button
                    key={idx}
                    onClick={() => setProfile(prev => ({ ...prev, image: avatar }))}
                    className={`relative aspect-square overflow-hidden border-2 transition-all ${
                      profile.image === avatar ? 'border-anime-cyan shadow-[0_0_15px_rgba(0,255,255,0.5)] scale-105' : 'border-white/10 grayscale hover:grayscale-0 hover:border-white/30'
                    }`}
                  >
                    <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    {profile.image === avatar && (
                      <div className="absolute inset-0 bg-anime-cyan/20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center sm:flex-row gap-6">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="absolute -inset-2 bg-gradient-to-r from-anime-cyan to-anime-pink rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
                <img 
                  src={profile.image} 
                  alt="Profile" 
                  className="relative w-32 h-32 rounded-full object-cover border-4 border-anime-cyan shadow-[0_0_20px_rgba(0,255,255,0.5)] group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                  <Upload className="text-white" size={32} />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              
              <div className="flex-1 w-full space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-anime-cyan ml-1">Display Name</label>
                <input 
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-14 px-6 bg-black/60 border-b-2 border-anime-cyan/30 focus:border-anime-cyan outline-none text-white text-lg font-display tracking-wider transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-anime-cyan ml-1">Description</label>
              <input 
                type="text"
                value={profile.description || ''}
                onChange={e => setProfile(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Productivity Architect"
                className="w-full h-14 px-6 bg-black/60 border-b-2 border-anime-cyan/30 focus:border-anime-cyan outline-none text-white text-lg font-display tracking-wider transition-all"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 skew-x-[-5deg]">
              <div className="flex items-center gap-3 skew-x-[5deg]">
                <div className="w-10 h-10 bg-anime-purple/20 flex items-center justify-center text-anime-cyan border border-anime-cyan/20">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold uppercase text-xs tracking-wider">Notifications</h3>
                  <p className="text-zinc-500 text-[10px] uppercase font-mono">System alerts & task updates</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!profile.notificationsEnabled && 'Notification' in window) {
                    Notification.requestPermission().then(permission => {
                      if (permission === 'granted') {
                        setProfile(prev => ({ ...prev, notificationsEnabled: true }));
                      } else {
                        alert('Please allow notifications in your browser settings.');
                      }
                    });
                  } else {
                    setProfile(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
                  }
                }}
                className={`w-12 h-6 rounded-none skew-x-[5deg] transition-colors relative ${profile.notificationsEnabled ? 'bg-anime-cyan' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-none bg-white transition-transform ${profile.notificationsEnabled ? 'left-7 bg-black' : 'left-1'}`} />
              </button>
            </div>

            <button 
              onClick={handleSave}
              className="anime-button w-full h-14 flex items-center justify-center gap-2"
            >
              <Save size={20} className="skew-x-[10deg]" />
              <span className="skew-x-[10deg] uppercase tracking-widest">{isSaved ? 'Synchronized!' : 'Update System'}</span>
            </button>
          </div>
        </section>

        {/* Data Management Section */}
        <section className="anime-card p-8 rounded-none space-y-8 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-anime-pink/5 -rotate-45 -translate-x-16 translate-y-16" />
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 bg-anime-pink/20 flex items-center justify-center text-anime-pink border border-anime-pink/30 skew-x-[-10deg]">
              <Save size={24} className="skew-x-[10deg]" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Data Core</h2>
          </div>

          <p className="text-zinc-400 text-sm font-mono uppercase tracking-tight relative z-10">
            Backup your strategic trajectory to the local storage or external data crystals.
          </p>

          <div className="space-y-4 relative z-10">
            <button 
              onClick={exportData}
              className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-bold flex items-center justify-center gap-2 transition-all border border-white/10 skew-x-[-10deg]"
            >
              <Download size={20} className="skew-x-[10deg] text-anime-cyan" />
              <span className="skew-x-[10deg] uppercase tracking-widest">Export Core</span>
            </button>

            <div className="relative">
              <input 
                type="file" 
                ref={importInputRef} 
                onChange={importData} 
                accept=".json" 
                className="hidden" 
              />
              <button 
                onClick={() => importInputRef.current?.click()}
                className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-bold flex items-center justify-center gap-2 transition-all border border-white/10 skew-x-[-10deg]"
              >
                <Upload size={20} className="skew-x-[10deg] text-anime-pink" />
                <span className="skew-x-[10deg] uppercase tracking-widest">Import Core</span>
              </button>
            </div>
            
            {importStatus === 'success' && (
              <p className="text-anime-cyan text-[10px] font-mono text-center animate-pulse">SYSTEM RESTORE SUCCESSFUL</p>
            )}
            {importStatus === 'error' && (
              <p className="text-anime-pink text-[10px] font-mono text-center animate-pulse">CORE CORRUPTION DETECTED</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

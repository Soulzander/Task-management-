import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, Upload, Save, User, Image as ImageIcon, Bell } from 'lucide-react';
import { storage } from '../utils/storage';
import { UserProfile } from '../types';
import { DEFAULT_USER_PROFILE, STORAGE_KEYS } from '../constants';

export default function ProfileView() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    return storage.get(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER_PROFILE);
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    storage.set(STORAGE_KEYS.USER_PROFILE, profile);
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
      tasks: storage.get(STORAGE_KEYS.TASKS, []),
      goals: storage.get(STORAGE_KEYS.GOALS, []),
      projects: storage.get(STORAGE_KEYS.PROJECTS, []),
      journal: storage.get('journal_entries', []),
      userProfile: storage.get(STORAGE_KEYS.USER_PROFILE, {})
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
          if (data.tasks) storage.set(STORAGE_KEYS.TASKS, data.tasks);
          if (data.goals) storage.set(STORAGE_KEYS.GOALS, data.goals);
          if (data.projects) storage.set(STORAGE_KEYS.PROJECTS, data.projects);
          if (data.journal) storage.set('journal_entries', data.journal);
          if (data.userProfile) storage.set(STORAGE_KEYS.USER_PROFILE, data.userProfile);
          
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
    <div className="space-y-12">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-4">
          Profile Settings
        </h1>
        <p className="text-zinc-400 text-lg">Manage your identity and data.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Edit Section */}
        <section className="glass p-8 rounded-3xl space-y-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <User size={24} />
            </div>
            <h2 className="text-2xl font-display font-bold text-white">Identity</h2>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col items-center sm:flex-row gap-6">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img 
                  src={profile.image} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/10 group-hover:border-indigo-500/50 transition-colors"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ImageIcon className="text-white" size={32} />
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
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Display Name</label>
                <input 
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-14 px-6 rounded-2xl bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none text-zinc-200 text-lg transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Description</label>
              <input 
                type="text"
                value={profile.description || ''}
                onChange={e => setProfile(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Productivity Architect"
                className="w-full h-14 px-6 rounded-2xl bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none text-zinc-200 text-lg transition-all"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="text-white font-medium">Notifications</h3>
                  <p className="text-zinc-500 text-xs">Get alerts for deadlines and tasks</p>
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
                className={`w-12 h-6 rounded-full transition-colors relative ${profile.notificationsEnabled ? 'bg-indigo-500' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${profile.notificationsEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <button 
              onClick={handleSave}
              className="w-full h-14 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Save size={20} />
              {isSaved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </section>

        {/* Data Management Section */}
        <section className="glass p-8 rounded-3xl space-y-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Save size={24} />
            </div>
            <h2 className="text-2xl font-display font-bold text-white">Data Management</h2>
          </div>

          <p className="text-zinc-400">
            Export your data to a JSON file to back it up or transfer it to another device. You can import it later to restore your workspace.
          </p>

          <div className="space-y-4">
            <button 
              onClick={exportData}
              className="w-full h-14 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium flex items-center justify-center gap-2 transition-all border border-white/5"
            >
              <Download size={20} />
              Export Data
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
                className="w-full h-14 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium flex items-center justify-center gap-2 transition-all border border-white/5"
              >
                <Upload size={20} />
                Import Data
              </button>
            </div>
            
            {importStatus === 'success' && (
              <p className="text-emerald-400 text-sm text-center">Data imported successfully!</p>
            )}
            {importStatus === 'error' && (
              <p className="text-red-400 text-sm text-center">Error importing data. Invalid file format.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plus, Trash2, Calendar, Quote, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
}

const REMARKS = [
  "The palest ink is better than the best memory.",
  "Journaling is like whispering to one's self and listening at the same time.",
  "Your life is a story worth writing down.",
  "Capture the moments that make your heart beat faster.",
  "In the journal I am at ease."
];

export default function JournalView() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('journal_entries');
    return saved ? JSON.parse(saved) : [];
  });
  const [newEntry, setNewEntry] = useState('');
  const [remark] = useState(() => REMARKS[Math.floor(Math.random() * REMARKS.length)]);

  useEffect(() => {
    localStorage.setItem('journal_entries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!newEntry.trim()) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      content: newEntry.trim()
    };
    setEntries([entry, ...entries]);
    setNewEntry('');
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Remark Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />
        <div className="relative glass p-8 rounded-3xl flex flex-col items-center text-center gap-4 border-white/5">
          <Quote size={32} className="text-indigo-400 opacity-50" />
          <p className="text-xl md:text-2xl font-remark text-zinc-300 italic tracking-wide">
            "{remark}"
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            <Sparkles size={12} className="text-indigo-500" />
            <span>Daily Reflection</span>
          </div>
        </div>
      </motion.div>

      <header className="flex flex-col gap-3">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Daily Journal</h2>
        <p className="text-zinc-500 font-medium">Capture your thoughts, reflections, and moments of clarity.</p>
      </header>

      {/* New Entry Input */}
      <section className="glass p-8 rounded-[2.5rem] border-white/10 relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-700" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <BookOpen size={20} />
              </div>
              <span className="text-sm font-bold text-zinc-300">New Entry</span>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="What's on your mind today?"
            className="w-full h-48 bg-black/20 border border-white/5 rounded-2xl p-6 text-2xl font-journal text-zinc-200 placeholder:text-zinc-700 focus:border-indigo-500/30 outline-none transition-all resize-none custom-scrollbar"
          />

          <div className="flex justify-end">
            <button
              onClick={addEntry}
              disabled={!newEntry.trim()}
              className="px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 group/btn"
            >
              <Plus size={20} className="group-hover/btn:rotate-90 transition-transform" />
              Save Reflection
            </button>
          </div>
        </div>
      </section>

      {/* Entries List */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">Past Reflections</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="glass p-8 rounded-3xl border-white/5 group relative overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.05] transition-all" />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400/60">
                      <Calendar size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">{entry.date}</span>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 text-zinc-600 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <p className="text-2xl font-journal text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {entries.length === 0 && (
            <div className="text-center py-24 glass rounded-3xl border-dashed border-white/5">
              <BookOpen size={48} className="mx-auto mb-4 text-zinc-800" />
              <h3 className="text-xl font-bold text-zinc-500">Your journal is empty</h3>
              <p className="text-zinc-600 mt-1">Start capturing your journey today.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

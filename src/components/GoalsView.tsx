import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import { Target, Trophy, Rocket, Flag, Calendar, Star, Plus, Trash2, X, CheckCircle2, Circle, Zap, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { storage } from '../utils/storage';
import { Goal, SubGoal } from '../types';
import { STORAGE_KEYS } from '../constants';

const ICON_MAP = {
  Flag,
  Rocket,
  Target,
  Trophy,
  Calendar,
  Star,
  Zap
};

const ICON_OPTIONS: (keyof typeof ICON_MAP)[] = ['Zap', 'Rocket', 'Target', 'Trophy', 'Flag', 'Calendar', 'Star'];

const INITIAL_GOALS: Goal[] = [
  {
    id: '1w',
    period: '1 Week',
    title: 'Spring Momentum',
    description: 'Harness the energy of immediate action to drive your weekly progress.',
    color: '#10b981', // emerald
    icon: 'Zap',
    subGoals: [
      { id: '1', text: 'Finish project documentation', completed: false },
      { id: '2', text: 'Review team performance', completed: true }
    ],
    createdAt: Date.now()
  },
  {
    id: '1m',
    period: '1 Month',
    title: 'Static Growth',
    description: 'Solidify your foundations and establish a consistent growth trajectory.',
    color: '#6366f1', // indigo
    icon: 'Rocket',
    subGoals: [],
    createdAt: Date.now()
  },
  {
    id: '6m',
    period: '6 Months',
    title: 'Systematic Impact',
    description: 'Establish a sustainable workflow and achieve core systemic KPIs.',
    color: '#f59e0b', // amber
    icon: 'Target',
    subGoals: [],
    createdAt: Date.now()
  },
  {
    id: '1y',
    period: '1 Year',
    title: 'Visionary Horizon',
    description: 'Transform your long-term vision into a tangible and lasting reality.',
    color: '#f43f5e', // rose
    icon: 'Trophy',
    subGoals: [],
    createdAt: Date.now()
  }
];

function TiltCard({ children, color, index }: { children: React.ReactNode, color: string, index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative h-full"
    >
      <div 
        style={{ transform: "translateZ(50px)" }}
        className="h-full"
      >
        {children}
      </div>
      
      {/* 3D Shadow Layer */}
      <div 
        className="absolute inset-0 rounded-[2.5rem] -z-10 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-2xl"
        style={{ 
          backgroundColor: color,
          transform: "translateZ(-20px) translateY(10px) scale(0.95)"
        }}
      />
    </motion.div>
  );
}

interface GoalsViewProps {
  onModalToggle?: (isOpen: boolean) => void;
}

export default function GoalsView({ onModalToggle }: GoalsViewProps) {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = storage.get<Goal[]>(STORAGE_KEYS.GOALS, INITIAL_GOALS);
    return saved.map((g: any) => ({
      ...g,
      subGoals: g.subGoals || [],
      createdAt: g.createdAt || Date.now()
    }));
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [newGoal, setNewGoal] = useState({
    period: '',
    title: '',
    description: '',
    color: '#6366f1',
    icon: 'Target' as keyof typeof ICON_MAP
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    onModalToggle?.(isCreating || !!confirmDeleteId);
    return () => onModalToggle?.(false);
  }, [isCreating, confirmDeleteId, onModalToggle]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.GOALS, goals);
  }, [goals]);

  const addSubGoal = (goalId: string, text: string) => {
    if (!text.trim()) return;
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subGoals: [...goal.subGoals, { id: crypto.randomUUID(), text, completed: false }]
        };
      }
      return goal;
    }));
  };

  const toggleSubGoal = (goalId: string, subGoalId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subGoals: goal.subGoals.map(sg => 
            sg.id === subGoalId ? { ...sg, completed: !sg.completed } : sg
          )
        };
      }
      return goal;
    }));
  };

  const deleteSubGoal = (goalId: string, subGoalId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subGoals: goal.subGoals.filter(sg => sg.id !== subGoalId)
        };
      }
      return goal;
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    setConfirmDeleteId(null);
  };

  const createCustomGoal = () => {
    if (!newGoal.title || !newGoal.period) return;
    const goal: Goal = {
      id: crypto.randomUUID(),
      period: newGoal.period,
      title: newGoal.title,
      description: newGoal.description,
      color: newGoal.color,
      icon: newGoal.icon,
      subGoals: [],
      createdAt: Date.now()
    };
    setGoals(prev => [...prev, goal]);
    setIsCreating(false);
    setNewGoal({ period: '', title: '', description: '', color: '#6366f1', icon: 'Target' });
  };

  const handleQuickAdd = (period: string, title: string) => {
    setNewGoal({
      period,
      title,
      description: '',
      color: '#6366f1',
      icon: 'Target'
    });
    setIsCreating(true);
    setIsDropdownOpen(false);
  };

  const calculateProgress = (subGoals: SubGoal[]) => {
    if (subGoals.length === 0) return 0;
    const completed = subGoals.filter(sg => sg.completed).length;
    return Math.round((completed / subGoals.length) * 100);
  };

  const calculateTimeProgress = (createdAt: number, period: string, hasObjectives: boolean) => {
    const lowerPeriod = period.toLowerCase();
    const isOneWeek = lowerPeriod === '1 week' || lowerPeriod === 'one week';

    if (!isOneWeek && !hasObjectives) {
      return {
        progress: 0,
        label: 'Add objective to start',
        isExpired: false,
        displayValue: '-',
        isWaiting: true,
        daysLeft: 999
      };
    }

    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    let isCalendarBased = false;

    if (lowerPeriod === '1 week' || lowerPeriod === 'one week') {
      const day = now.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      start.setDate(now.getDate() + diffToMonday);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 7);
      isCalendarBased = true;
    } else if (lowerPeriod === '1 month' || lowerPeriod === 'one month') {
      start = new Date(createdAt);
      end = new Date(start);
      end.setDate(start.getDate() + 30);
      isCalendarBased = true;
    } else if (lowerPeriod === '6 months' || lowerPeriod === 'six months') {
      start = new Date(createdAt);
      end = new Date(start);
      end.setDate(start.getDate() + 180);
      isCalendarBased = true;
    } else if (lowerPeriod === '1 year' || lowerPeriod === 'one year') {
      start = new Date(createdAt);
      end = new Date(start);
      end.setDate(start.getDate() + 365);
      isCalendarBased = true;
    }

    if (isCalendarBased) {
      const totalMs = end.getTime() - start.getTime();
      const elapsedMs = now.getTime() - start.getTime();
      const progress = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
      
      const totalDays = Math.round(totalMs / (1000 * 60 * 60 * 24));
      const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
      const daysLeft = totalDays - elapsedDays;

      return {
        progress: Math.round(progress),
        label: `${daysLeft} days left`,
        isExpired: false,
        displayValue: `${daysLeft}d`,
        isWaiting: false,
        daysLeft: daysLeft
      };
    }

    // Fallback for custom periods
    let durationDays = 0;
    if (lowerPeriod.includes('week')) {
      const match = lowerPeriod.match(/(\d+)\s*week/);
      durationDays = match ? parseInt(match[1]) * 7 : 7;
    } else if (lowerPeriod.includes('month')) {
      const match = lowerPeriod.match(/(\d+)\s*month/);
      durationDays = match ? parseInt(match[1]) * 30 : 30;
    } else if (lowerPeriod.includes('year')) {
      const match = lowerPeriod.match(/(\d+)\s*year/);
      durationDays = match ? parseInt(match[1]) * 365 : 365;
    } else if (lowerPeriod.includes('quarter')) {
      durationDays = 90;
    } else {
      return { progress: 0, label: 'Ongoing', isExpired: false, displayValue: '0d', isWaiting: false, daysLeft: 999 };
    }

    const durationMs = durationDays * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - createdAt;
    const progress = Math.min(100, Math.max(0, (elapsed / durationMs) * 100));
    
    let daysLeft = Math.ceil((durationMs - elapsed) / (24 * 60 * 60 * 1000));
    
    let label = '';
    let isExpired = false;
    if (daysLeft < 0) {
      label = 'Expired';
      isExpired = true;
    } else if (daysLeft === 0) {
      label = 'Last day';
    } else if (daysLeft === 1) {
      label = '1 day left';
    } else {
      label = `${daysLeft} days left`;
    }

    return { 
      progress: Math.round(progress), 
      label, 
      isExpired,
      displayValue: `${Math.max(0, daysLeft)}d`,
      isWaiting: false,
      daysLeft: daysLeft
    };
  };

  useEffect(() => {
    const checkExpired = () => {
      setGoals(prev => {
        const filtered = prev.filter(goal => {
          const stats = calculateTimeProgress(goal.createdAt, goal.period, goal.subGoals.length > 0);
          // Remove if more than 2 days past deadline (daysLeft <= -2)
          return stats.daysLeft > -2;
        });
        if (filtered.length !== prev.length) return filtered;
        return prev;
      });
    };

    checkExpired();
    const interval = setInterval(checkExpired, 1000 * 60 * 30); // Check every 30 mins
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12 pb-32 perspective-[1000px]">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">Strategic Horizons</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-none">
            Your Trajectory
          </h2>
        </div>
        {!isCreating && (
          <div className="flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="group relative px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10 flex items-center gap-3"
              >
                <Zap size={20} className="text-indigo-400" />
                <span>Quick Plan</span>
                <ChevronDown size={16} className={`transition-transform text-zinc-400 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    {[
                      { period: 'One week plan', title: 'Spring momentum', label: 'Spring momentum' },
                      { period: 'One month plan', title: 'Static growth', label: 'Static growth' },
                      { period: 'Six month plan', title: 'Systematic impact', label: 'Systematic impact' },
                      { period: 'One year plan', title: 'Visionary horizon', label: 'Visionary horizon' }
                    ].map(plan => (
                      <button
                        key={plan.period}
                        onClick={() => handleQuickAdd(plan.period, plan.title)}
                        className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <div className="font-medium text-white">{plan.label}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{plan.period}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="group relative px-8 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Plus size={24} className="group-hover:rotate-90 transition-transform" />
              <span>New Horizon</span>
            </button>
          </div>
        )}
      </header>

      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-8 rounded-[2.5rem] border-white/10 max-w-md w-full space-y-6"
            >
              <div className="space-y-2 text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-2xl font-display font-bold text-white">Delete Horizon?</h3>
                <p className="text-zinc-400">This action will permanently remove this strategic trajectory and all its objectives. This cannot be undone.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteGoal(confirmDeleteId)}
                  className="flex-1 py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold transition-all shadow-lg shadow-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div
            key="create-form"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass p-10 rounded-[3rem] border-white/10 relative overflow-hidden"
          >
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-3xl font-display font-bold text-white">New Horizon</h3>
                  <p className="text-zinc-500 text-sm">Define a new dimension of your strategic trajectory.</p>
                </div>
                <button 
                  onClick={() => setIsCreating(false)}
                  className="p-3 rounded-2xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8 max-w-2xl">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Timeframe</label>
                  <input 
                    type="text"
                    placeholder="e.g., 2 Years, Quarter 3..."
                    value={newGoal.period}
                    onChange={e => setNewGoal(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full h-14 px-6 rounded-2xl bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none text-zinc-200 text-lg transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Objective Title</label>
                  <input 
                    type="text"
                    placeholder="What is the core mission?"
                    value={newGoal.title}
                    onChange={e => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full h-14 px-6 rounded-2xl bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none text-zinc-200 text-lg transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Vision Description</label>
                  <textarea 
                    placeholder="Describe the desired future state..."
                    value={newGoal.description}
                    onChange={e => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full h-32 p-6 rounded-2xl bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none text-zinc-200 resize-none text-base transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Aura Color</label>
                  <div className="flex items-center gap-4 px-2 py-4 bg-white/[0.02] rounded-3xl border border-white/5">
                    {['#10b981', '#6366f1', '#f59e0b', '#f43f5e', '#ec4899', '#a855f7', '#3b82f6'].map(c => (
                      <motion.button
                        key={c}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNewGoal(prev => ({ ...prev, color: c }))}
                        className={`relative w-12 h-12 rounded-full transition-all duration-300 ${newGoal.color === c ? 'ring-2 ring-white ring-offset-4 ring-offset-black' : 'opacity-40 hover:opacity-100'}`}
                        style={{ 
                          backgroundColor: c,
                          boxShadow: newGoal.color === c ? `0 0 30px ${c}80` : 'none'
                        }}
                      >
                        {newGoal.color === c && (
                          <motion.div 
                            layoutId="activeColor"
                            className="absolute inset-0 rounded-full border-2 border-white"
                            initial={false}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="px-8 py-4 rounded-2xl hover:bg-white/5 text-zinc-400 font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={createCustomGoal}
                    disabled={!newGoal.title || !newGoal.period}
                    className="px-12 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-900 disabled:text-zinc-700 text-white font-bold transition-all shadow-xl shadow-indigo-500/20"
                  >
                    Launch Horizon
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="goals-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {goals.map((goal, index) => {
                const Icon = ICON_MAP[goal.icon] || Target;
                const progress = calculateProgress(goal.subGoals);
                const timeStats = calculateTimeProgress(goal.createdAt, goal.period, goal.subGoals.length > 0);
                
                return (
                  <TiltCard key={goal.id} color={goal.color} index={index}>
                    <div className="glass p-6 rounded-[2rem] h-full flex flex-col gap-5 relative overflow-hidden transition-all duration-700 group-hover:border-white/40 group-hover:bg-white/[0.08]">
                      {/* Intense Volumetric Glow */}
                      <div 
                        className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-[80px] opacity-30 transition-all duration-700 group-hover:opacity-60 group-hover:scale-150"
                        style={{ backgroundColor: goal.color }}
                      />

                      <div className="flex items-start justify-between relative z-10">
                        <motion.div 
                          animate={{ 
                            y: [0, -4, 0],
                            rotate: [0, 3, 0]
                          }}
                          transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: index * 0.5
                          }}
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl"
                          style={{ 
                            backgroundColor: `${goal.color}30`, 
                            color: goal.color, 
                            border: `1px solid ${goal.color}60`,
                            boxShadow: `0 0 20px ${goal.color}40`
                          }}
                        >
                          <Icon size={24} />
                        </motion.div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-300 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                              {goal.period}
                            </span>
                            <button 
                              onClick={() => setConfirmDeleteId(goal.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 transition-all opacity-40 hover:opacity-100"
                              title="Delete Goal"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            {/* Objectives Progress */}
                            <div className="flex items-center gap-2" title="Objectives Completion">
                              <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">Tasks</span>
                              <div className="w-16 h-1.5 bg-zinc-900/80 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 1.5, ease: "circOut" }}
                                  className="h-full relative"
                                  style={{ 
                                    backgroundColor: goal.color,
                                    boxShadow: `0 0 10px ${goal.color}`
                                  }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                                </motion.div>
                              </div>
                              <span className="text-[10px] font-bold font-mono w-6 text-right" style={{ color: goal.color }}>{progress}%</span>
                            </div>
                            
                            {/* Time Progress */}
                            <div className="flex items-center gap-2" title={timeStats.label}>
                              <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">Time</span>
                              {timeStats.isExpired ? (
                                <div className="flex items-center gap-2">
                                  {progress === 100 ? (
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider animate-pulse">Win</span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider animate-pulse">You Lost</span>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div className="w-16 h-1.5 bg-zinc-900/80 rounded-full overflow-hidden border border-white/5 relative">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${timeStats.progress}%` }}
                                      transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                                      className="h-full relative rounded-full overflow-hidden"
                                      style={{ 
                                        backgroundImage: timeStats.isWaiting
                                          ? 'none'
                                          : 'linear-gradient(90deg, #0ea5e9, #6366f1, #a855f7)',
                                        backgroundColor: timeStats.isWaiting
                                          ? '#3f3f46' // zinc-700
                                          : 'transparent',
                                        backgroundSize: '200% 100%',
                                        boxShadow: timeStats.isWaiting
                                          ? 'none'
                                          : '0 0 15px rgba(99, 102, 241, 0.5)'
                                      }}
                                    >
                                      {!timeStats.isWaiting && (
                                        <motion.div 
                                          animate={{ x: ['-100%', '100%'] }}
                                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                        />
                                      )}
                                    </motion.div>
                                  </div>
                                  <span className={`text-[10px] font-bold font-mono w-auto min-w-[1.5rem] text-right text-zinc-400`}>
                                    {timeStats.displayValue}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 relative z-10">
                        <h3 className="text-xl font-display font-bold text-white group-hover:translate-x-1 transition-transform duration-500">
                          {goal.title}
                        </h3>
                        <p className="text-zinc-400 text-xs leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity line-clamp-2">
                          {goal.description}
                        </p>
                      </div>

                      {/* Interactive Objectives List */}
                      <div className="relative z-10 flex-1 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Objectives</h4>
                          <span className="text-[9px] font-mono text-zinc-600">{goal.subGoals.length} items</span>
                        </div>

                        <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                          <AnimatePresence mode="popLayout">
                            {goal.subGoals.map((sg) => (
                              <motion.div
                                key={sg.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 group/item hover:bg-white/[0.1] hover:border-white/20 transition-all cursor-default"
                              >
                                <button 
                                  onClick={() => toggleSubGoal(goal.id, sg.id)}
                                  className="relative flex items-center justify-center transition-transform active:scale-75"
                                >
                                  {sg.completed ? (
                                    <CheckCircle2 size={16} style={{ color: goal.color, filter: `drop-shadow(0 0 5px ${goal.color})` }} />
                                  ) : (
                                    <Circle size={16} className="text-zinc-700 group-hover/item:text-zinc-500 transition-colors" />
                                  )}
                                </button>
                                <span className={`text-xs flex-1 font-medium transition-all ${sg.completed ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                                  {sg.text}
                                </span>
                                <button 
                                  onClick={() => deleteSubGoal(goal.id, sg.id)}
                                  className="opacity-0 group-item-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-all text-zinc-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>

                        <div className="mt-auto pt-4">
                          <div className="relative group/input">
                            <input 
                              type="text"
                              placeholder="New objective..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  addSubGoal(goal.id, e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                              className="w-full h-10 pl-4 pr-12 rounded-xl bg-black/40 border border-white/5 focus:border-white/30 outline-none text-xs text-zinc-200 placeholder:text-zinc-600 transition-all backdrop-blur-xl"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                              <Plus size={16} className="text-zinc-600 group-focus-within/input:text-white transition-colors" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3D Decorative Icon */}
                      <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:opacity-25 transition-all duration-700 pointer-events-none group-hover:scale-110 group-hover:-rotate-12">
                        <Star size={140} strokeWidth={0.5} style={{ color: goal.color, filter: `blur(2px)` }} />
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

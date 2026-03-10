import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, LayoutGrid, List, Sparkles, Search, Filter, Target, Calendar as CalendarIcon, Briefcase, BookOpen } from 'lucide-react';
import ThreeBackground from './components/ThreeBackground';
import TaskCard from './components/TaskCard';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import GoalsView from './components/GoalsView';
import JournalView from './components/JournalView';
import ProjectsView from './components/ProjectsView';
import ProfileView from './components/ProfileView';

import { safeJSONParse } from './utils/storage';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  difficulty: 'easy' | 'medium' | 'hard';
  color: string;
}

const DIFFICULTY_COLORS = {
  easy: '#10b981', // emerald-500
  medium: '#f59e0b', // amber-500
  hard: '#ef4444', // red-500
};

const DIFFICULTY_WEIGHTS = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export default function App() {
  const [activePage, setActivePage] = useState('calendar');
  const [tasks, setTasks] = useState<Task[]>(() => {
    return safeJSONParse(localStorage.getItem('tasks'), []);
  });
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importKey, setImportKey] = useState(0);
  const [userProfile, setUserProfile] = useState(() => {
    const defaultProfile = { name: 'Kim', description: 'Productivity Architect', image: 'https://picsum.photos/seed/user/200/200', notificationsEnabled: false };
    return safeJSONParse(localStorage.getItem('userProfile'), defaultProfile);
  });

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          const defaultProfile = { name: 'Kim', description: 'Productivity Architect', image: 'https://picsum.photos/seed/user/200/200', notificationsEnabled: false };
          const profile = safeJSONParse(localStorage.getItem('userProfile'), defaultProfile);
          profile.notificationsEnabled = true;
          localStorage.setItem('userProfile', JSON.stringify(profile));
          setUserProfile((prev: any) => ({ ...prev, notificationsEnabled: true }));
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!userProfile.notificationsEnabled || !('Notification' in window)) return;

    const checkNotifications = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      // 1. Check projects ending in 3 days
      const projects = safeJSONParse(localStorage.getItem('projects'), []);
      const notifiedProjects: Record<string, boolean> = safeJSONParse(localStorage.getItem('notifiedProjects'), {});
      
      projects.forEach((project: any) => {
        const endDate = new Date(project.endDate);
        const timeDiff = endDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff >= 0 && daysDiff <= 3) {
          const notifKey = `${project.id}-${todayStr}`;
          if (!notifiedProjects[notifKey]) {
            new Notification('Project Deadline Approaching', {
              body: `Project "${project.name}" is ending ${daysDiff === 0 ? 'today' : 'in ' + daysDiff + ' day(s)'}.`
            });
            notifiedProjects[notifKey] = true;
          }
        }
      });
      localStorage.setItem('notifiedProjects', JSON.stringify(notifiedProjects));

      // 2. Check incomplete tasks 1 hour before day ends (23:00)
      if (now.getHours() === 23) {
        const notifiedTasksDate = localStorage.getItem('notifiedTasksDate');
        if (notifiedTasksDate !== todayStr) {
          const savedTasks = safeJSONParse(localStorage.getItem('tasks'), []);
          const todayTasks = savedTasks.filter((t: any) => new Date(t.createdAt).toDateString() === now.toDateString());
          const hasIncompleteTasks = todayTasks.some((t: any) => !t.completed);
          if (hasIncompleteTasks) {
            new Notification('Incomplete Tasks', {
              body: 'You have incomplete tasks for today. One hour left!'
            });
            localStorage.setItem('notifiedTasksDate', todayStr);
          }
        }
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [userProfile.notificationsEnabled]);

  useEffect(() => {
    const handleStorageChange = () => {
      const defaultProfile = { name: 'Kim', description: 'Productivity Architect', image: 'https://picsum.photos/seed/user/200/200', notificationsEnabled: false };
      setUserProfile(safeJSONParse(localStorage.getItem('userProfile'), defaultProfile));
    };
    
    const handleDataImported = () => {
      handleStorageChange();
      setTasks(safeJSONParse(localStorage.getItem('tasks'), []));
      setImportKey(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleStorageChange);
    window.addEventListener('dataImported', handleDataImported);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
      window.removeEventListener('dataImported', handleDataImported);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback(() => {
    if (inputValue.trim()) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        text: inputValue.trim(),
        completed: false,
        createdAt: Date.now(),
        difficulty,
        color: DIFFICULTY_COLORS[difficulty],
      };
      setTasks((prev) => [newTask, ...prev]);
      setInputValue('');
    }
  }, [inputValue, difficulty]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const todayTasks = tasks.filter((task) => {
    return new Date(task.createdAt).toDateString() === new Date().toDateString();
  });

  const filteredTasks = todayTasks.filter((task) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && !task.completed) ||
      (filter === 'completed' && task.completed);
    return matchesFilter;
  }).sort((a, b) => {
    if (a.completed === b.completed) {
      return b.createdAt - a.createdAt;
    }
    return a.completed ? 1 : -1;
  });

  const totalPoints = todayTasks.reduce((acc, t) => acc + DIFFICULTY_WEIGHTS[t.difficulty], 0);
  const earnedPoints = todayTasks
    .filter((t) => t.completed)
    .reduce((acc, t) => acc + DIFFICULTY_WEIGHTS[t.difficulty], 0);
  const progressPercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  const renderContent = () => {
    switch (activePage) {
      case 'homepage':
        return (
          <>
            {/* Profile Header Section */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 flex items-center gap-6 cursor-pointer group/header"
              onClick={() => setActivePage('profile')}
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <img
                  src={userProfile.image}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/10 object-cover shadow-2xl group-hover/header:border-indigo-500/50 transition-colors"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent group-hover/header:from-indigo-400 group-hover/header:to-emerald-400 transition-all">
                  {userProfile.name}
                </h1>
                <p className="text-zinc-500 font-medium text-sm md:text-base group-hover/header:text-zinc-400 transition-colors">{userProfile.description || 'Productivity Architect'}</p>
              </div>
            </motion.header>

            {/* Input & Controls Section */}
            <section className="glass p-8 rounded-3xl mb-12 space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="What needs to be done?"
                    className="w-full h-14 pl-6 pr-14 rounded-2xl bg-zinc-900/50 border border-zinc-800 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-lg text-zinc-100 placeholder:text-zinc-600"
                  />
                  <button
                    onClick={addTask}
                    disabled={!inputValue.trim()}
                    className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20"
                  >
                    <Plus size={24} />
                  </button>
                </div>

                <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        difficulty === d
                          ? 'bg-zinc-800 text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  {(['all', 'active', 'completed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        filter === f
                          ? 'bg-zinc-800 text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex flex-col items-end">
                    <span className="text-zinc-500">Progress</span>
                    <span className="text-zinc-200 font-medium">
                      {earnedPoints} / {totalPoints} points
                    </span>
                  </div>
                  <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Tasks List Section */}
            <section className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 glass rounded-3xl"
                  >
                    <div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                      <LayoutGrid className="text-zinc-700" size={32} />
                    </div>
                    <h3 className="text-xl font-medium text-zinc-400">No tasks found</h3>
                    <p className="text-zinc-600 mt-1">Start by adding a new dimension to your day.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </>
        );
      case 'goals':
        return <GoalsView onModalToggle={setIsModalOpen} />;
      case 'calendar':
        return <CalendarView tasks={tasks} />;
      case 'projects':
        return <ProjectsView />;
      case 'journal':
        return <JournalView />;
      case 'profile':
        return <ProfileView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-sans relative flex flex-col">
      <ThreeBackground />
      <AnimatePresence>
        {!isModalOpen && (
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
        )}
      </AnimatePresence>

      <main className="flex-1 pb-32">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activePage}-${importKey}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <footer className="mt-24 text-center text-zinc-600 text-sm">
            <p>personal workspace crafted for the future by ZanderCross</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

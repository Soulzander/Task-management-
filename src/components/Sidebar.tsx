import { motion } from 'motion/react';
import { Home, Target, Calendar, Briefcase, BookOpen, User } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const navItems = [
  { id: 'homepage', icon: Home, label: 'Homepage' },
  { id: 'goals', icon: Target, label: 'Goals' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'projects', icon: Briefcase, label: 'Project Management' },
  { id: 'journal', icon: BookOpen, label: 'Journal' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ activePage, setActivePage }: SidebarProps) {
  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 h-16 bg-black/40 backdrop-blur-2xl border border-white/10 z-50 flex items-center px-4 gap-2 rounded-2xl shadow-2xl"
    >
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className="relative group p-3 transition-all duration-300 active:scale-90"
              title={item.label}
            >
              <div
                className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-white/10' : 'group-hover:bg-white/5'
                }`}
              />
              <div className={`relative z-10 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <Icon
                  size={20}
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-brand-primary' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />
              </div>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}

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
      className="fixed bottom-8 left-1/2 -translate-x-1/2 h-20 glass border-none z-50 flex items-center px-6 gap-2 rounded-3xl"
    >
      <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mr-4 hidden md:flex">
        <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45" />
      </div>

      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className="relative group p-3 md:p-4 rounded-2xl transition-all duration-300"
              title={item.label}
            >
              <div
                className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-indigo-500/20 border border-indigo-500/30' : 'group-hover:bg-white/5'
                }`}
              />
              <Icon
                size={24}
                className={`relative z-10 transition-colors duration-300 ${
                  isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'
                }`}
              />
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-8 bg-indigo-500 rounded-t-full"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="ml-4 hidden md:flex">
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </motion.nav>
  );
}

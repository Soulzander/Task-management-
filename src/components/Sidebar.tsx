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
      className="fixed bottom-8 left-1/2 -translate-x-1/2 h-20 bg-black/80 backdrop-blur-2xl border-t-2 border-anime-cyan z-50 flex items-center px-8 gap-4 rounded-none skew-x-[-10deg] shadow-[0_0_30px_rgba(0,255,255,0.2)]"
    >
      <div className="w-10 h-10 bg-anime-purple flex items-center justify-center shadow-lg shadow-anime-purple/40 mr-4 hidden md:flex skew-x-[10deg]">
        <div className="w-4 h-4 border-2 border-white rotate-45" />
      </div>

      <div className="flex items-center gap-2 skew-x-[10deg]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className="relative group p-3 md:p-4 transition-all duration-300 active:scale-90"
              title={item.label}
            >
              <div
                className={`absolute inset-0 transition-all duration-300 ${
                  isActive ? 'bg-anime-cyan/10 border-b-2 border-anime-cyan' : 'group-hover:bg-white/5'
                }`}
              />
              <div className={`relative z-10 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <Icon
                  size={24}
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-anime-cyan anime-text-glow' : 'text-zinc-600 group-hover:text-anime-cyan'
                  }`}
                />
                {/* Glitch layers on hover */}
                <div className="absolute inset-0 text-anime-pink opacity-0 group-hover:opacity-50 group-hover:animate-[glitch-anim_0.2s_infinite] -z-10">
                  <Icon size={24} />
                </div>
                <div className="absolute inset-0 text-anime-cyan opacity-0 group-hover:opacity-50 group-hover:animate-[glitch-anim_0.2s_infinite_reverse] -z-10">
                  <Icon size={24} />
                </div>
              </div>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -top-1 left-0 right-0 h-[2px] bg-anime-cyan shadow-[0_0_15px_rgba(0,255,255,1)]"
                >
                  <div className="absolute inset-0 bg-white animate-pulse" />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>

      <div className="ml-4 hidden md:flex skew-x-[10deg]">
        <div className="w-10 h-10 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-anime-cyan transition-colors cursor-pointer group">
          <div className="w-2 h-2 bg-anime-pink animate-pulse group-hover:scale-150 transition-transform" />
        </div>
      </div>
    </motion.nav>
  );
}

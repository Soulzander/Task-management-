import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, CheckCircle2, Circle, BookOpen } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  difficulty: 'easy' | 'medium' | 'hard';
  color: string;
}

interface CalendarViewProps {
  tasks: Task[];
}

export default function CalendarView({ tasks }: CalendarViewProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(currentYear, selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isToday = (day: number) => {
    return now.getDate() === day && now.getMonth() === selectedMonth && now.getFullYear() === currentYear;
  };

  const getDayName = (day: number) => {
    return new Date(currentYear, selectedMonth, day).toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getTasksForDate = (day: number, month: number, year: number) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate.getDate() === day && 
             taskDate.getMonth() === month && 
             taskDate.getFullYear() === year;
    }).sort((a, b) => {
      if (a.completed === b.completed) {
        return b.createdAt - a.createdAt;
      }
      return a.completed ? 1 : -1;
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const todayElement = scrollRef.current.querySelector('[data-today="true"]');
        if (todayElement) {
          todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedMonth]);

  const selectedTasks = selectedDate ? getTasksForDate(selectedDate.day, selectedDate.month, selectedDate.year) : [];

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-lg pt-4 pb-8 px-4 -mx-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-display font-bold text-white tracking-tight">{currentYear}</h2>
            <p className="text-indigo-400 font-medium tracking-wide uppercase text-xs">{months[selectedMonth]}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedMonth(prev => (prev === 0 ? 11 : prev - 1))}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setSelectedMonth(prev => (prev === 11 ? 0 : prev + 1))}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="px-4 space-y-2"
      >
        {days.map((day) => {
          const today = isToday(day);
          const dayTasks = getTasksForDate(day, selectedMonth, currentYear);
          
          return (
            <motion.div
              key={day}
              data-today={today}
              whileHover={{ x: 10 }}
              onClick={() => setSelectedDate({ day, month: selectedMonth, year: currentYear })}
              className={`w-full py-3 px-5 rounded-2xl flex items-center justify-between transition-all duration-500 cursor-pointer backdrop-blur-md ${
                today 
                  ? 'bg-indigo-500/90 shadow-xl shadow-indigo-500/30 text-white' 
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center min-w-[40px]">
                  <span className="text-[8px] uppercase font-bold tracking-[0.1em] opacity-50">
                    {getDayName(day)}
                  </span>
                  <span className="text-2xl font-display font-bold leading-none">
                    {day}
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium tracking-tight leading-tight">
                    {dayTasks.length > 0 ? `${dayTasks.length} Task${dayTasks.length > 1 ? 's' : ''}` : 'No tasks'}
                  </span>
                  <span className="text-[9px] opacity-40 font-mono uppercase">
                    {months[selectedMonth].slice(0, 3)} {day}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {dayTasks.length > 0 && !today && (
                  <div className="px-2 py-0.5 rounded-full bg-white/10 text-[8px] font-bold uppercase tracking-widest">
                    Details
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-xl p-6 md:p-12 flex items-center justify-center"
          >
            <div className="w-full max-w-2xl bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col max-h-[80vh] relative shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">
                    Tasks for {months[selectedDate.month]} {selectedDate.day}
                  </h3>
                  <p className="text-zinc-500">{selectedTasks.length} tasks found</p>
                </div>
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {selectedTasks.length > 0 ? (
                  selectedTasks.map(task => (
                    <div 
                      key={task.id}
                      className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700 flex items-center gap-4"
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${task.color}20`, color: task.color }}
                      >
                        {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                          {task.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-500">
                            {task.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-12">
                    <BookOpen size={48} className="mb-4 opacity-20" />
                    <p>No tasks recorded for this day.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

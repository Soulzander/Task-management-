import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Check, Trash2, Clock, Calendar } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  difficulty: 'easy' | 'medium' | 'hard';
  color: string;
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

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
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: -50 }}
      className="relative group perspective-1000"
    >
      <div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className={`glass p-6 rounded-2xl flex items-center justify-between gap-4 transition-all duration-300 ${
          task.completed ? "opacity-60 grayscale-[0.5]" : "opacity-100"
        }`}
      >
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => onToggle(task.id)}
            style={{ 
              borderColor: task.completed ? task.color : 'rgba(63, 63, 70, 1)',
              backgroundColor: task.completed ? task.color : 'transparent'
            }}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              task.completed
                ? "text-white"
                : "text-transparent hover:text-zinc-500"
            }`}
          >
            {task.completed && <Check size={18} />}
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className={`text-lg font-medium transition-all duration-300 ${
                  task.completed ? "line-through text-zinc-500" : "text-zinc-100"
                }`}
              >
                {task.text}
              </span>
              <span 
                style={{ backgroundColor: `${task.color}20`, color: task.color, borderColor: `${task.color}40` }}
                className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold border"
              >
                {task.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="p-2 rounded-lg text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300"
        >
          <Trash2 size={20} />
        </button>

        {/* 3D Decorative Element */}
        <div
          style={{
            transform: "translateZ(50px)",
            backgroundColor: `${task.color}20`,
          }}
          className="absolute -right-2 -top-2 w-12 h-12 rounded-full blur-2xl group-hover:opacity-100 opacity-50 transition-all duration-500"
        />
      </div>
    </motion.div>
  );
}

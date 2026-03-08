import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  User, 
  ListTodo, 
  X, 
  ChevronRight, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  inCharge: string;
  subordinates: string[];
  subtasks: Subtask[];
  createdAt: number;
}

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    inCharge: '',
    subordinates: [] as string[],
    subtasks: [] as string[]
  });
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subordinateInput, setSubordinateInput] = useState('');

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.startDate || !newProject.endDate) return;

    const project: Project = {
      id: crypto.randomUUID(),
      name: newProject.name,
      description: newProject.description,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      inCharge: newProject.inCharge,
      subordinates: newProject.subordinates,
      subtasks: newProject.subtasks.map(text => ({
        id: crypto.randomUUID(),
        text,
        completed: false
      })),
      createdAt: Date.now()
    };

    setProjects([project, ...projects]);
    setIsCreating(false);
    setNewProject({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      inCharge: '',
      subordinates: [],
      subtasks: []
    });
  };

  const getProjectStatus = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();

    if (now < start) return { color: '#10b981', label: 'Upcoming' }; // Green
    
    const total = end - start;
    const elapsed = now - start;
    const progress = elapsed / total;

    if (progress < 0.33) return { color: '#10b981', label: 'Early Phase' }; // Green
    if (progress < 0.66) return { color: '#3b82f6', label: 'Mid Phase' }; // Blue
    return { color: '#ef4444', label: 'Deadline Near' }; // Red
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const toggleSubtask = (projectId: string, subtaskId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          subtasks: p.subtasks.map(s => 
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          )
        };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-12 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Project Management</h2>
          <p className="text-zinc-500 font-medium">Orchestrate complex workflows and track long-term initiatives.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="group relative px-8 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-3 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Plus size={24} className="group-hover:rotate-90 transition-transform" />
          <span>New Project</span>
        </button>
      </header>

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
                <h3 className="text-3xl font-display font-bold text-white">Initialize Project</h3>
                <button 
                  onClick={() => setIsCreating(false)}
                  className="p-3 rounded-2xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Project Name</label>
                    <input 
                      type="text"
                      placeholder="Enter project title..."
                      value={newProject.name}
                      onChange={e => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-14 px-6 rounded-2xl bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none text-zinc-200 text-lg transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Description</label>
                    <textarea 
                      placeholder="What is this project about?"
                      value={newProject.description}
                      onChange={e => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full h-32 p-6 rounded-2xl bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none text-zinc-200 resize-none text-base transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Start Date</label>
                      <input 
                        type="date"
                        value={newProject.startDate}
                        onChange={e => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full h-14 px-6 rounded-2xl bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none text-zinc-200 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">End Date</label>
                      <input 
                        type="date"
                        value={newProject.endDate}
                        onChange={e => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full h-14 px-6 rounded-2xl bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none text-zinc-200 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Project Lead</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                      <input 
                        type="text"
                        placeholder="Who is in charge?"
                        value={newProject.inCharge}
                        onChange={e => setNewProject(prev => ({ ...prev, inCharge: e.target.value }))}
                        className="w-full h-14 pl-14 pr-6 rounded-2xl bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none text-zinc-200 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Subordinates</label>
                    <div className="relative group">
                      <input 
                        type="text"
                        placeholder="Add a subordinate..."
                        value={subordinateInput}
                        onChange={e => setSubordinateInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && subordinateInput.trim()) {
                            setNewProject(prev => ({
                              ...prev,
                              subordinates: [...prev.subordinates, subordinateInput.trim()]
                            }));
                            setSubordinateInput('');
                          }
                        }}
                        className="w-full h-14 pl-6 pr-14 rounded-2xl bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none text-zinc-200 transition-all"
                      />
                      <button 
                        onClick={() => {
                          if (subordinateInput.trim()) {
                            setNewProject(prev => ({
                              ...prev,
                              subordinates: [...prev.subordinates, subordinateInput.trim()]
                            }));
                            setSubordinateInput('');
                          }
                        }}
                        className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 flex items-center justify-center transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newProject.subordinates.map((name, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400 flex items-center gap-2">
                          {name}
                          <button onClick={() => setNewProject(prev => ({ ...prev, subordinates: prev.subordinates.filter((_, i) => i !== idx) }))}>
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Subtasks</label>
                    <div className="relative group">
                      <input 
                        type="text"
                        placeholder="Add a subtask..."
                        value={subtaskInput}
                        onChange={e => setSubtaskInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && subtaskInput.trim()) {
                            setNewProject(prev => ({
                              ...prev,
                              subtasks: [...prev.subtasks, subtaskInput.trim()]
                            }));
                            setSubtaskInput('');
                          }
                        }}
                        className="w-full h-14 pl-6 pr-14 rounded-2xl bg-black/40 border border-white/5 focus:border-indigo-500/50 outline-none text-zinc-200 transition-all"
                      />
                      <button 
                        onClick={() => {
                          if (subtaskInput.trim()) {
                            setNewProject(prev => ({
                              ...prev,
                              subtasks: [...prev.subtasks, subtaskInput.trim()]
                            }));
                            setSubtaskInput('');
                          }
                        }}
                        className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 flex items-center justify-center transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {newProject.subtasks.map((task, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={idx}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5"
                        >
                          <span className="text-sm text-zinc-300">{task}</span>
                          <button 
                            onClick={() => setNewProject(prev => ({
                              ...prev,
                              subtasks: prev.subtasks.filter((_, i) => i !== idx)
                            }))}
                            className="text-zinc-600 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="px-8 py-4 rounded-2xl hover:bg-white/5 text-zinc-400 font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateProject}
                  disabled={!newProject.name || !newProject.startDate || !newProject.endDate}
                  className="px-12 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold transition-all shadow-xl shadow-indigo-500/20"
                >
                  Launch Project
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="project-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-8"
          >
            {projects.map((project) => {
              const status = getProjectStatus(project.startDate, project.endDate);
              const completedTasks = project.subtasks.filter(s => s.completed).length;
              const progress = project.subtasks.length > 0 
                ? Math.round((completedTasks / project.subtasks.length) * 100) 
                : 0;

              return (
                <motion.div
                  layout
                  key={project.id}
                  className="group relative"
                >
                  {/* Dynamic Glow Layer */}
                  <div 
                    className="absolute -inset-4 rounded-[3.5rem] blur-[50px] opacity-20 group-hover:opacity-60 transition-all duration-700"
                    style={{ 
                      background: `radial-gradient(circle at center, ${status.color}80 0%, transparent 70%)` 
                    }}
                  />
                  
                  <div className="relative glass p-8 rounded-[2.5rem] border-white/10 overflow-hidden group-hover:border-white/20 transition-colors">
                    {/* Interior Aura Accent */}
                    <div 
                      className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"
                      style={{ backgroundColor: status.color }}
                    />
                    <div className="flex flex-col lg:flex-row gap-10">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-3xl font-display font-bold text-white">{project.name}</h3>
                              <span 
                                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                                style={{ 
                                  color: status.color, 
                                  borderColor: `${status.color}40`,
                                  backgroundColor: `${status.color}10`
                                }}
                              >
                                {status.label}
                              </span>
                            </div>
                            <p className="text-zinc-400 leading-relaxed">{project.description}</p>
                          </div>
                          <button 
                            onClick={() => deleteProject(project.id)}
                            className="p-3 rounded-2xl hover:bg-rose-500/10 text-zinc-600 hover:text-rose-500 transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="flex items-center gap-3 text-zinc-500">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                              <Calendar size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Timeline</span>
                              <span className="text-xs text-zinc-300">{project.startDate} — {project.endDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-zinc-500">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                              <User size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Lead & Team</span>
                              <span className="text-xs text-zinc-300">
                                {project.inCharge || 'Unassigned'}
                                {project.subordinates?.length > 0 && ` (+${project.subordinates.length} team)`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-zinc-500">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                              <Clock size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Progress</span>
                              <span className="text-xs text-zinc-300">{progress}% Complete</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full h-2 bg-zinc-900/80 rounded-full overflow-hidden border border-white/5 relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="h-full relative rounded-full overflow-hidden"
                            style={{ 
                              backgroundImage: 'linear-gradient(90deg, #b45309, #d97706, #fbbf24, #fef08a)',
                              backgroundSize: '200% 100%',
                              boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)'
                            }}
                          >
                            <motion.div 
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            />
                          </motion.div>
                        </div>
                      </div>

                      <div className="lg:w-80 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Subtasks</h4>
                          <span className="text-[10px] font-mono text-zinc-600">{completedTasks}/{project.subtasks.length}</span>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                          {[...project.subtasks].sort((a, b) => {
                            if (a.completed === b.completed) return 0;
                            return a.completed ? 1 : -1;
                          }).map((task) => (
                            <div 
                              key={task.id}
                              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 group/task hover:bg-white/[0.05] transition-all"
                            >
                              <button 
                                onClick={() => toggleSubtask(project.id, task.id)}
                                className="transition-transform active:scale-75"
                              >
                                {task.completed ? (
                                  <CheckCircle2 size={18} className="text-indigo-400" />
                                ) : (
                                  <div className="w-[18px] h-[18px] rounded-full border-2 border-zinc-700 group-hover/task:border-zinc-500" />
                                )}
                              </button>
                              <span className={`text-xs flex-1 ${task.completed ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                                {task.text}
                              </span>
                            </div>
                          ))}
                          {project.subtasks.length === 0 && (
                            <p className="text-center py-4 text-xs text-zinc-600 italic">No subtasks defined</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {projects.length === 0 && (
              <div className="text-center py-32 glass rounded-[3rem] border-dashed border-white/5">
                <Briefcase size={64} className="mx-auto mb-6 text-zinc-800" />
                <h3 className="text-2xl font-bold text-zinc-500">No active projects</h3>
                <p className="text-zinc-600 mt-2">Launch your first initiative to start tracking progress.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

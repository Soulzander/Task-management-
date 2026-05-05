import { motion } from 'motion/react';
import { TrendingUp, Award, Brain, Target, Activity } from 'lucide-react';
import { Task } from '../types';
import { useMemo } from 'react';

interface ReviewViewProps {
  tasks: Task[];
}

export default function ReviewView({ tasks }: ReviewViewProps) {
  // Calculate daily stats for the last 7 days
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    return days.map(date => {
      const dayTasks = tasks.filter(t => {
        const td = new Date(t.createdAt);
        return td.getDate() === date.getDate() && td.getMonth() === date.getMonth() && td.getFullYear() === date.getFullYear();
      });
      const total = dayTasks.length;
      const completed = dayTasks.filter(t => t.completed).length;
      const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
      return {
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        total,
        completed,
        percentage
      };
    });
  }, [tasks]);

  const overallStats = useMemo(() => {
    const total = last7Days.reduce((acc, day) => acc + day.total, 0);
    const completed = last7Days.reduce((acc, day) => acc + day.completed, 0);
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percentage };
  }, [last7Days]);

  // Generate insights (small blogs)
  const insights = useMemo(() => {
    const blogs = [];
    
    // 1. Completion Trend
    const recentDays = last7Days.slice(-3);
    const recentCompleted = recentDays.reduce((acc, day) => acc + day.completed, 0);
    const recentTotal = recentDays.reduce((acc, day) => acc + day.total, 0);
    const recentRate = recentTotal === 0 ? 0 : (recentCompleted / recentTotal) * 100;

    if (recentTotal === 0) {
      blogs.push({
        title: "Time to Build Momentum",
        icon: Activity,
        content: "You haven't scheduled many tasks recently. Start by adding 2-3 small, manageable tasks each day to build your momentum and get back into a productive rhythm."
      });
    } else if (recentRate >= 80) {
      blogs.push({
        title: "Outstanding Consistency",
        icon: TrendingUp,
        content: `You've completed ${Math.round(recentRate)}% of your tasks over the last few days. This high completion rate shows excellent focus and realistic planning. Keep maintaining this sustainable pace.`
      });
    } else if (recentRate >= 50) {
      blogs.push({
        title: "Steady Progress",
        icon: Target,
        content: `You're hitting a ${Math.round(recentRate)}% completion rate recently. You are making solid progress, but there might be room to optimize. Consider if you are taking on slightly too much each day.`
      });
    } else {
      blogs.push({
        title: "Reassess Your Workload",
        icon: Brain,
        content: `Your recent completion rate is around ${Math.round(recentRate)}%. It looks like you might be overestimating your daily capacity. Try scheduling fewer tasks and focus on completing them fully before adding more.`
      });
    }

    // 2. Difficulty Management
    const hardTasks = tasks.filter(t => t.difficulty === 'hard');
    const hardCompleted = hardTasks.filter(t => t.completed).length;
    const hardRate = hardTasks.length === 0 ? 0 : (hardCompleted / hardTasks.length) * 100;

    if (hardTasks.length > 0) {
      if (hardRate >= 70) {
        blogs.push({
          title: "Mastering the Hard Stuff",
          icon: Award,
          content: "You have a great track record of finishing your most difficult tasks. Tackling high-friction items head-on is a strong indicator of long-term growth and discipline."
        });
      } else {
        blogs.push({
          title: "Tackling High-Friction Tasks",
          icon: Brain,
          content: "You tend to leave 'hard' tasks incomplete. A great strategy is to 'Eat the Frog'—tackle your most difficult or dreaded task first thing in the morning when your willpower is highest."
        });
      }
    } else {
      blogs.push({
        title: "Step Out of Your Comfort Zone",
        icon: Target,
        content: "You haven't scheduled many 'hard' tasks recently. While knocking out easy tasks feels good, true growth happens when you challenge yourself with more complex objectives."
      });
    }

    return blogs;
  }, [last7Days, tasks]);

  return (
    <div className="space-y-12 pb-32">
      <header className="flex flex-col gap-3">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Performance Review</h2>
        <p className="text-zinc-500 font-medium">Analyze your growth, track daily completion, and discover areas for improvement.</p>
      </header>

      {/* Daily Completion Chart */}
      <section className="glass p-8 rounded-[2.5rem] border-white/10 relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-700" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-white">Daily Completion Rate</h3>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-400">{overallStats.percentage}%</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Overall Rate</div>
            </div>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 md:gap-4 pt-4">
            {last7Days.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-3 flex-1 group/bar h-full justify-end">
                <div className="w-full relative flex flex-col justify-end h-[120px] bg-black/20 rounded-t-xl overflow-hidden">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${day.percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl relative group-hover/bar:from-indigo-500 group-hover/bar:to-indigo-300 transition-colors"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white opacity-0 group-hover/bar:opacity-100 transition-opacity">
                      {day.percentage}%
                    </div>
                  </motion.div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover/bar:text-zinc-300 transition-colors">
                  {day.dayName}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Growth & Suggestions Blogs */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">Growth & Suggestions</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden group"
              >
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.05] transition-all" />
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
                    <Icon size={24} />
                  </div>
                  <h4 className="text-xl font-display font-bold text-white">{insight.title}</h4>
                  <p className="text-zinc-400 leading-relaxed text-sm">
                    {insight.content}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

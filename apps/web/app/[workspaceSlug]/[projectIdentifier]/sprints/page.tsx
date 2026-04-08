'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  Plus, Calendar, Target, ChevronRight, 
  TrendingDown, LayoutGrid, Briefcase, Settings,
  Activity, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  tasks: any[];
}

export default function SprintsPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  
  const [project, setProject] = useState<any>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Sprint state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    try {
      const wsRes = await api.get(`/workspaces/${params.workspaceSlug}`);
      const workspace = wsRes.data.data;

      const projRes = await api.get(`/workspaces/${workspace.id}/projects`);
      const proj = projRes.data.data.find((p: any) => p.identifier.toLowerCase() === (params.projectIdentifier as string).toLowerCase());
      
      if (!proj) throw new Error('Project not found');
      setProject(proj);

      const sprintsRes = await api.get(`/projects/${proj.id}/sprints`);
      setSprints(sprintsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch sprints', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [accessToken, params.workspaceSlug, params.projectIdentifier, router]);

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    setIsCreating(true);
    try {
      await api.post(`/projects/${project.id}/sprints`, { name, goal });
      setIsModalOpen(false);
      setName('');
      setGoal('');
      fetchData();
    } catch (err) {
      console.error('Failed to create sprint', err);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-white" />
      </div>
    );
  }

  const activeSprint = sprints.find(s => s.status === 'ACTIVE');
  const upcomingSprints = sprints.filter(s => s.status === 'UPCOMING');

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex">
      {/* Sidebar - Reusing styles */}
      <aside className="w-64 border-r border-white/10 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="font-bold tracking-tighter uppercase">TASKFLOW</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
           <Link href={`/${params.workspaceSlug}/${params.projectIdentifier}/tasks`} className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium">
             <Briefcase className="w-4 h-4" />
             Kanban Board
           </Link>
           <Link href="#" className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg text-sm font-medium">
             <Activity className="w-4 h-4" />
             Sprints
           </Link>
           <Link href={`/${params.workspaceSlug}/${params.projectIdentifier}/settings`} className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium">
             <Settings className="w-4 h-4" />
             Settings
           </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                Sprints
              </h1>
              <p className="text-zinc-500 mt-2">Plan and execute work cycles for your team.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Sprint
            </Button>
          </div>

          {/* Active Sprint Section */}
          <section className="space-y-6">
             <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-400">
                <Clock className="w-5 h-5" /> Current Sprint
             </h2>
             {activeSprint ? (
                <div className="glass p-8 rounded-3xl border border-blue-500/20 shadow-2xl shadow-blue-500/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4">
                      <TrendingDown className="w-32 h-32 text-blue-500/5 absolute -top-8 -right-8 group-hover:scale-110 transition-transform" />
                   </div>
                   
                   <div className="relative z-10 flex flex-col md:flex-row gap-10">
                      <div className="flex-1 space-y-4">
                         <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-widest bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                               Active
                            </span>
                            <span className="text-zinc-500 text-sm">{new Date(activeSprint.startDate!).toLocaleDateString()} - {new Date(activeSprint.endDate!).toLocaleDateString()}</span>
                         </div>
                         <h3 className="text-2xl font-bold">{activeSprint.name}</h3>
                         <p className="text-zinc-400 max-w-lg">{activeSprint.goal || 'No goal set for this sprint.'}</p>
                         
                         <div className="flex gap-6 pt-4">
                            <div className="space-y-1">
                               <div className="text-2xl font-bold">{activeSprint.tasks.length}</div>
                               <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Tasks</div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="space-y-1">
                               <div className="text-2xl font-bold text-emerald-500">
                                  {activeSprint.tasks.filter(t => t.status === 'DONE').length}
                               </div>
                               <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Completed</div>
                            </div>
                         </div>
                      </div>

                      <div className="w-full md:w-80 h-48 bg-white/5 rounded-2xl border border-white/10 p-6 flex items-center justify-center">
                         <div className="text-center space-y-3">
                            <Activity className="w-10 h-10 text-zinc-700 mx-auto" />
                            <p className="text-xs text-zinc-500 leading-relaxed uppercase tracking-tighter font-bold">Burndown Chart<br/>Coming Soon</p>
                         </div>
                      </div>
                   </div>
                </div>
             ) : (
                <div className="p-12 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                      <Target className="w-8 h-8 text-zinc-600" />
                   </div>
                   <div>
                      <h4 className="font-semibold text-zinc-300">No active sprint</h4>
                      <p className="text-sm text-zinc-500 mt-1 max-w-xs">Start an upcoming sprint to see progress and burndown analytics.</p>
                   </div>
                </div>
             )}
          </section>

          {/* Upcoming Sprints */}
          <section className="space-y-6">
             <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-zinc-500" /> Upcoming Sprints
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingSprints.map((sprint) => (
                   <div key={sprint.id} className="glass p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                         <h4 className="font-bold group-hover:text-blue-400 transition-colors uppercase tracking-tight">{sprint.name}</h4>
                         <MoreHorizontal className="w-4 h-4 text-zinc-600" />
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2 h-8 mb-6">{sprint.goal || 'No goal set.'}</p>
                      
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
                            {sprint.tasks.length} Tasks
                         </div>
                         <Button variant="ghost" size="sm" className="h-7 text-[10px] px-3 font-bold uppercase tracking-widest">
                            Start Sprint
                         </Button>
                      </div>
                   </div>
                ))}
                
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="p-6 border border-dashed border-white/10 rounded-2xl h-full flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors group"
                >
                   <Plus className="w-6 h-6 text-zinc-600 group-hover:text-zinc-400 mb-2" />
                   <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400">New Sprint</span>
                </button>
             </div>
          </section>
        </div>
      </main>

      {/* Create Sprint Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Sprint">
        <form onSubmit={handleCreateSprint} className="space-y-6">
           <Input 
             label="Sprint Name" 
             placeholder="e.g. Q4 Performance Push" 
             value={name}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
             required
           />
           <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-400">Sprint Goal</label>
              <textarea 
                className="bg-zinc-900 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[100px]"
                placeholder="What are we trying to achieve?"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
           </div>
           
           <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={isCreating}>Create Sprint</Button>
           </div>
        </form>
      </Modal>
    </div>
  );
}

function MoreHorizontal(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

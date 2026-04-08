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
  Search, Filter, Plus, MoreHorizontal, 
  MessageSquare, Paperclip, Calendar,
  LayoutGrid, List as ListIcon, Settings,
  Briefcase, Users, ChevronRight, BarChart2
} from 'lucide-react';

type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';

interface Task {
  id: string;
  title: string;
  sequenceNumber: number;
  status: TaskStatus;
  priority: string;
  project: {
    identifier: string;
  };
}

interface Project {
  id: string;
  name: string;
  identifier: string;
}

const COLUMNS: { label: string; status: TaskStatus; color: string }[] = [
  { label: 'Backlog', status: 'BACKLOG', color: 'bg-zinc-500/10 text-zinc-400' },
  { label: 'To Do', status: 'TODO', color: 'bg-blue-500/10 text-blue-400' },
  { label: 'In Progress', status: 'IN_PROGRESS', color: 'bg-amber-500/10 text-amber-400' },
  { label: 'In Review', status: 'IN_REVIEW', color: 'bg-purple-500/10 text-purple-400' },
  { label: 'Done', status: 'DONE', color: 'bg-emerald-500/10 text-emerald-400' },
];

export default function KanbanPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New Task state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('TODO');
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    try {
      // Find workspace first to get ID
      const wsRes = await api.get(`/workspaces/${params.workspaceSlug}`);
      const workspace = wsRes.data.data;

      // Find projects in workspace to match identifier
      const projRes = await api.get(`/workspaces/${workspace.id}/projects`);
      const proj = projRes.data.data.find((p: any) => p.identifier.toLowerCase() === (params.projectIdentifier as string).toLowerCase());
      
      if (!proj) throw new Error('Project not found');
      setProject(proj);

      // Fetch tasks for the project
      const tasksRes = await api.get(`/projects/${proj.id}/tasks`);
      setTasks(tasksRes.data.data);
    } catch (err) {
      console.error('Failed to fetch Kanban data', err);
      router.push(`/${params.workspaceSlug}`);
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    setIsCreating(true);
    try {
      await api.post(`/projects/${project.id}/tasks`, {
        title: newTaskTitle,
        status: newTaskStatus,
      });
      setIsModalOpen(false);
      setNewTaskTitle('');
      fetchData();
    } catch (err) {
      console.error('Failed to create task', err);
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

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex">
      {/* Sidebar */}
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
          <Link href={`/${params.workspaceSlug}`} className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-colors">
            <LayoutGrid className="w-4 h-4" />
            Workspace
          </Link>
          <div className="mt-4 px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Project: {project?.identifier}
          </div>
          <Link href={`/${params.workspaceSlug}/${params.projectIdentifier}/tasks`} className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg text-sm font-medium">
            <Briefcase className="w-4 h-4" />
            Kanban Board
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium">
            <ListIcon className="w-4 h-4" />
            List View
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium">
            <BarChart2 className="w-4 h-4" />
            Insights
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium">
            <Settings className="w-4 h-4" />
            Project Settings
          </Link>
        </nav>
      </aside>

      {/* Main Kanban Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Kanban Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl z-20 sticky top-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center font-bold text-xs text-zinc-400">
               {project?.identifier}
            </div>
            <h2 className="font-semibold truncate">{project?.name}</h2>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
            <span className="text-zinc-400 truncate">Tasks</span>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search tasks..." 
                  className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-white/20 w-48 transition-all focus:w-64"
                />
             </div>
             <Button variant="outline" size="sm" className="h-8">
               <Filter className="w-3.5 h-3.5 mr-2" /> Filter
             </Button>
             <Button size="sm" className="h-8" onClick={() => setIsModalOpen(true)}>
               <Plus className="w-3.5 h-3.5 mr-1" /> New Task
             </Button>
          </div>
        </header>

        {/* Board */}
        <div className="flex-1 overflow-x-auto p-6 flex gap-6 mt-2">
           {COLUMNS.map((col) => (
             <div key={col.status} className="w-80 shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-4 px-2">
                   <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${col.color}`}>
                         {col.label}
                      </span>
                      <span className="text-zinc-600 text-xs font-medium">
                         {tasks.filter(t => t.status === col.status).length}
                      </span>
                   </div>
                   <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full">
                      <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                   </Button>
                </div>

                <div className="flex flex-col gap-3 flex-1">
                   {tasks.filter(t => t.status === col.status).map((task) => (
                      <div 
                        key={task.id} 
                        className="p-4 glass rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-lg hover:shadow-black/20"
                      >
                         <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-zinc-600 tracking-tighter group-hover:text-zinc-400">
                               {project?.identifier}-{task.sequenceNumber}
                            </span>
                            <div className="uppercase text-[8px] font-black tracking-widest px-1.5 py-0.5 border border-white/10 rounded-md text-zinc-500 group-hover:border-white/20 transition-colors">
                               FEATURE
                            </div>
                         </div>
                         <h4 className="text-sm font-medium mb-4 line-clamp-2group-hover:text-blue-400 transition-colors">
                            {task.title}
                         </h4>
                         
                         <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2">
                               <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                  <MessageSquare className="w-3 h-3" /> 2
                               </div>
                               <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                  <Paperclip className="w-3 h-3" /> 1
                               </div>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] text-zinc-400 overflow-hidden">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.id}`} alt="avatar" />
                            </div>
                         </div>
                      </div>
                   ))}

                   <Button 
                     variant="ghost" 
                     className="w-full border border-dashed border-white/5 hover:border-white/10 hover:bg-white/[0.02] py-4 rounded-xl flex items-center justify-start gap-2 text-zinc-500 hover:text-zinc-400 text-sm"
                     onClick={() => {
                       setNewTaskStatus(col.status);
                       setIsModalOpen(true);
                     }}
                   >
                     <Plus className="w-4 h-4" /> Add task
                   </Button>
                </div>
             </div>
           ))}
        </div>
      </main>

      {/* New Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="flex flex-col gap-5">
           <Input 
             label="Task Title" 
             placeholder="What needs to be done?" 
             value={newTaskTitle}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskTitle(e.target.value)}
             required
           />
           
           <div className="flex flex-col gap-1.5">
             <label className="text-sm font-medium text-zinc-400">Status</label>
             <select 
               className="bg-zinc-900 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
               value={newTaskStatus}
               onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
             >
                {COLUMNS.map(c => (
                  <option key={c.status} value={c.status}>{c.label}</option>
                ))}
             </select>
           </div>
           
           <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={isCreating}>Create Task</Button>
           </div>
        </form>
      </Modal>
    </div>
  );
}

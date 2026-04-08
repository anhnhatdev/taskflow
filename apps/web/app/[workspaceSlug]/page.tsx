'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import Link from 'next/link';
import { Briefcase, Settings, Plus, LayoutGrid, List as ListIcon, Users } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  identifier: string;
  color?: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New Project State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjId, setNewProjId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    try {
      const wsRes = await api.get(`/workspaces/${params.workspaceSlug}`);
      const ws = wsRes.data.data;
      setWorkspace(ws);

      const projRes = await api.get(`/workspaces/${ws.id}/projects`);
      setProjects(projRes.data.data);
    } catch (err) {
      console.error('Failed to fetch workspace data', err);
      router.push('/dashboard');
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
  }, [accessToken, params.workspaceSlug, router]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    
    setIsCreating(true);
    try {
      await api.post(`/workspaces/${workspace.id}/projects`, {
        name: newProjName,
        identifier: newProjId,
      });
      setIsModalOpen(false);
      setNewProjName('');
      setNewProjId('');
      fetchData();
    } catch (err) {
      console.error('Failed to create project', err);
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
      <aside className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="font-bold tracking-tighter">TASKFLOW</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Workspace
          </div>
          <Link href={`/${params.workspaceSlug}`} className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg text-sm font-medium">
            <Briefcase className="w-4 h-4" />
            Projects
          </Link>
          <Link href={`/${params.workspaceSlug}/members`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white">
            <Users className="w-4 h-4" />
            Members
          </Link>
          <Link href={`/${params.workspaceSlug}/settings`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-sm uppercase shadow-lg shadow-blue-500/10">
              {workspace?.name.charAt(0)}
            </div>
            <h2 className="font-semibold">{workspace?.name}</h2>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </header>

        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-zinc-400 text-sm">Manage your software development projects here.</p>
          </div>

          {projects.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center bg-white/5">
              <Briefcase className="w-12 h-12 text-zinc-600 mb-4" />
              <h3 className="text-lg font-semibold">No projects yet</h3>
              <p className="text-zinc-500 text-sm mb-6">Start by creating a project to manage your tasks.</p>
              <Button onClick={() => setIsModalOpen(true)}>Create Project</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((p) => (
                <Link 
                  key={p.id}
                  href={`/${params.workspaceSlug}/${p.identifier.toLowerCase()}/tasks`}
                  className="group p-6 glass rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-zinc-400 text-sm">
                      {p.identifier}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings className="w-4 h-4 text-zinc-500" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg mb-1">{p.name}</h4>
                  <p className="text-zinc-500 text-sm line-clamp-2">{p.description || 'No description provided.'}</p>
                  
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                       <span className="text-xs text-zinc-500">Active</span>
                    </div>
                    <div className="h-6 w-16 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">PROJ</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="flex flex-col gap-5">
           <Input 
             label="Project Name" 
             placeholder="e.g. Mobile App" 
             value={newProjName}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
               setNewProjName(e.target.value);
               if (!newProjId) {
                  setNewProjId(e.target.value.substring(0, 3).toUpperCase());
               }
             }}
             required
           />
           <Input 
             label="Project Identifier (Short Key)" 
             placeholder="e.g. APP" 
             value={newProjId}
             maxLength={10}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjId(e.target.value.toUpperCase())}
             required
           />
           <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={isCreating}>Create Project</Button>
           </div>
        </form>
      </Modal>
    </div>
  );
}

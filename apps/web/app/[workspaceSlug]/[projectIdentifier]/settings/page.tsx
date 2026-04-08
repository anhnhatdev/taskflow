'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  Github, Settings, Briefcase, LayoutGrid, 
  ArrowLeft, Save, Trash2, AlertCircle
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  identifier: string;
  githubRepoOwner?: string;
  githubRepoName?: string;
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings state
  const [name, setName] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const wsRes = await api.get(`/workspaces/${params.workspaceSlug}`);
      const workspace = wsRes.data.data;

      const projRes = await api.get(`/workspaces/${workspace.id}/projects`);
      const proj = projRes.data.data.find((p: any) => p.identifier.toLowerCase() === (params.projectIdentifier as string).toLowerCase());
      
      if (!proj) throw new Error('Project not found');
      
      setProject(proj);
      setName(proj.name);
      setGithubOwner(proj.githubRepoOwner || '');
      setGithubRepo(proj.githubRepoName || '');
    } catch (err) {
      console.error('Failed to fetch project settings', err);
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

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    setIsSaving(true);
    try {
      // In a real app, we'd have a PATCH /projects/:id endpoint
      // For now, let's assume we use the workspace-scoped one
      await api.patch(`/workspaces/${params.workspaceSlug}/projects/${project.id}`, {
        name,
        githubRepoOwner: githubOwner,
        githubRepoName: githubRepo,
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setIsSaving(false);
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
      {/* Sidebar - Reusing styles from Kanban */}
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
             <ArrowLeft className="w-4 h-4" />
             Back to Board
           </Link>
           <div className="mt-4 px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
             Settings
           </div>
           <Link href="#" className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg text-sm font-medium">
             <Settings className="w-4 h-4" />
             General
           </Link>
           <Link href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium">
             <Github className="w-4 h-4" />
             GitHub App
           </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
              Project Settings
            </h1>
            <p className="text-zinc-500 mt-2">Manage your project configuration and integrations.</p>
          </div>

          <form onSubmit={handleUpdateSettings} className="space-y-10">
             {/* General Section */}
             <section className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                   <Briefcase className="w-5 h-5 text-blue-500" /> General Information
                </h3>
                <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                   <Input 
                     label="Project Name" 
                     value={name} 
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                   />
                   <div className="flex flex-col gap-1.5 opacity-50 cursor-not-allowed">
                      <label className="text-sm font-medium text-zinc-400">Project Identifier</label>
                      <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-500">
                         {project?.identifier}
                      </div>
                      <p className="text-[10px] text-zinc-600">Identifiers cannot be changed after project creation.</p>
                   </div>
                </div>
             </section>

             {/* GitHub Integration Section */}
             <section className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Github className="w-5 h-5 text-white" /> GitHub Integration
                   </h3>
                   {githubOwner && githubRepo ? (
                      <span className="text-[10px] px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full font-bold uppercase tracking-widest">
                         Connected
                      </span>
                   ) : (
                      <span className="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full font-bold uppercase tracking-widest">
                         Disconnected
                      </span>
                   )}
                </div>
                
                <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
                   <div className="flex gap-4">
                      <Input 
                        label="Repo Owner" 
                        placeholder="e.g. facebook" 
                        value={githubOwner} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGithubOwner(e.target.value)} 
                      />
                      <Input 
                        label="Repo Name" 
                        placeholder="e.g. react" 
                        value={githubRepo} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGithubRepo(e.target.value)} 
                      />
                   </div>
                   
                   <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                      <div className="text-xs text-zinc-400 leading-relaxed">
                         Connecting to a GitHub repository allows Taskflow to automatically sync issues, pull requests, and code commits with your tasks. Make sure the Taskflow Github App is installed on your repository.
                      </div>
                   </div>
                </div>
             </section>

             {/* Danger Zone */}
             <section className="space-y-6 pt-10 border-t border-white/10">
                <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
                <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-2xl flex items-center justify-between">
                   <div>
                      <h4 className="font-medium text-white">Delete project</h4>
                      <p className="text-xs text-zinc-500 mt-1">Permanently delete this project and all of its tasks. This action is irreversible.</p>
                   </div>
                   <Button variant="ghost" className="text-red-500 hover:bg-red-500/10 border border-red-500/20">
                      Delete Project
                   </Button>
                </div>
             </section>

             <div className="flex justify-end sticky bottom-0 bg-[#09090b]/80 backdrop-blur-sm py-4 border-t border-white/5">
                <Button onClick={handleUpdateSettings} isLoading={isSaving} className="shadow-lg shadow-white/5">
                   <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
             </div>
          </form>
        </div>
      </main>
    </div>
  );
}

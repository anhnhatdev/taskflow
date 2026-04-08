'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import Link from 'next/link';

import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, accessToken, logout } = useAuthStore();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create workspace form state
  const [newWsName, setNewWsName] = useState('');
  const [newWsSlug, setNewWsSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get('/workspaces');
      setWorkspaces(response.data.data);
    } catch (err) {
      console.error('Failed to fetch workspaces', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }

    fetchWorkspaces();
  }, [accessToken, router]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError('');

    try {
      await api.post('/workspaces', {
        name: newWsName,
        slug: newWsSlug,
      });
      
      setNewWsName('');
      setNewWsSlug('');
      setIsModalOpen(false);
      fetchWorkspaces();
    } catch (err: any) {
      setCreateError(err.response?.data?.error?.message || 'Failed to create workspace');
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
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold tracking-tighter">
            TASKFLOW
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2 text-right">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs text-zinc-500">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Workspaces</h1>
            <p className="text-zinc-400 mt-1 text-sm">Select a workspace to view your projects and tasks.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>+ Create Workspace</Button>
        </div>

        {workspaces.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-2xl p-20 flex flex-col items-center justify-center bg-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
              <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No workspaces found</h3>
            <p className="text-zinc-400 text-sm mb-8 max-w-xs text-center">
              Create your first workspace to start managing your projects with GitHub integration.
            </p>
            <Button size="lg" onClick={() => setIsModalOpen(true)}>Create your first workspace</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/${ws.slug}`}
                className="group p-6 glass rounded-2xl border border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.07]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl uppercase shadow-lg shadow-blue-500/10">
                    {ws.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{ws.name}</h3>
                    <p className="text-zinc-500 text-xs">taskflow.app/{ws.slug}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
                  <span className="text-xs text-zinc-400">Owner</span>
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-[#09090b] flex items-center justify-center text-[10px] text-zinc-400">
                      +1
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Workspace Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create Workspace"
      >
        <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-6">
          {createError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs">
              {createError}
            </div>
          )}
          
          <Input
            label="Workspace Name"
            placeholder="e.g. Acme Team"
            value={newWsName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewWsName(e.target.value);
              if (!newWsSlug) {
                setNewWsSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
              }
            }}
            required
          />

          <Input
            label="Workspace Slug (URL)"
            placeholder="e.g. acme-team"
            value={newWsSlug}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWsSlug(e.target.value)}
            required
          />

          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

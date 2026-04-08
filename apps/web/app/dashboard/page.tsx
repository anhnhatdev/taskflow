'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import Link from 'next/link';

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

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }

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

    fetchWorkspaces();
  }, [accessToken, router]);

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
            <div className="flex flex-col items-end mr-2">
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
            <h1 className="text-3xl font-bold">Your Workspaces</h1>
            <p className="text-zinc-400 mt-1 text-sm">Select a workspace to view your projects and tasks.</p>
          </div>
          <Button>+ Create Workspace</Button>
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
            <Button size="lg">Create your first workspace</Button>
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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl uppercase">
                    {ws.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{ws.name}</h3>
                    <p className="text-zinc-500 text-xs">taskflow.app/{ws.slug}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
                  <span className="text-xs text-zinc-400">Owner</span>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-black flex items-center justify-center text-[10px]">
                      +1
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

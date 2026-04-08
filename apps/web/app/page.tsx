import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#09090b] text-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-white/10 bg-zinc-800/30 backdrop-blur-2xl pb-6 pt-8 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-zinc-800/30 lg:p-4">
          Taskflow&nbsp;
          <code className="font-bold">v1.0.0</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <Link
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0 font-bold text-xl"
            href="/"
          >
            TASKFLOW
          </Link>
        </div>
      </div>

      <div className="relative flex flex-col place-items-center mt-32 mb-16">
        <h1 className="text-6xl font-bold tracking-tight text-center bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          Where code and tasks <br /> flow together
        </h1>
        <p className="mt-6 text-xl text-zinc-400 text-center max-w-2xl">
          Automate your task workflow. Taskflow syncs with your GitHub activity so you can focus on writing code, not updating cards.
        </p>
        
        <div className="mt-10 flex gap-4">
          <Link 
            href="/register" 
            className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors"
          >
            Get Started
          </Link>
          <Link 
            href="/login" 
            className="px-8 py-3 bg-zinc-900 text-white font-semibold rounded-full border border-white/10 hover:bg-zinc-800 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>

      <div className="grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left gap-8 mt-20">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-white/10 hover:bg-white/5">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            GitHub Sync{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm text-zinc-400`}>
            Auto-update task status from branches, PRs, and commits.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-white/10 hover:bg-white/5">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Focus Mode{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm text-zinc-400`}>
            Deep work with built-in Pomodoro and distraction blocking.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-white/10 hover:bg-white/5">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Dependency Graph{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm text-zinc-400`}>
            Visualize task dependencies and identify bottlenecks.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-white/10 hover:bg-white/5">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            AI Breakdown{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm text-zinc-400`}>
            Let AI split your big features into actionable subtasks.
          </p>
        </div>
      </div>
    </main>
  );
}

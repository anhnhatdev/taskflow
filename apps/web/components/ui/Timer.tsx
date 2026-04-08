'use client';

import React, { useState, useEffect } from 'react';
import { Play, Square, Clock } from 'lucide-react';
import { Button } from './Button';
import api from '@/lib/api';

interface TimerProps {
  taskId: string;
  onStatusChange?: () => void;
}

export const Timer = ({ taskId, onStatusChange }: TimerProps) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerId, setTimerId] = useState<string | null>(null);

  useEffect(() => {
    // Check for active timer on mount
    const checkActive = async () => {
      try {
        const res = await api.get('/time/active');
        if (res.data.data && res.data.data.taskId === taskId) {
          setIsActive(true);
          setTimerId(res.data.data.id);
          const start = new Date(res.data.data.startedAt).getTime();
          setSeconds(Math.floor((Date.now() - start) / 1000));
        }
      } catch (err) {
        console.error('Timer check failed', err);
      }
    };
    checkActive();
  }, [taskId]);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.post('/time/start', { taskId });
      setIsActive(true);
      setTimerId(res.data.data.id);
      setSeconds(0);
      onStatusChange?.();
    } catch (err) {
      alert('Could not start timer. You might have another timer running.');
    }
  };

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post('/time/stop', { note: 'Completed via card' });
      setIsActive(false);
      setTimerId(null);
      onStatusChange?.();
    } catch (err) {
      console.error('Failed to stop timer', err);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {isActive ? (
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg animate-pulse">
          <Clock className="w-3 h-3 text-blue-500" />
          <span className="text-[10px] font-mono font-bold text-blue-400">
             {formatTime(seconds)}
          </span>
          <button onClick={handleStop} className="p-0.5 hover:bg-red-500/20 rounded">
             <Square className="w-3 h-3 text-red-500 fill-current" />
          </button>
        </div>
      ) : (
        <button 
          onClick={handleStart}
          className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 hover:text-white transition-colors"
        >
          <Play className="w-3 h-3" /> Start Timer
        </button>
      )}
    </div>
  );
};

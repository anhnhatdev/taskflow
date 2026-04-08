'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCircle2, MessageSquare, UserPlus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actor?: {
    name: string;
    avatarUrl?: string;
  };
}

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const socket = useSocket();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (socket) {
      socket.on('notification:received', (notif: Notification) => {
        setNotifications(prev => [notif, ...prev]);
      });
    }

    return () => {
      socket?.off('notification:received');
    };
  }, [socket]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#09090b]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Notifications</h3>
              <button 
                onClick={markAllRead}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest"
              >
                Mark all read
              </button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer relative ${!notif.isRead ? 'bg-blue-500/[0.02]' : 'opacity-60'}`}
                  >
                    {!notif.isRead && (
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                    )}
                    <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
                          {notif.type === 'TASK_ASSIGNED' && <UserPlus className="w-4 h-4 text-blue-400" />}
                          {notif.type === 'COMMENT_ADDED' && <MessageSquare className="w-4 h-4 text-purple-400" />}
                          {notif.type === 'TASK_BLOCKED' && <AlertCircle className="w-4 h-4 text-red-500" />}
                          {!['TASK_ASSIGNED', 'COMMENT_ADDED', 'TASK_BLOCKED'].includes(notif.type) && <Bell className="w-4 h-4 text-zinc-400" />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{notif.title}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{notif.body}</p>
                          <p className="text-[10px] text-zinc-600 mt-2 font-medium">
                             {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center space-y-2 opacity-30">
                   <Bell className="w-8 h-8 mx-auto" />
                   <p className="text-xs font-medium">No notifications yet</p>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-white/[0.02] text-center border-t border-white/5">
               <button className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                  View All
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function AlertCircle(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}

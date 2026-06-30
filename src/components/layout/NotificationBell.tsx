'use client';
import { useState, useEffect, useRef } from 'react';
import { notificationsApi } from '@/lib/api';
import { Notification } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { clsx } from 'clsx';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    try {
      const res: any = await notificationsApi.getAll();
      const notifs: Notification[] = res.data?.notifications || [];
      setNotifications(notifs);
      setUnread(notifs.filter((n) => !n.isRead).length);
    } catch {}
  };

  useEffect(() => { fetchNotifications(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('notification:new', (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnread((prev) => prev + 1);
    });
    return () => { socket.off('notification:new'); };
  }, [socket]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-xl hover:bg-gray-100"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
      >
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-scale-in">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
              {unread > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unread}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={clsx(
                    'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors',
                    !n.isRead && 'bg-blue-50/60',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                    )}
                    <div className={clsx('flex-1 min-w-0', n.isRead && 'pl-4')}>
                      <p className="text-sm font-medium text-gray-900 leading-snug">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

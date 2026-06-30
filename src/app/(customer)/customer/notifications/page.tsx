'use client';
import { useEffect, useState } from 'react';
import { notificationsApi } from '@/lib/api';
import { Notification } from '@/types';
import { toast } from '@/components/ui/Toast';

const TYPE_ICONS: Record<string, string> = {
  job_assigned: '👷', job_accepted: '✅', job_rejected: '❌', job_started: '▶️',
  job_completed: '🎉', job_cancelled: '✕', payment_received: '💳', payment_released: '💰',
  withdrawal_processed: '🏦', kyc_approved: '✅', kyc_rejected: '❌', review_received: '⭐', system: '🔔',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.getAll(1).then((res: any) => {
      setNotifications(res.data?.notifications || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {}
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-black text-teal-800">Notifications</h1>
          {unread > 0 && <p className="text-sm text-green-600 font-semibold mt-0.5">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm text-green-600 font-semibold hover:text-green-700">Mark all read</button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">🔔</p>
          <p className="font-black text-teal-800 text-lg mb-2">No notifications</p>
          <p className="text-teal-400 text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <button key={n.id} onClick={() => !n.isRead && markRead(n.id)}
              className={`w-full text-left card p-4 flex items-start gap-3 transition ${!n.isRead ? 'border-green-200 bg-green-50/50' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${!n.isRead ? 'bg-green-100' : 'bg-teal-50'}`}>
                {TYPE_ICONS[n.type] || '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-tight ${!n.isRead ? 'text-teal-800' : 'text-teal-600'}`}>{n.title}</p>
                <p className="text-xs text-teal-400 mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-xs text-teal-300 mt-1">{new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-1" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

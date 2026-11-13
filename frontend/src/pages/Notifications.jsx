import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiBell, FiCheckCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { notificationService } from '../services/notificationService';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    notificationService.list()
      .then((res) => { setNotifications(res.data); setUnreadCount(res.unreadCount); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      fetchNotifications();
    } catch { toast.error('Failed'); }
  };

  const openNotification = async (notification) => {
    if (!notification.isRead) await handleMarkRead(notification._id);
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      toast.success('All marked as read');
      fetchNotifications();
    } catch { toast.error('Failed'); }
  };

  const typeColor = (type) => {
    const map = {
      task_due: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
      lead_assigned: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
      deal_won: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
      deal_lost: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
      customer_assigned: 'bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400',
      system: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    };
    return map[type] || map.system;
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-500">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="btn-secondary" onClick={handleMarkAllRead}>
            <FiCheckCircle className="mr-1 inline" size={14} />Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="card flex h-32 items-center justify-center text-slate-400 text-sm">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
          <FiBell size={32} />
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50
                ${!n.isRead ? 'border-l-4 border-primary-500' : ''}`}
              onClick={() => openNotification(n)}
            >
              <div className="flex items-start gap-3">
                <span className={`rounded-full p-2 text-xs ${typeColor(n.type)}`}>
                  <FiBell size={13} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${n.isRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-800 dark:text-slate-100'}`}>
                    {n.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {format(new Date(n.createdAt), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="h-2 w-2 rounded-full bg-primary-500 mt-1 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

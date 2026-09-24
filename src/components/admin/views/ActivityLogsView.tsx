import React, { useState, useEffect } from 'react';
import { ScrollText, RefreshCw, Search, ShieldCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { adminApi, ActivityLog } from '../../../services/adminApi';

interface ActivityLogsViewProps {
  onShowToast: (msg: string) => void;
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ onShowToast }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = async () => {
    try {
      const res = await adminApi.getActivityLogs();
      if (res.success && res.logs) {
        setLogs(res.logs);
      }
    } catch {
      onShowToast('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      !searchQuery.trim() ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#008080] bg-teal-50 px-2 py-0.5 rounded">
              Core Analytics & Security
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-[#008080]" />
            Security & System Activity Logs
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time audit log of administrative actions, merchant verifications, authentication attempts, and crawler protocol queries.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, email, or IP..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080]"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Action / Event</th>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">IP Address</th>
                <th className="py-3 px-4 font-semibold">Event Details</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{log.user}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{log.ip}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm truncate">{log.details}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.status === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

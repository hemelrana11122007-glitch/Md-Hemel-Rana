import React from 'react';
import { Mail, ExternalLink, X, Trash2, CheckCircle2, KeyRound, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DevEmail } from '../services/authApi';

interface DevMailboxModalProps {
  onSelectAction: (type: 'verify' | 'reset', token: string) => void;
}

export const DevMailboxModal: React.FC<DevMailboxModalProps> = ({ onSelectAction }) => {
  const { devEmails, isMailboxOpen, setIsMailboxOpen, fetchDevEmails } = useAuth();

  if (!isMailboxOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsMailboxOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#008080]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                Development Mailbox
                <span className="text-[10px] px-2 py-0.5 font-semibold bg-teal-100 text-[#008080] rounded-full">
                  Nodemailer Dev Mode
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Preview verification emails and password reset links without needing external SMTP setup.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMailboxOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {devEmails.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No emails dispatched yet</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Register a new account or click "Forgot Password" to test the automated email dispatch system.
              </p>
            </div>
          ) : (
            devEmails.map((item: DevEmail) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/30 hover:border-teal-200 transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {item.type === 'verification' ? (
                      <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                        <KeyRound className="w-4 h-4" />
                      </span>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.subject}</p>
                      <p className="text-[11px] text-slate-500">
                        To: <span className="font-semibold text-slate-700">{item.to}</span> ·{' '}
                        {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                    {item.type}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-600 break-all select-all flex items-center justify-between gap-2">
                  <span>Token: {item.token ? item.token.substring(0, 24) + '...' : 'N/A'}</span>
                  {item.token && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMailboxOpen(false);
                        onSelectAction(item.type === 'verification' ? 'verify' : 'reset', item.token!);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-md transition-colors cursor-pointer shrink-0"
                    >
                      <span>{item.type === 'verification' ? 'Verify Now' : 'Reset Password'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Tokens are generated with crypto random bytes and securely hashed.</span>
          </div>
          <button
            type="button"
            onClick={fetchDevEmails}
            className="text-xs font-semibold text-[#008080] hover:underline cursor-pointer"
          >
            Refresh Mailbox
          </button>
        </div>
      </div>
    </div>
  );
};

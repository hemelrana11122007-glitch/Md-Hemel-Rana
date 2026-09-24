import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Wholesale Inquiry');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-8 bg-[#F8FAFA] min-h-[calc(100vh-200px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008080] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Merchant & Customer Support
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-3">
              Contact AR Market BD
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Have questions about bulk orders, customs clearance, or vendor onboarding? We are available 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <Phone className="w-6 h-6 text-[#008080] mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-900">Direct Phone</div>
              <div className="text-xs text-slate-500 mt-0.5">+880 1800-AR-BD</div>
              <div className="text-[11px] text-slate-400">+1 (800) 555-ARBD</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <Mail className="w-6 h-6 text-[#008080] mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-900">Email Support</div>
              <div className="text-xs text-slate-500 mt-0.5">support@armarketbd.com</div>
              <div className="text-[11px] text-slate-400">trade@armarketbd.com</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <Clock className="w-6 h-6 text-[#008080] mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-900">Hours of Service</div>
              <div className="text-xs text-slate-500 mt-0.5">24/7 Escrow & Trade</div>
              <div className="text-[11px] text-slate-400">Live agents on duty</div>
            </div>
          </div>

          {submitted ? (
            <div className="p-8 bg-teal-50 border border-teal-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#008080] mx-auto" />
              <h3 className="text-base font-bold text-teal-950">Message Transmitted!</h3>
              <p className="text-xs text-teal-800">
                A dedicated multi-vendor support agent will reply to {email} within 2 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariq Ahmed"
                    className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Topic</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080]"
                >
                  <option value="Wholesale Inquiry">Wholesale MOQ & Volume Pricing</option>
                  <option value="Import Customs">Foreign Import Tariffs & Customs</option>
                  <option value="Retail Order">Retail Delivery & Tracking</option>
                  <option value="Become a Seller">Become a Verified Seller / Vendor</option>
                  <option value="Other">Other Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Details</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your procurement requirements or issue..."
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080]"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message to Support</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Send, Sparkles, Bot, ShoppingBag, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import sobaiAvatarImg from '../assets/images/sobai_ai_robot_avatar_1790625723414.jpg';

interface SobaiAIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateShop?: (category?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'sobai';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export const SobaiAIDrawer: React.FC<SobaiAIDrawerProps> = ({ isOpen, onClose, onNavigateShop }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'sobai',
      text: "Hi there! I'm Sobai AI, your smart shopping assistant on AR Market BD. How can I help you today? I can help find retail deals, calculate wholesale MOQ pricing, or check import clearance.",
      timestamp: 'Just now',
      suggestions: [
        'Find top electronic deals',
        'How does wholesale MOQ work?',
        'Bangladesh delivery timelines',
        'Import clearance & tariffs',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "I found verified products matching your request! AR Market BD offers fast delivery across all 64 districts with Cash on Delivery (COD) and 100% buyer protection.";
      let replySuggestions: string[] = ['Browse Fashion & Apparel', 'Explore Wholesale Hub', 'View Mega Deals'];

      const lower = text.toLowerCase();
      if (lower.includes('wholesale') || lower.includes('moq') || lower.includes('bulk')) {
        replyText = "In our Wholesale section, verified factories offer transparent Minimum Order Quantity (MOQ) tiers starting from 10–50 units with up to 45% savings. Would you like to view wholesale lots?";
        replySuggestions = ['Explore Wholesale Hub', 'Contact Factory Sellers', 'Sample Order Requests'];
      } else if (lower.includes('delivery') || lower.includes('shipping') || lower.includes('time') || lower.includes('bangladesh')) {
        replyText = "Standard retail deliveries take 24–48 hours in Dhaka and 48–72 hours across all other districts in Bangladesh. Express air shipments for imports arrive within 3–7 days!";
        replySuggestions = ['Track Order Status', 'Cash on Delivery Info', 'Shop Now'];
      } else if (lower.includes('electronic') || lower.includes('gadget') || lower.includes('phone') || lower.includes('headphone')) {
        replyText = "We have top-rated ANC Studio Headphones, Sapphire Chrono Smartwatches, and fast USB-C accessories in stock with manufacturer warranty and instant dispatch.";
        replySuggestions = ['View Electronics & Tech', 'Check 50% OFF Deals', 'Shop Top Rated'];
      }

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'sobai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: replySuggestions,
      };

      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="bg-gradient-to-r from-[#0f766e] via-[#115e59] to-[#064e3b] p-4 sm:p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={sobaiAvatarImg}
                alt="Sobai AI"
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-300 shadow-md"
              />
              <span className="w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight font-display">
                  Sobai AI
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wide bg-emerald-400/20 text-emerald-300 rounded-full border border-emerald-400/40">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-teal-100 font-medium">
                Your Smart Shopping Assistant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-[#0f766e] text-white rounded-br-xs font-semibold'
                    : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs font-medium'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>

              {/* Quick suggestions if available */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((sugg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(sugg)}
                      className="px-3 py-1.5 text-[11px] font-bold text-[#0f766e] bg-teal-50 hover:bg-teal-100/90 rounded-full border border-teal-200/80 transition-all text-left cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      <span>{sugg}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 bg-white rounded-2xl border border-slate-200 w-24 text-slate-400 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Sobai AI about products, wholesale, shipping..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20 outline-hidden placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-xl bg-[#0f766e] hover:bg-[#0d625b] disabled:bg-slate-300 text-white flex items-center justify-center transition-all cursor-pointer shadow-md disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

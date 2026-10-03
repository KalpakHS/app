import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockChatInitialMessages, mockChatResponses } from '../data/mockData';
import ChatMessage from '../components/common/ChatMessage';
import BottomNavigation from '../components/common/BottomNavigation';
import Toast from '../components/common/Toast';

export default function AIAssistantPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(mockChatInitialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState(null);
  const chatBottomRef = useRef(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickPrompts = [
    { label: "Analyze my last adherence streak", icon: "analytics", iconColor: "text-[#0D9488]" },
    { label: "Explain Albuterol dosage", icon: "medication", iconColor: "text-[#0284C7]" },
    { label: "Check device battery status", icon: "battery_charging_full", iconColor: "text-[#D97706]" },
    { label: "What should I do if SpO2 drops?", icon: "emergency", iconColor: "text-[#EF4444]" }
  ];

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate grounded clinical AI response
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "I've cross-referenced your query with your latest telemetry stream. Your baseline parameters are currently stable within your personalized care profile.";
      let verificationCard = null;

      const lower = query.toLowerCase();
      if (lower.includes('adherence') || lower.includes('streak')) {
        replyText = "Your 7-day adherence score is 92%. You have successfully completed 13 of your 14 scheduled dosing sessions this week with consistent flow rates.";
        verificationCard = {
          flowRate: "Adherence Score: 92%",
          duration: "13 / 14 sessions logged",
          badge: "Compliance Verified"
        };
      } else if (lower.includes('albuterol') || lower.includes('dosage') || lower.includes('dose')) {
        replyText = "Albuterol is a short-acting bronchodilator. Your prescribed dose is 2.5mg (2 puffs) via SmartNeb Pocket-01 every 4 to 6 hours as scheduled by Dr. Evelyn Vance.";
        verificationCard = {
          flowRate: "Rx: Albuterol 2.5mg",
          duration: "Next dose: 11:00 AM",
          badge: "Active Regimen"
        };
      } else if (lower.includes('battery') || lower.includes('power')) {
        replyText = "Your SmartNeb device battery level is currently at 84%, which is optimal for approximately 14 more operating hours and 4 more days of regular treatment.";
        verificationCard = {
          flowRate: "ESP32 Battery: 84%",
          duration: "Health degradation: 4.2%/yr",
          badge: "Optimal Battery"
        };
      } else if (lower.includes('chamber') || lower.includes('liquid') || lower.includes('saline') || lower.includes('refill')) {
        replyText = "The medication chamber currently holds 2.1 mL (68% capacity). You have sufficient medication for the next scheduled session.";
        verificationCard = {
          flowRate: "Chamber Level: 68%",
          duration: "Volume: 2.1 mL remaining",
          badge: "Level Optimal"
        };
      } else if (lower.includes('spo2') || lower.includes('oxygen') || lower.includes('drop')) {
        replyText = "Your resting SpO2 is currently 98% (Optimal). If your oxygen level drops below 92% or you experience difficulty speaking in full sentences, immediately start rescue therapy and press the 1-Tap SOS button.";
      } else if (lower.includes('temp') || lower.includes('temperature')) {
        replyText = "Your baseline temperature is 36.8°C (Optimal). No fever detected across telemetry checks.";
      } else if (lower.includes('clean') || lower.includes('wash') || lower.includes('maintenance')) {
        replyText = "Rinse the medication reservoir with warm distilled water after each session. Allow to air-dry completely. Do not scrape or touch the ultrasonic mesh plate.";
      } else if (lower.includes('hello') || lower.includes('hi')) {
        replyText = "Hello! I am your SmartNeb clinical AI companion. All telemetry sensors are currently transmitting normally. What can I help you with today?";
      }

      const botMsg = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: replyText,
        verificationCard
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 900);
  };

  return (
    <div className="bg-[#F8FAFC] font-body-md text-on-surface flex flex-col min-h-screen">
      <Toast message={toast} onClose={() => setToast(null)} />

      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl pt-safe border-b border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="h-16 px-gutter flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Back to dashboard"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <span className="font-bold text-[18px] text-[#0F172A] tracking-tight">SmartNeb AI Assistant</span>
          </div>
          <div className="flex items-center gap-2 bg-[#F1F5F9] px-3 py-1.5 rounded-full text-[12px] font-medium text-[#0D9488] border border-[#E2E8F0]">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col relative w-full px-gutter pt-20 pb-44 bg-[#F8FAFC] max-w-md mx-auto flex-grow">
        <div className="flex flex-col w-full gap-space-md">
          
          {/* Patient & Telemetry Context summary pill */}
          <div className="flex items-center justify-between bg-white border border-[#E2E8F0] p-3.5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0D9488]/10 flex items-center justify-center text-[#0D9488]">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  monitoring
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-[#0F172A] text-[15px]">Telemetry Stream Active</h3>
                <p className="text-[13px] text-[#64748B]">SpO2 98% • Vitals Stable</p>
              </div>
            </div>
            <span className="text-[12px] bg-[#CCFBF1] text-[#0D9488] border border-[#99F6E4] px-2.5 py-1 rounded-full font-semibold">
              Live Feed
            </span>
          </div>

          {/* Chat Stream */}
          <div className="flex flex-col gap-space-md pb-4 pt-2">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Typing indicator bubble */}
            {isTyping && (
              <div className="flex items-start gap-3 max-w-[85%] animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-[#CCFBF1] border border-[#99F6E4] flex-shrink-0 flex items-center justify-center text-[#0D9488]">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
                <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-2xl rounded-tl-sm text-xs text-[#64748B] flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1 text-[11px] font-medium">Analyzing telemetry stream...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Prompts Section */}
          <div className="flex flex-col gap-space-xs my-2">
            <p className="text-[12px] uppercase tracking-wider text-[#64748B] px-1 font-semibold">Suggested Prompts</p>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {quickPrompts.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.label)}
                  className="flex items-center gap-2 bg-white hover:bg-[#F1F5F9] text-[#1E293B] px-4 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors flex-shrink-0 border border-[#CBD5E1] shadow-sm active:scale-95"
                >
                  <span className={`material-symbols-outlined text-[18px] ${chip.iconColor}`}>
                    {chip.icon}
                  </span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Medical disclaimer footer note */}
          <div className="px-2 py-1 text-center">
            <p className="text-[12px] text-[#94A3B8] italic leading-relaxed">
              Grounded strictly in patient data. Consult your physician for clinical decisions.
            </p>
          </div>

        </div>
      </main>

      {/* Bottom Chat Input Bar */}
      <div className="fixed bottom-20 inset-x-0 z-40 bg-white/90 backdrop-blur-xl px-gutter py-2.5 border-t border-[#E2E8F0]">
        <div className="max-w-md mx-auto w-full">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-white border border-[#CBD5E1] p-1.5 pl-2 rounded-2xl shadow-sm focus-within:border-[#0D9488] focus-within:ring-1 focus-within:ring-[#0D9488]"
          >
            <button 
              type="button"
              onClick={() => setToast('Attachment simulation: Telemetry snapshot attached to context.')}
              className="w-9 h-9 rounded-xl hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] transition-colors"
              aria-label="Attach file"
            >
              <span className="material-symbols-outlined text-[22px]">add_circle</span>
            </button>
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about your regimen or SpO2 trends..."
              className="flex-1 bg-transparent border-none outline-none text-[#0F172A] placeholder:text-[#94A3B8] text-[14px] px-2"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] flex items-center justify-center text-white font-bold transition-colors shadow-sm disabled:opacity-50"
              aria-label="Send message"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation role="patient" activeTab="ai" />
    </div>
  );
}

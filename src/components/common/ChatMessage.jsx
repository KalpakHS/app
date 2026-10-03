import React from 'react';

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className="flex items-start gap-3 max-w-[85%] ml-auto flex-row-reverse animate-fade-in">
        <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex-shrink-0 flex items-center justify-center text-[#475569] shadow-sm">
          <span className="material-symbols-outlined text-[18px]">person</span>
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          <div className="bg-[#0D9488] text-white font-medium p-4 rounded-2xl rounded-tr-sm text-sm shadow-sm leading-relaxed">
            {message.text}
          </div>
          <span className="text-[#94A3B8] px-1 text-[11px] font-medium">{message.time || 'Just now'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 max-w-[95%] animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-[#CCFBF1] border border-[#99F6E4] flex-shrink-0 flex items-center justify-center text-[#0D9488] shadow-sm">
        <span className="material-symbols-outlined text-[18px]">smart_toy</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl rounded-tl-sm text-sm text-[#0F172A] flex flex-col gap-3 shadow-sm leading-relaxed">
          <p>{message.text}</p>

          {/* Optional Telemetry Verification Card if present */}
          {message.verificationCard && (
            <div className="bg-[#F8FAFC] p-3 rounded-xl flex items-center justify-between border border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981]">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                </div>
                <div>
                  <p className="text-[13px] text-[#0F172A] font-semibold">{message.verificationCard.flowRate}</p>
                  <p className="text-[11px] text-[#64748B]">{message.verificationCard.duration}</p>
                </div>
              </div>
              <span className="text-[11px] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded-full text-[#059669] font-semibold">
                {message.verificationCard.badge}
              </span>
            </div>
          )}
        </div>
        <span className="text-[#94A3B8] px-1 text-[11px] font-medium">{message.time || 'Just now'}</span>
      </div>
    </div>
  );
}

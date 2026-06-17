// src/components/AccessDeniedPage.tsx

import React, { useEffect, useState } from "react";
import { Button } from "./components/ui/button";

const AccessDeniedPage: React.FC = () => {
  const [requested, setRequested] = useState(false);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
    );
  }, []);

  return (
    <div className='flex h-screen items-center justify-center bg-[#0d1b2a] bg-[radial-gradient(circle_at_1px_1px,rgba(150,165,180,0.16)_1px,transparent_0)] [background-size:24px_24px] px-5'>
      <style>{`
        @keyframes adp-card-in {
          from { opacity: 0; transform: translateY(18px) rotate(-1.1deg) scale(.97); }
          to { opacity: 1; transform: translateY(0) rotate(-1.1deg) scale(1); }
        }
        @keyframes adp-bar-1 { to { width: 86%; } }
        @keyframes adp-bar-2 { to { width: 61%; } }
        @keyframes adp-bar-3 { to { width: 39%; } }
        @keyframes adp-stamp {
          0% { opacity: 0; transform: scale(2.2) rotate(-26deg); }
          55% { opacity: 1; transform: scale(.9) rotate(-9deg); }
          78% { transform: scale(1.06) rotate(-13deg); }
          100% { transform: scale(1) rotate(-12deg); }
        }
        @keyframes adp-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .adp-card { animation: adp-card-in .6s cubic-bezier(.16,1,.3,1) .05s forwards; }
        .adp-bar1 { animation: adp-bar-1 .5s ease-out .4s forwards; }
        .adp-bar2 { animation: adp-bar-2 .5s ease-out .52s forwards; }
        .adp-bar3 { animation: adp-bar-3 .5s ease-out .64s forwards; }
        .adp-stamp { animation: adp-stamp .65s cubic-bezier(.34,1.56,.64,1) .85s forwards; }
        .adp-meta { animation: adp-fade-up .5s ease-out 1.35s forwards; }
        .adp-body { animation: adp-fade-up .5s ease-out 1.5s forwards; }
        .adp-actions { animation: adp-fade-up .5s ease-out 1.65s forwards; }
        @media (prefers-reduced-motion: reduce) {
          .adp-card, .adp-bar1, .adp-bar2, .adp-bar3, .adp-stamp, .adp-meta, .adp-body, .adp-actions {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .adp-card { transform: rotate(-1.1deg) !important; }
          .adp-bar1 { width: 86% !important; }
          .adp-bar2 { width: 61% !important; }
          .adp-bar3 { width: 39% !important; }
          .adp-stamp { transform: rotate(-12deg) !important; }
        }
      `}</style>

      <div className='relative w-full max-w-[440px]'>
        {/* folder tab */}
        <div className='absolute -top-[22px] left-[30px] flex h-[26px] w-[108px] items-center justify-center rounded-t-[4px] bg-[#ddccac] font-mono text-[10px] uppercase tracking-[0.14em] text-[#15120f]/85'>
          Case file
        </div>

        {/* document card */}
        <div className='adp-card relative rounded-[5px] bg-[#f4ead7] px-9 pb-9 pt-10 opacity-0 shadow-[0_30px_60px_-16px_rgba(0,0,0,0.55),0_2px_0_rgba(0,0,0,0.08)]'>
          <div className='mb-6 border-t-[1.5px] border-dashed border-[#ddccac]' />

          {/* redaction bars */}
          <div className='mb-[9px] adp-bar1 h-[10px] w-0 rounded-[2px] bg-[#15120f]' />
          <div className='mb-[9px] adp-bar2 h-[10px] w-0 rounded-[2px] bg-[#15120f]' />
          <div className='mb-[9px] adp-bar3 h-[10px] w-0 rounded-[2px] bg-[#15120f]' />

          {/* ink stamp */}
          <div
            className='adp-stamp absolute -top-[10px] right-[14px] border-2 border-[#b3261e] px-4 py-[9px] text-[1.02rem] uppercase tracking-[0.05em] text-[#b3261e] opacity-0'
            style={{
              fontFamily: "'Special Elite', 'Courier New', cursive",
              background: "rgba(179,38,30,0.07)",
              mixBlendMode: "multiply",
              clipPath:
                "polygon(3% 10%,12% 1%,24% 6%,37% 0%,49% 6%,62% 0%,75% 5%,89% 0%,98% 11%,93% 24%,100% 38%,94% 51%,100% 65%,92% 77%,98% 90%,84% 100%,69% 94%,54% 100%,41% 95%,27% 100%,13% 94%,2% 100%,7% 85%,0% 70%,6% 55%,0% 40%,7% 25%,1% 14%)",
            }}>
            Access denied
          </div>

          <p className='adp-meta mt-[38px] mb-[14px] font-mono text-[0.7rem] uppercase tracking-[0.13em] text-[#6b7a8a] opacity-0'>
            REF 403 · ACCESS RESTRICTED{today ? ` · ${today}` : ""}
          </p>

          <p className='adp-body mb-7 max-w-[34ch] text-[0.98rem] leading-[1.65] text-[#15120f] opacity-0'>
            This file sits above your current clearance. Head back to your
            profile, or send a request to whoever manages access for your team.
          </p>

          <div className='adp-actions flex items-center gap-5 opacity-0'>
            <Button
              variant={"default"}
              className='rounded-[3px] bg-[#15120f] px-6 py-[1.4rem] text-[0.84rem] font-semibold text-[#f4ead7] shadow-[0_1px_0_rgba(0,0,0,0.25)] hover:-translate-y-px hover:bg-[#15120f] active:translate-y-0 active:scale-[.98]'
              onClick={() => (window.location.href = "/profile")}>
              Return to profile
            </Button>

            <button
              type='button'
              disabled={requested}
              onClick={() => setRequested(true)}
              className='border-0 border-b border-dashed border-[#6b7a8a] bg-transparent pb-px text-[0.84rem] text-[#6b7a8a] transition-colors hover:border-[#b3261e] hover:text-[#b3261e] disabled:cursor-default disabled:hover:border-[#6b7a8a] disabled:hover:text-[#6b7a8a]'>
              {requested ? "Request sent" : "Request access"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;

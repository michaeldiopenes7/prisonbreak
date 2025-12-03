import React, { useEffect } from 'react';
import { WhacAMole } from './components/game/WhacAMole';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const cursorUrl = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23ef4444" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>') 16 16, auto`;

  return (
    <div 
      className="min-h-screen w-full bg-slate-800 flex flex-col items-center py-12 font-sans selection:bg-red-500 selection:text-white"
    >
      <style>{`
        *, button, a, .cursor-pointer {
          cursor: ${cursorUrl} !important;
        }
      `}</style>
      <div className="container max-w-4xl mx-auto px-4 flex flex-col items-center gap-8">
        
        {/* Title Section */}
        <div className="text-center space-y-2">
          <div className="inline-block border-4 border-red-600 p-2 rotate-[-2deg] bg-white shadow-xl">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase">
              PRISON BREAK
            </h1>
          </div>
          <p className="text-slate-400 font-mono text-lg mt-4">
            Stop the escapees! Catch them before they flee!
          </p>
        </div>

        {/* Game Container */}
        <WhacAMole />

        {/* Footer */}
        <footer className="mt-8 text-slate-500 text-sm font-medium font-mono">
          WARDEN MODE: ACTIVE
        </footer>
      </div>
      
      <Toaster />
    </div>
  );
}

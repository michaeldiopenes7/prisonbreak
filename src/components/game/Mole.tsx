import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

import suspectImg from "figma:asset/dbd02edf2849353d26082bf016bf0309898d2a6f.png";
import innocentImg from "figma:asset/569e314f1210edeecdf59a91ddef82633db0fadd.png";

export type BeardStyle = 'none' | 'stubble' | 'mustache' | 'goatee' | 'full';
export type Outfit = 'prisoner' | 'ninja' | 'firefighter';

interface MoleProps {
  isVisible: boolean;
  isWhacked: boolean;
  onWhack: () => void;
  onMiss: () => void;
  skinColor: string;
  beardStyle: BeardStyle;
  outfit?: Outfit;
  isSuspect?: boolean;
}

export const Mole: React.FC<MoleProps> = ({ 
  isVisible, 
  isWhacked, 
  onWhack, 
  onMiss,
  skinColor = '#f0d5b1',
  beardStyle = 'stubble',
  outfit = 'prisoner',
  isSuspect = false
}) => {
  
  const handleContainerClick = (e: React.MouseEvent) => {
    // Stop propagation not needed if we handle logic correctly, 
    // but we want to ensure we don't trigger onMiss if we successfully hit the mole.
    // The mole element will handle its own click. 
    // If this fires, it means we hit the background/empty space.
    
    if (!isVisible) {
      onMiss();
    }
  };

  const handleMoleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent container click from firing
    onWhack();
  };

  return (
    <div 
      className="relative w-full aspect-square flex items-end justify-center overflow-hidden rounded-lg shadow-inner bg-slate-900 border-4 border-slate-600 cursor-crosshair active:border-red-500/50 transition-colors"
      onClick={handleContainerClick}
    >
      {/* Cell Background - Concrete/Dark */}
      <div 
        className="absolute inset-0 opacity-60 grayscale pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1762833758650-010797df8ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jcmV0ZSUyMHdhbGwlMjB0ZXh0dXJlJTIwcHJpc29ufGVufDF8fHx8MTc2NDIzMjg2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Cell Bars Shadow (Foreground effect for depth) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex justify-between px-2 opacity-30">
         <div className="w-2 h-full bg-black/50 blur-[1px]" />
         <div className="w-2 h-full bg-black/50 blur-[1px]" />
         <div className="w-2 h-full bg-black/50 blur-[1px]" />
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "10%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative w-2/3 h-5/6 z-20 cursor-pointer select-none touch-manipulation"
            onClick={handleMoleClick}
            whileTap={{ scale: 0.95 }}
          >
            {/* Prisoner Character - Image Replacement */}
            <div className="w-full h-full flex flex-col items-center justify-end relative">
              
              {outfit === 'prisoner' ? (
                <div className="w-full h-full relative flex items-start justify-center pointer-events-none overflow-hidden rounded-t-3xl">
                  <img 
                    src={isSuspect ? suspectImg : innocentImg} 
                    alt={isSuspect ? "Suspect" : "Innocent"}
                    className="w-full h-full object-cover object-top scale-150 origin-top filter drop-shadow-2xl"
                  />
                  {/* Hit Overlay */}
                  {isWhacked && (
                    <div className="absolute inset-0 bg-red-500/30 mix-blend-multiply rounded-t-full" />
                  )}
                </div>
              ) : (
              /* Fallback for other outfits if needed, though prisoner is now primary */
              <div className="w-full h-full flex flex-col items-center justify-end relative">
                {/* Body (Outfit) */}
                <div className="w-full h-2/3 rounded-t-3xl relative overflow-hidden shadow-xl border-2 border-black/20 transition-colors duration-200">
                
                {/* Prisoner: Striped Shirt */}
                {outfit === 'prisoner' && (
                  <div className="w-full h-full bg-white">
                    <div className="absolute top-4 w-full h-4 bg-black" />
                    <div className="absolute top-12 w-full h-4 bg-black" />
                    <div className="absolute top-20 w-full h-4 bg-black" />
                    <div className="absolute top-28 w-full h-4 bg-black" />
                    {/* Prisoner Number */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/10 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      {Math.floor(Math.random() * 9000) + 1000}
                    </div>
                  </div>
                )}

                {/* Ninja: All Black Stealth Gear */}
                {outfit === 'ninja' && (
                  <div className="w-full h-full bg-black relative">
                    {/* Chest details (Minimalist) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full flex justify-center opacity-50">
                       <div className="w-0 h-0 border-l-[50px] border-r-[50px] border-b-[80px] border-l-transparent border-r-transparent border-b-zinc-900" />
                    </div>
                    
                    {/* Weapon Handle (Katana) peeking out (Darker) */}
                    <div className="absolute -top-4 right-4 w-4 h-20 bg-zinc-900 rotate-45 border border-zinc-800 rounded-sm z-0" />
                    <div className="absolute top-4 right-0 w-8 h-2 bg-zinc-800 rotate-45 z-0" />
                  </div>
                )}

                {/* Firefighter: Bunker Gear */}
                {outfit === 'firefighter' && (
                  <div className="w-full h-full bg-yellow-600 relative">
                    {/* Reflective Stripes (Chest) */}
                    <div className="absolute top-12 w-full h-6 bg-yellow-300 border-y-2 border-slate-300/50 flex items-center justify-center gap-4">
                        <div className="w-full h-2 bg-slate-300/50" />
                    </div>
                     {/* Suspenders */}
                     <div className="absolute top-0 left-1/4 w-4 h-full bg-red-700 z-10" />
                     <div className="absolute top-0 right-1/4 w-4 h-full bg-red-700 z-10" />
                    {/* Collar */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 bg-black rounded-b-xl z-0" />
                    {/* Buttons */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-2 h-2 bg-metal-500 rounded-full shadow-sm z-20 bg-slate-400" />
                    <div className="absolute top-32 left-1/2 -translate-x-1/2 w-2 h-2 bg-metal-500 rounded-full shadow-sm z-20 bg-slate-400" />
                  </div>
                )}
              </div>

              {/* Head */}
              <div 
                className="absolute top-4 w-3/4 aspect-square rounded-2xl border-2 border-black/10 shadow-md flex flex-col items-center z-30"
                style={{ backgroundColor: skinColor }}
              >
                {/* Headgear */}
                {outfit === 'prisoner' && (
                  <div className="absolute -top-4 w-[110%] h-12 bg-slate-800 rounded-t-full border-b-4 border-slate-900" />
                )}
                
                {/* Ninja Hood - Full Face Cover */}
                {outfit === 'ninja' && (
                   <div className="absolute -top-1 w-[105%] h-[105%] bg-black rounded-2xl z-40 flex flex-col items-center pt-8">
                      {/* Eye Slit */}
                      <div className="w-3/4 h-10 bg-zinc-900 rounded-md flex items-center justify-center gap-3 border border-zinc-800 shadow-inner">
                           {/* Only Eyes Visible */}
                           <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_5px_white]" />
                           <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_5px_white]" />
                      </div>
                   </div>
                )}
                {outfit === 'firefighter' && (
                   <div className="absolute -top-6 w-[120%] h-16 bg-red-600 rounded-t-full border-b-8 border-black z-40 flex justify-center items-end pb-2">
                       {/* Helmet Badge */}
                       <div className="w-8 h-8 bg-yellow-400 rounded-shield border-2 border-yellow-600 mb-1" />
                   </div>
                )}

                {/* Face Details */}
                <div className="mt-10 flex flex-col items-center w-full relative h-full">
                  
                  {/* Eyes / Mask */}
                   <div className="w-full bg-slate-800 h-8 absolute top-0 flex items-center justify-center gap-2 px-1 z-10">
                      {isWhacked ? (
                        <>
                          <div className="text-white font-bold text-lg">X</div>
                          <div className="text-white font-bold text-lg">X</div>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </>
                      )}
                   </div>

                  {/* Beard / Facial Hair */}
                  {beardStyle === 'stubble' && (
                    <div className="absolute bottom-0 w-full h-8 bg-black/10 rounded-b-xl" />
                  )}
                  
                  {beardStyle === 'mustache' && (
                    <div className="absolute top-9 w-10 h-3 bg-black rounded-full" />
                  )}

                  {beardStyle === 'goatee' && (
                    <>
                      <div className="absolute top-9 w-8 h-2 bg-black rounded-full" />
                      <div className="absolute bottom-1 w-4 h-4 bg-black rounded-full" />
                    </>
                  )}

                  {beardStyle === 'full' && (
                    <div className="absolute bottom-0 w-full h-10 bg-black rounded-b-xl flex items-end justify-center pb-1">
                         <div className="w-6 h-2 bg-white/20 rounded-full mb-4" /> {/* Mouth hole/hint */}
                    </div>
                  )}

                  {/* Mouth */}
                  <div className={`absolute ${beardStyle === 'full' ? 'bottom-5' : 'bottom-3'} w-6 h-2 bg-black/20 rounded-full z-10`}>
                    {isWhacked && <div className="w-full h-full bg-black rounded-full border-2 border-white" />}
                  </div>
                  
                </div>
                </div>
              </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Whack Effect */}
      {isWhacked && (
        <motion.div 
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 z-30 text-4xl font-black text-red-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none whitespace-nowrap"
        >
            BUSTED!
        </motion.div>
      )}
    </div>
  );
};

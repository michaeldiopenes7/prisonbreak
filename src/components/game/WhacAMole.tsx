import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Mole, BeardStyle, Outfit } from "./Mole";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Play,
  RotateCcw,
  Trophy,
  Timer,
  AlertTriangle,
  Lock,
  Siren,
} from "lucide-react";
import { toast } from "sonner";

// Constants
const GAME_DURATION = 30; // seconds
const TOTAL_HOLES = 9;
const MIN_SPAWN_INTERVAL = 600;
const MAX_SPAWN_INTERVAL = 1200;
const MIN_STAY_DURATION = 700;
const MAX_STAY_DURATION = 1500;

// Character Variations
const SUSPECT_SKINS = [
  "#5c3a1e", // Dark
  "#3b2313", // Very Dark
  "#8d5524", // Medium Dark
  "#d6a168", // Tan
  "#e0ac69", // Medium Light
  "#e6a756", // Golden
];

const SKIN_TONES = [
  "#f0d5b1", // Light
  "#ffdbac", // Pale
  ...SUSPECT_SKINS,
];

const BEARD_STYLES: BeardStyle[] = [
  "none",
  "stubble",
  "mustache",
  "goatee",
  "full",
];

interface MoleConfig {
  skin: string;
  beard: BeardStyle;
  outfit: Outfit;
}

const VOICELINES = [
  "Stop, police!",
  "We’re not letting this one get away. Continuing pursuit.",
  "Dispatch, we’ve got a suspect",
  "Freeze! Hands in the air!",
  "Backup required in Sector 4!",
  "Suspect spotted, moving to intercept!",
];

interface Voiceline {
  id: number;
  text: string;
  x: number;
  y: number;
}

export const WhacAMole: React.FC = () => {
  const [moles, setMoles] = useState<boolean[]>(
    Array(TOTAL_HOLES).fill(false),
  );
  const [whackedStatus, setWhackedStatus] = useState<boolean[]>(
    Array(TOTAL_HOLES).fill(false),
  );
  const [moleConfigs, setMoleConfigs] = useState<MoleConfig[]>(
    Array(TOTAL_HOLES).fill({
      skin: SKIN_TONES[0],
      beard: "stubble",
      outfit: "prisoner",
    }),
  );

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<
    "time" | "empty_cell" | "innocent_hit"
  >("time");
  
  // Onboarding State
  const [playerName, setPlayerName] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [tempName, setTempName] = useState("");

  // Voicelines State
  const [activeVoicelines, setActiveVoicelines] = useState<Voiceline[]>([]);
  const voicelineTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs to manage timeouts without triggering re-renders or dependency loops
  const moleTimeouts = useRef<{
    [key: number]: NodeJS.Timeout;
  }>({});
  const gameLoopTimeout = useRef<NodeJS.Timeout | null>(null);

  // Ref to track moles state for async access
  const molesRef = useRef(moles);
  useEffect(() => {
    molesRef.current = moles;
  }, [moles]);

  const handleEngage = () => {
    if (!playerName) {
      setShowOnboarding(true);
    } else {
      startGame();
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    setPlayerName(tempName);
    setShowOnboarding(false);
    setShowWelcome(true);

    // Start game after delay
    setTimeout(() => {
      setShowWelcome(false);
      startGame();
    }, 2000);
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setMoles(Array(TOTAL_HOLES).fill(false));
    setWhackedStatus(Array(TOTAL_HOLES).fill(false));
    setGameOverReason("time");

    // Clear any existing timeouts
    Object.values(moleTimeouts.current).forEach(clearTimeout);
    moleTimeouts.current = {};
    if (voicelineTimeoutRef.current) clearTimeout(voicelineTimeoutRef.current);
    setActiveVoicelines([]);

    runGameLoop();
    runVoicelineLoop();
  };

  const runVoicelineLoop = useCallback(() => {
    if (!isPlaying) return;

    const delay = Math.random() * 5000 + 3000; // 3-8 seconds

    voicelineTimeoutRef.current = setTimeout(() => {
      if (!isPlaying) return;
      
      // Add a new random voiceline
      const text = VOICELINES[Math.floor(Math.random() * VOICELINES.length)];
      const id = Date.now();
      // Random position within the game board (approximate percentages)
      const x = Math.random() * 60 + 20; // 20-80%
      const y = Math.random() * 60 + 20; // 20-80%

      setActiveVoicelines(prev => [...prev, { id, text, x, y }]);

      // Remove it after a few seconds
      setTimeout(() => {
        setActiveVoicelines(prev => prev.filter(v => v.id !== id));
      }, 2500);

      runVoicelineLoop();
    }, delay);
  }, [isPlaying]);

  const runGameLoop = useCallback(() => {
    if (!isPlaying) return;

    const spawnTime =
      Math.random() *
        (MAX_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) +
      MIN_SPAWN_INTERVAL;

    gameLoopTimeout.current = setTimeout(() => {
      if (!isPlaying) return;
      spawnMole();
      runGameLoop();
    }, spawnTime);
  }, [isPlaying]);

  // Effect to trigger loop when playing state changes
  useEffect(() => {
    if (isPlaying) {
      runGameLoop();
      runVoicelineLoop();
    } else {
      if (gameLoopTimeout.current)
        clearTimeout(gameLoopTimeout.current);
      if (voicelineTimeoutRef.current)
        clearTimeout(voicelineTimeoutRef.current);
    }
    return () => {
      if (gameLoopTimeout.current)
        clearTimeout(gameLoopTimeout.current);
      if (voicelineTimeoutRef.current)
        clearTimeout(voicelineTimeoutRef.current);
    };
  }, [isPlaying, runGameLoop, runVoicelineLoop]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame("time");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const endGame = (
    reason: "time" | "empty_cell" | "innocent_hit",
  ) => {
    setIsPlaying(false);
    setIsGameOver(true);
    setGameOverReason(reason);
    if (score > highScore) {
      setHighScore(score);
    }

    if (reason !== "time") {
      // Optional sound effect trigger or toast
    }
  };

  const spawnMole = () => {
    const availableIndices = molesRef.current
      .map((isActive, index) => (!isActive ? index : -1))
      .filter((index) => index !== -1);

    if (availableIndices.length === 0) return;

    const randomIndex =
      availableIndices[
        Math.floor(Math.random() * availableIndices.length)
      ];

    // Generate Random Appearance
    const randomSkin =
      SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
    const randomBeard =
      BEARD_STYLES[
        Math.floor(Math.random() * BEARD_STYLES.length)
      ];

    // Determine Outfit - Default to prisoner (image based) unless we want special types
    // The user requested "replace with these image the suspect", implying we use the images primarily.
    // We will force 'prisoner' outfit to use the new image logic, but keeping the code structure flexible.
    const randomOutfit: Outfit = "prisoner"; 

    setMoleConfigs((prev) => {
      const newConfigs = [...prev];
      newConfigs[randomIndex] = {
        skin: randomSkin,
        beard: randomBeard,
        outfit: randomOutfit,
      };
      return newConfigs;
    });

    setMoles((prev) => {
      const newMoles = [...prev];
      newMoles[randomIndex] = true;
      return newMoles;
    });

    setWhackedStatus((prev) => {
      const newStatus = [...prev];
      newStatus[randomIndex] = false;
      return newStatus;
    });

    const stayDuration =
      Math.random() * (MAX_STAY_DURATION - MIN_STAY_DURATION) +
      MIN_STAY_DURATION;

    if (moleTimeouts.current[randomIndex])
      clearTimeout(moleTimeouts.current[randomIndex]);

    moleTimeouts.current[randomIndex] = setTimeout(() => {
      hideMole(randomIndex);
    }, stayDuration);
  };

  const hideMole = (index: number) => {
    setMoles((prev) => {
      const newMoles = [...prev];
      newMoles[index] = false;
      return newMoles;
    });
    setTimeout(() => {
      setWhackedStatus((prev) => {
        const newStatus = [...prev];
        newStatus[index] = false;
        return newStatus;
      });
    }, 200);
  };

  const handleWhack = (index: number) => {
    if (!moles[index] || whackedStatus[index] || !isPlaying)
      return;

    // Check if the whacked mole is a suspect or a civilian
    const isSuspect = SUSPECT_SKINS.includes(
      moleConfigs[index].skin,
    );

    if (!isSuspect) {
      // Caught a civilian!
      toast.error("INNOCENT CIVILIAN! Do not engage!", {
        position: "top-center",
        duration: 2000,
        style: {
          background: "#ef4444",
          color: "white",
          border: "none",
        },
      });
      endGame("innocent_hit");
      return;
    }

    setScore((prev) => prev + 1);
    setWhackedStatus((prev) => {
      const newStatus = [...prev];
      newStatus[index] = true;
      return newStatus;
    });

    if (moleTimeouts.current[index])
      clearTimeout(moleTimeouts.current[index]);

    moleTimeouts.current[index] = setTimeout(() => {
      hideMole(index);
    }, 400);
  };

  const handleMiss = (index: number) => {
    if (!isPlaying) return;

    // If the mole is hidden, clicking the container ends the game
    if (!moles[index]) {
      toast.error("FALSE ALARM! You raided an empty cell!", {
        position: "top-center",
        duration: 2000,
        style: {
          background: "#ef4444",
          color: "white",
          border: "none",
        },
      });
      endGame("empty_cell");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-700 text-slate-200">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-slate-400 text-sm flex items-center gap-1 mb-1">
              <Timer className="w-4 h-4" /> Time
            </div>
            <div className="text-2xl font-bold font-mono text-red-500">
              {timeLeft}s
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-950/30 border-red-900/50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-red-400 text-sm flex items-center gap-1 mb-1 font-bold uppercase">
              <AlertTriangle className="w-4 h-4" /> Caught
            </div>
            <div className="text-3xl font-black text-white">
              {score}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700 text-slate-200">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-slate-400 text-sm flex items-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-yellow-600" />{" "}
              Record
            </div>
            <div className="text-2xl font-bold font-mono">
              {highScore}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Board */}
      <div className="relative bg-zinc-900 p-4 sm:p-8 rounded-xl shadow-2xl border-8 border-zinc-800">
        {/* Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {Array.from({ length: TOTAL_HOLES }).map(
            (_, index) => (
              <Mole
                key={index}
                isVisible={moles[index]}
                isWhacked={whackedStatus[index]}
                skinColor={moleConfigs[index].skin}
                beardStyle={moleConfigs[index].beard}
                outfit={moleConfigs[index].outfit}
                isSuspect={SUSPECT_SKINS.includes(moleConfigs[index].skin)}
                onWhack={() => handleWhack(index)}
                onMiss={() => handleMiss(index)}
              />
            ),
          )}
        </div>

        {/* Random Voiceline Popups */}
        {activeVoicelines.map((voiceline) => (
          <div
            key={voiceline.id}
            className="absolute z-30 pointer-events-none text-red-600 font-black uppercase tracking-tighter text-xl sm:text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-bottom-4 duration-300"
            style={{
              top: `${voiceline.y}%`,
              left: `${voiceline.x}%`,
              transform: "translate(-50%, -50%) rotate(-5deg)",
              textShadow: "0 0 10px rgba(220, 38, 38, 0.5)",
            }}
          >
            "{voiceline.text}"
          </div>
        ))}

          {/* Overlays */}
        {!isPlaying && !isGameOver && !showOnboarding && !showWelcome && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md rounded-lg z-40 flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-6 p-4 bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">
              Lockdown
            </h2>
            <p className="text-slate-400 mb-2 max-w-xs font-mono">
              Security breach detected. Catch all escaping
              prisoners!
            </p>
            <p className="text-red-400 mb-8 text-xs font-bold uppercase border border-red-900/50 bg-red-950/30 px-3 py-1 rounded">
              Warning: Hitting civilians or empty cells will
              terminate mission
            </p>
            <Button
              size="lg"
              onClick={handleEngage}
              className="bg-red-600 hover:bg-red-700 text-white text-lg px-10 h-16 rounded-sm shadow-lg uppercase font-black tracking-widest transition-all"
            >
              <Play className="w-6 h-6 mr-2" /> Engage
            </Button>
          </div>
        )}

        {/* Onboarding Overlay */}
        {showOnboarding && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md rounded-lg z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="w-full max-w-sm space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-widest">
                  Identity Verification
                </h2>
                <p className="text-slate-400 text-sm font-mono">
                  Enter your credentials to access the system.
                </p>
              </div>
              
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="name" className="text-red-500 font-mono text-xs uppercase font-bold">
                    Warden Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="ENTER NAME"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value.toUpperCase())}
                    className="bg-slate-800 border-slate-700 text-white font-mono placeholder:text-slate-600 text-center uppercase tracking-widest"
                    autoFocus
                    autoComplete="off"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={!tempName.trim()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest"
                >
                  Confirm Identity
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Welcome Overlay */}
        {showWelcome && (
          <div className="absolute inset-0 bg-black rounded-lg z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
             <div className="space-y-4">
                <div className="text-green-500 font-mono text-sm uppercase tracking-widest animate-pulse">
                   Access Granted
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-wider">
                   Welcome, Warden <span className="text-red-500">{playerName}</span>
                </h2>
                <div className="w-16 h-1 bg-red-600 mx-auto rounded-full" />
             </div>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-lg z-40 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="bg-zinc-900 border-2 border-zinc-700 p-8 rounded-xl shadow-2xl max-w-sm w-full transform transition-all">
              <div className="mb-4 flex justify-center">
                {gameOverReason !== "time" ? (
                  <Siren className="w-16 h-16 text-red-500 animate-pulse" />
                ) : (
                  <Lock className="w-16 h-16 text-slate-500" />
                )}
              </div>

              <h2 className="text-3xl font-black text-white mb-2 uppercase">
                {gameOverReason === "empty_cell"
                  ? "FALSE ALARM"
                  : gameOverReason === "innocent_hit"
                    ? "CIVILIAN CASUALTY"
                    : "SHIFT ENDED"}
              </h2>

              <div className="text-6xl font-black text-red-500 mb-4 font-mono">
                {score}
              </div>

              <p className="text-slate-400 mb-8 font-mono text-sm">
                {gameOverReason === "empty_cell"
                  ? "Protocol violation! You raided an empty cell."
                  : gameOverReason === "innocent_hit"
                    ? "You hit an innocent! Check your fire."
                    : score > 20
                      ? "OUTSTANDING SERVICE"
                      : score > 10
                        ? `GOOD WORK, WARDEN ${playerName}`
                        : "SECURITY BREACH FAILED"}
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={startGame}
                  size="lg"
                  className="w-full h-14 text-lg bg-slate-200 text-slate-900 hover:bg-white font-bold uppercase"
                >
                  <RotateCcw className="w-5 h-5 mr-2" /> Retry
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Instructions */}
      <div className="text-center text-sm text-slate-500 font-mono uppercase tracking-wide space-y-1">
        <p>Click SUSPECTS ONLY �� Avoid Civilians</p>
        <p className="text-red-500/50 text-xs">
          Penalty: Immediate termination for false alarms
        </p>
      </div>
    </div>
  );
};
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import {
  computeRemaining,
  readState,
  subscribe,
  TimerState,
} from "../lib/timerStore";

const DANGER_THRESHOLD = 5 * 60;

const formatTime = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
};

const Index = () => {
  const [state, setState] = useState<TimerState>(() => readState());
  const [remaining, setRemaining] = useState(() => computeRemaining(readState()));

  useEffect(() => {
    const unsub = subscribe(() => setState(readState()));
    return unsub;
  }, []);

  useEffect(() => {
    const tick = () => setRemaining(computeRemaining(state));
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [state]);

  const isDanger = remaining > 0 && remaining <= DANGER_THRESHOLD;
  const isFinished = state.totalSet > 0 && remaining === 0 && state.endsAt !== null;

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Discreet admin link */}
      <Link
        to="/admin"
        aria-label="Admin"
        className="fixed bottom-3 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-card/30 text-muted-foreground/40 opacity-30 transition-opacity hover:opacity-100 hover:text-foreground"
      >
        <Settings className="h-4 w-4" />
      </Link>

      <div className="flex min-h-screen w-full items-center justify-center p-6">
        <div
          className={`relative flex w-full max-w-[min(95vw,160vh)] aspect-[16/9] items-center justify-center rounded-2xl border-4 transition-all duration-700 ${
            isDanger
              ? "border-destructive glow-danger"
              : "border-primary glow-safe"
          }`}
        >
          <div className="text-center">
            {isFinished ? (
              <div className="font-display font-bold leading-none text-gradient-danger animate-blink-stop text-[18vw] md:text-[14vw]">
                STOP
              </div>
            ) : (
              <div
                className={`font-display font-bold tabular-nums leading-none transition-colors text-[16vw] md:text-[13vw] ${
                  isDanger
                    ? "text-gradient-danger animate-pulse-danger"
                    : "text-gradient-safe"
                }`}
              >
                {formatTime(remaining)}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;

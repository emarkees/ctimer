import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Pause, Play, RotateCcw, Timer as TimerIcon } from "lucide-react";
import {
  computeRemaining,
  readState,
  subscribe,
  writeState,
} from "@/lib/timerStore";

const formatTime = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
};

const Admin = () => {
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("10");
  const [seconds, setSeconds] = useState("0");
  const [state, setState] = useState(() => readState());
  const [, force] = useState(0);

  useEffect(() => subscribe(() => setState(readState())), []);
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 500);
    return () => window.clearInterval(id);
  }, []);

  const remaining = computeRemaining(state);
  const running = state.endsAt !== null && state.pausedRemaining === null && remaining > 0;
  const isFinished = state.totalSet > 0 && remaining === 0 && state.endsAt !== null;

  const handleLoad = () => {
    const total =
      (parseInt(hours) || 0) * 3600 +
      (parseInt(minutes) || 0) * 60 +
      (parseInt(seconds) || 0);
    writeState({ endsAt: null, pausedRemaining: total, totalSet: total });
  };

  const handleStart = () => {
    const rem = remaining;
    if (rem <= 0) return;
    writeState({
      endsAt: Date.now() + rem * 1000,
      pausedRemaining: null,
      totalSet: state.totalSet,
    });
  };

  const handlePause = () => {
    writeState({
      endsAt: null,
      pausedRemaining: remaining,
      totalSet: state.totalSet,
    });
  };

  const handleReset = () => {
    writeState({
      endsAt: null,
      pausedRemaining: state.totalSet,
      totalSet: state.totalSet,
    });
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 md:py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <TimerIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight">
                Admin Console
              </h1>
              <p className="text-xs text-muted-foreground">
                Stage timer control · hidden from audience
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Stage view
          </Link>
        </header>

        <Card className="border-border/60 bg-card/60 p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Live
            </span>
            <span
              className={`text-xs font-medium ${
                isFinished
                  ? "text-destructive"
                  : running
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {isFinished ? "Stopped" : running ? "Counting down" : "Idle"}
            </span>
          </div>
          <div className="mt-2 font-display text-6xl font-bold tabular-nums">
            {isFinished ? "STOP" : formatTime(remaining)}
          </div>
        </Card>

        <Card className="border-border/60 bg-card/60 p-6 backdrop-blur">
          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold">Set duration</h2>
            <p className="text-xs text-muted-foreground">
              Enter hours, minutes, and seconds
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Hours", value: hours, set: setHours, max: 99 },
              { label: "Minutes", value: minutes, set: setMinutes, max: 59 },
              { label: "Seconds", value: seconds, set: setSeconds, max: 59 },
            ].map((f) => (
              <div key={f.label}>
                <Label className="text-xs text-muted-foreground">{f.label}</Label>
                <Input
                  type="number"
                  min={0}
                  max={f.max}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="mt-1 h-12 border-border/60 bg-secondary/50 font-display text-center text-xl"
                />
              </div>
            ))}
          </div>

          <Button onClick={handleLoad} variant="secondary" className="mt-4 w-full">
            Load timer
          </Button>
        </Card>

        <Card className="border-border/60 bg-card/60 p-6 backdrop-blur">
          <h2 className="mb-4 font-display text-lg font-semibold">Controls</h2>
          <div className="grid grid-cols-2 gap-3">
            {running ? (
              <Button
                onClick={handlePause}
                className="col-span-2 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Pause className="mr-2 h-4 w-4" /> Pause
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                disabled={remaining === 0}
                className="col-span-2 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
            )}
            <Button
              onClick={handleReset}
              variant="outline"
              className="col-span-2 h-11 border-border/60"
              disabled={state.totalSet === 0}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Admin;

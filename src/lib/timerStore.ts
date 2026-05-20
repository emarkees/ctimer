// Shared timer state synced across windows/tabs via localStorage.
// State stores the absolute end timestamp so the display stays accurate
// even if the admin window is closed.

export type TimerState = {
  endsAt: number | null; // epoch ms when timer ends (null if not running)
  pausedRemaining: number | null; // seconds remaining while paused
  totalSet: number; // seconds originally set
};

const KEY = "stage-countdown-state";

const defaultState: TimerState = {
  endsAt: null,
  pausedRemaining: null,
  totalSet: 0,
};

export const readState = (): TimerState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
};

export const writeState = (s: TimerState) => {
  localStorage.setItem(KEY, JSON.stringify(s));
  // Notify same-tab listeners (storage event only fires cross-tab)
  window.dispatchEvent(new CustomEvent("stage-timer-update"));
};

export const subscribe = (cb: () => void) => {
  const handler = () => cb();
  window.addEventListener("storage", handler);
  window.addEventListener("stage-timer-update", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("stage-timer-update", handler);
  };
};

export const computeRemaining = (s: TimerState): number => {
  if (s.pausedRemaining !== null) return s.pausedRemaining;
  if (s.endsAt === null) return 0;
  return Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000));
};

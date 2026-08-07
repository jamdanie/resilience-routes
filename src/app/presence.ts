export interface PresenceController {
  setMission: (missionId: string | null) => void;
  stop: () => void;
}

interface PresenceResponse {
  active?: number;
}

const HEARTBEAT_MS = 25_000;

export function createPresenceController(
  onUpdate: (state: { connected: boolean; active: number | null; label: string }) => void
): PresenceController {
  const endpoint = import.meta.env.VITE_PRESENCE_ENDPOINT?.trim();
  const sessionId = crypto.randomUUID();
  let missionId: string | null = null;
  let timer: number | null = null;
  let stopped = false;

  const send = async (leaving = false): Promise<void> => {
    if (!endpoint) {
      onUpdate({ connected: true, active: null, label: "Live session" });
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, missionId, leaving, timestamp: Date.now() }),
        keepalive: leaving
      });
      if (!response.ok) throw new Error(`Presence request failed: ${response.status}`);
      const payload = (await response.json()) as PresenceResponse;
      onUpdate({
        connected: true,
        active: Number.isFinite(payload.active) ? Number(payload.active) : null,
        label: Number.isFinite(payload.active) ? "Operators online" : "Live session"
      });
    } catch {
      onUpdate({ connected: false, active: null, label: "Presence offline" });
    }
  };

  const schedule = (): void => {
    if (timer !== null) window.clearInterval(timer);
    timer = window.setInterval(() => void send(), HEARTBEAT_MS);
  };

  const setMission = (nextMissionId: string | null): void => {
    missionId = nextMissionId;
    void send();
  };

  const stop = (): void => {
    if (stopped) return;
    stopped = true;
    if (timer !== null) window.clearInterval(timer);
    void send(true);
  };

  window.addEventListener("pagehide", stop, { once: true });
  void send();
  schedule();

  return { setMission, stop };
}

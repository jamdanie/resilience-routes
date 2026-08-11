# Live presence contract

Resilience Routes can display a real concurrent operator count when a presence endpoint is configured. The interface never generates a simulated count.

## Configuration

Copy `.env.example` to `.env.local` and set:

```text
VITE_PRESENCE_ENDPOINT=https://example.com/api/presence
```

The browser sends a JSON heartbeat every 25 seconds:

```json
{
  "sessionId": "temporary-random-uuid",
  "missionId": "pacific-northwest",
  "leaving": false,
  "timestamp": 1785980000000
}
```

The endpoint returns the number of sessions seen during its active window:

```json
{ "active": 3 }
```

When the page closes, it sends a final heartbeat with `leaving: true`. The service should also expire sessions automatically after 60–90 seconds so disconnected browsers do not remain in the count.

## Privacy boundary

Do not collect names, emails, IP-derived location, mission answers, or other personal information. The random session ID should expire with the presence record and should not be reused as an analytics identifier.

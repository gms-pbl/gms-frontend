# GMS Frontend Workspace

React frontend workspace for greenhouse operations UI.

## Folder Structure

- `frontend/` - Vite + React application

## Current UI Scope

- `/zones` is connected to live backend APIs.
- `/zones` includes a device control modal (actuator commands + live status).
- `/zones` live readings and command ACK status come from backend-persisted state.
- `/zones` marks devices as `LIVE` / `OFFLINE` and supports availability filtering (`Live`, `Offline`, `All`; default `Live`).
- `/` dashboard still uses local mock hooks for sensor and alert feeds.

## Stack

- React (JavaScript)
- Tailwind CSS
- Vite

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm

## Setup and Run

From repository root:

```bash
cd frontend/frontend
npm install
npm run dev
```

UI URL: `http://localhost:5173`

Build/lint:

```bash
npm run build
npm run lint
```

## Environment Variables

Create `frontend/frontend/.env.local` if you need custom values:

```env
VITE_API_BASE_URL=/api
VITE_TENANT_ID=tenant-demo
VITE_GREENHOUSE_ID=greenhouse-demo
```

Meaning:

- `VITE_API_BASE_URL` - backend REST base URL used by frontend requests
- `VITE_TENANT_ID` - current tenant scope (future: each user/org has own resources)
- `VITE_GREENHOUSE_ID` - current greenhouse scope under that tenant

Example future scenario:

- tenant `acme` with greenhouse `west-site`
- tenant `biofarm` with greenhouse `north-site`

Frontend simply switches context values and talks to the same API contract.

By default, Vite dev server proxies `/api/*` to `http://localhost:8081/*`, which avoids local browser CORS noise.

## Route Map

- `/` - dashboard shell (mock-driven today)
- `/zones` - zone registration and management (live backend)

## `/zones` API Purpose

- `GET /v1/zones/registry` - refresh discovered + assigned lists
- `POST /v1/zones/assign` - bind a discovered device to a zone
- `POST /v1/zones/unassign` - move zone back to discovered state
- `POST /v1/zones/sync` - push full zone snapshot to gateway
- `POST /v1/zones/command` - send per-device command (used by control modal)
- `GET /v1/zones/command-ack?command_id=...` - poll gateway ACK state for last command
- `GET /v1/dashboard/live?greenhouse_id=...&zone_id=...` - poll latest persisted metric keys for selected device/zone

## Device Control Modal (`/zones`)

When opening a device card from `/zones`, the modal currently provides:

- OUT control grid (`OUT_00..OUT_07`) with HIGH/LOW commands
- Sensor value section (`air_*`, `soil_*`)
- Input status section (`din_00..din_03`)
- Output status driven by live telemetry (`dout_00..dout_07`)
- Command ACK panel (`PENDING/FORWARDED/APPLIED/FAILED/TIMEOUT`) for last output command

Command payload shape used by frontend:

```json
{
  "tenant_id": "tenant-demo",
  "greenhouse_id": "greenhouse-demo",
  "device_id": "portenta-xxxx",
  "action": "SET_OUTPUT",
  "payload": {
    "channel": 0,
    "state": 1
  }
}
```

## Data Source Matrix

| Page | Source | Purpose |
|---|---|---|
| `/zones` | backend REST | operational zone management (persistent backend state) |
| `/` | local hooks | temporary dashboard simulation |

## Recommended Local Workflow

1. Start gateway stack:

```bash
cd firmware/src/gateway
./scripts/up.sh
```

2. Start backend (dockerized or native):

```bash
cd backend/infra
./scripts/up.sh
```

This local stack runs backend plus TimescaleDB persistence; gateway MQTT is expected on `localhost:1883`.

Follow backend logs while starting:

```bash
cd backend/infra
./scripts/up.sh -v
```

3. Start frontend:

```bash
cd frontend/frontend
npm run dev
```

4. Open:

- `http://localhost:5173/zones`
- `http://localhost:4173` (simulator UI)

## Troubleshooting

- If Vite shows `http proxy error ... ECONNREFUSED` for `/v1/...`, backend is down or still starting.
- Verify backend health with `curl http://localhost:8081/actuator/health`.
- If backend just restarted, wait a few seconds for Spring Boot + Flyway to finish booting.

## Contributor Notes

- Zone UI contract lives in `frontend/frontend/src/hooks/useZoneRegistry.js`.
- Runtime config defaults live in `frontend/frontend/src/config/runtimeConfig.js`.
- Dashboard migration target is replacing:
  - `frontend/frontend/src/hooks/useSensorData.js`
  - `frontend/frontend/src/hooks/useAlerts.js`

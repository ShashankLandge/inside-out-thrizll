# Dating MVP Backend (Express + Socket.IO + Prisma + SQLite)

A stripped-down backend you can run quickly to test your dating-app MVP.

## Stack
- Node.js + TypeScript
- Express (REST)
- Socket.IO (realtime)
- Prisma + SQLite (dev database)
- JWT auth (no refresh tokens)

## Quick start

```bash
# 1) extract this repo folder
cd dating-mvp-backend

# 2) copy env
cp .env.example .env

# 3) install deps
npm install

# 4) generate prisma client and create SQLite DB
npx prisma generate
npm run prisma:migrate

# 5) run dev
npm run dev
# API at http://localhost:4000 ; Socket.IO at same host
```

## REST endpoints (MVP)
- **POST** `/api/v1/auth/register` `{ name, email, password, age?, location? }`
- **POST** `/api/v1/auth/login` `{ email, password }`
- **GET** `/api/v1/users/:id`
- **POST** `/api/v1/requests` `{ toUserId }` (auth)
- **GET** `/api/v1/requests?incoming=true|false` (auth)
- **POST** `/api/v1/requests/:id/respond` `{ action: 'accept'|'reject' }` (auth)
- **GET** `/api/v1/rooms` (auth)
- **GET** `/api/v1/rooms/:roomId/messages?limit=50` (auth)
- **POST** `/api/v1/rooms/:roomId/messages` `{ text }` (auth)
- **POST** `/api/v1/rooms/:roomId/tier-request` `{ requestedTier }` (auth)
- **POST** `/api/v1/rooms/:roomId/tier-respond` `{ requestId, approve }` (auth)

Auth: send `Authorization: Bearer <JWT>` header after login/register.

## Socket.IO events
Authenticate on connect with:
```js
io.connect('http://localhost:4000', { auth: { token: '<JWT>' } });
```

- `join_room` `{ roomId }` → ack `{ success }`
- `send_message` `{ clientMsgId?, roomId, text }` → ack `{ success, serverMessageId }`; server emits `receive_message`
- `typing` `{ roomId, isTyping }`
- `tier_request` `{ roomId, requestedTier }` → notifies other user
- `tier_respond` `{ requestId, approve }` → on approve server emits `tier_applied`

Server emits:
- `incoming_request` when someone sends you a match request
- `room_created` when a request is accepted (room is ready)
- `receive_message` to room subscribers
- `tier_request` to the other member
- `tier_applied` when tier change is applied

## Dev tips
- Use SQLite for quick dev. Switch to Postgres later by changing `datasource` in `prisma/schema.prisma` and `DATABASE_URL` in `.env`.
- All sockets also join `user:<userId>` room so we can push user-targeted events.
- Minimal validation only; expand with zod or similar later.
- For media tiers: currently tiers only store state; actual media is not implemented in MVP.

# MatchPlay Frontend (Vite + React + Tailwind)

## Quick start

1. Copy `.env.example` to `.env` and set `VITE_API_URL` to your backend base URL (e.g. http://localhost:4000)
2. Install deps:
   ```
   npm install
   ```
3. Run dev server:
   ```
   npm run dev
   ```

The app provides:
- Signup & Login pages (registers against backend)
- Discover users & send requests
- See incoming requests & accept/reject
- List of active chats, open chat rooms, realtime messaging (uses socket.io)
- Request tier upgrades (consent flow handled server-side)

## Important backend note (small required endpoint)

The frontend expects a `GET /api/v1/users` endpoint that returns all users:

Add this to your backend `routes/users.ts` (or equivalent):

```ts
// list users
usersRouter.get('/', async (req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, age: true, location: true }});
  res.json(users);
});
```

This is safe for MVP. The rest of endpoints used are already in the backend scaffold.


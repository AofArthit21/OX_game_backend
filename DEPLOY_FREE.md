# Free Deploy Guide (Neon + Render + Vercel)

## 1) Neon Postgres (Free)
- Create Neon project.
- Copy `DATABASE_URL` from Neon.
- Keep SSL on (`sslmode=require`).

## 2) Backend on Render (Free Web Service)
- Connect repo: `AofArthit21/OX_game_backend`.
- Render can auto-detect `render.yaml`.
- Set these env vars in Render:
  - `DATABASE_URL` = Neon connection string
  - `GOOGLE_CLIENT_ID` = your Google client id
  - `GOOGLE_CLIENT_SECRET` = your Google client secret
  - `FRONTEND_URL` = your Vercel frontend URL
  - `CORS_ORIGIN` = your Vercel frontend URL
  - `BACKEND_URL` = your Render backend URL
  - `REDIS_URL` = your Redis URL (Upstash/Render Key Value)
- Deploy and note backend URL (example: `https://ox-game-backend.onrender.com`).

## 3) Google OAuth Console
- Authorized JavaScript origins:
  - `https://<your-frontend>.vercel.app`
- Authorized redirect URI:
  - `https://<your-backend>.onrender.com/api/auth/google/callback`

## 4) Frontend on Vercel (Free)
- Project: `ox-game-frontend`.
- Set env var:
  - `NEXT_PUBLIC_NEST_API_BASE_URL=https://<your-backend>.onrender.com`
- Redeploy.

## 5) Smoke Test
- Open frontend URL.
- Click `Login with Google`.
- Confirm redirect back with token in URL.
- Play one game and confirm leaderboard loads.

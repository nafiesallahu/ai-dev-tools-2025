# Online Coding Interview Platform

React (Vite) frontend with Monaco-based collaborative editor and Pyodide-powered Python execution, plus an Express + Socket.io backend for session creation and real-time sync.

## Prerequisites
- Node.js 18+ and npm

## Setup
```bash
# install backend deps
cd server && npm install

# install frontend deps
cd ../client && npm install
```

## Running
Open two terminals:
```bash
# terminal 1: backend
cd server
npm run dev

# terminal 2: frontend
cd client
npm run dev
```
Frontend defaults to `http://localhost:5173` and expects the API/socket at `http://localhost:4000`.

## Environment
- Backend listens on `PORT` (default 4000).
- Frontend can override API/socket origin with `VITE_API_URL` / `VITE_SOCKET_URL`.

## Features
- Create a unique session link via the backend.
- Share the link; all visitors join the same room.
- Live code collaboration with Monaco (JavaScript/Python highlighting).
- Client-side execution: JS via sandboxed `Function`, Python via Pyodide (WebAssembly).
- Session state kept in-memory on the server (code + language).



# 🩺 QuickMed

QuickMed is a modern AI-powered healthcare assistant that combines a React + TypeScript frontend with an Express + TypeScript backend.

The app supports:
- Symptom analysis and likely causes
- Treatment and medication recommendations
- Prescription / lab report upload processing
- Saved user history and secure auth

---

## 📁 Project Structure

- `backend/` — Express API, TypeScript server, MongoDB integration, Gemini/Groq AI routes
- `frontend/` — Vite + React + TypeScript frontend with Tailwind, shadcn/ui, and React Router

---

## 🚀 Local Setup

### 1. Backend

```bash
cd backend
npm install
```

Create a `backend/.env` file with these values:

```env
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
# or use GEMINI_API_KEY as an alias
GEMINI_API_KEY=your_groq_api_key
PORT=5000
```

Then start the backend in development mode:

```bash
npm run dev
```

The backend should start on `http://localhost:5000` by default.

### 2. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The frontend is served by Vite, typically on `http://localhost:5173`.

---

## 🧩 API Endpoints

The backend exposes the following `gemini` routes:

- `POST /api/gemini/cause` — analyze likely cause from symptoms
- `POST /api/gemini/treatment` — return treatment steps
- `POST /api/gemini/medication` — return medication suggestions
- `POST /api/gemini/home-remedies` — return home remedy tips
- `POST /api/gemini/save-history` — save symptom/results history

Authentication routes live under `/api/auth`.

---

## 🔧 Notes

- The backend currently uses `GROQ_API_KEY` or `GEMINI_API_KEY` to authenticate with the Groq API.
- If you get network errors like `getaddrinfo ENOTFOUND api.groq.com`, verify your internet connection and DNS settings.
- Make sure your `.env` file is loaded before starting the backend.

---

## 💡 Frontend Tech

- React 18
- Vite
- Tailwind CSS
- `react-router-dom` for routing
- `framer-motion` for motion effects
- `react-markdown` for rich result rendering

---

## 🧪 Recommended Workflow

1. Start MongoDB and make sure `DB_URL` is valid.
2. Run the backend: `cd backend && npm run dev`
3. Run the frontend: `cd frontend && npm run dev`
4. Open the app in your browser and use the dashboard interface.

---

## 📌 Disclaimer

QuickMed provides general health information and is not a replacement for professional medical advice.

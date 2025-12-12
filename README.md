# Amsterdam Rent Predictor

End-to-end ML project to predict monthly rent prices in Amsterdam.

## Stack
- Backend: FastAPI + scikit-learn
- Model: Gradient Boosting (synthetic training data)
- Frontend: React + Vite + TypeScript

## Features
- Predict monthly rent price
- Fixed ±€50 confidence band (placeholder, not statistically calibrated)
- Interactive frontend

## Run locally

### Backend
```bash
python -m venv .venv
.venv\Scripts\activate
pip install fastapi uvicorn joblib numpy pandas scikit-learn pydantic
python train_and_save.py
uvicorn app:app --host 127.0.0.1 --port 8001
```

The backend runs at:
```
http://127.0.0.1:8001
```

Health check:
```
http://127.0.0.1:8001/health
```

### Frontend
```bash
cd rent-frontend
npm install
npm run dev
```

Open the frontend at:
http://localhost:5173

---

### Windows PowerShell note

If npm fails because scripts are disabled, use:

```powershell
cd rent-frontend
npm.cmd install
npm.cmd run dev
```

Alternatively, run the same commands in Command Prompt (cmd.exe).

---

## Windows convenience scripts

```powershell
.\scripts\run_backend_windows.ps1
.\scripts\run_frontend_windows.ps1
```

These scripts automatically start the backend and frontend on Windows.

---

## Project structure
```text
.
├── app.py                 FastAPI backend
├── train_and_save.py      Model training (synthetic data)
├── rent-frontend/         React + Vite frontend
│   └── src/App.tsx        Main UI
├── scripts/
│   ├── run_backend_windows.ps1
│   └── run_frontend_windows.ps1
└── README.md

```

## Notes
- The dataset is synthetic and intended for demo / educational use
- The ±€50 band is not a statistically calibrated confidence interval

---

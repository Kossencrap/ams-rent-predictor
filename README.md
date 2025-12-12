# Amsterdam Rent Predictor

End-to-end ML project to predict monthly rent prices in Amsterdam.

## Stack
- **Backend**: FastAPI + scikit-learn
- **Model**: Gradient Boosting (synthetic training data)
- **Frontend**: React + Vite + TypeScript

---

## Features
- Predict monthly rent price
- Fixed ±€50 confidence band (placeholder)
- Interactive frontend

---

## Run locally

### Backend
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8001

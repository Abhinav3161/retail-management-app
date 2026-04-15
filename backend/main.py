from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from config import ALLOWED_ORIGINS
from database import Base, engine
import models
from routers import auth, products, sales, reports, insights
from utils.websocket_manager import get_manager

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Retail Backend", version="0.1.0")

ws_manager = get_manager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(sales.router, prefix="/sales", tags=["sales"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])
app.include_router(insights.router, prefix="/insights", tags=["insights"])


@app.get("/")
def health():
    return {"status": "ok"}


@app.websocket("/ws/dashboard")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

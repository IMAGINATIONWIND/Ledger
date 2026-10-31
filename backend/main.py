from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.workouts import router as workouts_router
from routes.stats    import router as stats_router
from utils.importer  import router as import_router

app = FastAPI(
    title="IronLedger API",
    description="Workout tracking backend — SQL analytics showcase",
    version="1.0.0",
)

# Allow requests from the Next.js frontend (Vercel URL + localhost dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to your Vercel URL before final deploy
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workouts_router)
app.include_router(stats_router)
app.include_router(import_router)


@app.get("/health")
def health():
    return {"status": "ok"}

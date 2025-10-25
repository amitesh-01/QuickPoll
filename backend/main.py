from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.database import engine
from models.models import Base
from routers import auth, polls, votes, likes

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="QuickPoll API", description="Real-time Opinion Polling Platform")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(polls.router)
app.include_router(votes.router)
app.include_router(likes.router)

@app.get("/")
def root():
    return {"message": "Welcome to QuickPoll API"}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models.models import User, Poll
from schemas.schemas import PollCreate, PollResponse
from core.dependencies import get_current_user
from services.poll_service import create_poll_service, get_poll_with_details

router = APIRouter(prefix="/polls", tags=["Polls"])

@router.post("/", response_model=PollResponse)
def create_poll(poll: PollCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new poll."""
    db_poll = create_poll_service(poll, current_user.id, db)
    return get_poll_with_details(db_poll.id, current_user.id, db)

@router.get("/", response_model=List[PollResponse])
def get_polls(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all active polls."""
    polls = db.query(Poll).filter(Poll.is_active == True).offset(skip).limit(limit).all()
    return [get_poll_with_details(poll.id, current_user.id, db) for poll in polls]

@router.get("/{poll_id}", response_model=PollResponse)
def get_poll(poll_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get a specific poll by ID."""
    poll = db.query(Poll).filter(Poll.id == poll_id, Poll.is_active == True).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    return get_poll_with_details(poll_id, current_user.id, db)
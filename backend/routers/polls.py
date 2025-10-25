from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from core.database import get_db
from models.models import User, Poll
from schemas.schemas import PollCreate, PollResponse, PollUpdate
from core.dependencies import get_current_user, get_current_user_optional
from services.poll_service import create_poll_service, get_poll_with_details

router = APIRouter(prefix="/polls", tags=["Polls"])

@router.post("/", response_model=PollResponse)
def create_poll(poll: PollCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new poll."""
    db_poll = create_poll_service(poll, current_user.id, db)
    return get_poll_with_details(db_poll.id, current_user.id, db)

@router.get("/", response_model=List[PollResponse])
def get_polls(skip: int = 0, limit: int = 100, current_user: Optional[User] = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Get all active polls."""
    polls = db.query(Poll).filter(Poll.is_active == True).offset(skip).limit(limit).all()
    user_id = current_user.id if current_user else None
    return [get_poll_with_details(poll.id, user_id, db) for poll in polls]

@router.get("/{poll_id}", response_model=PollResponse)
def get_poll(poll_id: int, current_user: Optional[User] = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Get a specific poll by ID."""
    poll = db.query(Poll).filter(Poll.id == poll_id, Poll.is_active == True).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    user_id = current_user.id if current_user else None
    return get_poll_with_details(poll_id, user_id, db)

@router.put("/{poll_id}", response_model=PollResponse)
def update_poll(poll_id: int, poll_update: PollUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update a poll (owner only)."""
    poll = db.query(Poll).filter(Poll.id == poll_id, Poll.is_active == True).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if user is the owner
    if poll.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this poll")
    
    # Update fields if provided
    if poll_update.title is not None:
        poll.title = poll_update.title
    if poll_update.description is not None:
        poll.description = poll_update.description
    
    db.commit()
    db.refresh(poll)
    
    return get_poll_with_details(poll_id, current_user.id, db)

@router.delete("/{poll_id}")
def delete_poll(poll_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a poll (owner only)."""
    poll = db.query(Poll).filter(Poll.id == poll_id, Poll.is_active == True).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if user is the owner
    if poll.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this poll")
    
    # Soft delete
    poll.is_active = False
    db.commit()
    
    return {"message": "Poll deleted successfully"}
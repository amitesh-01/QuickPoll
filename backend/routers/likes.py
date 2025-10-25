from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.models import User, Poll
from core.dependencies import get_current_user

router = APIRouter(prefix="/polls", tags=["Likes"])

@router.post("/{poll_id}/like")
def like_poll(poll_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Like a poll."""
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if already liked
    if current_user in poll.liked_by:
        raise HTTPException(status_code=400, detail="You have already liked this poll")
    
    # Add like
    poll.liked_by.append(current_user)
    db.commit()
    
    return {"message": "Poll liked successfully"}

@router.delete("/{poll_id}/like")
def unlike_poll(poll_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Unlike a poll."""
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if liked
    if current_user not in poll.liked_by:
        raise HTTPException(status_code=400, detail="You have not liked this poll")
    
    # Remove like
    poll.liked_by.remove(current_user)
    db.commit()
    
    return {"message": "Poll unliked successfully"}
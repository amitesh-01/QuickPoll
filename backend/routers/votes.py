from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.models import User, Poll, PollOption, Vote
from schemas.schemas import VoteCreate, VoteResponse
from core.dependencies import get_current_user

router = APIRouter(prefix="/polls", tags=["Voting"])

@router.post("/{poll_id}/vote", response_model=VoteResponse)
def vote_on_poll(poll_id: int, vote: VoteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Vote on a poll."""
    # Check if poll exists and is active
    poll = db.query(Poll).filter(Poll.id == poll_id, Poll.is_active == True).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if option belongs to this poll
    option = db.query(PollOption).filter(
        PollOption.id == vote.option_id, 
        PollOption.poll_id == poll_id
    ).first()
    if not option:
        raise HTTPException(status_code=400, detail="Invalid option for this poll")
    
    # Check if user already voted
    existing_vote = db.query(Vote).filter(
        Vote.user_id == current_user.id, 
        Vote.poll_id == poll_id
    ).first()
    if existing_vote:
        raise HTTPException(status_code=400, detail="You have already voted on this poll")
    
    # Create vote
    db_vote = Vote(
        user_id=current_user.id,
        poll_id=poll_id,
        option_id=vote.option_id
    )
    db.add(db_vote)
    db.commit()
    db.refresh(db_vote)
    
    return db_vote
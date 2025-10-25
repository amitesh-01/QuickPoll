from sqlalchemy.orm import Session
from models.models import Poll, PollOption, Vote, User
from schemas.schemas import PollCreate

def get_poll_with_details(poll_id: int, user_id: int, db: Session):
    """Get poll with all details including votes and user interaction status."""
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        return None
    
    # Get vote counts for each option
    options_with_counts = []
    for option in poll.options:
        vote_count = db.query(Vote).filter(Vote.option_id == option.id).count()
        option_data = {
            "id": option.id,
            "text": option.text,
            "vote_count": vote_count
        }
        options_with_counts.append(option_data)
    
    # Check if current user voted
    user_vote = db.query(Vote).filter(
        Vote.user_id == user_id, 
        Vote.poll_id == poll_id
    ).first()
    
    # Check if current user liked
    user_liked = db.query(User).filter(
        User.id == user_id,
        User.liked_polls.any(Poll.id == poll_id)
    ).first() is not None
    
    # Calculate totals
    total_votes = sum(option["vote_count"] for option in options_with_counts)
    like_count = len(poll.liked_by)
    
    return {
        "id": poll.id,
        "title": poll.title,
        "description": poll.description,
        "creator_id": poll.creator_id,
        "creator": poll.creator,
        "is_active": poll.is_active,
        "created_at": poll.created_at,
        "options": options_with_counts,
        "total_votes": total_votes,
        "like_count": like_count,
        "user_voted": user_vote.option_id if user_vote else None,
        "user_liked": user_liked
    }

def create_poll_service(poll_data: PollCreate, creator_id: int, db: Session):
    """Create a new poll with options."""
    # Create poll
    db_poll = Poll(
        title=poll_data.title,
        description=poll_data.description,
        creator_id=creator_id
    )
    db.add(db_poll)
    db.commit()
    db.refresh(db_poll)
    
    # Create poll options
    for option_text in poll_data.options:
        db_option = PollOption(text=option_text, poll_id=db_poll.id)
        db.add(db_option)
    
    db.commit()
    return db_poll
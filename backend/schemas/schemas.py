from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Poll Option Schemas
class PollOptionBase(BaseModel):
    text: str

class PollOptionCreate(PollOptionBase):
    pass

class PollOptionResponse(PollOptionBase):
    id: int
    vote_count: int = 0
    
    class Config:
        from_attributes = True

# Poll Schemas
class PollBase(BaseModel):
    title: str
    description: Optional[str] = None

class PollCreate(PollBase):
    options: List[str]  # List of option texts

class PollResponse(PollBase):
    id: int
    creator_id: int
    creator: UserResponse
    is_active: bool
    created_at: datetime
    options: List[PollOptionResponse]
    total_votes: int = 0
    like_count: int = 0
    user_voted: Optional[int] = None  # option_id if user voted
    user_liked: bool = False
    
    class Config:
        from_attributes = True

# Vote Schema
class VoteCreate(BaseModel):
    option_id: int

class VoteResponse(BaseModel):
    id: int
    user_id: int
    poll_id: int
    option_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime
import re

# User Schemas
class UserBase(BaseModel):
    username: str
    email: str
    
    @validator('email')
    def validate_email(cls, v):
        # Email regex pattern
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 50:
            raise ValueError('Username must not exceed 50 characters')
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username can only contain letters, numbers, and underscores')
        return v

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        if len(v) > 100:
            raise ValueError('Password must not exceed 100 characters')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

# Poll Option Schemas
class PollOptionBase(BaseModel):
    text: str

class PollOptionCreate(PollOptionBase):
    pass

class PollOptionResponse(PollOptionBase):
    id: int
    vote_count: int = 0
    
    class Config:
        orm_mode = True

# Poll Schemas
class PollBase(BaseModel):
    title: str
    description: Optional[str] = None
    
    @validator('title')
    def validate_title(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('Poll title must be at least 3 characters long')
        if len(v) > 200:
            raise ValueError('Poll title must not exceed 200 characters')
        return v.strip()
    
    @validator('description')
    def validate_description(cls, v):
        if v is not None and len(v) > 1000:
            raise ValueError('Poll description must not exceed 1000 characters')
        return v

class PollCreate(PollBase):
    options: List[str]  # List of option texts
    
    @validator('options')
    def validate_options(cls, v):
        if len(v) < 2:
            raise ValueError('Poll must have at least 2 options')
        if len(v) > 10:
            raise ValueError('Poll cannot have more than 10 options')
        
        # Check for empty options
        cleaned_options = [opt.strip() for opt in v if opt.strip()]
        if len(cleaned_options) != len(v):
            raise ValueError('All poll options must be non-empty')
        
        # Check for duplicate options
        if len(set(cleaned_options)) != len(cleaned_options):
            raise ValueError('Poll options must be unique')
        
        # Check option length
        for opt in cleaned_options:
            if len(opt) > 500:
                raise ValueError('Each poll option must not exceed 500 characters')
        
        return cleaned_options

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
        orm_mode = True

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
        orm_mode = True

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
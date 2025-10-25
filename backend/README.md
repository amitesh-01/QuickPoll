# QuickPoll Backend

A simple real-time opinion polling platform built with FastAPI.

## Features

- User registration and authentication (JWT)
- Create polls with multiple options
- Vote on polls (one vote per user per poll)
- Like/unlike polls
- Real-time vote and like counting
- RESTful API with automatic documentation

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
├── .env                # Environment variables
├── core/
│   ├── config.py       # Configuration settings
│   ├── database.py     # Database connection
│   └── dependencies.py # FastAPI dependencies
├── models/
│   └── models.py       # SQLAlchemy models
├── schemas/
│   └── schemas.py      # Pydantic schemas
├── routers/
│   ├── auth.py         # Authentication routes
│   ├── polls.py        # Poll management routes
│   ├── votes.py        # Voting routes
│   └── likes.py        # Like/unlike routes
├── services/
│   └── poll_service.py # Business logic for polls
└── utils/
    └── auth.py         # Authentication utilities
```

## Setup Instructions

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Copy environment file:**
   ```bash
   copy .env.example .env  # On Windows
   ```

4. **Run the application:**
   ```bash
   python main.py
   ```
   Or using uvicorn:
   ```bash
   uvicorn main:app --reload
   ```

5. **Access the API:**
   - API: http://localhost:8000
   - Interactive Docs: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get access token
- `GET /auth/me` - Get current user info

### Polls
- `POST /polls` - Create a new poll
- `GET /polls` - Get all polls
- `GET /polls/{poll_id}` - Get specific poll

### Voting
- `POST /polls/{poll_id}/vote` - Vote on a poll

### Likes
- `POST /polls/{poll_id}/like` - Like a poll
- `DELETE /polls/{poll_id}/like` - Unlike a poll

## Usage Example

1. Register a user at `/auth/register`
2. Login at `/auth/login` to get access token
3. Use the token in Authorization header: `Bearer <token>`
4. Create polls, vote, and like polls using the respective endpoints

## Database

**Development**: Uses SQLite by default (quickpoll.db)
**Production**: PostgreSQL (configured for Render.com deployment)

The database is created automatically when you first run the application.

## Deployment

This application is ready for deployment on **Render.com** with PostgreSQL.

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- PostgreSQL setup on Render
- Environment configuration  
- Step-by-step deployment guide

## Security Features

- Password hashing with bcrypt
- JWT tokens for authentication
- CORS middleware for cross-origin requests
- Input validation with Pydantic
- Environment-based configuration
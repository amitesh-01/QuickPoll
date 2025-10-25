# QuickPoll Deployment Guide - Render.com + PostgreSQL

## Step-by-Step Deployment Process

### Step 1: Prepare Your Code for Deployment

✅ **Files Added/Modified for Deployment:**
- `requirements.txt` - Added `psycopg2-binary` for PostgreSQL
- `build.sh` - Build script for Render
- `Procfile` - Process file for web service
- `runtime.txt` - Python version specification
- Updated database configuration for PostgreSQL

### Step 2: Set Up PostgreSQL Database on Render

1. **Go to Render.com Dashboard**
   - Sign up/Login at [render.com](https://render.com)
   
2. **Create a PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Fill in details:
     - **Name**: `quickpoll-db`
     - **Database**: `quickpoll_db`
     - **User**: `quickpoll_user`
     - **Region**: Choose closest to your location
     - **PostgreSQL Version**: 14 or latest
     - **Plan**: Free tier is fine for development
   
3. **Get Database Connection Details**
   - After creation, go to database dashboard
   - Copy the **Internal Database URL** (starts with `postgresql://`)
   - Example: `postgresql://quickpoll_user:password@dpg-xxx-a.oregon-postgres.render.com/quickpoll_db`

### Step 3: Deploy FastAPI Application

1. **Create Web Service on Render**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `QuickPoll` repository
   
2. **Configure Web Service**
   - **Name**: `quickpoll-api`
   - **Environment**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`

3. **Set Environment Variables**
   Go to "Environment" tab and add:
   ```
   DATABASE_URL = [paste your PostgreSQL Internal Database URL from Step 2]
   SECRET_KEY = your-super-secret-jwt-key-change-this-in-production-render
   ALGORITHM = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 30
   DEBUG = False
   ```

### Step 4: Deploy and Test

1. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes)
   
2. **Test Your API**
   - Your API will be available at: `https://your-service-name.onrender.com`
   - Test endpoints:
     - `GET /` - Should return welcome message
     - `GET /docs` - FastAPI documentation
     - `POST /auth/register` - Register a user
     - `POST /auth/login` - Login

### Step 5: Update CORS for Production (Optional)

In `main.py`, update CORS origins:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",  # Your frontend URL
        "https://quickpoll-frontend.onrender.com",  # If frontend also on Render
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Important Notes

### Database Management
- **Automatic Table Creation**: Tables are created automatically on first deployment
- **Data Persistence**: PostgreSQL data persists across deployments
- **Backups**: Render automatically backs up PostgreSQL databases

### Security Best Practices
- Change `SECRET_KEY` to a strong, unique value
- Set `DEBUG=False` in production
- Use environment variables for sensitive data
- Consider using specific CORS origins instead of "*"

### Monitoring
- **Logs**: Available in Render dashboard under "Logs" tab
- **Metrics**: Monitor performance in Render dashboard
- **Health Checks**: Render automatically monitors your service

### Cost
- **PostgreSQL**: Free tier includes 1GB storage, 97 hours/month
- **Web Service**: Free tier includes 750 hours/month
- **Upgrading**: Paid plans available for production use

## Troubleshooting

### Common Issues:
1. **Build Fails**: Check `build.sh` permissions and syntax
2. **Database Connection**: Verify `DATABASE_URL` is correct
3. **Import Errors**: Ensure all dependencies in `requirements.txt`
4. **CORS Issues**: Check `allow_origins` configuration

### Getting Help:
- Check Render logs for detailed error messages
- Verify environment variables are set correctly
- Test locally with PostgreSQL connection string

## Local Development with PostgreSQL

To test locally with PostgreSQL:
1. Install PostgreSQL locally
2. Create a database: `createdb quickpoll_db`
3. Update your `.env` file with local PostgreSQL URL
4. Run: `python main.py`

Your QuickPoll API will be live and ready to use! 🚀
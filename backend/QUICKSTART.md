# Quick Start Guide - AI Mind Mentor Backend

## 🚀 Getting Started

Follow these steps to set up and run the backend server:

### 1. Navigate to Backend Directory
```powershell
cd backend
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Set Up Environment Variables
Run the setup script (Windows):
```powershell
.\setup.ps1
```

Or manually:
```powershell
cp .env.example .env
```

Then edit `.env` file and add your configuration:

```env
# Database - Replace with your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/ai_mind_mentor

# JWT Secret - Generate a secure random string (at least 32 characters)
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars

# Google Gemini API Key - Get from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# CORS - Update if your frontend runs on a different port
CORS_ORIGIN=http://localhost:5173
```

### 4. Set Up MongoDB

**Option A: Local MongoDB**
```powershell
# Install MongoDB from https://www.mongodb.com/try/download/community
# Start MongoDB service
mongod --dbpath C:\data\db
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (free tier available)
3. Get connection string
4. Update `MONGODB_URI` in `.env` file

### 5. Get Google Gemini API Key
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key and paste it in `.env` file

### 6. Start the Server

**Development mode (with auto-reload):**
```powershell
npm run dev
```

**Production mode:**
```powershell
npm start
```

The server will start on `https://ai-mind-mentor-clg-3.onrender.com`

### 7. Test the API

Open your browser or use curl:
```powershell
# Health check
curl https://ai-mind-mentor-clg-3.onrender.com/health

# API info
curl https://ai-mind-mentor-clg-3.onrender.com
```

Expected response:
```json
{
  "status": "ok",
  "message": "AI Mind Mentor API is running"
}
```

## 📝 Next Steps

1. **Update Frontend API URL** (if needed):
   - Frontend is already configured to use `https://ai-mind-mentor-clg-3.onrender.com/api`
   - Check `frontend/src/services/api.js` if you need to change the port

2. **Test User Registration**:
   ```powershell
   curl -X POST https://ai-mind-mentor-clg-3.onrender.com/api/auth/register `
     -H "Content-Type: application/json" `
     -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
   ```

3. **Start the Frontend**:
   ```powershell
   cd ../frontend
   npm run dev
   ```

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env` file
- For Atlas, ensure your IP is whitelisted

### Gemini API Errors
- Verify `GEMINI_API_KEY` is correct
- Check API quota limits
- Ensure you have enabled the Gemini API

### CORS Errors
- Update `CORS_ORIGIN` in `.env` to match your frontend URL
- Default is `http://localhost:5173` (Vite default port)

### Port Already in Use
- Change `PORT` in `.env` file
- Update frontend API URL accordingly

## 📚 API Documentation

See [README.md](README.md) for complete API documentation including:
- All available endpoints
- Request/response formats
- Authentication requirements
- Error handling

## 🛠️ Development

### Project Structure
```
backend/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── middleware/      # Auth & error handling
├── models/          # MongoDB schemas
├── routes/          # API routes
├── services/        # Gemini AI integration
├── utils/           # JWT utilities
└── server.js        # Main entry point
```

### Adding New Features
1. Create model in `models/`
2. Create controller in `controllers/`
3. Create routes in `routes/`
4. Import routes in `server.js`

## 💡 Tips

- Use `npm run dev` during development for auto-reload
- Check logs for detailed error messages
- MongoDB Compass is useful for viewing database data
- Use Postman or Thunder Client for API testing

## 🎉 You're All Set!

Your backend is now ready to power the AI Mind Mentor application!

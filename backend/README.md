# AI Mind Mentor - Backend

Backend API for AI Mind Mentor application built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT-based authentication
- 🧠 AI-powered career guidance using Google Gemini
- 💬 Emotional support chat
- 📊 Mood tracking and burnout analysis
- 🎯 Career roadmap generation
- 👤 User profile management

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Google Gemini API Key

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string (at least 32 characters)
   - Set `GEMINI_API_KEY` to your Google Gemini API key
   - Adjust `CORS_ORIGIN` if your frontend runs on a different port

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Mood Tracking
- `POST /api/mood` - Log mood entry
- `GET /api/mood/history` - Get mood history
- `GET /api/mood/stats` - Get mood statistics
- `GET /api/mood/analyze` - Get burnout analysis

### Career Management
- `POST /api/career/roadmap` - Generate career roadmap
- `GET /api/career/roadmap` - Get user's career roadmap
- `PUT /api/career/profile` - Update career profile
- `GET /api/career/profile` - Get career profile

### Chat
- `POST /api/chat/career` - Send career-related message
- `POST /api/chat/emotional` - Send emotional support message
- `POST /api/chat/gemini` - Direct Gemini API communication

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 5000) |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret key for JWT tokens | Yes |
| GEMINI_API_KEY | Google Gemini API key | Yes |
| CORS_ORIGIN | Allowed CORS origin | No (default: http://localhost:5173) |

## Project Structure

```
backend/
├── config/
│   └── database.js         # MongoDB configuration
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── careerController.js # Career management
│   ├── chatController.js   # Chat functionality
│   └── moodController.js   # Mood tracking
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   └── errorHandler.js     # Global error handler
├── models/
│   ├── User.js             # User model
│   ├── Mood.js             # Mood entry model
│   ├── CareerProfile.js    # Career profile model
│   └── ChatSession.js      # Chat session model
├── routes/
│   ├── authRoutes.js       # Auth routes
│   ├── careerRoutes.js     # Career routes
│   ├── chatRoutes.js       # Chat routes
│   └── moodRoutes.js       # Mood routes
├── services/
│   └── geminiService.js    # Google Gemini AI integration
├── utils/
│   └── jwt.js              # JWT utilities
├── .env.example            # Environment variables template
├── package.json
├── README.md
└── server.js               # Main server file
```

## Getting Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

## MongoDB Setup

### Local MongoDB:
```bash
# Install MongoDB and start the service
mongod --dbpath /path/to/data
```

### MongoDB Atlas (Cloud):
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string and update `.env`

## License

MIT

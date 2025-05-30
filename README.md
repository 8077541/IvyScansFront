# Ivy Scans - Webcomic Reader

A modern webcomic reader with a clean interface built with Next.js.

## Backend Integration

This application is prepared to connect to your custom backend. Here's how to set it up:

### API Structure

The application expects the following API endpoints:

#### Comics
- `GET /api/comics` - Get all comics with pagination and filtering
- `GET /api/comics/featured` - Get featured comics
- `GET /api/comics/latest` - Get latest comics
- `GET /api/comics/:id` - Get comic details
- `GET /api/comics/:id/chapters` - Get comic chapters
- `GET /api/comics/:id/chapters/:chapter` - Get chapter details
- `GET /api/genres` - Get all genres
- `GET /api/comics/search?q=query` - Search comics

#### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh token

#### User
- `GET /api/user/bookmarks` - Get user bookmarks
- `POST /api/user/bookmarks` - Add bookmark
- `DELETE /api/user/bookmarks/:id` - Remove bookmark
- `GET /api/user/ratings` - Get user ratings
- `POST /api/user/ratings` - Add or update rating
- `DELETE /api/user/ratings/:id` - Delete rating
- `GET /api/user/history` - Get reading history
- `POST /api/user/history` - Add to reading history
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Expected Response Formats

#### Comics List
\`\`\`json
{
  "comics": [
    {
      "id": "string",
      "title": "string",
      "cover": "string",
      "latestChapter": "string",
      "updatedAt": "string",
      "status": "string",
      "genres": ["string"]
    }
  ],
  "total": 100,
  "totalPages": 10
}
\`\`\`

#### Comic Detail
\`\`\`json
{
  "id": "string",
  "title": "string",
  "cover": "string",
  "latestChapter": "string",
  "updatedAt": "string",
  "status": "string",
  "genres": ["string"],
  "description": "string",
  "author": "string",
  "artist": "string",
  "released": "string",
  "chapters": [
    {
      "number": 1,
      "title": "string",
      "date": "string"
    }
  ]
}
\`\`\`

#### Chapter
\`\`\`json
{
  "images": ["string"],
  "title": "string",
  "number": 1
}
\`\`\`

#### User
\`\`\`json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "joinDate": "string",
  "avatar": "string",
  "readingStats": {
    "totalRead": 0,
    "currentlyReading": 0,
    "completedSeries": 0,
    "totalChaptersRead": 0
  }
}
\`\`\`

### Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3001/api
\`\`\`

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local` and update the values
4. Run the development server: `npm run dev`

## Authentication

The application uses JWT for authentication. The token is stored in localStorage and sent in the Authorization header for authenticated requests.

## Deployment

Deploy the application to Vercel or any other hosting provider that supports Next.js.

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

####################

# Backend Integration Guide

This document provides guidance on transitioning from mock data to a real backend for the Ivy Scans webcomic reader application.

## Current Setup

The application is currently using mock data with the `USE_MOCK_API` flag set to `true` in `lib/config.ts`. This allows the application to function without a real backend by using predefined mock data.

## Transitioning to a Real Backend

### Step 1: Set up your backend

1. Create a backend service that implements the API endpoints defined in the application.
2. Ensure your backend follows the expected response formats as defined in the types.
3. Set up authentication with JWT or a similar mechanism.

### Step 2: Update configuration

1. Set the `USE_MOCK_API` flag to `false` in `lib/config.ts`.
2. Update the `API_BASE_URL` to point to your backend service.

\`\`\`typescript
// lib/config.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-backend-api.com/api"
export const USE_MOCK_API = false
\`\`\`

### Step 3: Test API endpoints

1. Test each API endpoint to ensure it returns data in the expected format.
2. Check authentication flows (login, register, logout).
3. Verify that all CRUD operations work as expected.

### Step 4: Handle environment variables

1. Create a `.env.local` file with your backend URL:

\`\`\`
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
\`\`\`

2. For production, set the environment variables in your hosting platform (e.g., Vercel).

## API Endpoints Required

Your backend needs to implement the following endpoints:

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh token

### Comics

- `GET /api/comics` - Get all comics with pagination and filtering
- `GET /api/comics/featured` - Get featured comics
- `GET /api/comics/latest` - Get latest comics
- `GET /api/comics/:id` - Get comic details
- `GET /api/comics/:id/chapters` - Get comic chapters
- `GET /api/comics/:id/chapters/:chapter` - Get chapter details
- `GET /api/genres` - Get all genres
- `GET /api/comics/search?q=query` - Search comics

### User

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

## Response Formats

Ensure your backend returns data in the expected formats. Refer to the TypeScript interfaces in `types/index.ts` for the expected data structures.

## Troubleshooting Previous Fetch Errors

The fetch errors you were experiencing could have been due to several reasons:

1. **CORS issues**: If your backend doesn't have proper CORS headers, the browser will block requests.
2. **Network errors**: If the backend is unreachable or returns non-200 status codes.
3. **Data format mismatches**: If the backend returns data in a format different from what the frontend expects.
4. **Authentication issues**: If the token is invalid or expired.

To diagnose these issues:

1. Check the browser's developer console for specific error messages.
2. Use the Network tab to see the actual requests and responses.
3. Verify that your backend is returning the expected status codes and data formats.
4. Ensure authentication tokens are being properly sent and validated.

## Common Issues and Solutions

### 1. "Failed to fetch" errors

- Check if your backend is running and accessible
- Verify CORS headers are properly set
- Check for network connectivity issues

### 2. Authentication failures

- Ensure tokens are being properly stored and sent
- Check token expiration and refresh mechanisms
- Verify backend validation logic

### 3. Data format issues

- Compare the expected data format with what your backend returns
- Use TypeScript interfaces to ensure type safety
- Add logging to track data transformations

### 4. Empty database

- If your database is empty, you'll need to seed it with initial data
- Create scripts to populate your database with test data
- Consider implementing a fallback to mock data when real data is not available

## Conclusion

Transitioning from mock data to a real backend requires careful planning and testing. By following this guide, you should be able to successfully integrate your backend with the Ivy Scans frontend application.
\`\`\`

## 4. Let's update the API service to better handle the transition to a real backend

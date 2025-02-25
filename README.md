# Music Blog Platform

A web application built with Node.js, Express.js, and MongoDB where users can share their favorite music (songs, albums, or playlists) by posting links from Spotify, view posts from others, and comment on them.

## Features
- User registration and login with JWT authentication.
- Create, edit, and delete personal blog posts with Spotify links.
- View all posts on the home page.
- Comment on individual posts.
- Dark-themed, modern UI.

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- Spotify Developer account (for API keys)

## Installation
1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd music-blog-platform
    ```
2. Navigate to the backend folder and install dependencies:
    ```bash
    cd backend
    npm install
    ```
3. Create a .env file in the backend folder with the following variables:
    ```plaintext
    MONGODB_URI=<your-mongodb-connection-string>
    JWT_SECRET=<your-secret-key>
    SPOTIFY_CLIENT_ID=<your-spotify-client-id>
    SPOTIFY_CLIENT_SECRET=<your-spotify-client-secret>
    PORT=3000
    ```
    - Replace placeholders with your actual values.
4. Start the server:
    ```bash
    npm start
    ```
5. Open your browser and go to http://localhost:3000

## Usage
- Register/Login: Start at the auth page (http://localhost:3000/auth.html) to create an account or log in.
- Home: View all posts at http://localhost:3000.
- Profile: Manage your posts and profile at http://localhost:3000/profile.html.
- Post Details: Click a post on the home page to view it and add comments.

## Project Structure
```
music-blog-platform/
├── backend/              # Server-side code
│   ├── .env              # Environment variables (not in git)
│   ├── api.js            # Spotify API integration
│   ├── auth.js           # Authentication logic
│   ├── db.js             # MongoDB connection and schemas
│   ├── server.js         # Spotify API integration
│   ├── package.json      # Dependencies and scripts
│   ├── package-lock.json # Lock file for exact dependency versions
│   └── node_modules/     # Installed dependencies
├── public/               # Client-side code
│   ├── auth.html         # Login/register page
│   ├── index.html        # Home page
│   ├── post.html         # Single post page
│   ├── profile.html      # User profile page
│   ├── script.js         # Client-side JavaScript
│   └── styles.css        # Stylesheet
└── README.md             # Project documentation
```

## Notes
- Ensure MongoDB is running before starting the server.
- Spotify links must be valid (track, album, or playlist URLs).

##
Built as a final project with ❤️ using Node.js, Express, and MongoDB.
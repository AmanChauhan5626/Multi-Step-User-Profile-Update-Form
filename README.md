# Multi-Step User Profile Update Form

A full-stack application featuring a multi-step form with validation, conditional logic, and image upload functionality.

## Features

- Multi-step form with validation
- Frontend + Backend validation
- Dynamic fields based on user selection
- File upload with preview
- Password strength meter
- Real-time API validation
- MongoDB integration

## Key Requirements Implemented

- Frontend + Backend Validation (No third-party libraries)
- Dynamic Fields:
  - Custom gender input when "Other" is selected
  - Company name field appears only when "Entrepreneur" is selected for profession
- File Upload: Profile picture (<=2MB, only JPG/PNG) with live preview
- Password Update Section with strength checking
- Real-time Validation:
  - Username availability check via API
  - Password strength meter
- Conditional Logic:
  - Address fields reset if country changes
  - Date of Birth field prevents future dates

## Setup Instructions

### Prerequisites
- Node.js and npm
- MongoDB

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd profile-update-form
```

2. Install dependencies:
```
npm install
cd client
npm install
```

3. Set up environment variables:
Create a `.env` file in the `server` directory with the following:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

4. Run the application:
```
# Run backend server
npm run start

# In a separate terminal, run the frontend
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Deployment

### MongoDB Atlas Setup
1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and update your `.env` file

### Backend Deployment (Render)
1. Create a free account on [Render](https://render.com/)
2. Create a new Web Service
3. Connect your repository
4. Set the build command: `npm install`
5. Set the start command: `npm start`
6. Add environment variables from your `.env` file
7. Deploy

### Frontend Deployment (Netlify)
1. Create a free account on [Netlify](https://www.netlify.com/)
2. Create a new site from Git
3. Connect your repository
4. Set the build command: `cd client && npm install && npm run build`
5. Set the publish directory: `client/build`
6. Add environment variable: `CI=false`
7. Deploy 
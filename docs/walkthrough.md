# Backend Project Setup Walkthrough

I have successfully initialized your Node.js backend project with Express and Mongoose.

## Changes Made

### Project Infrastructure
- Initialized `package.json` with **ES Modules** support.
- Configured scripts:
  - `npm run dev`: Starts the server with `nodemon` for auto-restarts during development.
  - `npm start`: Starts the server with standard `node`.

### Core Implementation
- **Express Server**: Set up in `src/index.js` with CORS and JSON middleware.
- **Mongoose Configuration**: Implemented in `src/config/db.js` for MongoDB Atlas connection.
- **Request Logging**: Added custom middleware to log incoming requests in the format `"METHOD :: ENDPOINT"`.
- **Environment Management**: Added `.env` for sensitive configurations like database URIs and ports.
- **Folder Structure**: Created a clean modular structure (`models`, `controllers`, `routes`, `config`).

## How to Get Started

1.  **Configure MongoDB Atlas**:
    - Open the [`.env`](file:///c:/Users/TIMOTHY/OneDrive/Desktop/PROJECTS/ChurchOS/server/.env) file.
    - Replace the placeholder `MONGODB_URI` with your actual MongoDB Atlas connection string.
2.  **Run the Server**:
    ```bash
    cd server
    npm run dev
    ```
3.  **Verify Setup**:
    - Visit `http://localhost:5000/api/health` in your browser. You should see a "Server is healthy" message once the database is connected.

> [!IMPORTANT]
> The server currently crashes on startup because the `MONGODB_URI` is a placeholder. After you update the `.env` file with your actual Atlas URI, `nodemon` will automatically restart the server and connect successfully.

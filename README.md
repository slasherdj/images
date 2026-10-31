# slasherdj-images

A modern full-stack cloud image management system built with **React**, **Node.js/Express**, **Cloudinary**, and **MongoDB**.

---

## Features

- **Cloud Image Uploads**: Multi-file uploads directly transformed and stored via Cloudinary.
- **Custom Renaming**: Rename image files before uploading with live preview.
- **Gallery & Management**: View, filter, and inspect uploaded images.
- **Modern Responsive UI**: Clean Tailwind CSS layout with dark and light aesthetic.
- **Configurable Environments**: Separate development and production settings for both client and server.

---

## Project Structure

```text
slasherdj-images/
├── backend/
│   ├── .env.example
│   ├── cloudinaryConfig.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── .env.example
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── ImageCard.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Cloudinary Account** (for Cloud Name, API Key, and Secret)
- **MongoDB Atlas** or local MongoDB instance

---

### 2. Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```

2. Copy the example environment file and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

3. Configure your `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/slasherdj_images?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   # or
   npm start
   ```

---

### 3. Frontend Setup

1. Open a terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Ensure `frontend/.env` points to your backend:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:5173`.

# IMS BHU Fest Entry Portal

This is a light-weight minimalistic full-stack **MERN (MongoDB, Express, React, Node.js)** application designed for scanning and verifying entries with **QR codes or Pass IDs**.  
It features **user authentication** to ensure that only authenticated users can access the scanning functionality.  

The idea behind this application is to **ensure only legitimate people enter the college fest** and to **track their entry records** — including **when they entered** and the **number of people currently inside the fest**.

The application is built as seperate**backend & frontend app** and is configured for seamless deployment on **Vercel**.

---

## Features

- **User Authentication**
  - Secure login system using **JWT (JSON Web Tokens)**.
  - Protected routes – only logged-in users can scan items.
  - Multiple users can scan entries at once.

- **QR Code Scanning**
  - **Live Camera**: Uses the device’s camera to scan QR codes in real time.
  - **Image Upload**: Upload an image file to scan a QR code from it.

- **Database Integration**
  - Connects to **MongoDB** to fetch item details and update scan status.

- **Duplicate Scan Prevention**
  - Prevents scanning the same item multiple times.
  - Informs the user when the item was last scanned.

- **Scan Counter**
  - Displays a **real-time count** of all successfully scanned items.

- **Persistent Login**
  - Remembers the user’s session across browser refreshes using **localStorage**.

- **Admin Panel**
  - Multiple admin accounts to manage users and entries.
  - Create new **scanner accounts** (for staff handling QR scanning).
  - Create new **entry passes** for users/items.
  - **Free up single entries** (resetting scan status of a specific pass).
  - **Free up entries in bulk** (reset multiple passes at once).
  - **Free up all entries at once** (reset the entire database of passes).

---

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Axios
- html5-qrcode

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB (Mongoose)

**Authentication**
- JWT (JSON Web Tokens)
- bcryptjs

**Deployment**
- Vercel

---

## Project Structure

```
/
├── backend/          # Backend Express.js application
├── client/       # Frontend React (Vite) application

```

---

## Prerequisites

Before you begin, ensure you have installed:

- [Node.js](https://nodejs.org/) (v16 or later recommended)  
- npm (comes with Node.js)  
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))  

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/mrstmcpp/IMS_BHU_Fest_Entry_Portal.git
cd IMS_BHU_Fest_Entry_Portal
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `/backend` and add the following:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/yourDatabaseName?retryWrites=true&w=majority
JWT_SECRET=YOUR_SUPER_SECRET_KEY_HERE
NODE_ENV=dev or production 
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

In your environment variables add the following:
```Environment Variables
VITE_BACKEND_URL=https://YOUR-BACKEND-URL.COM/api
```

### 4. Database Seeding (Required)
- Add at least **one user** in the `users` collection.  
  - Hash the password using bcrypt (online generator) or temporarily log it in `authController.js`.

- Add some **items** in the `items` collection with this structure:

```json
{
  "name": "Dr. ABC XYZ",
  "elixirPassId": "ELIXIRPASSID1",
  "department": "RADIOLOGY",
  "batch": "SR"
}
```

---

## Running the Application

Run **backend** and **frontend** in separate terminals.

### Start Backend
```bash
cd backend
npm start
```
Backend runs on: [http://localhost:5000](http://localhost:5000)

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: [http://localhost:5173](http://localhost:5173)

---

## Deployment (Vercel)

1. Push your code to a **GitHub repository**.  
2. Connect the repo to your **Vercel account**.  
3. Vercel auto-detects the **monorepo** using `vercel.json`.  
4. In **Vercel Project Settings**, add these environment variables:  
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV`  
5. Deploy 🚀  

Vercel handles the build process for both **frontend** and **backend** automatically.

---

## Summary
This project provides a secure, full-stack MERN application for **QR code scanning and verification**, with an **Admin Panel** for managing scanner accounts and entry passes — fully ready for **production deployment** on Vercel.

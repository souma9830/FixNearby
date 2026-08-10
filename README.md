<div align="center">
  <h1 align="center">FixNearby 🛠️</h1>
  <p align="center">
    <strong>An open-source hyperlocal service platform connecting users with nearby workers.</strong>
  </p>
  <p align="center">
    <a href="https://github.com/souma9830/FixNearby/issues"><img alt="Issues" src="https://img.shields.io/github/issues/souma9830/FixNearby?color=blue&style=flat-square" /></a>
    <a href="https://github.com/souma9830/FixNearby/pulls"><img alt="Pull Requests" src="https://img.shields.io/github/issues-pr/souma9830/FixNearby?color=green&style=flat-square" /></a>
    <a href="https://github.com/souma9830/FixNearby/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" /></a>
    <a href="https://github.com/souma9830/FixNearby/actions"><img alt="CI Status" src="https://img.shields.io/github/actions/workflow/status/souma9830/FixNearby/ci-quality.yml?branch=master&style=flat-square" /></a>
    <a href="https://github.com/souma9830/FixNearby/commits/master"><img alt="Last Commit" src="https://img.shields.io/github/last-commit/souma9830/FixNearby?style=flat-square" /></a>
    <a href="https://github.com/souma9830/FixNearby"><img alt="Repo Size" src="https://img.shields.io/github/repo-size/souma9830/FixNearby?style=flat-square" /></a>
  </p>
  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="./docs/API_SPECIFICATION.md">API Specs</a> •
    <a href="./docs/REALTIME_SOCKET_PROTOCOLS.md">Socket Protocols</a> •
    <a href="./docs/SYSTEM_DEPLOYMENT_GUIDE.md">Deployment Guide</a> •
    <a href="#-how-to-contribute">Contributing</a>
  </p>
</div>

## 📖 What We Are Building

**FixNearby** is designed to bridge the gap between people who need everyday services (like plumbing, electrical work, carpentry, or cleaning) and the skilled professionals who provide them in their local neighborhoods. 

Unlike massive corporate directories, FixNearby aims to be a lightweight, fast, and community-driven application built entirely on the **MERN Stack** (MongoDB, Express, React, Node.js) and styled with **Tailwind CSS**.

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

## 📖 Project Vision

**FixNearby** is a community-driven platform built to connect people who need everyday services, such as plumbing, electrical work, carpentry, cleaning, and repairs, with skilled professionals in their local area.

Our goal is to create a platform that is:
- ⚡ Fast and lightweight
- 📱 Easy to use on mobile and desktop
- 🛠️ Built for real community needs
- 🌍 Open-source and contributor-friendly
- 🚀 Scalable for future feature growth

Unlike large corporate directories, FixNearby focuses on local discovery, trust, and accessibility.

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

## 🏗️ Current Project State

This repository is currently a **scaffolded starter template**. We have built about 50% of the foundational architecture so that open-source contributors can easily jump in and start coding features immediately!
 
### What's already built:
- **Frontend (`client/`)**: A Vite + React application with React Router configured. It includes a fully responsive Tailwind CSS landing page, navigation, and dummy-data placeholder pages (`/services`, `/worker/:id`, `/bookings`, `/profile`).
- **Backend (`server/`)**: An Express.js server connected to MongoDB. It includes a basic project folder structure (`routes`, `controllers`, `models`, `middleware`), a basic `User` schema with password hashing, and a JWT authentication skeleton.

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

## 🎯 What We Need (The Roadmap)

> 📖 **Open Source Contributor Drive:** We have created a comprehensive, deep-dive [**Open Source Contributor Roadmap**](docs/CONTRIBUTOR_ROADMAP.md) detailing system subsystems, current architectural gaps (like the bookings/search API bypasses), code hygiene standards, and a categorized feature wishlist!
* Refer to the roadmap to see how you can help fix code integrations, route orphan components, or build advanced real-time systems.

We rely on the open-source community to bring this platform to life! If you are looking to contribute, here are the core features we need help building right now:

### 🚀 Frontend Tasks (React)
- 🔌 **API Integration**: Connect the login, register, and profile forms to real backend endpoints.
- 🧠 **State Management**: Implement Context API or Redux to manage authentication state globally.
- 🔍 **Search & Filtering**: Build worker filtering on the `/services` page by category, rating, and location.
- 📊 **Interactive Dashboards**: Replace placeholder `/dashboard` and `/bookings` pages with dynamic data tables.
  
### ⚙️ Backend Tasks (Node.js)
- 🔐 **Authentication**: Finish the JWT login/register flow in `authController.js` and enforce protected routes.
- 🗂️ **Database Models**: Create Mongoose schemas for `Worker`, `Service`, `Booking`, and `Review`.
- 🌐 **RESTful APIs**: Build CRUD endpoints for nearby workers, reviews, and bookings.
- ✅ **Validation**: Add robust input validation and error handling using Joi or Express-Validator.

> **Tip:** Search the codebase for `TODO:` comments. We've left dozens of hints exactly where new code needs to be added!


<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

## Flowchart

<img width="5463" height="305" alt="Service Booking Flow-2026-05-04-174651" src="https://github.com/user-attachments/assets/1e1cf568-44ad-495a-8e89-f0a60e9e34f5" />

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

## 💻 Tech Stack

- 🎨 Frontend: React.js (Vite), React Router v6, Tailwind CSS
- 🛠️ Backend: Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt
- 🗄️ Database: MongoDB, Mongoose

 <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

## 🛠️ Getting Started

Want to run the project locally? Please refer to our comprehensive [**Developer Guide**](./docs/DEVELOPER_GUIDE.md) for full setup instructions, or follow these quick steps:

### 📌 Prerequisites

Before you start, make sure you have the following installed:

- ✅ Node.js (v18+ recommended)
- ✅ npm or yarn
- ✅ MongoDB (local instance or MongoDB Atlas)
- ✅ Git
- ✅ A code editor like VS Code

### Backend Setup
1. Navigate to the server folder: 
   ```bash
   cd server
   ```
2. Install dependencies: 
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` in the server root and fill in your details (like `MONGODB_URI` and `JWT_SECRET`).
4. Start the server: 
   ```bash
   npm run dev
   ```
  
### Frontend Setup
1. Navigate to the client folder in a new terminal: 
   ```bash
   cd client
   ```
2. Install dependencies: 
   ```bash
   npm install
   ```
3. Start the dev server: 
   ```bash
   npm run dev
   ```

 <img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

## 🐳 Run with Docker Compose

The complete local stack includes the React client, Node.js API, MongoDB, and Redis.

```bash
JWT_SECRET="replace-with-a-long-random-value" docker compose up --build
```

Open `http://localhost:5173`. The client proxies API and Socket.IO traffic to the server inside the Compose network. Persistent Docker volumes retain MongoDB, Redis, and uploaded files.

Stop the stack with:

```bash
docker compose down
```

Use `docker compose down -v` only when you intentionally want to remove all local persisted data.

## 🧪 Troubleshooting

If you run into issues, try the following:

- 🟡 Make sure MongoDB is running and the connection string in ```.env``` is correct.
- 🟡 Confirm that both frontend and backend dependencies are installed.
- 🟡 Check that your Node.js version is compatible with the project requirements.
- 🟡 If the app fails to start, inspect the terminal output for missing environment variables.
- 🟡 Clear node_modules and reinstall dependencies if package issues appear.

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

## 🤝 How to Contribute

We welcome contributions from everyone—whether you are a beginner looking for your first PR, or a senior dev wanting to design system architecture.

Please read our [**CONTRIBUTING.md**](./docs/CONTRIBUTING.md) for detailed instructions on how to fork the repo, create a branch, and submit a Pull Request.

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).

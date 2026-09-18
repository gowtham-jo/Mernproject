# 🎓 LearnHub LMS — Modern Full-Stack MERN Platform

A complete, modern, production-grade **Learning Management System (LMS)** built with the MERN stack (MongoDB, Express, React, Node.js), featuring role-based access control across **Admin**, **Teacher**, and **Student** personas, real-time Socket.IO messaging, interactive video & rich-text classroom learning, auto-graded quizzes, and analytics dashboards.

---

## 🚀 Key Features

### 👑 1. Administrator Capabilities
- **Platform Executive Dashboard**: Live metrics, user distributions, enrollment trends, and catalog status.
- **User Management**: Activate/deactivate accounts, delete users, and onboard instructors.
- **Course & Curriculum Oversight**: Full CRUD and status toggle for all courses.
- **Category Taxonomy**: Manage learning domains and specializations.
- **Global Broadcasts**: Send instant system-wide notifications and announcements.
- **Platform Analytics**: Interactive Recharts diagrams tracking monthly adoption.

### 👩‍🏫 2. Instructor (Teacher) Features
- **5-Step Course Builder Wizard**:
  1. *Course Information*: Title, metadata, pricing, duration, and thumbnail uploads.
  2. *Curriculum Structure*: Drag-and-drop module creation and reordering.
  3. *Lesson & Content Creation*: Video lessons (YouTube/MP4), downloadable PDF resources, rich text markdown, and quiz creator.
  4. *Student Live Preview*: Preview marketplace appearance and syllabus.
  5. *Publishing Controls*: Instant publish or draft toggle.
- **Student Roster & Progress Monitoring**: Real-time completion rates for all enrolled students.
- **Assessment Grader**: Track student quiz performance and pass/fail metrics.
- **Direct Messaging**: 1-on-1 real-time Socket.IO chat with students.
- **Course Announcements**: Send broadcasts directly to enrolled students with instant notifications.

### 👨‍🎓 3. Student Experience
- **Course Discovery & Filters**: Search with debounced keywords, filter by category, difficulty level, pricing, and sort by rating/popularity.
- **Interactive Classroom Environment**:
  - Full-screen distraction-free player.
  - Video streaming player with duration indicators.
  - PDF/document resource viewer and download manager.
  - Rich text reading interface.
  - "Mark as Complete" toggle with instant progress persistence.
- **Quiz & Examination Engine**:
  - Countdown timer for timed assessments.
  - Interactive multiple choice and true/false question player.
  - Auto-grading on submission.
  - Detailed score reports with answer explanations.
- **Personalized Dashboard**: "Continue Learning" resume banner, active courses, and weekly study activity charts.
- **Real-time Messaging**: Chat directly with teachers.
- **Notification Center**: Real-time toast alerts and dropdown notification center.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons, Recharts, React Hot Toast, Axios |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer, Helmet, Socket.IO, Express Rate Limit |
| **Storage & Media** | Local disk storage (`/uploads`) with automatic Cloudinary streaming fallback |
| **Realtime Engine**| Socket.IO for chat messaging, typing indicators, presence, and live notifications |

---

## 🔑 Demo Login Credentials

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **👑 Admin** | `admin@example.com` | `Password123!` |
| **👩‍🏫 Teacher** | `teacher@example.com` | `Password123!` |
| **👨‍🎓 Student** | `student@example.com` | `Password123!` |

*(Quick 1-click fill buttons are also available directly on the login page)*

---

## ⚙️ Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally on `mongodb://127.0.0.1:27017/learnhub_lms` or a MongoDB Atlas URI

### 2. Backend Setup
```bash
cd server
npm install
node seeds/seed.js   # Seeds the database with demo users, courses, quizzes & categories
npm start            # Starts backend API on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev          # Starts frontend on http://localhost:5173
```

---

## 📁 Project Architecture

```
learnhub-lms/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI & Course Cards
│   │   │   ├── common/         # Button, Input, Modal, DataTable, StatsCard, etc.
│   │   │   ├── layout/         # Navbar, Footer, Sidebar, Header, NotificationBell
│   │   │   └── course/         # CourseCard
│   │   ├── context/            # AuthContext, SocketContext, NotificationContext
│   │   ├── layouts/            # DashboardLayout, PublicLayout, AuthLayout
│   │   ├── pages/
│   │   │   ├── public/         # Landing, CourseList, CourseDetail, About, Contact
│   │   │   ├── auth/           # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── student/        # Dashboard, CourseLearn, Quizzes, QuizAttempt, etc.
│   │   │   ├── teacher/        # Dashboard, CreateCourse, MyCourses, Students, etc.
│   │   │   ├── admin/          # Dashboard, Users, Courses, Categories, Analytics, etc.
│   │   │   └── shared/         # Chat, Profile, Settings
│   │   ├── services/           # Axios API modules (auth, course, quiz, chat, etc.)
│   │   ├── routes/             # ProtectedRoute with RBAC
│   │   ├── App.jsx             # Main Router
│   │   └── index.css           # Tailwind + Custom Design System
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                     # Backend API & WebSocket Server
│   ├── config/                 # MongoDB & Cloudinary configs
│   ├── controllers/            # Route controllers for all domain entities
│   ├── middleware/             # Auth JWT, RBAC authorize, Uploads, Error handling
│   ├── models/                 # Mongoose schemas (User, Course, Quiz, Lesson, etc.)
│   ├── routes/                 # Express API routes
│   ├── seeds/                  # Seed database script
│   ├── utils/                  # AppError, catchAsync, sendEmail
│   ├── uploads/                # Static media uploads directory
│   ├── app.js                  # Express app setup
│   ├── server.js               # HTTP & Socket.IO server entry point
│   ├── .env.example
│   └── package.json
│
└── README.md
```

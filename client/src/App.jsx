import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Landing from './pages/public/Landing';
import CourseList from './pages/public/CourseList';
import CourseDetail from './pages/public/CourseDetail';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import NotFound from './pages/public/NotFound';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import BrowseCourses from './pages/student/BrowseCourses';
import MyCourses from './pages/student/MyCourses';
import CourseLearn from './pages/student/CourseLearn';
import StudentProgress from './pages/student/Progress';
import StudentQuizzes from './pages/student/Quizzes';
import QuizAttempt from './pages/student/QuizAttempt';
import StudentResults from './pages/student/Results';
import StudentMessages from './pages/student/Messages';
import StudentNotifications from './pages/student/Notifications';
import StudentProfile from './pages/student/Profile';
import StudentSettings from './pages/student/Settings';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherMyCourses from './pages/teacher/MyCourses';
import CreateCourse from './pages/teacher/CreateCourse';
import EditCourse from './pages/teacher/EditCourse';
import TeacherStudents from './pages/teacher/Students';
import TeacherQuizzes from './pages/teacher/Quizzes';
import TeacherResults from './pages/teacher/Results';
import TeacherAnnouncements from './pages/teacher/Announcements';
import TeacherMessages from './pages/teacher/Messages';
import TeacherProfile from './pages/teacher/Profile';
import TeacherSettings from './pages/teacher/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStudents from './pages/admin/Students';
import AdminTeachers from './pages/admin/Teachers';
import AdminCourses from './pages/admin/Courses';
import AdminCategories from './pages/admin/Categories';
import AdminEnrollments from './pages/admin/Enrollments';
import AdminAnalytics from './pages/admin/Analytics';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminProfile from './pages/admin/Profile';
import AdminSettings from './pages/admin/Settings';

export function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '13px',
              },
            }}
          />

          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Auth Layout Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Student Protected Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin', 'teacher']}>
                  <DashboardLayout title="Student Workspace" />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="browse" element={<BrowseCourses />} />
              <Route path="courses" element={<MyCourses />} />
              <Route path="progress" element={<StudentProgress />} />
              <Route path="quizzes" element={<StudentQuizzes />} />
              <Route path="quizzes/:id" element={<QuizAttempt />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="messages" element={<StudentMessages />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="settings" element={<StudentSettings />} />
            </Route>

            {/* Standalone Full-screen Course Classroom Player */}
            <Route
              path="/student/courses/:courseId"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                  <CourseLearn />
                </ProtectedRoute>
              }
            />

            {/* Teacher Protected Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <DashboardLayout title="Instructor Workspace" />
                </ProtectedRoute>
              }
            >
              <Route index element={<TeacherDashboard />} />
              <Route path="courses" element={<TeacherMyCourses />} />
              <Route path="courses/create" element={<CreateCourse />} />
              <Route path="courses/:courseId/edit" element={<EditCourse />} />
              <Route path="students" element={<TeacherStudents />} />
              <Route path="quizzes" element={<TeacherQuizzes />} />
              <Route path="results" element={<TeacherResults />} />
              <Route path="announcements" element={<TeacherAnnouncements />} />
              <Route path="messages" element={<TeacherMessages />} />
              <Route path="profile" element={<TeacherProfile />} />
              <Route path="settings" element={<TeacherSettings />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout title="Platform Administration" />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="teachers" element={<AdminTeachers />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="enrollments" element={<AdminEnrollments />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

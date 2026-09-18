import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Category from '../models/Category.js';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Enrollment from '../models/Enrollment.js';
import QuizResult from '../models/QuizResult.js';
import Notification from '../models/Notification.js';
import Announcement from '../models/Announcement.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/learnhub_lms';
const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || 'Password123!';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected. Clearing old database collections...');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Course.deleteMany(),
      Module.deleteMany(),
      Lesson.deleteMany(),
      Quiz.deleteMany(),
      Question.deleteMany(),
      Enrollment.deleteMany(),
      QuizResult.deleteMany(),
      Notification.deleteMany(),
      Announcement.deleteMany(),
    ]);

    console.log('[Seed] Creating demo users...');
    // Create Users (Password hashing will be handled by schema pre-save hook)
    const adminUser = await User.create({
      name: 'Eleanor Vance (Admin)',
      email: 'admin@example.com',
      password: DEFAULT_PASSWORD,
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Head of Education and Lead Administrator at LearnHub LMS.',
      phone: '+1 (555) 019-2834',
    });

    const teacher1 = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'teacher@example.com',
      password: DEFAULT_PASSWORD,
      role: 'teacher',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bio: 'Senior Full-Stack Architect & AI Researcher with 12+ years industry experience.',
      phone: '+1 (555) 342-9812',
    });

    const teacher2 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      password: DEFAULT_PASSWORD,
      role: 'teacher',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bio: 'Staff Product Designer & Design Systems Lead at modern SaaS companies.',
      phone: '+1 (555) 781-4321',
    });

    const student1 = await User.create({
      name: 'John Doe',
      email: 'student@example.com',
      password: DEFAULT_PASSWORD,
      role: 'student',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      bio: 'Enthusiastic web developer learning the modern MERN stack & AI engineering.',
      phone: '+1 (555) 902-1144',
    });

    const student2 = await User.create({
      name: 'Sophia Patel',
      email: 'sophia.patel@example.com',
      password: DEFAULT_PASSWORD,
      role: 'student',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      bio: 'Computer Science undergraduate passionate about building accessible web apps.',
      phone: '+1 (555) 891-2311',
    });

    console.log('[Seed] Creating Categories...');
    const catWeb = await Category.create({
      name: 'Web Development',
      slug: 'web-development',
      description: 'Master frontend, backend, and full-stack web applications with modern tech stacks.',
      icon: 'Code2',
    });

    const catAI = await Category.create({
      name: 'AI & Data Science',
      slug: 'ai-data-science',
      description: 'Explore machine learning, LLMs, prompt engineering, and modern neural networks.',
      icon: 'Cpu',
    });

    const catUI = await Category.create({
      name: 'UI/UX Design',
      slug: 'ui-ux-design',
      description: 'Design intuitive interfaces, interactive prototypes, and scalable design systems.',
      icon: 'Palette',
    });

    const catCloud = await Category.create({
      name: 'Cloud & DevOps',
      slug: 'cloud-devops',
      description: 'Deploy, scale, and orchestrate cloud applications using Docker, Kubernetes, and CI/CD.',
      icon: 'Cloud',
    });

    const catMobile = await Category.create({
      name: 'Mobile Development',
      slug: 'mobile-development',
      description: 'Build native and cross-platform mobile apps for iOS and Android with React Native and Flutter.',
      icon: 'Smartphone',
    });

    console.log('[Seed] Creating Courses, Modules, Lessons, and Quizzes...');

    // COURSE 1: Complete MERN Stack Bootcamp
    const course1 = await Course.create({
      title: 'Complete Modern MERN Stack Bootcamp 2026',
      subtitle: 'Build production-ready full-stack applications with React 19, Node.js, Express & MongoDB',
      description:
        'A comprehensive masterclass designed to take you from fundamentals to deploying enterprise-scale MERN applications. You will build real-world products with authentication, WebSockets, payment gateways, and cloud storage.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      category: catWeb._id,
      teacher: teacher1._id,
      price: 89.99,
      level: 'intermediate',
      duration: '8 Weeks',
      status: 'published',
      rating: 4.9,
      enrolledStudentsCount: 1420,
      requirements: [
        'Basic understanding of HTML, CSS, and modern JavaScript (ES6+)',
        'Node.js installed on your computer',
        'A code editor like VS Code',
      ],
      learningOutcomes: [
        'Architect scalable RESTful APIs with Node.js and Express',
        'Master MongoDB database schemas, relations, indexing, and aggregations',
        'Build responsive, highly interactive frontend applications with React & Vite',
        'Implement robust JWT authentication and Role-Based Access Control',
        'Deploy production applications with Docker and CI/CD pipelines',
      ],
      tags: ['React', 'Node.js', 'MongoDB', 'Express', 'TailwindCSS', 'FullStack'],
    });

    // Course 1 Module 1
    const c1m1 = await Module.create({
      course: course1._id,
      title: 'Module 1: Architecture & Backend Foundations',
      description: 'Understanding MVC architecture, Express middleware, and MongoDB connections.',
      order: 1,
    });

    const c1m1l1 = await Lesson.create({
      module: c1m1._id,
      course: course1._id,
      title: '1.1 Introduction to Clean MERN Architecture',
      description: 'Overview of modern full-stack architectural layers and best practices.',
      type: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
      duration: '14 min',
      order: 1,
      isPreview: true,
    });

    const c1m1l2 = await Lesson.create({
      module: c1m1._id,
      course: course1._id,
      title: '1.2 Setting up Express and Secure JWT Middleware',
      description: 'Implementing token-based authentication and role-based guards.',
      type: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
      duration: '22 min',
      order: 2,
    });

    const c1m1l3 = await Lesson.create({
      module: c1m1._id,
      course: course1._id,
      title: '1.3 MongoDB Schema Design Guide & Best Practices',
      description: 'Comprehensive reading material on relational data patterns in document databases.',
      type: 'text',
      content: `### MongoDB Schema Design in Modern SaaS

When architecting a high-throughput MongoDB application, consider the following rules:

1. **Favor Embedding** for 1:Few relationships where the sub-documents are always queried together with the parent.
2. **Favor Referencing** for 1:Many or Many:Many relationships, or when sub-documents grow unboundedly.
3. **Always Index Query Filters**: Ensure compound indexes match the equality-sort-range (ESR) rule.
4. **Use Lean Queries** for read-heavy operations where Mongoose document overhead is unnecessary.

\`\`\`javascript
// Example Compound Index
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
\`\`\`
`,
      duration: '8 min',
      order: 3,
    });

    // Course 1 Module 2
    const c1m2 = await Module.create({
      course: course1._id,
      title: 'Module 2: React UI & State Management',
      description: 'Creating high-performance React components, hooks, and Context API.',
      order: 2,
    });

    const c1m2l1 = await Lesson.create({
      module: c1m2._id,
      course: course1._id,
      title: '2.1 Modern React Patterns & Custom Hooks',
      description: 'Learn custom hooks for data fetching, caching, and state synchronization.',
      type: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=6ThXsUwLWvc',
      duration: '18 min',
      order: 1,
    });

    // Quiz for Course 1
    const quiz1 = await Quiz.create({
      course: course1._id,
      title: 'MERN Stack Core Competency Quiz',
      description: 'Test your understanding of REST APIs, JWT authentication, and React state architecture.',
      timeLimit: 10,
      passingScore: 70,
      attemptsAllowed: 3,
    });

    const c1m2l2 = await Lesson.create({
      module: c1m2._id,
      course: course1._id,
      title: '2.2 Knowledge Check: MERN Mastery Quiz',
      description: 'Evaluate your learning with our interactive knowledge check.',
      type: 'quiz',
      duration: '15 min',
      order: 2,
      quiz: quiz1._id,
    });

    // Questions for Quiz 1
    await Question.create([
      {
        quiz: quiz1._id,
        questionText: 'What is the primary benefit of using JWT (JSON Web Tokens) for authentication?',
        type: 'multiple_choice',
        options: [
          'It completely encrypts the user database on every request',
          'It is stateless and allows decentralized session verification',
          'It automatically refreshes cookies without code',
          'It eliminates the need for passwords',
        ],
        correctAnswer: 1,
        marks: 2,
        explanation: 'JWTs are digitally signed and stateless, meaning the backend can verify validity without querying session stores on every request.',
      },
      {
        quiz: quiz1._id,
        questionText: 'True or False: In Mongoose, pre("save") middleware runs before a new document is written to the database.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 0,
        marks: 1,
        explanation: 'pre("save") hooks execute right before document validation and persistence, making it ideal for hashing passwords.',
      },
      {
        quiz: quiz1._id,
        questionText: 'Which HTTP method should be used when updating only specific fields of a resource?',
        type: 'multiple_choice',
        options: ['GET', 'POST', 'PATCH or PUT', 'DELETE'],
        correctAnswer: 2,
        marks: 2,
        explanation: 'PATCH is intended for partial updates, while PUT is commonly used for complete replacement or idempotent updates.',
      },
    ]);

    // COURSE 2: UI/UX & Design Systems Masterclass
    const course2 = await Course.create({
      title: 'Design Systems & Modern UI/UX with Figma & Tailwind',
      subtitle: 'From wireframes to production token systems and interactive prototypes',
      description:
        'Master the craft of digital product design. Learn visual hierarchy, typography, color palettes, responsive layouts, micro-interactions, and how to translate design tokens seamlessly into Tailwind CSS.',
      thumbnail: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=800&auto=format&fit=crop&q=80',
      category: catUI._id,
      teacher: teacher2._id,
      price: 64.99,
      level: 'beginner',
      duration: '5 Weeks',
      status: 'published',
      rating: 4.95,
      enrolledStudentsCount: 980,
      requirements: ['No prior design experience needed', 'Figma account (Free tier)'],
      learningOutcomes: [
        'Master Figma components, variants, and auto-layout',
        'Create scalable design tokens and spacing systems',
        'Implement accessible contrast ratios (WCAG 2.1 AA)',
        'Translate designs into clean, semantic Tailwind CSS',
      ],
      tags: ['Figma', 'UI/UX', 'DesignSystems', 'TailwindCSS'],
    });

    const c2m1 = await Module.create({
      course: course2._id,
      title: 'Module 1: Foundations of Visual Design & Design Tokens',
      description: 'Understanding typography scales, color palettes, and component hierarchy.',
      order: 1,
    });

    await Lesson.create({
      module: c2m1._id,
      course: course2._id,
      title: '1.1 Color Systems & Semantic Design Tokens',
      description: 'Constructing harmonious color palettes with high contrast and dark mode parity.',
      type: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=kbZ1flkyi8A',
      duration: '16 min',
      order: 1,
      isPreview: true,
    });

    await Lesson.create({
      module: c2m1._id,
      course: course2._id,
      title: '1.2 Typography Hierarchy Guide (PDF)',
      description: 'Downloadable PDF reference cheat-sheet for type scales and line heights.',
      type: 'document',
      documentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      duration: '10 min',
      order: 2,
    });

    // COURSE 3: Practical Artificial Intelligence & LLMs
    const course3 = await Course.create({
      title: 'Generative AI & LLM Application Development with Python & Node',
      subtitle: 'Build RAG pipelines, autonomous agents, and AI-powered full-stack SaaS apps',
      description:
        'A hands-on, practical journey into building intelligent applications. Master embeddings, vector databases, Retrieval Augmented Generation (RAG), and agentic workflows.',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
      category: catAI._id,
      teacher: teacher1._id,
      price: 99.99,
      level: 'advanced',
      duration: '6 Weeks',
      status: 'published',
      rating: 4.88,
      enrolledStudentsCount: 750,
      requirements: ['Basic Python or JavaScript proficiency', 'Interest in Artificial Intelligence'],
      learningOutcomes: [
        'Understand tokenization, context windows, and embeddings',
        'Build semantic search and RAG knowledge bases',
        'Create autonomous agents with tool calling capabilities',
      ],
      tags: ['AI', 'Python', 'LLM', 'RAG', 'VectorDB'],
    });

    const c3m1 = await Module.create({
      course: course3._id,
      title: 'Module 1: LLM Architecture & Embeddings Fundamentals',
      description: 'How modern neural language models process and generate structured information.',
      order: 1,
    });

    await Lesson.create({
      module: c3m1._id,
      course: course3._id,
      title: '1.1 Understanding Embeddings & Vector Spaces',
      description: 'Vector embeddings explained visually with real-world similarity clustering.',
      type: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=QdDoFfkVkcw',
      duration: '20 min',
      order: 1,
      isPreview: true,
    });

    // Sample Enrollments for student1 (John Doe)
    console.log('[Seed] Creating demo enrollments...');
    const enrollment1 = await Enrollment.create({
      student: student1._id,
      course: course1._id,
      progress: 50,
      completedLessons: [c1m1l1._id, c1m1l2._id],
      lastAccessedLesson: c1m1l3._id,
      enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    const enrollment2 = await Enrollment.create({
      student: student1._id,
      course: course2._id,
      progress: 100,
      completedLessons: [],
      enrolledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      completedAt: new Date(),
    });

    // Sample Quiz Result for student1
    await QuizResult.create({
      student: student1._id,
      quiz: quiz1._id,
      course: course1._id,
      score: 5,
      totalMarks: 5,
      percentage: 100,
      passed: true,
      answers: [
        { question: (await Question.findOne({ quiz: quiz1._id }))._id, selectedOption: 1, isCorrect: true, marksAwarded: 2 },
      ],
    });

    // Sample Global & Course Announcements
    console.log('[Seed] Creating announcements...');
    await Announcement.create({
      sender: adminUser._id,
      title: 'Welcome to LearnHub LMS v2.0 Platform!',
      content: 'We are thrilled to launch the new LearnHub learning platform with interactive video learning, real-time messaging, and instant quiz grading.',
      isGlobal: true,
    });

    await Announcement.create({
      sender: teacher1._id,
      course: course1._id,
      title: 'Live Q&A Session this Friday at 4 PM UTC',
      content: 'Join us for a live coding walkthrough covering MongoDB aggregation pipelines and performance optimization tricks.',
      isGlobal: false,
    });

    // Sample Notifications
    console.log('[Seed] Creating sample notifications...');
    await Notification.create([
      {
        recipient: student1._id,
        sender: teacher1._id,
        title: 'Welcome to MERN Stack Bootcamp!',
        message: 'Get started with Module 1: Architecture & Backend Foundations.',
        type: 'enrollment',
        link: `/student/courses/${course1._id}`,
      },
      {
        recipient: student1._id,
        sender: teacher1._id,
        title: 'New Announcement: Live Q&A Session',
        message: 'Dr. Sarah Jenkins posted an announcement in MERN Bootcamp.',
        type: 'announcement',
        link: `/courses/${course1._id}`,
      },
    ]);

    console.log('====================================================');
    console.log('🎉 LearnHub LMS Database Seed Completed Successfully!');
    console.log('====================================================');
    console.log('DEMO ACCOUNTS (Password for all: Password123!)');
    console.log('👑 Admin:   admin@example.com');
    console.log('👩‍🏫 Teacher: teacher@example.com');
    console.log('👨‍🎓 Student: student@example.com');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

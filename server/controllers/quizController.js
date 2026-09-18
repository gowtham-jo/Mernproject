import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizResult from '../models/QuizResult.js';
import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Create a quiz with questions
// @route   POST /api/quizzes
// @access  Private/Teacher/Admin
export const createQuiz = catchAsync(async (req, res, next) => {
  const {
    course,
    lesson,
    title,
    description,
    timeLimit,
    passingScore,
    attemptsAllowed,
    questions,
  } = req.body;

  const courseExists = await Course.findById(course);
  if (!courseExists) {
    return next(new AppError('Course not found', 404));
  }

  if (req.user.role !== 'admin' && courseExists.teacher.toString() !== req.user.id.toString()) {
    return next(new AppError('Unauthorized to create quiz for this course', 403));
  }

  const quiz = await Quiz.create({
    course,
    lesson: lesson || undefined,
    title,
    description: description || '',
    timeLimit: timeLimit !== undefined ? timeLimit : 15,
    passingScore: passingScore !== undefined ? passingScore : 70,
    attemptsAllowed: attemptsAllowed !== undefined ? attemptsAllowed : 3,
  });

  // Create questions if provided
  if (questions && Array.isArray(questions) && questions.length > 0) {
    const questionDocs = questions.map((q) => ({
      quiz: quiz._id,
      questionText: q.questionText,
      type: q.type || 'multiple_choice',
      options: q.options,
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1,
      explanation: q.explanation || '',
    }));
    await Question.insertMany(questionDocs);
  }

  const populatedQuestions = await Question.find({ quiz: quiz._id });

  res.status(201).json({
    success: true,
    message: 'Quiz created successfully',
    data: {
      quiz: {
        ...quiz.toObject(),
        questions: populatedQuestions,
      },
    },
  });
});

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id).populate('course', 'title teacher');
  if (!quiz) {
    return next(new AppError('Quiz not found', 404));
  }

  const isTeacherOrAdmin =
    req.user.role === 'admin' ||
    (quiz.course && quiz.course.teacher?.toString() === req.user.id.toString());

  let questions;
  if (isTeacherOrAdmin) {
    questions = await Question.find({ quiz: quiz._id });
  } else {
    // For students, hide correct answer & explanation before submission
    questions = await Question.find({ quiz: quiz._id }).select('-correctAnswer -explanation');
  }

  // Get previous attempts count for current user
  const attemptsCount = await QuizResult.countDocuments({
    quiz: quiz._id,
    student: req.user.id,
  });

  const latestResult = await QuizResult.findOne({
    quiz: quiz._id,
    student: req.user.id,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      quiz: {
        ...quiz.toObject(),
        questions,
      },
      userAttempts: attemptsCount,
      attemptsRemaining: Math.max(0, quiz.attemptsAllowed - attemptsCount),
      latestResult,
    },
  });
});

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Teacher/Admin
export const updateQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    return next(new AppError('Quiz not found', 404));
  }

  const course = await Course.findById(quiz.course);
  if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id.toString()) {
    return next(new AppError('Unauthorized to update this quiz', 403));
  }

  const {
    title,
    description,
    timeLimit,
    passingScore,
    attemptsAllowed,
    questions,
  } = req.body;

  if (title) quiz.title = title;
  if (description !== undefined) quiz.description = description;
  if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
  if (passingScore !== undefined) quiz.passingScore = passingScore;
  if (attemptsAllowed !== undefined) quiz.attemptsAllowed = attemptsAllowed;

  await quiz.save();

  // If questions array is updated, replace existing
  if (questions && Array.isArray(questions)) {
    await Question.deleteMany({ quiz: quiz._id });
    const questionDocs = questions.map((q) => ({
      quiz: quiz._id,
      questionText: q.questionText,
      type: q.type || 'multiple_choice',
      options: q.options,
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1,
      explanation: q.explanation || '',
    }));
    await Question.insertMany(questionDocs);
  }

  const updatedQuestions = await Question.find({ quiz: quiz._id });

  res.status(200).json({
    success: true,
    message: 'Quiz updated successfully',
    data: {
      quiz: {
        ...quiz.toObject(),
        questions: updatedQuestions,
      },
    },
  });
});

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Teacher/Admin
export const deleteQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    return next(new AppError('Quiz not found', 404));
  }

  await Question.deleteMany({ quiz: quiz._id });
  await QuizResult.deleteMany({ quiz: quiz._id });
  await Quiz.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Quiz deleted successfully',
  });
});

// @desc    Submit Quiz attempt & calculate results
// @route   POST /api/quizzes/:id/submit
// @access  Private/Student
export const submitQuiz = catchAsync(async (req, res, next) => {
  const { answers } = req.body; // Array of { questionId, selectedOption }
  const quizId = req.params.id;
  const studentId = req.user.id;

  const quiz = await Quiz.findById(quizId).populate('course');
  if (!quiz) {
    return next(new AppError('Quiz not found', 404));
  }

  // Check attempt limits
  const attemptsCount = await QuizResult.countDocuments({
    quiz: quizId,
    student: studentId,
  });

  if (quiz.attemptsAllowed > 0 && attemptsCount >= quiz.attemptsAllowed) {
    return next(
      new AppError(
        `You have exceeded the maximum allowed attempts (${quiz.attemptsAllowed}) for this quiz.`,
        400
      )
    );
  }

  // Fetch actual questions with correct answers
  const questions = await Question.find({ quiz: quizId });
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

  let totalScore = 0;
  let totalMarks = 0;
  const gradedAnswers = [];

  questions.forEach((q) => {
    const qIdStr = q._id.toString();
    const studentAns = answers?.find((a) => a.questionId === qIdStr);
    const selected = studentAns ? studentAns.selectedOption : null;

    const isCorrect = selected !== null && selected === q.correctAnswer;
    const marksAwarded = isCorrect ? q.marks : 0;

    totalMarks += q.marks;
    totalScore += marksAwarded;

    gradedAnswers.push({
      question: q._id,
      selectedOption: selected,
      isCorrect,
      marksAwarded,
    });
  });

  const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 100;
  const passed = percentage >= quiz.passingScore;

  const quizResult = await QuizResult.create({
    student: studentId,
    quiz: quiz._id,
    course: quiz.course._id,
    answers: gradedAnswers,
    score: totalScore,
    totalMarks,
    percentage,
    passed,
    attemptNumber: attemptsCount + 1,
    submittedAt: new Date(),
  });

  // Create notification for student
  await Notification.create({
    recipient: studentId,
    title: `Quiz Results: ${quiz.title}`,
    message: `You scored ${percentage}% (${passed ? 'PASSED' : 'FAILED'}) on "${quiz.title}".`,
    type: 'quiz_result',
    link: `/student/results/${quizResult._id}`,
  }).catch(() => {});

  // Populate questions details for immediate review response
  const populatedResult = await QuizResult.findById(quizResult._id)
    .populate({
      path: 'quiz',
      populate: { path: 'course', select: 'title' },
    })
    .populate('answers.question');

  res.status(200).json({
    success: true,
    message: passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Keep practicing!',
    data: { result: populatedResult },
  });
});

// @desc    Get all quiz results for current user or by course
// @route   GET /api/results
// @access  Private
export const getQuizResults = catchAsync(async (req, res, next) => {
  const { courseId, studentId } = req.query;
  const query = {};

  if (req.user.role === 'student') {
    query.student = req.user.id;
  } else if (studentId) {
    query.student = studentId;
  }

  if (courseId) {
    query.course = courseId;
  }

  const results = await QuizResult.find(query)
    .populate('quiz', 'title timeLimit passingScore')
    .populate('course', 'title thumbnail')
    .populate('student', 'name email profileImage')
    .sort({ submittedAt: -1 });

  res.status(200).json({
    success: true,
    count: results.length,
    data: { results },
  });
});

// @desc    Get single quiz result by ID
// @route   GET /api/results/:id
// @access  Private
export const getQuizResultById = catchAsync(async (req, res, next) => {
  const result = await QuizResult.findById(req.params.id)
    .populate('quiz')
    .populate('course', 'title')
    .populate('student', 'name email profileImage')
    .populate({
      path: 'answers.question',
    });

  if (!result) {
    return next(new AppError('Quiz result not found', 404));
  }

  // Ensure authorized (only the student who took it, the course teacher, or admin)
  if (
    req.user.role === 'student' &&
    result.student._id.toString() !== req.user.id.toString()
  ) {
    return next(new AppError('Unauthorized to view this quiz result', 403));
  }

  res.status(200).json({
    success: true,
    data: { result },
  });
});

// @desc    Get all quizzes created by teacher
// @route   GET /api/quizzes/teacher/all
// @access  Private/Teacher/Admin
export const getTeacherQuizzes = catchAsync(async (req, res, next) => {
  const teacherCourses = await Course.find({ teacher: req.user.id }).select('_id');
  const courseIds = teacherCourses.map((c) => c._id);

  const quizzes = await Quiz.find({ course: { $in: courseIds } })
    .populate('course', 'title thumbnail')
    .sort({ createdAt: -1 });

  const enrichedQuizzes = await Promise.all(
    quizzes.map(async (q) => {
      const questionCount = await Question.countDocuments({ quiz: q._id });
      const submissionsCount = await QuizResult.countDocuments({ quiz: q._id });
      return {
        ...q.toObject(),
        questionCount,
        submissionsCount,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: enrichedQuizzes.length,
    data: { quizzes: enrichedQuizzes },
  });
});

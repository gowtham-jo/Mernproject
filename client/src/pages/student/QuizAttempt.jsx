import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Check,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import quizService from '../../services/quizService';
import { Loader } from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await quizService.getQuizById(id);
        const q = res.data.quiz;
        setQuiz(q);
        setQuestions(q.questions || []);

        if (q.timeLimit && q.timeLimit > 0) {
          setTimeLeft(q.timeLimit * 60);
        }
      } catch (err) {
        toast.error('Quiz not found or inaccessible.');
        navigate('/student/quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!timeLeft || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(); // Auto submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const handleSelectOption = (questionId, optionIndex) => {
    if (result) return; // Prevent changing after submission
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }));

      const res = await quizService.submitQuiz(id, formattedAnswers);
      setResult(res.data.result);
      toast.success('Quiz submitted and graded successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading quiz questions..." />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* 1. QUIZ HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/student/quizzes"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Quizzes
          </Link>
          <h1 className="text-xl font-black text-slate-900">{quiz?.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {quiz?.course?.title || 'Knowledge Assessment'} • Pass Mark: {quiz?.passingScore}%
          </p>
        </div>

        {!result && quiz?.timeLimit > 0 && (
          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border font-mono font-bold text-sm ${
              timeLeft < 120
                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* 2. RESULTS SUMMARY (If submitted) */}
      {result ? (
        <div className="space-y-6">
          <div
            className={`p-8 rounded-3xl border text-center space-y-4 shadow-lg ${
              result.passed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                result.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {result.passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>

            <div>
              <span
                className={`px-3 py-1 text-xs font-extrabold rounded-full uppercase tracking-wider ${
                  result.passed
                    ? 'bg-emerald-200/60 text-emerald-800'
                    : 'bg-rose-200/60 text-rose-800'
                }`}
              >
                {result.passed ? 'Passed Examination' : 'Did Not Pass'}
              </span>
              <h2 className="text-3xl font-black mt-2">
                Score: {result.score} / {result.totalMarks} ({result.percentage}%)
              </h2>
              <p className="text-xs mt-1 opacity-80">
                {result.passed
                  ? 'Great job! You have satisfied the knowledge requirements for this module.'
                  : 'You did not meet the passing score. Review the explanations below and try again.'}
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setCurrentIndex(0);
                  if (quiz?.timeLimit) setTimeLeft(quiz.timeLimit * 60);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                <span>Retake Quiz</span>
              </Button>
              <Link to="/student/results">
                <Button size="sm">
                  <span>View All Results</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-subtle space-y-6">
            <h3 className="text-lg font-black text-slate-900">Answer Explanations</h3>

            <div className="space-y-6 divide-y divide-slate-100">
              {result.answers?.map((ans, idx) => {
                const question = ans.question || questions[idx];
                if (!question) return null;

                return (
                  <div key={idx} className="pt-6 first:pt-0 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-sm font-bold text-slate-900">
                        {idx + 1}. {question.questionText}
                      </h4>
                      <Badge variant={ans.isCorrect ? 'green' : 'rose'} size="sm">
                        {ans.isCorrect ? `+${ans.marksAwarded} Marks` : '0 Marks'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {question.options?.map((opt, optIdx) => {
                        const isStudentChoice = ans.selectedOption === optIdx;
                        const isCorrectChoice = question.correctAnswer === optIdx;

                        let style = 'bg-slate-50 border-slate-200 text-slate-700';
                        if (isCorrectChoice) {
                          style = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold';
                        } else if (isStudentChoice && !ans.isCorrect) {
                          style = 'bg-rose-50 border-rose-300 text-rose-800 font-semibold';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${style}`}
                          >
                            <span>{opt}</span>
                            {isCorrectChoice && <Check className="w-4 h-4 text-emerald-600" />}
                            {isStudentChoice && !ans.isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                        <span className="font-bold">Explanation: </span>
                        {question.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* 3. ACTIVE QUIZ RUNNER INTERFACE */
        <div className="space-y-6">
          {/* Question Navigation Tracker */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700">Question {currentIndex + 1} of {totalQuestions}</span>
              <span className="text-xs text-slate-400">({answeredCount} answered)</span>
            </div>

            <div className="flex space-x-1.5 overflow-x-auto">
              {questions.map((q, idx) => (
                <button
                  key={q._id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentIndex === idx
                      ? 'bg-blue-600 text-white shadow-sm'
                      : answers[q._id] !== undefined
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-subtle space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  Question {currentIndex + 1} • {currentQuestion.marks} {currentQuestion.marks > 1 ? 'Marks' : 'Mark'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-3 leading-snug">
                  {currentQuestion.questionText}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options?.map((option, optIdx) => {
                  const isSelected = answers[currentQuestion._id] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion._id, optIdx)}
                      className={`w-full p-4 rounded-2xl border text-sm font-medium transition-all text-left flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              size="md"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              <span>Previous</span>
            </Button>

            {currentIndex < totalQuestions - 1 ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                variant="success"
                size="md"
                loading={submitting}
                onClick={handleSubmitQuiz}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Submit & Grade Quiz</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttempt;

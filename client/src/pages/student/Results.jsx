import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, Clock, BookOpen, ChevronRight } from 'lucide-react';
import quizService from '../../services/quizService';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

export const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await quizService.getResults();
        setResults(res.data.results || []);
      } catch (err) {
        console.error('Failed to load quiz results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading your quiz results..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quiz Results History</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your scored submissions and examine detailed answer explanations
        </p>
      </div>

      {results && results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((res) => (
            <div
              key={res._id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle hover-card space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={res.passed ? 'green' : 'rose'} size="sm" dot>
                    {res.passed ? 'PASSED' : 'FAILED'}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Attempt #{res.attemptNumber || 1}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {res.quiz?.title || 'Quiz'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {res.course?.title || 'Course Assessment'}
                </p>

                <div className="mt-4 p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Score</span>
                    <p className="text-lg font-black text-slate-900">
                      {res.score} / {res.totalMarks}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Percentage</span>
                    <p className="text-lg font-black text-blue-600">
                      {res.percentage}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Date</span>
                    <p className="text-xs font-semibold text-slate-700">
                      {new Date(res.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to={`/student/quizzes/${res.quiz?._id || res.quiz}`}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <span>View Quiz / Retake</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="No quiz submissions yet"
          description="You haven't completed any quizzes yet. Take a quiz inside your enrolled courses."
          actionLabel="Browse Quizzes"
          onAction={() => (window.location.href = '/student/quizzes')}
        />
      )}
    </div>
  );
};

export default StudentResults;

import React, { useState, useEffect } from 'react';
import { HelpCircle, Clock, Award, Users, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import quizService from '../../services/quizService';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export const TeacherQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const res = await quizService.getTeacherQuizzes();
        setQuizzes(res.data.quizzes || []);
      } catch (err) {
        console.error('Failed to load teacher quizzes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleDeleteQuiz = async (id) => {
    try {
      await quizService.deleteQuiz(id);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
      toast.success('Quiz deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete quiz.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading created quizzes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quizzes & Assessments</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View all quizzes attached to your curriculum modules and examine submissions
        </p>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle hover-card flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {quiz.course?.title || 'Masterclass'}
                  </span>
                  <button
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900">{quiz.title}</h3>

                <div className="grid grid-cols-3 gap-2 text-center mt-4 p-3 bg-slate-50 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Questions</span>
                    <p className="text-sm font-black text-slate-900">{quiz.questionCount || 3}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Pass Score</span>
                    <p className="text-sm font-black text-emerald-600">{quiz.passingScore}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Submissions</span>
                    <p className="text-sm font-black text-blue-600">{quiz.submissionsCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Time Limit: {quiz.timeLimit} minutes</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={HelpCircle}
          title="No quizzes created"
          description="You can attach quizzes to modules inside the Course Builder wizard."
        />
      )}
    </div>
  );
};

export default TeacherQuizzes;

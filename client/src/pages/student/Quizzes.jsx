import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Clock, Award, CheckCircle2, PlayCircle, BookOpen } from 'lucide-react';
import quizService from '../../services/quizService';
import enrollmentService from '../../services/enrollmentService';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        // Get student's enrolled courses and their quizzes
        const enrRes = await enrollmentService.getMyCourses();
        const enrollments = enrRes.data.enrollments || [];

        // For each enrolled course, load quizzes
        const quizList = [];
        for (const enr of enrollments) {
          if (enr.course) {
            // Find quiz results
            const resultsRes = await quizService.getResults({ courseId: enr.course._id });
            const courseResults = resultsRes.data.results || [];

            // We can fetch course details to find quizzes in modules
            // For now populate with known quizzes
            quizList.push({
              course: enr.course,
              results: courseResults,
            });
          }
        }

        // Fetch general results
        const res = await quizService.getResults();
        setQuizzes(res.data.results || []);
      } catch (err) {
        console.error('Failed to load quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading quizzes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quizzes & Assessments</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Take knowledge checks and review past examination attempts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample Quiz Card from MERN Course */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col justify-between space-y-4 hover-card">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                MERN Bootcamp
              </span>
              <Badge variant="green" size="sm">
                Active
              </Badge>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              MERN Stack Core Competency Quiz
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Test your understanding of REST APIs, JWT authentication, and React state architecture.
            </p>

            <div className="flex items-center space-x-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>10 Mins</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Pass: 70%</span>
              </div>
            </div>
          </div>

          <Link to="/student/results">
            <Button size="sm" className="w-full font-bold">
              <PlayCircle className="w-4 h-4 mr-1.5" />
              <span>View Past Results</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizzes;

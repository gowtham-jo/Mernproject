import React, { useState, useEffect } from 'react';
import { Radio, Plus, Trash2, Send, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import announcementService from '../../services/announcementService';
import courseService from '../../services/courseService';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

export const TeacherAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    courseId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, courseRes] = await Promise.all([
        announcementService.getAnnouncements(),
        courseService.getMyTeacherCourses(),
      ]);
      setAnnouncements(annRes.data.announcements || []);
      const myCourses = courseRes.data.courses || [];
      setCourses(myCourses);
      if (myCourses.length > 0 && !form.courseId) {
        setForm((prev) => ({ ...prev, courseId: myCourses[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.courseId) {
      toast.error('Please fill in title, content, and select target course.');
      return;
    }

    try {
      setCreating(true);
      const res = await announcementService.createAnnouncement(form);
      setAnnouncements([res.data.announcement, ...announcements]);
      setShowModal(false);
      setForm({ title: '', content: '', courseId: courses[0]?._id || '' });
      toast.success('Announcement broadcast to all enrolled students!');
    } catch (err) {
      toast.error(err.message || 'Failed to post announcement.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await announcementService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      toast.success('Announcement deleted.');
    } catch (err) {
      toast.error('Failed to delete announcement.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Course Announcements</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast notifications, Q&A session dates, and syllabus updates to students
          </p>
        </div>

        <Button onClick={() => setShowModal(true)} size="md" className="font-bold flex-shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Announcement</span>
        </Button>
      </div>

      {loading ? (
        <Loader text="Loading announcements..." />
      ) : announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle flex flex-col justify-between space-y-4 hover-card"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {ann.course?.title || 'Course Announcement'}
                  </span>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann._id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {ann.sender?.name || 'Instructor'}</span>
                <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Radio}
          title="No announcements posted"
          description="Click 'New Announcement' above to notify your students."
          actionLabel="Post Announcement"
          onAction={() => setShowModal(true)}
        />
      )}

      {/* Modal for creating announcement */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Broadcast Announcement"
        >
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Target Course
              </label>
              <select
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full border rounded-xl p-2.5 text-xs bg-white"
                required
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Announcement Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Live Q&A Session this Friday at 4 PM"
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Content Details
              </label>
              <textarea
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your announcement message..."
                className="w-full border rounded-xl p-3 text-xs"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={creating}>
                <Send className="w-3.5 h-3.5 mr-1" />
                <span>Broadcast Now</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeacherAnnouncements;

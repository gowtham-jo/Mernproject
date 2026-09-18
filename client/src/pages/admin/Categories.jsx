import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCatId, setDeleteCatId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: 'BookOpen',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await courseService.getCategories();
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingCategory) {
        await courseService.updateCategory(editingCategory._id, form);
        toast.success('Category updated successfully!');
      } else {
        await courseService.createCategory(form);
        toast.success('Category created successfully!');
      }
      setShowModal(false);
      setEditingCategory(null);
      setForm({ name: '', description: '', icon: 'BookOpen' });
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatId) return;
    try {
      await courseService.deleteCategory(deleteCatId);
      toast.success('Category deleted.');
      setCategories((prev) => prev.filter((c) => c._id !== deleteCatId));
      setDeleteCatId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Course Categories</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize catalog domains, specializations, and taxonomy
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingCategory(null);
            setForm({ name: '', description: '', icon: 'BookOpen' });
            setShowModal(true);
          }}
          size="md"
          className="font-bold flex-shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Category</span>
        </Button>
      </div>

      {loading ? (
        <Loader text="Loading categories..." />
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle hover-card flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setForm({
                          name: cat.name,
                          description: cat.description || '',
                          icon: cat.icon || 'BookOpen',
                        });
                        setShowModal(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCatId(cat._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Slug: {cat.slug}</span>
                <span className="text-blue-600">{cat.courseCount || 0} Courses</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="No categories found"
          description="Create categories to organize your courses."
        />
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingCategory ? 'Edit Category' : 'Create New Category'}
        >
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <Input
              label="Category Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Cyber Security & Ethical Hacking"
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-xl p-2.5 text-xs"
                placeholder="Brief description of this field..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={saving}>
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message="Are you sure you want to delete this category? (Note: Categories with active courses cannot be deleted)."
      />
    </div>
  );
};

export default AdminCategories;

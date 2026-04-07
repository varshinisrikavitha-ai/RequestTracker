import React, { useState, useEffect } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import FormInput from '../components/FormInput';
import TextArea from '../components/TextArea';
import Select from '../components/Select';
import { useAuth } from '../context/AuthContext';
import { createRequest } from '../api/requests.api';
import { getCategories, getDepartments } from '../api/admin.api';
import { getErrorMessage } from '../utils/formatters';

const SubmitRequest = () => {
  const { user } = useAuth();
  const isDeptHead = user?.role === 'DEPARTMENT_HEAD';
  const assignedDepartmentId = user?.department?.id || user?.departmentId || '';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    departmentId: '',
    priority: 'MEDIUM',
  });
  const [attachment, setAttachment] = useState(null);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getDepartments({ limit: 100 }),
      getCategories({ limit: 100 }),
    ]).then(([deptRes, catRes]) => {
      setDepartments(deptRes.data.data || []);
      setCategories(catRes.data.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isDeptHead && assignedDepartmentId) {
      setFormData((prev) => ({ ...prev, departmentId: assignedDepartmentId }));
    }
  }, [isDeptHead, assignedDepartmentId]);

  const effectiveDepartmentId = isDeptHead ? assignedDepartmentId : formData.departmentId;
  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));
  const categoryOptions = categories
    .filter((c) => !effectiveDepartmentId || c.departmentId === effectiveDepartmentId)
    .map((c) => ({ value: c.id, label: c.name }));

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // reset categoryId when department changes
      ...(name === 'departmentId' ? { categoryId: '' } : {}),
    }));
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }
    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }
    if (!effectiveDepartmentId || !formData.categoryId) {
      setError('Please select both department and category.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('description', formData.description.trim());
      fd.append('categoryId', formData.categoryId);
      fd.append('departmentId', effectiveDepartmentId);
      fd.append('priority', formData.priority);
      if (attachment) fd.append('attachment', attachment);

      await createRequest(fd);
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        departmentId: isDeptHead ? assignedDepartmentId : '',
        priority: 'MEDIUM',
      });
      setAttachment(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Submit Request</h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">Fill in the form below to submit a new request</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle size={20} className="text-emerald-600" />
          <p className="font-medium text-emerald-800">Request submitted successfully!</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      )}

      <Card className="max-w-3xl border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Request Title"
            placeholder="e.g., New Monitor Setup"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />

          <TextArea
            label="Description"
            placeholder="Provide details about your request..."
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={5}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <Select
              label="Department"
              options={departmentOptions}
              name="departmentId"
              value={effectiveDepartmentId}
              onChange={handleInputChange}
              required
              disabled={isDeptHead}
            />
            <Select
              label="Category"
              options={categoryOptions}
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
            />
          </div>

          {isDeptHead && (
            <p className="-mt-3 text-xs text-slate-500">
              Department is locked to your assigned department.
            </p>
          )}

          <Select
            label="Priority"
            options={priorityOptions}
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            required
          />

          {/* File Upload */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-700">Attachment (optional)</label>
            <div className="group rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-blue-400 bg-slate-50/60">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={32} className="mx-auto text-slate-400 transition group-hover:text-blue-600" />
                <p className="mt-2 font-medium text-slate-700">Click to select a file</p>
                <p className="mt-1 text-xs text-slate-500">PDF, Word, JPEG, PNG, GIF, WEBP, TXT — max 10 MB</p>
              </label>
            </div>

            {attachment && (
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-900">{attachment.name}</p>
                  <p className="text-xs text-slate-500">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={() => setAttachment(null)} className="text-rose-600 hover:text-rose-700">
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-600 py-3 font-medium text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
            <button
              type="reset"
              onClick={() => {
                setFormData({
                  title: '',
                  description: '',
                  categoryId: '',
                  departmentId: isDeptHead ? assignedDepartmentId : '',
                  priority: 'MEDIUM',
                });
                setAttachment(null);
              }}
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Clear Form
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SubmitRequest;

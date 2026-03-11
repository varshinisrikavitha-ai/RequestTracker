import React, { useState, useEffect } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import FormInput from '../components/FormInput';
import TextArea from '../components/TextArea';
import Select from '../components/Select';
import { createRequest } from '../api/requests.api';
import { getCategories, getDepartments } from '../api/admin.api';
import { getErrorMessage } from '../utils/formatters';

const SubmitRequest = () => {
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

  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));
  const categoryOptions = categories
    .filter((c) => !formData.departmentId || c.departmentId === formData.departmentId)
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
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('categoryId', formData.categoryId);
      fd.append('departmentId', formData.departmentId);
      fd.append('priority', formData.priority);
      if (attachment) fd.append('attachment', attachment);

      await createRequest(fd);
      setSuccess(true);
      setFormData({ title: '', description: '', categoryId: '', departmentId: '', priority: 'MEDIUM' });
      setAttachment(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submit Request</h1>
        <p className="text-gray-600 mt-1">Fill in the form below to submit a new request</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600" />
          <p className="text-green-800 font-medium">Request submitted successfully!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      <Card className="max-w-3xl">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Department"
              options={departmentOptions}
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              required
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
            <label className="block text-sm font-medium text-gray-700 mb-3">Attachment (optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition group">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={32} className="mx-auto text-gray-400 group-hover:text-blue-500 transition" />
                <p className="text-gray-600 font-medium mt-2">Click to select a file</p>
                <p className="text-gray-500 text-xs mt-1">PDF, Word, JPEG, PNG, GIF, WEBP, TXT — max 10 MB</p>
              </label>
            </div>

            {attachment && (
              <div className="mt-3 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{attachment.name}</p>
                  <p className="text-gray-500 text-xs">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={() => setAttachment(null)} className="text-red-600 hover:text-red-700">
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
            <button
              type="reset"
              onClick={() => { setFormData({ title: '', description: '', categoryId: '', departmentId: '', priority: 'MEDIUM' }); setAttachment(null); }}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition"
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

import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import Card from '../components/Card';
import FormInput from '../components/FormInput';
import TextArea from '../components/TextArea';
import Select from '../components/Select';

const SubmitRequest = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
  });

  const [attachments, setAttachments] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const categoryOptions = [
    { value: 'Hardware', label: 'Hardware' },
    { value: 'Software', label: 'Software' },
    { value: 'Access', label: 'Access' },
    { value: 'Other', label: 'Other' },
  ];

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ title: '', description: '', category: '', priority: '' });
    setAttachments([]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submit Request</h1>
        <p className="text-gray-600 mt-1">Fill in the form below to submit a new request</p>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-4 h-4 bg-green-500 rounded-full" />
          <p className="text-green-800 font-medium">Request submitted successfully! Your request ID will be assigned shortly.</p>
        </div>
      )}

      <Card className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <FormInput
            label="Request Title"
            placeholder="e.g., New Monitor Setup"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />

          {/* Description */}
          <TextArea
            label="Description"
            placeholder="Provide details about your request..."
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={5}
          />

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Category"
              options={categoryOptions}
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            />
            <Select
              label="Priority"
              options={priorityOptions}
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Attachments</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition group">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={32} className="mx-auto text-gray-400 group-hover:text-blue-500 transition" />
                <p className="text-gray-600 font-medium mt-2">Drag and drop your files here</p>
                <p className="text-gray-500 text-sm">or click to select files</p>
              </label>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                      <p className="text-gray-500 text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Request
            </button>
            <button
              type="reset"
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

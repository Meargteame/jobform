import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ArrowLeft,
  Briefcase,
  AlertCircle,
  Loader2,
  Check,
  FileSpreadsheet,
} from 'lucide-react';

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
  'Remote',
];

const JobCreatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    companyName: user?.companyName || '',
    location: '',
    employmentType: 'Full-time',
    description: '',
    requirements: '',
    salary: '',
    deadline: '',
    status: 'draft',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, targetStatus) => {
    e.preventDefault();
    setError('');

    const statusToSave = targetStatus || formData.status;

    if (!formData.title || !formData.description || !formData.location || !formData.employmentType) {
      setError('Please fill in all required fields: Title, Location, Type, and Description.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        status: statusToSave,
      };

      const res = await api.post('/jobs', payload);

      if (res.data.success) {
        const createdJob = res.data.data;
        // Proceed directly to the Form Builder for this job
        navigate(`/dashboard/jobs/${createdJob._id}/form`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create job posting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center space-x-3">
        <Link
          to="/dashboard"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Create Job Posting
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Fill in the job details, then customize your application form in the next step.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center space-x-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={(e) => handleSubmit(e, formData.status)}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6"
      >
        {/* Job Title & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Senior Full-Stack Developer"
              value={formData.title}
              onChange={handleChange}
              className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              required
              placeholder="e.g. Yonile Digital"
              value={formData.companyName}
              onChange={handleChange}
              className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Location & Employment Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. Addis Ababa / Remote / London"
              value={formData.location}
              onChange={handleChange}
              className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Employment Type <span className="text-red-500">*</span>
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Salary & Application Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Salary / Compensation <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="salary"
              placeholder="e.g. $70,000 - $95,000 / year or Negotiable"
              value={formData.salary}
              onChange={handleChange}
              className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Application Deadline <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            About the Role / Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={5}
            placeholder="Describe the mission, key responsibilities, team structure, and day-to-day impact..."
            value={formData.description}
            onChange={handleChange}
            className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          ></textarea>
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            Requirements & Qualifications <span className="text-xs text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            name="requirements"
            rows={4}
            placeholder="• 4+ years React and Node.js experience&#10;• Experience with MongoDB schema modeling&#10;• Strong communication and problem solving"
            value={formData.requirements}
            onChange={handleChange}
            className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          ></textarea>
        </div>

        {/* Buttons / Actions */}
        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 text-center text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, 'draft')}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save as Draft & Build Form'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, 'published')}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Publish & Build Form
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobCreatePage;

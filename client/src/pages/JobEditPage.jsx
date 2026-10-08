import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Save,
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

const JobEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    employmentType: 'Full-time',
    description: '',
    requirements: '',
    salary: '',
    deadline: '',
    status: 'draft',
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setInitialLoading(true);
        const res = await api.get(`/jobs/${id}`);
        if (res.data.success) {
          const job = res.data.data;
          setFormData({
            title: job.title || '',
            companyName: job.companyName || '',
            location: job.location || '',
            employmentType: job.employmentType || 'Full-time',
            description: job.description || '',
            requirements: job.requirements || '',
            salary: job.salary || '',
            deadline: job.deadline ? job.deadline.split('T')[0] : '',
            status: job.status || 'draft',
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load job details.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.title || !formData.description || !formData.location || !formData.employmentType) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.put(`/jobs/${id}`, formData);
      if (res.data.success) {
        setSuccessMsg('Job posting updated successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job posting.');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-gray-500">Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Edit Job Posting
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Update vacancy specifications and active status.
            </p>
          </div>
        </div>

        <Link
          to={`/dashboard/jobs/${id}/form`}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Edit Application Form</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center space-x-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
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
              value={formData.companyName}
              onChange={handleChange}
              className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              required
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

          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Publish Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="draft">Draft (Private)</option>
              <option value="published">Published (Public)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Salary / Compensation <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="salary"
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

        <div>
          <label className="block text-sm font-semibold text-gray-800">
            About the Role / Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">
            Requirements & Qualifications <span className="text-xs text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            name="requirements"
            rows={4}
            value={formData.requirements}
            onChange={handleChange}
            className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          ></textarea>
        </div>

        <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <Link
            to="/dashboard"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobEditPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
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
        setSuccessMsg('Job posting updated successfully.');
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
      <div className="py-20 flex flex-col items-center justify-center space-y-3 font-sans text-ink">
        <Loader2 className="w-6 h-6 text-ink animate-spin stroke-[1.5]" />
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-ink">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 text-muted hover:text-ink hover:bg-paper-2 rounded-[8px] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">
              Edit job posting
            </h1>
            <p className="text-xs text-muted mt-1">
              Update posting specifications and live status.
            </p>
          </div>
        </div>

        <Link
          to={`/dashboard/jobs/${id}/form`}
          className="btn-secondary"
        >
          <FileSpreadsheet className="w-4 h-4 stroke-[1.5]" />
          <span>Edit application form</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-[8px] bg-red-50/80 border border-red-200 text-xs text-red-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0 stroke-[1.5]" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-white border border-line text-ink text-xs font-medium rounded-[8px] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-signal" />
          <span>{successMsg}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[12px] border border-line p-8 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-1.5">
              Job title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:border-ink transition-all"
            />
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-ink mb-1.5">
              Company name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:border-ink transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-1.5">
              Location <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:border-ink transition-all"
            />
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-ink mb-1.5">
              Employment type <span className="text-red-600">*</span>
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:border-ink transition-all"
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-ink mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:border-ink transition-all"
            >
              <option value="draft">Draft (Private)</option>
              <option value="published">Published (Accepting)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-1.5">
              Salary / Compensation <span className="text-xs text-muted font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:border-ink transition-all"
            />
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-ink mb-1.5">
              Application deadline <span className="text-xs text-muted font-normal">(Optional)</span>
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:border-ink transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[14px] font-semibold text-ink mb-1.5">
            About the role / Description <span className="text-red-600">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3.5 rounded-[8px] border border-line bg-white text-ink text-[14px] focus:outline-none focus:ring-2 focus:ring-signal focus:border-ink transition-all"
          />
        </div>

        <div>
          <label className="block text-[14px] font-semibold text-ink mb-1.5">
            Requirements & Qualifications <span className="text-xs text-muted font-normal">(Optional)</span>
          </label>
          <textarea
            name="requirements"
            rows={4}
            value={formData.requirements}
            onChange={handleChange}
            className="w-full p-3.5 rounded-[8px] border border-line bg-white text-ink text-[14px] focus:outline-none focus:ring-2 focus:ring-signal focus:border-ink transition-all"
          />
        </div>

        <div className="pt-4 border-t border-line flex items-center justify-end gap-3">
          <Link
            to="/dashboard"
            className="btn-tertiary"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin stroke-[1.5]" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobEditPage;

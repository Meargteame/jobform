import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Check,
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
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-ink">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="p-2 text-muted hover:text-ink hover:bg-paper-2 rounded-[8px] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">
            Create job posting
          </h1>
          <p className="text-xs text-muted mt-1">
            Fill in the role details, then configure the application form in the next step.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-[8px] bg-red-50/80 border border-red-200 text-xs text-red-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0 stroke-[1.5]" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={(e) => handleSubmit(e, formData.status)}
        className="bg-white rounded-[12px] border border-line p-8 space-y-6"
      >
        {/* Job Title & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-1.5">
              Job title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.title}
              onChange={handleChange}
              className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all placeholder-muted/60"
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
              placeholder="e.g. Acme Corp"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all placeholder-muted/60"
            />
          </div>
        </div>

        {/* Location & Employment Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-1.5">
              Location <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. London / Remote"
              value={formData.location}
              onChange={handleChange}
              className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all placeholder-muted/60"
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
              className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all"
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
            <label className="block text-[14px] font-semibold text-ink mb-1.5">
              Salary / Compensation <span className="text-xs text-muted font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="salary"
              placeholder="e.g. $80,000 - $110,000 / year"
              value={formData.salary}
              onChange={handleChange}
              className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all placeholder-muted/60"
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
              className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all"
            />
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-[14px] font-semibold text-ink mb-1.5">
            About the role / Description <span className="text-red-600">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={5}
            placeholder="Describe the mission, key responsibilities, team structure, and impact..."
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3.5 rounded-[8px] border border-line bg-white text-ink text-[14px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all placeholder-muted/60"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-[14px] font-semibold text-ink mb-1.5">
            Requirements & Qualifications <span className="text-xs text-muted font-normal">(Optional)</span>
          </label>
          <textarea
            name="requirements"
            rows={4}
            placeholder="• 4+ years React and Node.js experience&#10;• Experience with MongoDB modeling&#10;• Clear written and verbal communication"
            value={formData.requirements}
            onChange={handleChange}
            className="w-full p-3.5 rounded-[8px] border border-line bg-white text-ink text-[14px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all placeholder-muted/60"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-end gap-3">
          <Link
            to="/dashboard"
            className="btn-tertiary w-full sm:w-auto"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, 'draft')}
            className="btn-secondary w-full sm:w-auto"
          >
            {loading ? 'Saving...' : 'Save as draft & build form'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, 'published')}
            className="btn-primary w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin stroke-[1.5]" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[1.5]" />
                <span>Publish & build form</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobCreatePage;

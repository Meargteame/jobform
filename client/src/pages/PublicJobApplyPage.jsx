import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  FileCheck,
  Upload,
} from 'lucide-react';
import BetterFormLogo from '../components/BetterFormLogo';

const PublicJobApplyPage = () => {
  const { slug } = useParams();

  const [job, setJob] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUnpublished, setIsUnpublished] = useState(false);

  // Form submission state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${apiBase}/public/jobs/${slug}`);
        if (res.data.success) {
          setJob(res.data.data.job);
          setQuestions(res.data.data.questions || []);
        }
      } catch (err) {
        if (err.response?.data?.isUnpublished) {
          setIsUnpublished(true);
        } else {
          setError(err.response?.data?.message || 'Job posting not found or no longer active.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [slug]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckboxAnswer = (questionId, optionValue, isChecked) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? [...prev[questionId]] : [];
      let updated;
      if (isChecked) {
        updated = [...current, optionValue];
      } else {
        updated = current.filter((item) => item !== optionValue);
      }
      return { ...prev, [questionId]: updated };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB maximum limit. Please choose a smaller file.');
      e.target.value = '';
      return;
    }

    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      alert('Only PDF, DOC, and DOCX files are permitted for CV upload.');
      e.target.value = '';
      return;
    }

    setCvFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setSubmitError('Please complete all standard required fields (Name, Email, Phone).');
      return;
    }

    if (!cvFile) {
      setSubmitError('Please attach your CV / Resume file before submitting.');
      return;
    }

    for (const q of questions) {
      if (q.required) {
        const val = answers[q._id];
        const isEmpty =
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0);

        if (isEmpty) {
          setSubmitError(`Please provide an answer for "${q.label}".`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);

      const submissionPayload = new FormData();
      submissionPayload.append('fullName', formData.fullName.trim());
      submissionPayload.append('email', formData.email.trim().toLowerCase());
      submissionPayload.append('phone', formData.phone.trim());
      submissionPayload.append('cv', cvFile);
      submissionPayload.append('answers', JSON.stringify(answers));

      const res = await axios.post(
        `${apiBase}/public/jobs/${slug}/applications`,
        submissionPayload,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (res.data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.response?.data?.message || 'Failed to submit application. Please check all fields.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 font-sans text-ink">
        <Loader2 className="w-6 h-6 text-ink animate-spin mb-3 stroke-[1.5]" />
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">Loading posting...</p>
      </div>
    );
  }

  if (isUnpublished) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 font-sans text-ink">
        <div className="max-w-md w-full bg-white p-8 rounded-[12px] border border-line text-left">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-ink" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Status Notice
            </span>
          </div>
          <h2 className="text-xl font-bold text-ink">Position is not currently active</h2>
          <p className="mt-2 text-[14px] text-muted leading-relaxed">
            This job posting is not accepting applications right now.
          </p>
          <div className="mt-6 pt-6 border-t border-line">
            <Link
              to="/"
              className="inline-flex items-center text-xs font-semibold text-ink hover:underline"
            >
              BetterForm Home &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 font-sans text-ink">
        <div className="max-w-md w-full bg-white p-8 rounded-[12px] border border-line text-left">
          <AlertCircle className="w-6 h-6 text-red-600 mb-3 stroke-[1.5]" />
          <h2 className="text-xl font-bold text-ink">Posting not found</h2>
          <p className="mt-2 text-[14px] text-muted leading-relaxed">
            {error || 'This application link does not exist or has expired.'}
          </p>
          <div className="mt-6 pt-6 border-t border-line">
            <Link
              to="/"
              className="inline-flex items-center text-xs font-semibold text-ink hover:underline"
            >
              BetterForm Home &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation state
  if (submitted) {
    return (
      <div className="min-h-screen bg-paper flex flex-col justify-center py-12 px-6 font-sans text-ink">
        <div className="max-w-lg mx-auto w-full bg-white p-8 sm:p-10 rounded-[12px] border border-line text-left">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="w-3 h-3 rounded-full bg-signal" />
            <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink font-semibold">
              Submission Received
            </span>
          </div>

          <h1 className="text-2xl font-bold text-ink tracking-[-0.03em]">
            Application submitted
          </h1>

          <p className="mt-3 text-[15px] text-muted leading-relaxed">
            Thank you, <strong className="text-ink font-semibold">{formData.fullName}</strong>. Your application for{' '}
            <strong className="text-ink font-semibold">{job.title}</strong> at{' '}
            <strong className="text-ink font-semibold">{job.companyName}</strong> has been transmitted directly to the recruiter.
          </p>

          <div className="mt-6 p-4 bg-paper rounded-[8px] border border-line text-xs text-muted space-y-1.5 font-mono">
            <div>
              <span className="text-ink">APPLICANT:</span> {formData.email}
            </div>
            <div>
              <span className="text-ink">CV ATTACHMENT:</span> {cvFile?.name}
            </div>
            <div>
              <span className="text-ink">TIMESTAMP:</span> {new Date().toLocaleString()}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-line flex items-center justify-between">
            <BetterFormLogo size={24} />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              BetterForm
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-12 px-6 lg:px-8 font-sans text-ink">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Top brand header */}
        <div className="flex items-center justify-between pb-2">
          <Link to="/" className="inline-block">
            <BetterFormLogo size={28} />
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Candidate Application
          </span>
        </div>

        {/* Job Details Card */}
        <div className="bg-white rounded-[12px] border border-line p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-signal" />
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                {job.companyName}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.03em] text-ink">
              {job.title}
            </h1>

            {/* Metadata Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
              <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.12em] bg-paper px-2.5 py-1 rounded-[6px] border border-line">
                <MapPin className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{job.location}</span>
              </span>

              <span className="font-mono text-[11px] uppercase tracking-[0.12em] bg-paper px-2.5 py-1 rounded-[6px] border border-line">
                {job.employmentType}
              </span>

              {job.salary && (
                <span className="font-mono text-[11px] bg-paper px-2.5 py-1 rounded-[6px] border border-line text-ink">
                  {job.salary}
                </span>
              )}

              {job.deadline && (
                <span className="font-mono text-[11px] bg-paper px-2.5 py-1 rounded-[6px] border border-line text-muted">
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Description & Requirements */}
          <div className="pt-6 border-t border-line space-y-6 text-left">
            <div>
              <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted mb-2">
                About the role
              </h2>
              <div className="text-[15px] text-ink whitespace-pre-line leading-relaxed font-normal">
                {job.description}
              </div>
            </div>

            {job.requirements && (
              <div className="pt-4 border-t border-line">
                <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted mb-2">
                  Requirements
                </h2>
                <div className="text-[15px] text-ink whitespace-pre-line leading-relaxed font-normal">
                  {job.requirements}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Application Form Card */}
        <div className="bg-white rounded-[12px] border border-line p-8 space-y-6">
          <div className="border-b border-line pb-4">
            <h2 className="text-xl font-bold text-ink tracking-[-0.02em]">
              Apply for this position
            </h2>
            <p className="text-xs text-muted mt-1">
              Complete the structured fields below. All fields marked with * are required.
            </p>
          </div>

          {submitError && (
            <div className="p-3.5 rounded-[8px] bg-red-50/80 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0 stroke-[1.5]" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Standard Profile Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-semibold text-ink mb-1.5">
                  Full name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Jane Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all placeholder-muted/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-ink mb-1.5">
                    Email address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all placeholder-muted/60"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-semibold text-ink mb-1.5">
                    Phone number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+1 555 0192"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all placeholder-muted/60"
                  />
                </div>
              </div>

              {/* CV File Upload */}
              <div>
                <label className="block text-[14px] font-semibold text-ink mb-1.5">
                  Curriculum Vitae (CV) <span className="text-red-600">*</span>
                </label>
                <div className="border border-dashed border-line hover:border-ink rounded-[8px] p-5 text-center transition-colors bg-paper">
                  <input
                    type="file"
                    id="cvUpload"
                    required
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="cvUpload"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                  >
                    {cvFile ? (
                      <div className="flex items-center gap-2 text-ink bg-white px-3 py-1.5 rounded-[6px] border border-line">
                        <FileCheck className="w-4 h-4 text-ink stroke-[1.5]" />
                        <span className="text-xs font-semibold">{cvFile.name}</span>
                        <span className="font-mono text-[10px] text-muted">
                          ({(cvFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-muted stroke-[1.5]" />
                        <span className="text-xs font-semibold text-ink underline underline-offset-2">
                          Attach resume file
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                          PDF, DOC, DOCX (Max 5MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Questions Section */}
            {questions.length > 0 && (
              <div className="pt-6 border-t border-line space-y-5">
                <h3 className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
                  Screening Questions
                </h3>

                {questions.map((q) => {
                  const currentValue = answers[q._id];

                  return (
                    <div key={q._id} className="space-y-1.5 text-left">
                      <label className="block text-[14px] font-semibold text-ink">
                        {q.label} {q.required && <span className="text-red-600">*</span>}
                      </label>

                      {q.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          required={q.required}
                          value={currentValue || ''}
                          onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                          placeholder="Type your response..."
                          className="w-full p-3 rounded-[8px] border border-line bg-white text-ink text-[14px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all placeholder-muted/60"
                        />
                      ) : q.type === 'select' ? (
                        <select
                          required={q.required}
                          value={currentValue || ''}
                          onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                          className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[14px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all"
                        >
                          <option value="">Select option...</option>
                          {q.options?.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : q.type === 'radio' ? (
                        <div className="space-y-2 pt-1">
                          {q.options?.map((opt, i) => (
                            <label
                              key={i}
                              className="flex items-center gap-2.5 text-[14px] text-ink cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`question_${q._id}`}
                                required={q.required}
                                checked={currentValue === opt}
                                onChange={() => handleAnswerChange(q._id, opt)}
                                className="w-4 h-4 text-ink accent-[#0B0B0C] border-line focus:ring-signal"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : q.type === 'checkbox' ? (
                        <div className="space-y-2 pt-1">
                          {q.options?.map((opt, i) => {
                            const isChecked = Array.isArray(currentValue) && currentValue.includes(opt);
                            return (
                              <label
                                key={i}
                                className="flex items-center gap-2.5 text-[14px] text-ink cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) =>
                                    handleCheckboxAnswer(q._id, opt, e.target.checked)
                                  }
                                  className="w-4 h-4 rounded text-ink accent-[#0B0B0C] border-line focus:ring-signal"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <input
                          type={q.type}
                          required={q.required}
                          value={currentValue || ''}
                          onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                          placeholder={
                            q.type === 'url'
                              ? 'https://...'
                              : q.type === 'number'
                              ? 'e.g. 5'
                              : 'Your answer...'
                          }
                          className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[14px] focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all placeholder-muted/60"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Primary Submit Button: ink fill / paper text */}
            <div className="pt-6 border-t border-line">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center h-[44px] px-5 rounded-[8px] text-[15px] font-semibold text-paper bg-ink hover:bg-[#202022] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin stroke-[1.5]" />
                    <span>Submitting application...</span>
                  </>
                ) : (
                  <span>Submit application</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center font-mono text-[11px] uppercase tracking-[0.12em] text-muted py-4">
          Powered by BetterForm &bull; Create better job applications
        </div>
      </div>
    </div>
  );
};

export default PublicJobApplyPage;

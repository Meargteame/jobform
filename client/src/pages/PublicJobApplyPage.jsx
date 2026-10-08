import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  FileCheck,
} from 'lucide-react';

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

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB maximum limit. Please choose a smaller file.');
      e.target.value = '';
      return;
    }

    // Check allowed format: PDF, DOC, DOCX
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

    // Basic client validations
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setSubmitError('Please complete all standard required fields (Name, Email, Phone).');
      return;
    }

    if (!cvFile) {
      setSubmitError('Please attach your CV / Resume file before submitting.');
      return;
    }

    // Validate required custom questions
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-gray-500">Loading job opportunity...</p>
      </div>
    );
  }

  if (isUnpublished) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-200 text-center shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Position Not Active</h2>
          <p className="mt-2 text-sm text-gray-600">
            This job posting is currently not accepting applications. Please contact the company or check back later.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            JobForm Homepage &rarr;
          </Link>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-200 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Posting Not Found</h2>
          <p className="mt-2 text-sm text-gray-600">
            {error || 'The job application link you followed does not exist or has expired.'}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            JobForm Homepage &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // Success Confirmation View
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto bg-white p-8 sm:p-10 rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Application Submitted Successfully!
          </h1>

          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Thank you, <span className="font-semibold text-gray-900">{formData.fullName}</span>. Your application for{' '}
            <span className="font-semibold text-gray-900">{job.title}</span> at{' '}
            <span className="font-semibold text-gray-900">{job.companyName}</span> has been received.
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 text-left space-y-1.5">
            <div>
              <span className="font-medium text-gray-700">Confirmation Sent To:</span> {formData.email}
            </div>
            <div>
              <span className="font-medium text-gray-700">CV File:</span> {cvFile?.name}
            </div>
            <div>
              <span className="font-medium text-gray-700">Timestamp:</span> {new Date().toLocaleString()}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Powered by <span className="font-semibold text-gray-600">JobForm</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Company & Role Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
            <Briefcase className="w-4 h-4" />
            <span>{job.companyName}</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {job.title}
          </h1>

          {/* Badges / Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
            <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-md">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
              <span>{job.location}</span>
            </div>

            <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-md font-medium text-gray-800">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
              <span>{job.employmentType}</span>
            </div>

            {job.salary && (
              <div className="inline-flex items-center bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-md font-medium">
                <DollarSign className="w-3.5 h-3.5 mr-1" />
                <span>{job.salary}</span>
              </div>
            )}

            {job.deadline && (
              <div className="inline-flex items-center bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-md">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Role Details */}
          <div className="mt-8 space-y-6 pt-6 border-t border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">About the Role</h2>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {job.description}
              </div>
            </div>

            {job.requirements && (
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-2">Requirements</h2>
                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {job.requirements}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Application Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Apply for this position</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Please submit your details and resume below. All fields marked with * are required.
            </p>
          </div>

          {submitError && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Standard Built-in Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Abebe Bekele"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. abebe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="e.g. +251 91 123 4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1.5 block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* CV File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  CV / Resume <span className="text-red-500">*</span>
                </label>
                <div className="mt-1.5 border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-5 text-center transition-colors bg-gray-50/50">
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
                      <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <FileCheck className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-semibold">{cvFile.name}</span>
                        <span className="text-[10px] text-gray-400">
                          ({(cvFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-gray-400" />
                        <span className="text-xs font-medium text-emerald-600 hover:underline">
                          Click to upload your CV
                        </span>
                        <span className="text-[11px] text-gray-400">
                          PDF, DOC, or DOCX formats accepted (max 5MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Questions Section */}
            {questions.length > 0 && (
              <div className="pt-6 border-t border-gray-100 space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                  Additional Screening Questions
                </h3>

                {questions.map((q) => {
                  const currentValue = answers[q._id];

                  return (
                    <div key={q._id} className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-800">
                        {q.label} {q.required && <span className="text-red-500">*</span>}
                      </label>

                      {q.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          required={q.required}
                          value={currentValue || ''}
                          onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                          placeholder="Type your response..."
                          className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        ></textarea>
                      ) : q.type === 'select' ? (
                        <select
                          required={q.required}
                          value={currentValue || ''}
                          onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                          className="block w-full px-3.5 py-2.5 border border-gray-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Select an option...</option>
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
                              className="flex items-center space-x-2.5 text-sm text-gray-700 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`question_${q._id}`}
                                required={q.required}
                                checked={currentValue === opt}
                                onChange={() => handleAnswerChange(q._id, opt)}
                                className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
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
                                className="flex items-center space-x-2.5 text-sm text-gray-700 cursor-pointer"
                              >
                                <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) =>
                                  handleCheckboxAnswer(q._id, opt, e.target.checked)
                                }
                                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
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
                          className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center text-xs text-gray-400 py-4">
          Powered by <span className="font-semibold text-gray-600">JobForm</span> &bull; Hiring Made Simple
        </div>
      </div>
    </div>
  );
};

export default PublicJobApplyPage;

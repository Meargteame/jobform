import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  FileText,
  Mail,
  Phone,
  User,
  Calendar,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState('');

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/applications/${id}`);
      if (res.data.success) {
        setApplication(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load candidate application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      setStatusFeedback('');
      const res = await api.patch(`/applications/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setApplication(res.data.data);
        setStatusFeedback(`Candidate marked as ${newStatus}.`);
        setTimeout(() => setStatusFeedback(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-gray-500">Loading candidate application...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-base font-semibold text-red-700">{error || 'Application not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-emerald-700 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Go Back
        </button>
      </div>
    );
  }

  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  const fullCvUrl = application.cvUrl?.startsWith('http')
    ? application.cvUrl
    : `${backendBase}${application.cvUrl}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to={application.job ? `/dashboard/jobs/${application.job._id}/applications` : '/dashboard'}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {application.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Applicant for{' '}
              <span className="font-semibold text-gray-800">
                {application.job?.title || 'Job Posting'}
              </span>
            </p>
          </div>
        </div>

        {/* Status Pipeline Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-gray-500 mr-1 uppercase tracking-wider">
            Status:
          </span>
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => handleStatusChange('applied')}
              disabled={updatingStatus}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                application.status === 'applied'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Applied
            </button>

            <button
              onClick={() => handleStatusChange('shortlisted')}
              disabled={updatingStatus}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1 ${
                application.status === 'shortlisted'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-emerald-700'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              <span>Shortlist</span>
            </button>

            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={updatingStatus}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1 ${
                application.status === 'rejected'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-red-700'
              }`}
            >
              <XCircle className="w-3 h-3" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      </div>

      {statusFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Candidate Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-100">
          Candidate Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Full Name</p>
              <p className="font-semibold text-gray-900">{application.fullName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Email Address</p>
              <a
                href={`mailto:${application.email}`}
                className="font-medium text-emerald-600 hover:underline break-all"
              >
                {application.email}
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Phone</p>
              <p className="font-medium text-gray-800">{application.phone}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Submitted At</p>
              <p className="font-medium text-gray-800">
                {new Date(application.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* CV Download / Preview Row */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-gray-800">
              Uploaded Resume / CV Document
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={fullCvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open / View CV</span>
            </a>

            <a
              href={fullCvUrl}
              download
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        </div>
      </div>

      {/* Application Answers */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Candidate Application Responses ({application.answers?.length || 0})
          </h2>
        </div>

        {(!application.answers || application.answers.length === 0) ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            No custom question answers submitted for this application.
          </p>
        ) : (
          <div className="space-y-6">
            {application.answers.map((ans, idx) => {
              const isUrl = ans.type === 'url' || String(ans.answer).startsWith('http');
              const isArray = Array.isArray(ans.answer);

              return (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Question #{idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                      {ans.type}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900">{ans.label}</h3>

                  <div className="text-sm text-gray-800 pt-1">
                    {isArray ? (
                      <div className="flex flex-wrap gap-1.5">
                        {ans.answer.map((item, i) => (
                          <span
                            key={i}
                            className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : isUrl ? (
                      <a
                        href={ans.answer}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 hover:underline font-medium space-x-1"
                      >
                        <span>{ans.answer}</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1 inline" />
                      </a>
                    ) : (
                      <p className="whitespace-pre-line leading-relaxed font-normal text-gray-700 bg-white p-3 rounded border border-gray-200">
                        {ans.answer !== undefined && ans.answer !== '' ? String(ans.answer) : '(No response provided)'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetailsPage;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ArrowRight,
  CheckCircle2,
  FileText,
  Share2,
  Users,
  Sparkles,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      await login('demo@jobform.local', 'Demo123456');
      navigate('/dashboard');
    } catch (e) {
      // If server seed not run or credentials changed, take to login page with prefill
      navigate('/login?demo=true');
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Job<span className="text-emerald-600">Form</span>
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Minimalist Hiring Workflow for Modern Teams</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight md:leading-[1.15]">
          Create better job applications.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Build professional application forms, share one link, and manage candidates from one simple dashboard.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors group"
          >
            <span>Create your first job</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            onClick={handleDemoLogin}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
          >
            <span>View demo</span>
          </button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-gray-500">
          <span className="flex items-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
            No candidate account required
          </span>
          <span className="flex items-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
            Zero setup friction
          </span>
          <span className="flex items-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
            Instant public application link
          </span>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              How it works
            </h2>
            <p className="mt-3 text-gray-600 text-sm sm:text-base">
              A frictionless 4-step pipeline designed to get jobs published and candidates reviewed in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Create a job</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Add role details, company info, employment type, salary, and requirements.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Build your form</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Default applicant fields are ready. Add custom questions with dropdowns, radios, or text.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Share your link</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Publish with one click and share your custom job URL across LinkedIn, Twitter, or job boards.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm mb-4">
                4
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Review candidates</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                View submitted CVs, read custom answers, and shortlist or reject candidates from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Engineered for clarity and speed
          </h2>
          <p className="mt-3 text-gray-600 text-sm sm:text-base">
            Everything you need to hire efficiently without cluttered menus or bloated software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Custom application forms</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Create specific questions tailored to the vacancy: text, dropdown, phone, URL, radio, or checkboxes.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">CV collection</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Reliable file upload for PDF, DOC, and DOCX resumes up to 5MB with safe storage and one-click preview.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Candidate management</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Search by candidate name or email and filter applications by status across your entire pipeline.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Simple hiring pipeline</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Review individual answers and quickly move applicants between Applied, Shortlisted, and Rejected.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">No candidate account required</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Candidates can submit their applications directly without passwords or signup friction.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              JWT authentication, encrypted passwords, rate-limiting, and strict recruiter ownership validation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-emerald-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center mt-auto">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to streamline your job applications?</h2>
          <p className="text-emerald-200 text-base mb-8">
            Create an account in 30 seconds and start receiving structured candidate submissions today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-lg font-semibold text-base transition-colors shadow-sm"
          >
            <span>Create your first job</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

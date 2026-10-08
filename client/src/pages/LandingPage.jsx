import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BetterFormLogo from '../components/BetterFormLogo';

const LandingPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      await login('demo@betterform.local', 'Demo123456');
      navigate('/dashboard');
    } catch (e) {
      try {
        await login('demo@jobform.local', 'Demo123456');
        navigate('/dashboard');
      } catch (err2) {
        navigate('/login?demo=true');
      }
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-signal selection:text-ink">
      {/* Top Header */}
      <header className="border-b border-line bg-paper sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center">
            <BetterFormLogo height={32} />
          </Link>

          <div className="flex items-center gap-5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn-primary"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[14px] font-semibold text-ink hover:text-muted transition-colors px-2 py-2"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-6 lg:px-12 max-w-[1280px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7 text-left">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-signal" />
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
                The Minimalist Hiring Workflow
              </p>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[68px] font-bold tracking-[-0.04em] text-ink leading-[1.03]">
              Create better job applications.
            </h1>

            <p className="mt-6 text-[18px] text-muted max-w-[580px] leading-[1.5] font-normal">
              BetterForm is a minimalist hiring workflow that lets companies create professional job application forms, share one application link, and manage candidates from one simple dashboard.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/register"
                className="btn-primary"
              >
                <span>Create your first job</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </Link>

              <button
                onClick={handleDemoLogin}
                className="btn-secondary"
              >
                View demo workspace
              </button>
            </div>

            {/* Badges / Micro-rules */}
            <div className="mt-12 pt-8 border-t border-line grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Candidates</p>
                <p className="mt-1 text-[14px] font-semibold text-ink">No account required</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Setup</p>
                <p className="mt-1 text-[14px] font-semibold text-ink">Zero setup friction</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Distribution</p>
                <p className="mt-1 text-[14px] font-semibold text-ink">One link to share</p>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Form Structure Graphic echoing the Brand Mark */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-line rounded-[12px] p-8 relative overflow-hidden">
              <div className="flex items-center justify-between pb-6 border-b border-line">
                <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
                  Live Application Preview
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-signal" title="Signal: Applicant dot" />
              </div>

              {/* Stepped Form Progress Motif */}
              <div className="mt-6 space-y-5">
                <div>
                  <div className="flex justify-between items-center text-xs text-muted font-medium mb-1.5">
                    <span className="text-ink font-semibold">Position Applied</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em]">Full-time</span>
                  </div>
                  <div className="h-[44px] bg-paper rounded-[8px] border border-line px-3.5 flex items-center text-xs text-ink font-medium">
                    Senior Product Engineer
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs text-muted font-medium mb-1.5">
                    <span className="text-ink font-semibold">Applicant Name</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em]">Required</span>
                  </div>
                  <div className="h-[44px] bg-paper rounded-[8px] border border-line px-3.5 flex items-center text-xs text-ink">
                    Sarah Jenkins
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs text-muted font-medium mb-1.5">
                    <span className="text-ink font-semibold">Curriculum Vitae (CV)</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em]">PDF · 2.1 MB</span>
                  </div>
                  <div className="h-[44px] bg-paper rounded-[8px] border border-line border-dashed px-3.5 flex items-center justify-between text-xs text-muted">
                    <span className="text-ink font-medium">resume_sarah_jenkins.pdf</span>
                    <span className="w-2 h-2 rounded-full bg-signal" />
                  </div>
                </div>

                {/* Status dot progression */}
                <div className="pt-4 border-t border-line flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-signal" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink font-semibold">
                      Shortlisted applicant
                    </span>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    Ready for review
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Brand Identity Story Section: Three fields. One step up. */}
      <section className="py-20 border-t border-line bg-paper-2/40">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Symbol Display */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div className="w-[240px] h-[240px] bg-ink rounded-[32px] p-6 relative flex items-center justify-center">
                <BetterFormLogo variant="symbol" theme="dark" height={192} />
              </div>
            </div>

            {/* Brand Concept Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
                96 Grid &bull; Radii 12 / 48 &bull; Three Fields &bull; One Dot
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-ink leading-[1.1]">
                Three fields.<br />One step up.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-line">
                <div>
                  <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">A &bull; Fields</span>
                  <p className="mt-2 text-xs text-muted leading-relaxed">
                    Three left-aligned rows cut from solid black: the grammar of every form, drawn as negative space.
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">B &bull; Progression</span>
                  <p className="mt-2 text-xs text-muted leading-relaxed">
                    Each row runs longer than the last. An application gaining shape, a pipeline gaining clarity.
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">C &bull; Candidate</span>
                  <p className="mt-2 text-xs text-muted leading-relaxed">
                    The green dot is the applicant, surfacing from the structure into the curve where a page would fold.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="py-20 border-t border-line bg-paper">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div className="max-w-[640px] mb-14 text-left">
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted mb-2">
              The Hiring Loop
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-ink">
              How BetterForm works.
            </h2>
            <p className="mt-3 text-[16px] text-muted leading-relaxed">
              A linear, structured workflow designed to get roles published and candidate submissions organized without clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-7 rounded-[12px] border border-line">
              <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">01</span>
              <h3 className="mt-4 text-[18px] font-bold tracking-[-0.02em] text-ink">Create job</h3>
              <p className="mt-2 text-[14px] text-muted leading-relaxed">
                Define title, description, employment type, location, and compensation parameters.
              </p>
            </div>

            <div className="bg-white p-7 rounded-[12px] border border-line">
              <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">02</span>
              <h3 className="mt-4 text-[18px] font-bold tracking-[-0.02em] text-ink">Build application form</h3>
              <p className="mt-2 text-[14px] text-muted leading-relaxed">
                Add custom questions tailored to the vacancy: text, dropdowns, radios, or file uploads.
              </p>
            </div>

            <div className="bg-white p-7 rounded-[12px] border border-line">
              <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">03</span>
              <h3 className="mt-4 text-[18px] font-bold tracking-[-0.02em] text-ink">Share one public link</h3>
              <p className="mt-2 text-[14px] text-muted leading-relaxed">
                Publish instantly and share a clean application page across your hiring channels.
              </p>
            </div>

            <div className="bg-white p-7 rounded-[12px] border border-line">
              <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">04</span>
              <h3 className="mt-4 text-[18px] font-bold tracking-[-0.02em] text-ink">Review candidate answers</h3>
              <p className="mt-2 text-[14px] text-muted leading-relaxed">
                Inspect candidate answers and CVs, and transition status between Applied, Shortlisted, and Rejected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Capabilities */}
      <section className="py-20 border-t border-line bg-paper-2/40">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div className="max-w-[640px] mb-14 text-left">
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted mb-2">
              Core Capabilities
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-ink">
              Quiet structure, zero fluff.
            </h2>
            <p className="mt-3 text-[16px] text-muted leading-relaxed">
              Every detail is designed for speed, clarity, and ease of review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-[12px] border border-line text-left">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Questions</p>
              <h3 className="mt-2 text-[18px] font-bold text-ink">Custom form builder</h3>
              <p className="mt-2 text-[14px] text-muted leading-relaxed">
                Form questions support single-line text, textarea, select menus, radio buttons, numbers, URLs, and phone formats.
              </p>
            </div>

            <div className="bg-white p-7 rounded-[12px] border border-line text-left">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Resumes</p>
              <h3 className="mt-2 text-[18px] font-bold text-ink">Secure CV attachments</h3>
              <p className="mt-2 text-[14px] text-muted leading-relaxed">
                Reliable uploads for PDF, DOC, and DOCX resumes with size validation and preview links for the hiring team.
              </p>
            </div>

            <div className="bg-white p-7 rounded-[12px] border border-line text-left">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Pipeline</p>
              <h3 className="mt-2 text-[18px] font-bold text-ink">Applicant status dot</h3>
              <p className="mt-2 text-[14px] text-muted leading-relaxed">
                Clear status markers: ink dot for new applications, signal green for shortlisted candidates, hollow ring for rejected.
              </p>
            </div>

            <div className="bg-white p-7 rounded-[12px] border border-line text-left">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Experience</p>
              <h3 className="mt-2 text-[18px] font-bold text-ink">Frictionless applicant flow</h3>
              <p className="mt-2 text-[14px] text-muted leading-relaxed">
                Candidates never need an account. They open the link, answer the form, upload their CV, and submit in seconds.
              </p>
            </div>

            <div className="bg-white p-7 rounded-[12px] border border-line text-left">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Governance</p>
              <h3 className="mt-2 text-[18px] font-bold text-ink">Recruiter data isolation</h3>
              <p className="mt-2 text-[14px] text-muted leading-relaxed">
                Strict company workspace separation. Recruiters only see, edit, and manage candidate submissions for their own postings.
              </p>
            </div>

            <div className="bg-white p-7 rounded-[12px] border border-line text-left">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Control</p>
              <h3 className="mt-2 text-[18px] font-bold text-ink">Publish & unpublish anytime</h3>
              <p className="mt-2 text-[14px] text-muted leading-relaxed">
                Toggle jobs between draft and published. Unpublished roles immediately stop receiving submissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Footer CTA Section (ink background, green signal CTA) */}
      <footer className="bg-ink text-paper py-20 px-6 lg:px-12 mt-auto border-t border-line">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-16 border-b border-line-dark">
            <div className="max-w-[620px] text-left">
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted-dark mb-3">
                Start Today
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-paper leading-[1.1]">
                Ready to build better job applications?
              </h2>
              <p className="mt-4 text-[16px] text-muted-dark">
                Create an account in 30 seconds and share your first application link today.
              </p>
            </div>

            <div>
              <Link
                to="/register"
                className="btn-primary-dark"
              >
                <span>Create your first job</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </Link>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-dark">
            <div className="flex items-center gap-3">
              <BetterFormLogo variant="symbol" theme="dark" height={24} />
              <span className="font-mono text-[11px] uppercase tracking-[0.12em]">
                &copy; {new Date().getFullYear()} BetterForm
              </span>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em]">
              Swiss editorial structure &bull; Minimalist hiring
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

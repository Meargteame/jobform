import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import BetterFormLogo from '../components/BetterFormLogo';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  ArrowRight,
  Loader2,
  AlertCircle,
  Building,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

const PublicCareersPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (typeFilter !== 'all') params.type = typeFilter;

      const res = await api.get('/public/jobs', { params });
      if (res.data.success) {
        setJobs(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load open positions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const companyName = jobs[0]?.companyName || 'Our Company';

  return (
    <div className="min-h-screen bg-paper font-sans text-ink selection:bg-signal selection:text-ink">
      {/* Top Header */}
      <header className="border-b border-line bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BetterFormLogo size={28} />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-muted hover:text-ink transition-colors"
            >
              Recruiter sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-line bg-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper border border-line text-xs font-semibold text-ink">
            <span className="w-2 h-2 rounded-full bg-signal" />
            <span>We are hiring</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] text-ink">
            Careers at {companyName}
          </h1>

          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Join a collaborative team dedicated to building purposeful products. Explore our current open vacancies and find your next opportunity below.
          </p>

          <div className="pt-2 flex items-center justify-center gap-4 text-xs font-mono uppercase tracking-[0.12em] text-muted">
            <span>{jobs.length} Open Positions</span>
            <span>•</span>
            <span>Equal Opportunity Employer</span>
          </div>
        </div>
      </section>

      {/* Main Jobs Directory */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-[12px] border border-line flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-[14px] stroke-[1.5]" />
            <input
              type="text"
              placeholder="Search by role title, keywords, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bf-input w-full pl-9 text-xs"
            />
          </form>

          {/* Employment Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All roles' },
              { id: 'Full-time', label: 'Full-time' },
              { id: 'Part-time', label: 'Part-time' },
              { id: 'Contract', label: 'Contract' },
              { id: 'Remote', label: 'Remote' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTypeFilter(t.id)}
                className={`h-[36px] px-3.5 rounded-[8px] text-xs font-semibold transition-colors whitespace-nowrap ${
                  typeFilter === t.id
                    ? 'bg-ink text-paper'
                    : 'bg-paper hover:bg-paper-2 text-ink border border-line'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-[8px] bg-red-50/80 border border-red-200 text-xs text-red-800 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 stroke-[1.5]" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-[12px] border border-line">
            <Loader2 className="w-6 h-6 text-ink animate-spin stroke-[1.5]" />
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
              Loading open opportunities...
            </p>
          </div>
        ) : jobs.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-[12px] border border-line p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-paper border border-line flex items-center justify-center mx-auto text-muted">
              <Briefcase className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-ink">No open positions found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              We couldn't find any job listings matching your search filter. Check back soon for new openings.
            </p>
            {(search || typeFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setTypeFilter('all');
                }}
                className="btn-secondary btn-compact"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          /* Jobs Listing Grid */
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-[12px] border border-line p-6 hover:border-ink transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      {job.companyName}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-line" />
                    <span className="font-mono text-[11px] text-ink bg-paper px-2 py-0.5 rounded-[4px] border border-line">
                      {job.employmentType}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold tracking-[-0.02em] text-ink group-hover:underline">
                    <Link to={`/apply/${job.slug}`}>{job.title}</Link>
                  </h2>

                  <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                    {job.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>{job.location}</span>
                      </span>
                    )}

                    {job.salary && (
                      <span className="flex items-center gap-1.5 font-medium text-ink">
                        <DollarSign className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>{job.salary}</span>
                      </span>
                    )}

                    {job.deadline && (
                      <span className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>Apply by {new Date(job.deadline).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                  <Link
                    to={`/apply/${job.slug}`}
                    className="btn-primary"
                  >
                    <span>Apply for role</span>
                    <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-white py-10 px-4 sm:px-6 mt-16 text-center space-y-3 font-sans">
        <div className="flex items-center justify-center gap-2">
          <BetterFormLogo size={20} />
        </div>
        <p className="text-xs text-muted">
          Powered by BetterForm — Modern application workflows for high-performing hiring teams.
        </p>
      </footer>
    </div>
  );
};

export default PublicCareersPage;

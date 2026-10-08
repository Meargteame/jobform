import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BetterFormLogo from '../components/BetterFormLogo';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, password, companyName } = formData;

    if (!name || !email || !password || !companyName) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center py-12 px-6 lg:px-8 font-sans text-ink">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-left">
        <Link to="/" className="inline-block mb-8">
          <BetterFormLogo size={36} />
        </Link>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">
          Create recruiter workspace
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ink underline underline-offset-4 hover:text-muted transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white p-8 border border-line rounded-[12px]">
          {error && (
            <div className="mb-6 p-3.5 rounded-[8px] bg-red-50/80 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5 stroke-[1.5]" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[14px] font-semibold text-ink mb-1.5">
                Full name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-ink mb-1.5">
                Company name
              </label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Acme Corp"
                className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-ink mb-1.5">
                Work email address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@company.com"
                className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-ink mb-1.5">
                Password <span className="font-normal text-xs text-muted">(min. 8 characters)</span>
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-[44px] px-3.5 rounded-[8px] border border-line bg-white text-ink text-[15px] placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:border-ink transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center h-[44px] px-5 rounded-[8px] text-[15px] font-semibold text-paper bg-ink hover:bg-[#202022] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin stroke-[1.5]" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <span>Create workspace</span>
                    <ArrowRight className="w-4 h-4 ml-2 stroke-[1.5]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

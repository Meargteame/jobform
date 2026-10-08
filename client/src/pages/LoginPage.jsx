import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BetterFormLogo from '../components/BetterFormLogo';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@betterform.local');
    setPassword('Demo123456');
    setError('');
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center py-12 px-6 lg:px-8 font-sans text-ink">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-left">
        <Link to="/" className="inline-block mb-8">
          <BetterFormLogo size={36} />
        </Link>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">
          Sign in to your account
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Or{' '}
          <Link to="/register" className="font-semibold text-ink underline underline-offset-4 hover:text-muted transition-colors">
            create a new recruiter account
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

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[14px] font-semibold text-ink mb-1.5">
                Work email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="bf-input w-full"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-ink mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bf-input w-full"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin stroke-[1.5]" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4 ml-2 stroke-[1.5]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick-fill helper */}
          <div className="mt-6 pt-6 border-t border-line">
            <button
              type="button"
              onClick={handleFillDemo}
              className="btn-secondary w-full text-xs font-semibold"
            >
              <span>Fill demo credentials</span>
              <span className="font-mono text-[11px] text-muted">(demo@betterform.local)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import { useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

const AUTH_KEY = 'reakt-sitekit-admin-auth';
export const ADMIN_PASSWORD_KEY = 'reakt-sitekit-admin-password';

const getExpectedPassword = () => {
  const override = typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_PASSWORD_KEY) : null;
  return (override || import.meta.env.VITE_ADMIN_PASSWORD || 'demo').trim();
};

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const expectedPassword = getExpectedPassword();

  const isAuthenticated =
    typeof window !== 'undefined' && window.localStorage.getItem(AUTH_KEY) === '1';

  const message = useMemo(() => {
    return `Use password: ${expectedPassword}`;
  }, [expectedPassword]);

  if (isAuthenticated) {
    return <Navigate to='/admin' replace />;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (password.trim() === expectedPassword) {
      window.localStorage.setItem(AUTH_KEY, '1');
      navigate('/admin');
      return;
    }

    setError('Wrong password. Use the demo password shown below.');
  };

  return (
    <main className='admin-auth-shell'>
      <section className='admin-auth-card sitekit-glow rounded-3xl border border-white/20 bg-slate-950/90 p-6 md:p-8'>
        <div className='grid gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-start'>
          <div className='space-y-4'>
            <p className='admin-auth-kicker'>Editor sign-in</p>
            <h1 className='text-3xl font-semibold leading-tight'>Welcome to the control panel</h1>
            <p className='text-sm text-slate-300'>
              Access your comprehensive website editor to design pages, reorder sections, tune SEO, and publish workspace
              snapshots.
            </p>
            <div className='rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200'>
              <p className='mb-1 font-medium'>Current local development mode</p>
              <p className='text-slate-300'>
                Use the password below or set <code className='rounded bg-slate-800 px-1.5 py-1'>VITE_ADMIN_PASSWORD</code>{' '}
                in your environment.
              </p>
            </div>
            <p className='rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-slate-200'>{message}</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <label className='block text-sm'>
              <span className='mb-1 block'>Workspace password</span>
              <input
                value={password}
                onChange={(event) => {
                  setError('');
                  setPassword(event.target.value);
                }}
                type='password'
                className='w-full rounded-xl border border-white/15 bg-slate-900/75 px-3 py-2'
                autoComplete='current-password'
                placeholder='Enter admin password'
              />
            </label>
            {error ? <p className='text-sm text-rose-300'>{error}</p> : null}
            <Button type='submit' fullWidth>
              Enter dashboard
            </Button>
            <p className='text-xs text-slate-400'>
              <Link to='/' className='rounded-full border border-white/20 px-3 py-1.5 inline-block hover:bg-white/10'>
                Back to public site
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

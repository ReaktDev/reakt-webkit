import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { hasAdminSession, loginToAdmin } from '../../lib/adminAuth';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  if (hasAdminSession()) {
    return <Navigate to='/admin' replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result = await loginToAdmin(password);
    setIsSubmitting(false);

    if (result.ok) {
      navigate('/admin');
      return;
    }

    setError(result.message || 'Wrong password.');
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
              <p className='mb-1 font-medium'>Server-protected admin access</p>
              <p className='text-slate-300'>
                Deploy with <code className='rounded bg-slate-800 px-1.5 py-1'>ADMIN_PASSWORD</code> and{' '}
                <code className='rounded bg-slate-800 px-1.5 py-1'>ADMIN_SESSION_SECRET</code> on your host.
              </p>
            </div>
            <p className='rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-slate-200'>
              Local development fallback: <strong>demo</strong>. Production password hints are never shown in the browser.
            </p>
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
            <Button type='submit' fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Checking...' : 'Enter dashboard'}
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

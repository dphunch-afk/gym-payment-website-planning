'use client';

import { FormEvent, useState } from 'react';

export function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: String(data.get('email') || ''),
        password: String(data.get('password') || '')
      })
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.error || 'Login failed');
      setLoading(false);
      return;
    }

    window.location.assign(body.redirectTo || '/');
  }

  return (
    <form className="stack" onSubmit={submit}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error ? <div className="error" role="alert">{error}</div> : null}
      <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}

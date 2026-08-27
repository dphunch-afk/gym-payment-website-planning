'use client';

export function LogoutButton() {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.assign('/login');
  }

  return <button className="btn secondary" type="button" onClick={logout}>Sign out</button>;
}

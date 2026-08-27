import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === 'MEMBER' ? '/member' : '/owner');

  return (
    <main className="page">
      <div className="container">
        <div className="form-card card">
          <span className="badge">Gym Owner Manager</span>
          <h1>Sign in</h1>
          <p className="muted">Owners and members use the same secure login. Your role controls what you can access.</p>
          <LoginForm />
          <div className="demo-box">
            <strong>Demo Owner</strong><br />owner@gym.local / Owner@123<br /><br />
            <strong>Demo Member</strong><br />member@gym.local / Member@123
          </div>
        </div>
      </div>
    </main>
  );
}

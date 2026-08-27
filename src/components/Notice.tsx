export function Notice({ success, error }: { success?: string; error?: string }) {
  if (!success && !error) return null;
  return <div className={error ? 'notice error-notice' : 'notice success-notice'}>{error || success}</div>;
}

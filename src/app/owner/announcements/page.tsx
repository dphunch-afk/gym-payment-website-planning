import { db } from '@/lib/db';
import { formatDate } from '@/lib/finance';
import { createAnnouncement, toggleAnnouncement } from './actions';

export default async function AnnouncementsPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const announcements = await db.announcement.findMany({
    include: { createdBy: true },
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <main className="page">
      <div className="container stack">
        <div>
          <h1>Announcements</h1>
          <p className="muted">Publish gym notices that appear in the member portal.</p>
        </div>

        {params.success ? <div className="success">{params.success}</div> : null}
        {params.error ? <div className="error">{params.error}</div> : null}

        <section className="card">
          <h2>New announcement</h2>
          <form action={createAnnouncement} className="stack">
            <label className="field"><span>Title</span><input name="title" required maxLength={120} /></label>
            <label className="field"><span>Message</span><textarea name="body" required rows={4} maxLength={1200} /></label>
            <button className="btn" type="submit">Publish announcement</button>
          </form>
        </section>

        <section className="card">
          <h2>Announcement history</h2>
          {announcements.length ? (
            <div className="stack">
              {announcements.map((notice) => (
                <article key={notice.id} className="notice-card">
                  <div className="section-head">
                    <div>
                      <div className="muted" style={{ fontSize: 12 }}>{formatDate(notice.publishedAt)} · {notice.createdBy.name}</div>
                      <h3>{notice.title}</h3>
                    </div>
                    <span className="badge">{notice.isActive ? 'Visible' : 'Hidden'}</span>
                  </div>
                  <p>{notice.body}</p>
                  <form action={toggleAnnouncement}>
                    <input type="hidden" name="id" value={notice.id} />
                    <input type="hidden" name="current" value={String(notice.isActive)} />
                    <button className="btn secondary" type="submit">{notice.isActive ? 'Hide from members' : 'Show to members'}</button>
                  </form>
                </article>
              ))}
            </div>
          ) : <p className="muted">No announcements yet.</p>}
        </section>
      </div>
    </main>
  );
}

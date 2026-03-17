import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[var(--bg-primary)]">
      <div className="max-w-5xl mx-auto text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 text-[var(--accent)]">
            SubmissionAI
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            AI-Powered Commercial Insurance Submission Engine
          </p>
        </div>

        {/* Hero Content */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-[var(--text-primary)]">
            Transform Your Insurance Workflow{' '}
            <span className="text-[var(--accent)]">in Minutes</span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-4">
            From client intake to carrier quotes in <strong className="text-[var(--accent)]">30 minutes</strong>—not 4 hours.
          </p>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Auto-generate ACORD forms, match optimal carriers, compare quotes side-by-side, and see real-time ROI metrics.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="bg-white border border-[var(--border)] rounded-lg p-6 hover:bg-[var(--bg-card-hover)] transition-colors shadow-sm">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold mb-2 text-[var(--text-primary)]">Smart Intake</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Enter client data once. AI extracts from existing docs.
            </p>
          </div>
          <div className="bg-white border border-[var(--border)] rounded-lg p-6 hover:bg-[var(--bg-card-hover)] transition-colors shadow-sm">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold mb-2 text-[var(--text-primary)]">Auto-Generate Forms</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              ACORD 125, 126 instantly populated. Review and edit.
            </p>
          </div>
          <div className="bg-white border border-[var(--border)] rounded-lg p-6 hover:bg-[var(--bg-card-hover)] transition-colors shadow-sm">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2 text-[var(--text-primary)]">Carrier Matching</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              AI recommends best-fit carriers based on risk profile.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div>
          <Link
            href="/demo"
            className="inline-block bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl"
          >
            Start Interactive Demo →
          </Link>
          <p className="text-sm text-[var(--text-muted)] mt-4">
            Live demo with synthetic data · No signup required
          </p>
        </div>

        {/* Value Prop Footer */}
        <div className="mt-16 pt-8 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            Built for brokers who write 50+ commercial submissions per month
          </p>
          <div className="flex justify-center gap-8 text-sm text-[var(--text-muted)]">
            <span>⏱️ Save 1,500+ hours/year</span>
            <span>✅ Reduce errors by 73%</span>
            <span>📈 Bind 4 days faster</span>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { carrierRecommendations } from '@/lib/synthetic-data';
import Link from 'next/link';

export default function CarrierMatch() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Step 3: Carrier Recommendations</h1>
        <p className="text-[var(--text-secondary)]">
          AI-powered carrier matching based on risk profile, industry type, revenue, and claims history.
        </p>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {carrierRecommendations.map((carrier) => (
          <div
            key={carrier.name}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--accent)] transition-all"
          >
            <div className="p-6">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{carrier.name}</h3>
                    <span className="px-3 py-1 bg-[var(--accent)]/20 text-[var(--accent-light)] rounded-full text-sm font-semibold">
                      {carrier.amBestRating}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {carrier.appetite}
                  </p>
                </div>
                
                {/* Match Score */}
                <div className="text-right">
                  <div className="text-3xl font-bold text-[var(--accent-light)]">
                    {carrier.matchScore}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Match Score</div>
                  
                  {/* Score Bar */}
                  <div className="w-24 h-2 bg-[var(--bg-secondary)] rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] score-bar"
                      style={{ '--fill-width': `${carrier.matchScore}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>

              {/* Estimated Premium Range */}
              <div className="mb-6 p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg">
                <div className="text-sm text-[var(--text-muted)] mb-1">Estimated Premium Range</div>
                <div className="text-2xl font-bold text-[var(--accent-light)]">
                  {carrier.estimatedPremiumRange}
                </div>
              </div>

              {/* Strengths */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  ✓ Strengths
                </h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {carrier.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-[var(--success)] mt-0.5">•</span>
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concerns */}
              {carrier.concerns.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    ⚠ Considerations
                  </h4>
                  <div className="space-y-2">
                    {carrier.concerns.map((concern, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="text-[var(--warning)] mt-0.5">•</span>
                        <span>{concern}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialties */}
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Specialties
                </h4>
                <div className="flex flex-wrap gap-2">
                  {carrier.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-6 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg">
        <h3 className="font-semibold mb-2 text-[var(--accent-light)]">
          🤖 How AI Matching Works
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Our algorithm analyzes risk characteristics (industry NAICS code, revenue tier, claims frequency/severity,
          coverage lines needed) and matches them against each carrier's known appetite, underwriting guidelines,
          and historical acceptance patterns. Match scores reflect probability of quote + competitive pricing.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <Link
          href="/demo?step=acord"
          className="px-6 py-3 border border-[var(--border)] hover:bg-[var(--bg-card)] rounded-lg transition-colors"
        >
          ← Back to ACORD Forms
        </Link>
        <Link
          href="/demo?step=quotes"
          className="bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-lg"
        >
          Compare Quotes →
        </Link>
      </div>
    </div>
  );
}

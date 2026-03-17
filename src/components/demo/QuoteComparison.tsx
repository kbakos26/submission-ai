'use client';

import { useState } from 'react';
import { carrierQuotes } from '@/lib/synthetic-data';
import Link from 'next/link';

export default function QuoteComparison() {
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);

  // Sort by overall score
  const sortedQuotes = [...carrierQuotes].sort((a, b) => b.overallScore - a.overallScore);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Step 4: Quote Comparison</h1>
        <p className="text-[var(--text-secondary)]">
          Side-by-side comparison of carrier quotes with scoring and analysis.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-sm text-[var(--text-muted)] mb-1">Quotes Received</div>
          <div className="text-3xl font-bold text-[var(--accent-light)]">{carrierQuotes.length}</div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-sm text-[var(--text-muted)] mb-1">Best Premium</div>
          <div className="text-3xl font-bold text-[var(--success)]">
            ${Math.min(...carrierQuotes.map(q => q.totalPremium)).toLocaleString()}
          </div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-sm text-[var(--text-muted)] mb-1">Premium Range</div>
          <div className="text-3xl font-bold">
            ${(Math.max(...carrierQuotes.map(q => q.totalPremium)) - Math.min(...carrierQuotes.map(q => q.totalPremium))).toLocaleString()}
          </div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-sm text-[var(--text-muted)] mb-1">Top Rated</div>
          <div className="text-3xl font-bold text-[var(--accent-light)]">
            {sortedQuotes[0].carrierName.split(' ')[0]}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-muted)] sticky left-0 bg-[var(--bg-secondary)] z-10">
                  Carrier
                </th>
                {sortedQuotes.map(quote => (
                  <th key={quote.carrierName} className="px-4 py-3 text-center min-w-[160px]">
                    <div className="font-bold">{quote.carrierName}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">{quote.amBestRating}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Overall Score */}
              <tr className="border-t border-[var(--border)] bg-[var(--accent)]/5">
                <td className="px-4 py-3 font-semibold sticky left-0 bg-[var(--bg-card)] z-10">
                  Overall Score
                </td>
                {sortedQuotes.map(quote => (
                  <td key={quote.carrierName} className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <span className="text-2xl font-bold text-[var(--accent-light)]">
                        {quote.overallScore}
                      </span>
                      {quote.overallScore === Math.max(...sortedQuotes.map(q => q.overallScore)) && (
                        <span className="text-[var(--success)]">★</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Total Premium */}
              <tr className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-semibold sticky left-0 bg-[var(--bg-card)] z-10">
                  Total Premium
                </td>
                {sortedQuotes.map(quote => (
                  <td key={quote.carrierName} className="px-4 py-3 text-center">
                    <div className={`text-lg font-bold ${quote.totalPremium === Math.min(...sortedQuotes.map(q => q.totalPremium)) ? 'text-[var(--success)]' : ''}`}>
                      ${quote.totalPremium.toLocaleString()}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Coverage Lines */}
              {sortedQuotes[0].coverages.map((coverage, idx) => (
                <tr key={coverage.line} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 sticky left-0 bg-[var(--bg-card)] z-10">
                    <div className="font-medium">{coverage.line}</div>
                    <div className="text-xs text-[var(--text-muted)]">Premium / Deductible / Limit</div>
                  </td>
                  {sortedQuotes.map(quote => {
                    const cov = quote.coverages.find(c => c.line === coverage.line);
                    return (
                      <td key={quote.carrierName} className="px-4 py-3 text-center">
                        {cov ? (
                          <>
                            <div className="font-semibold">${cov.premium.toLocaleString()}</div>
                            <div className="text-xs text-[var(--text-secondary)] mt-1">
                              ${cov.deductible.toLocaleString()} ded
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                              {cov.limit}
                            </div>
                          </>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Payment Options */}
              <tr className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-semibold sticky left-0 bg-[var(--bg-card)] z-10">
                  Payment Options
                </td>
                {sortedQuotes.map(quote => (
                  <td key={quote.carrierName} className="px-4 py-3 text-center text-xs text-[var(--text-secondary)]">
                    {quote.paymentOptions}
                  </td>
                ))}
              </tr>

              {/* Bind Deadline */}
              <tr className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-semibold sticky left-0 bg-[var(--bg-card)] z-10">
                  Bind Deadline
                </td>
                {sortedQuotes.map(quote => (
                  <td key={quote.carrierName} className="px-4 py-3 text-center text-sm">
                    {quote.bindDeadline}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Quote Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Detailed Quotes</h2>
        <div className="space-y-4">
          {sortedQuotes.map((quote) => (
            <div
              key={quote.carrierName}
              className={`bg-[var(--bg-card)] border rounded-lg overflow-hidden transition-all ${
                selectedCarrier === quote.carrierName
                  ? 'border-[var(--accent)] shadow-lg'
                  : 'border-[var(--border)] hover:border-[var(--accent)]/50'
              }`}
            >
              <button
                onClick={() => setSelectedCarrier(selectedCarrier === quote.carrierName ? null : quote.carrierName)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-[var(--accent-light)]">
                    {quote.overallScore}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-left">{quote.carrierName}</h3>
                    <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                      <span>{quote.amBestRating}</span>
                      <span>·</span>
                      <span className="font-semibold text-[var(--accent-light)]">
                        ${quote.totalPremium.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-2xl text-[var(--text-muted)]">
                  {selectedCarrier === quote.carrierName ? '−' : '+'}
                </div>
              </button>

              {selectedCarrier === quote.carrierName && (
                <div className="px-6 pb-6 border-t border-[var(--border)]">
                  {/* Coverage Details */}
                  <div className="mt-4 space-y-3">
                    {quote.coverages.map((coverage) => (
                      <div key={coverage.line} className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold">{coverage.line}</div>
                          <div className="text-lg font-bold text-[var(--accent-light)]">
                            ${coverage.premium.toLocaleString()}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-[var(--text-secondary)]">
                          <div>
                            <div className="text-xs text-[var(--text-muted)]">Deductible</div>
                            <div className="font-medium">${coverage.deductible.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-xs text-[var(--text-muted)]">Limit</div>
                            <div className="font-medium">{coverage.limit}</div>
                          </div>
                          {coverage.aggregateLimit && (
                            <div>
                              <div className="text-xs text-[var(--text-muted)]">Aggregate</div>
                              <div className="font-medium">{coverage.aggregateLimit}</div>
                            </div>
                          )}
                        </div>
                        {coverage.sublimits && (
                          <div className="mt-2 text-xs text-[var(--text-muted)]">
                            Sublimits: {coverage.sublimits.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Exclusions */}
                  {quote.exclusions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                        Exclusions & Limitations
                      </h4>
                      <ul className="space-y-1">
                        {quote.exclusions.map((exclusion, idx) => (
                          <li key={idx} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="text-[var(--warning)]">•</span>
                            <span>{exclusion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <Link
          href="/demo?step=carriers"
          className="px-6 py-3 border border-[var(--border)] hover:bg-[var(--bg-card)] rounded-lg transition-colors"
        >
          ← Back to Carriers
        </Link>
        <Link
          href="/demo?step=roi"
          className="bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-lg"
        >
          View ROI Dashboard →
        </Link>
      </div>
    </div>
  );
}

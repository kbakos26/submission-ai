'use client';

import { sampleClient } from '@/lib/synthetic-data';
import Link from 'next/link';

export default function AcordForms() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Step 2: ACORD Forms Generated</h1>
        <p className="text-[var(--text-secondary)]">
          Auto-populated ACORD 125 and 126 forms based on client intake data.
        </p>
      </div>

      {/* Form Preview Container */}
      <div className="space-y-6">
        {/* ACORD 125 - Commercial Insurance Application */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden">
          <div className="bg-[var(--bg-secondary)] px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">ACORD 125</h2>
              <p className="text-sm text-[var(--text-secondary)]">Commercial Insurance Application</p>
            </div>
            <button className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-light)] rounded-lg text-sm font-medium transition-colors">
              Download PDF
            </button>
          </div>
          <div className="p-6 space-y-6">
            {/* Section 1: Named Insured */}
            <section>
              <h3 className="font-semibold mb-3 text-[var(--accent-light)]">1. Named Insured</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)]">Legal Name:</span>
                  <div className="font-medium mt-1">{sampleClient.businessName}</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">DBA:</span>
                  <div className="font-medium mt-1">{sampleClient.dba}</div>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[var(--text-muted)]">Mailing Address:</span>
                  <div className="font-medium mt-1">
                    {sampleClient.mailingAddress}, {sampleClient.city}, {sampleClient.state} {sampleClient.zip}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Entity Type:</span>
                  <div className="font-medium mt-1">{sampleClient.entityType}</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">NAICS Code:</span>
                  <div className="font-medium mt-1">{sampleClient.naicsCode}</div>
                </div>
              </div>
            </section>

            {/* Section 2: Business Information */}
            <section className="border-t border-[var(--border)] pt-6">
              <h3 className="font-semibold mb-3 text-[var(--accent-light)]">2. Business Information</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)]">Years in Business:</span>
                  <div className="font-medium mt-1">{sampleClient.yearsInBusiness}</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Years with Current Agent:</span>
                  <div className="font-medium mt-1">{sampleClient.yearsWithCurrentAgent}</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Annual Revenue:</span>
                  <div className="font-medium mt-1">${sampleClient.annualRevenue.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Employee Count:</span>
                  <div className="font-medium mt-1">{sampleClient.employeeCount}</div>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[var(--text-muted)]">Description of Operations:</span>
                  <div className="font-medium mt-1 leading-relaxed">{sampleClient.descriptionOfOperations}</div>
                </div>
              </div>
            </section>

            {/* Section 3: Lines of Business Requested */}
            <section className="border-t border-[var(--border)] pt-6">
              <h3 className="font-semibold mb-3 text-[var(--accent-light)]">3. Lines of Business Requested</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {sampleClient.linesOfBusiness.map((line) => (
                  <div key={line} className="flex items-center gap-2">
                    <span className="text-[var(--success)] text-lg">☑</span>
                    <span className="text-sm">{line}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Prior Coverage */}
            <section className="border-t border-[var(--border)] pt-6">
              <h3 className="font-semibold mb-3 text-[var(--accent-light)]">4. Prior Coverage Information</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)]">Prior Carrier:</span>
                  <div className="font-medium mt-1">{sampleClient.priorCarrier}</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Policy Number:</span>
                  <div className="font-medium mt-1">{sampleClient.priorPolicyNumber}</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Expiration Date:</span>
                  <div className="font-medium mt-1">{sampleClient.priorExpirationDate}</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Prior Premium:</span>
                  <div className="font-medium mt-1">${sampleClient.priorPremium.toLocaleString()}</div>
                </div>
              </div>
            </section>

            {/* Section 5: Loss History */}
            <section className="border-t border-[var(--border)] pt-6">
              <h3 className="font-semibold mb-3 text-[var(--accent-light)]">5. Loss History (Last 5 Years)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                    <tr>
                      <th className="px-4 py-2 text-left text-[var(--text-muted)]">Year</th>
                      <th className="px-4 py-2 text-left text-[var(--text-muted)]">Type</th>
                      <th className="px-4 py-2 text-left text-[var(--text-muted)]">Description</th>
                      <th className="px-4 py-2 text-right text-[var(--text-muted)]">Amount</th>
                      <th className="px-4 py-2 text-center text-[var(--text-muted)]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleClient.claimsHistory.map((claim, idx) => (
                      <tr key={idx} className="border-b border-[var(--border)]">
                        <td className="px-4 py-3">{claim.year}</td>
                        <td className="px-4 py-3">{claim.type}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{claim.description}</td>
                        <td className="px-4 py-3 text-right font-medium">${claim.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${claim.status === 'Closed' ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--warning)]/20 text-[var(--warning)]'}`}>
                            {claim.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        {/* ACORD 126 - General Liability Section */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden">
          <div className="bg-[var(--bg-secondary)] px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">ACORD 126</h2>
              <p className="text-sm text-[var(--text-secondary)]">Commercial General Liability Section</p>
            </div>
            <button className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-light)] rounded-lg text-sm font-medium transition-colors">
              Download PDF
            </button>
          </div>
          <div className="p-6 space-y-6">
            <section>
              <h3 className="font-semibold mb-3 text-[var(--accent-light)]">Coverage Details</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)]">Classification:</span>
                  <div className="font-medium mt-1">722511 - Full-Service Restaurants</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Each Occurrence Limit:</span>
                  <div className="font-medium mt-1">$2,000,000</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">General Aggregate:</span>
                  <div className="font-medium mt-1">$4,000,000</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Products/Completed Ops Aggregate:</span>
                  <div className="font-medium mt-1">$4,000,000</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Personal & Advertising Injury:</span>
                  <div className="font-medium mt-1">$2,000,000</div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Medical Expense (Any One Person):</span>
                  <div className="font-medium mt-1">$10,000</div>
                </div>
              </div>
            </section>

            <section className="border-t border-[var(--border)] pt-6">
              <h3 className="font-semibold mb-3 text-[var(--accent-light)]">Additional Coverages</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--success)] text-lg">☑</span>
                  <span className="text-sm">Liquor Liability - $2,000,000 per occurrence</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--success)] text-lg">☑</span>
                  <span className="text-sm">Host Liquor Liability</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--success)] text-lg">☑</span>
                  <span className="text-sm">Products Liability - Food Service Operations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--success)] text-lg">☑</span>
                  <span className="text-sm">Waiver of Subrogation (where required by contract)</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <Link
          href="/demo?step=intake"
          className="px-6 py-3 border border-[var(--border)] hover:bg-[var(--bg-card)] rounded-lg transition-colors"
        >
          ← Back to Intake
        </Link>
        <Link
          href="/demo?step=carriers"
          className="bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-lg"
        >
          Match Carriers →
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { sampleClient } from '@/lib/synthetic-data';
import { ClientInfo } from '@/types';
import Link from 'next/link';

export default function IntakeForm() {
  const [formData, setFormData] = useState<ClientInfo>(sampleClient);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Step 1: Client Intake</h1>
        <p className="text-[var(--text-secondary)]">
          Enter client business details. Form is pre-filled with synthetic data for demo purposes.
        </p>
      </div>

      {/* Form */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-8">
        <form className="space-y-8">
          {/* Business Info */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b border-[var(--border)] pb-2">
              Business Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Legal Business Name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  DBA (Doing Business As)
                </label>
                <input
                  type="text"
                  value={formData.dba}
                  onChange={(e) => setFormData({ ...formData, dba: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Entity Type
                </label>
                <select
                  value={formData.entityType}
                  onChange={(e) => setFormData({ ...formData, entityType: e.target.value as any })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                >
                  <option>Corporation</option>
                  <option>LLC</option>
                  <option>Partnership</option>
                  <option>Sole Proprietor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  NAICS Code
                </label>
                <input
                  type="text"
                  value={formData.naicsCode}
                  onChange={(e) => setFormData({ ...formData, naicsCode: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>
            </div>
          </section>

          {/* Contact & Location */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b border-[var(--border)] pb-2">
              Contact & Location
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Mailing Address
                </label>
                <input
                  type="text"
                  value={formData.mailingAddress}
                  onChange={(e) => setFormData({ ...formData, mailingAddress: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                    ZIP
                  </label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>
            </div>
          </section>

          {/* Business Metrics */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b border-[var(--border)] pb-2">
              Business Metrics
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Annual Revenue
                </label>
                <input
                  type="number"
                  value={formData.annualRevenue}
                  onChange={(e) => setFormData({ ...formData, annualRevenue: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Employee Count
                </label>
                <input
                  type="number"
                  value={formData.employeeCount}
                  onChange={(e) => setFormData({ ...formData, employeeCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Location Count
                </label>
                <input
                  type="number"
                  value={formData.locationCount}
                  onChange={(e) => setFormData({ ...formData, locationCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Years in Business
                </label>
                <input
                  type="number"
                  value={formData.yearsInBusiness}
                  onChange={(e) => setFormData({ ...formData, yearsInBusiness: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>
            </div>
          </section>

          {/* Description of Operations */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b border-[var(--border)] pb-2">
              Operations
            </h3>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                Description of Operations
              </label>
              <textarea
                value={formData.descriptionOfOperations}
                onChange={(e) => setFormData({ ...formData, descriptionOfOperations: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
              />
            </div>
          </section>

          {/* Coverage Lines */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b border-[var(--border)] pb-2">
              Coverage Lines Needed
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {formData.linesOfBusiness.map((line) => (
                <div key={line} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg">
                  <span className="text-[var(--success)]">✓</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Prior Coverage */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b border-[var(--border)] pb-2">
              Prior Coverage
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Prior Carrier
                </label>
                <input
                  type="text"
                  value={formData.priorCarrier}
                  onChange={(e) => setFormData({ ...formData, priorCarrier: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Prior Premium
                </label>
                <input
                  type="number"
                  value={formData.priorPremium}
                  onChange={(e) => setFormData({ ...formData, priorPremium: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                />
              </div>
            </div>
          </section>

          {/* Claims History */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b border-[var(--border)] pb-2">
              Claims History (Last 5 Years)
            </h3>
            <div className="space-y-3">
              {formData.claimsHistory.map((claim, idx) => (
                <div key={idx} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold text-[var(--accent-light)]">{claim.year}</span>
                      <span className="mx-2 text-[var(--text-muted)]">·</span>
                      <span>{claim.type}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${claim.status === 'Closed' ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--warning)]/20 text-[var(--warning)]'}`}>
                      {claim.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">{claim.description}</p>
                  <div className="text-sm font-semibold text-[var(--accent)]">
                    ${claim.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </form>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-end">
        <Link
          href="/demo?step=acord"
          className="bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-lg"
        >
          Generate ACORD Forms →
        </Link>
      </div>
    </div>
  );
}

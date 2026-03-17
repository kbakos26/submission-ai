'use client';

import { useState } from 'react';
import Link from 'next/link';
import { dashboardSubmissions } from '@/lib/synthetic-data';
import { SubmissionStatus } from '@/types';

const statusConfig: Record<SubmissionStatus, { label: string; color: string; bgColor: string }> = {
  'document-collection': { label: 'Document Collection', color: 'text-[var(--warning)]', bgColor: 'bg-[var(--warning)]/10' },
  'data-extraction': { label: 'Data Extraction', color: 'text-[var(--accent)]', bgColor: 'bg-[var(--accent)]/10' },
  'forms-review': { label: 'Forms Review', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  'package-ready': { label: 'Package Ready', color: 'text-[var(--success)]', bgColor: 'bg-[var(--success)]/10' },
};

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const stats = {
    total: dashboardSubmissions.length,
    inProgress: dashboardSubmissions.filter(s => s.status === 'data-extraction' || s.status === 'forms-review').length,
    awaitingDocs: dashboardSubmissions.filter(s => s.status === 'document-collection').length,
    ready: dashboardSubmissions.filter(s => s.status === 'package-ready').length,
  };

  const filteredSubmissions = dashboardSubmissions.filter(sub =>
    sub.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.assignedBroker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border)] sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <h1 className="text-2xl font-bold text-[var(--accent)] cursor-pointer hover:text-[var(--accent-light)] transition-colors">
                SubmissionAI
              </h1>
            </Link>
            <nav className="flex gap-6 text-sm">
              <a href="#" className="text-[var(--text-primary)] font-medium">Dashboard</a>
              <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Analytics</a>
              <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Settings</a>
            </nav>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            Demo Mode · <Link href="/" className="text-[var(--accent)] hover:underline">Exit</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 shadow-sm">
            <div className="text-sm text-[var(--text-muted)] mb-1 font-medium">Total Submissions</div>
            <div className="text-3xl font-bold text-[var(--text-primary)]">{stats.total}</div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 shadow-sm">
            <div className="text-sm text-[var(--text-muted)] mb-1 font-medium">In Progress</div>
            <div className="text-3xl font-bold text-[var(--accent)]">{stats.inProgress}</div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 shadow-sm">
            <div className="text-sm text-[var(--text-muted)] mb-1 font-medium">Awaiting Documents</div>
            <div className="text-3xl font-bold text-[var(--warning)]">{stats.awaitingDocs}</div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 shadow-sm">
            <div className="text-sm text-[var(--text-muted)] mb-1 font-medium">Ready to Submit</div>
            <div className="text-3xl font-bold text-[var(--success)]">{stats.ready}</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Submissions</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm w-64 shadow-sm"
            />
            <Link
              href="/demo/submission/new?step=upload"
              className="bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-semibold px-6 py-2 rounded-lg transition-all shadow-sm flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              <span>New Submission</span>
            </Link>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-[var(--bg-primary)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Lines of Business</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Date Created</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Broker</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => {
                const config = statusConfig[submission.status];
                let startStep = 'upload';
                if (submission.status === 'data-extraction') startStep = 'extraction';
                else if (submission.status === 'forms-review') startStep = 'acord';
                else if (submission.status === 'package-ready') startStep = 'package';
                
                return (
                  <tr
                    key={submission.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--text-primary)]">{submission.clientName}</div>
                      <div className="text-xs text-[var(--text-muted)]">{submission.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {submission.linesOfBusiness.map((line) => (
                          <span
                            key={line}
                            className="px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-xs text-[var(--text-secondary)]"
                          >
                            {line}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] transition-all"
                            style={{ width: `${submission.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[var(--text-secondary)] w-10 text-right">
                          {submission.progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {submission.dateCreated}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                      {submission.assignedBroker}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/demo/submission/${submission.id}?step=${startStep}`}
                        className="text-[var(--accent)] hover:text-[var(--accent-light)] font-medium text-sm transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

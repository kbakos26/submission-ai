"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] mb-8">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            AI-Powered Workflow Automation
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="text-[var(--text-primary)]">Commercial Insurance</span>
          <br />
          <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] bg-clip-text text-transparent">
            Submissions in Minutes
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-12 max-w-3xl mx-auto leading-relaxed">
          Transform 4-hour submission workflows into 30-minute automated processes. 
          AI-powered ACORD form generation, carrier matching, and quote comparison.
        </p>

        <Link
          href="/demo"
          className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-[var(--accent-glow)] hover:scale-105"
        >
          <span>Launch Demo</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
          {[
            { value: "90%", label: "Time Saved Per Submission" },
            { value: "73%", label: "Error Reduction" },
            { value: "2,000+", label: "Hours Saved Annually" },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <div className="text-4xl font-black text-[var(--accent)] mb-2">{stat.value}</div>
              <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-left max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            The Problem
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            Commercial insurance brokers waste <strong className="text-[var(--text-primary)]">3-5 hours per submission</strong> on manual data entry:
          </p>
          <ul className="space-y-2 text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--danger)] mt-1">✗</span>
              <span>Manually filling out ACORD forms (125, 126, 140)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--danger)] mt-1">✗</span>
              <span>Re-entering data into multiple carrier portals</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--danger)] mt-1">✗</span>
              <span>Comparing quotes in different formats</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--danger)] mt-1">✗</span>
              <span>Building client proposals manually</span>
            </li>
          </ul>
          <p className="text-[var(--text-muted)] text-sm mt-4">
            A 10-broker agency with 50 submissions/month wastes <strong>1,500-2,500 hours/year</strong>.
          </p>
        </div>

        <p className="text-sm text-[var(--text-muted)] mt-12">
          Built as a "Build First" submission for{" "}
          <a href="https://tenex.co" target="_blank" rel="noopener" className="text-[var(--accent)] hover:text-[var(--accent-light)] underline">
            Tenex AI Strategist
          </a>
          {" "}role
        </p>
      </div>
    </div>
  );
}

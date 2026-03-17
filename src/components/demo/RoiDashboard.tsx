'use client';

import { roiMetrics } from '@/lib/synthetic-data';
import Link from 'next/link';

export default function RoiDashboard() {
  // Calculate metrics
  const timeSavedPerSubmission = roiMetrics.avgTimePerSubmissionBefore - roiMetrics.avgTimePerSubmissionAfter;
  const totalHoursSavedPerMonth = timeSavedPerSubmission * roiMetrics.submissionsPerMonth;
  const totalHoursSavedPerYear = totalHoursSavedPerMonth * 12;
  const costSavedPerYear = totalHoursSavedPerYear * roiMetrics.avgBrokerHourlyCost;
  const additionalRevenuePerYear = roiMetrics.additionalPoliciesPerMonth * 12 * roiMetrics.avgCommissionPerPolicy;
  const totalFinancialImpact = costSavedPerYear + additionalRevenuePerYear;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Step 5: ROI Dashboard</h1>
        <p className="text-[var(--text-secondary)]">
          Quantified business impact metrics for this demo scenario.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 border border-[var(--accent)]/30 rounded-lg p-6">
          <div className="text-sm text-[var(--text-secondary)] mb-2">Time Saved per Submission</div>
          <div className="text-4xl font-bold text-[var(--accent-light)] mb-1">
            {timeSavedPerSubmission.toFixed(1)}h
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {roiMetrics.avgTimePerSubmissionBefore}h → {roiMetrics.avgTimePerSubmissionAfter}h
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--success)]/20 to-[var(--success)]/5 border border-[var(--success)]/30 rounded-lg p-6">
          <div className="text-sm text-[var(--text-secondary)] mb-2">Annual Hours Recovered</div>
          <div className="text-4xl font-bold text-[var(--success)] mb-1">
            {totalHoursSavedPerYear.toLocaleString()}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {roiMetrics.brokerCount} brokers × {roiMetrics.submissionsPerMonth} submissions/mo
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--warning)]/20 to-[var(--warning)]/5 border border-[var(--warning)]/30 rounded-lg p-6">
          <div className="text-sm text-[var(--text-secondary)] mb-2">Annual Cost Savings</div>
          <div className="text-4xl font-bold text-[var(--warning)] mb-1">
            ${costSavedPerYear.toLocaleString()}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {totalHoursSavedPerYear.toLocaleString()}h × ${roiMetrics.avgBrokerHourlyCost}/h
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--accent-light)]/20 to-[var(--accent-light)]/5 border border-[var(--accent-light)]/30 rounded-lg p-6">
          <div className="text-sm text-[var(--text-secondary)] mb-2">Total Annual Impact</div>
          <div className="text-4xl font-bold text-[var(--accent-light)] mb-1">
            ${totalFinancialImpact.toLocaleString()}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            Savings + additional revenue
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Time Efficiency */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>⏱️</span>
            <span>Time Efficiency</span>
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--text-secondary)]">Before SubmissionAI</span>
                <span className="font-semibold">{roiMetrics.avgTimePerSubmissionBefore}h per submission</span>
              </div>
              <div className="w-full h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--danger)]"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--text-secondary)]">After SubmissionAI</span>
                <span className="font-semibold">{roiMetrics.avgTimePerSubmissionAfter}h per submission</span>
              </div>
              <div className="w-full h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--success)]"
                  style={{ width: `${(roiMetrics.avgTimePerSubmissionAfter / roiMetrics.avgTimePerSubmissionBefore) * 100}%` }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--border)]">
              <div className="text-sm text-[var(--text-muted)] mb-1">Efficiency Gain</div>
              <div className="text-3xl font-bold text-[var(--success)]">
                {Math.round((1 - roiMetrics.avgTimePerSubmissionAfter / roiMetrics.avgTimePerSubmissionBefore) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Quality Improvements */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>✅</span>
            <span>Quality Improvements</span>
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[var(--text-secondary)]">Error Reduction</span>
                <span className="text-2xl font-bold text-[var(--success)]">{roiMetrics.errorReductionPercent}%</span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Auto-population eliminates manual data entry errors and omissions
              </p>
            </div>
            <div className="pt-4 border-t border-[var(--border)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[var(--text-secondary)]">Faster Binding</span>
                <span className="text-2xl font-bold text-[var(--accent-light)]">{roiMetrics.fasterBindingDays} days</span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Streamlined workflow accelerates quote-to-bind timeline
              </p>
            </div>
            <div className="pt-4 border-t border-[var(--border)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[var(--text-secondary)]">Data Consistency</span>
                <span className="text-2xl font-bold text-[var(--success)]">100%</span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Single data entry ensures consistency across all forms and carriers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Impact */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>📈</span>
          <span>Revenue Impact</span>
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-[var(--text-muted)] mb-2">Additional Policies/Month</div>
            <div className="text-3xl font-bold text-[var(--accent-light)] mb-2">
              +{roiMetrics.additionalPoliciesPerMonth}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              With time saved, brokers can write {roiMetrics.additionalPoliciesPerMonth} more policies per month
            </p>
          </div>
          <div>
            <div className="text-sm text-[var(--text-muted)] mb-2">Avg Commission/Policy</div>
            <div className="text-3xl font-bold mb-2">
              ${roiMetrics.avgCommissionPerPolicy.toLocaleString()}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Average broker commission on commercial policies
            </p>
          </div>
          <div>
            <div className="text-sm text-[var(--text-muted)] mb-2">Additional Annual Revenue</div>
            <div className="text-3xl font-bold text-[var(--success)] mb-2">
              ${additionalRevenuePerYear.toLocaleString()}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {roiMetrics.additionalPoliciesPerMonth} × 12 months × ${roiMetrics.avgCommissionPerPolicy.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Callout */}
      <div className="bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent-light)]/20 border border-[var(--accent)]/40 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold mb-3">Business Case Summary</h3>
        <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-3xl mx-auto">
          For a {roiMetrics.brokerCount}-broker agency writing {roiMetrics.submissionsPerMonth} submissions/month,
          SubmissionAI delivers <strong className="text-[var(--accent-light)]">${totalFinancialImpact.toLocaleString()}/year</strong> in
          combined cost savings and additional revenue, while reducing errors by {roiMetrics.errorReductionPercent}%
          and accelerating binding by {roiMetrics.fasterBindingDays} days.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
            <span className="text-[var(--text-muted)]">ROI Timeline:</span>
            <span className="ml-2 font-semibold">Immediate</span>
          </div>
          <div className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
            <span className="text-[var(--text-muted)]">Payback Period:</span>
            <span className="ml-2 font-semibold">&lt; 2 months</span>
          </div>
          <div className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
            <span className="text-[var(--text-muted)]">Implementation:</span>
            <span className="ml-2 font-semibold">2-4 weeks</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <Link
          href="/demo?step=quotes"
          className="px-6 py-3 border border-[var(--border)] hover:bg-[var(--bg-card)] rounded-lg transition-colors"
        >
          ← Back to Quotes
        </Link>
        <div className="flex gap-3">
          <Link
            href="/demo?step=intake"
            className="px-6 py-3 border border-[var(--border)] hover:bg-[var(--bg-card)] rounded-lg transition-colors"
          >
            Start Over
          </Link>
          <Link
            href="/"
            className="bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-lg"
          >
            Exit Demo
          </Link>
        </div>
      </div>
    </div>
  );
}

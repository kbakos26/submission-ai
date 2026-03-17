'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { DemoStep } from '@/types';

const steps: { id: DemoStep; label: string; icon: string }[] = [
  { id: 'intake', label: 'Client Intake', icon: '📋' },
  { id: 'acord', label: 'ACORD Forms', icon: '📄' },
  { id: 'carriers', label: 'Carrier Match', icon: '🎯' },
  { id: 'quotes', label: 'Quote Compare', icon: '📊' },
  { id: 'roi', label: 'ROI Dashboard', icon: '💰' },
];

export default function Sidebar() {
  const searchParams = useSearchParams();
  const currentStep = (searchParams.get('step') as DemoStep) || 'intake';

  return (
    <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border)]">
        <Link href="/" className="block">
          <h2 className="text-xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] bg-clip-text text-transparent">
            SubmissionAI
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Demo Workflow</p>
        </Link>
      </div>

      {/* Navigation Steps */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const currentIndex = steps.findIndex(s => s.id === currentStep);
            const isCompleted = index < currentIndex;

            return (
              <li key={step.id}>
                <Link
                  href={`/demo?step=${step.id}`}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive
                      ? 'bg-[var(--accent)] text-white shadow-lg'
                      : isCompleted
                      ? 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                    }
                  `}
                >
                  <span className="text-xl">{step.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold opacity-60">
                        Step {index + 1}
                      </span>
                      {isCompleted && <span className="text-[var(--success)]">✓</span>}
                    </div>
                    <div className="font-medium">{step.label}</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
        <p>Synthetic data demo</p>
        <p className="mt-1 opacity-60">No real API calls</p>
      </div>
    </aside>
  );
}

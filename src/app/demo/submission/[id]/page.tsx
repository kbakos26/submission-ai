'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { dashboardSubmissions, uploadedDocuments, extractedFields, requiredDocuments, coverLetterPreview, submissionPackageFiles } from '@/lib/synthetic-data';

const steps = [
  { id: 1, name: 'Document Upload', key: 'upload' },
  { id: 2, name: 'AI Data Extraction', key: 'extraction' },
  { id: 3, name: 'Missing Documents', key: 'missing' },
  { id: 4, name: 'ACORD Forms', key: 'acord' },
  { id: 5, name: 'Submission Package', key: 'package' },
];

function SubmissionFlowContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = params.id as string;
  const currentStepKey = searchParams.get('step') || 'upload';
  const currentStep = steps.findIndex(s => s.key === currentStepKey) + 1 || 1;

  const submission = dashboardSubmissions.find(s => s.id === submissionId);

  const goToStep = (stepKey: string) => {
    router.push(`/demo/submission/${submissionId}?step=${stepKey}`);
  };

  const nextStep = () => {
    const nextIndex = currentStep;
    if (nextIndex < steps.length) {
      goToStep(steps[nextIndex].key);
    }
  };

  if (!submission && submissionId !== 'new') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Submission Not Found</h2>
          <Link href="/demo" className="text-[var(--accent)] hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const clientName = submission?.clientName || 'New Submission';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/demo" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                ← Dashboard
              </Link>
              <div>
                <h1 className="text-xl font-bold">{clientName}</h1>
                <p className="text-sm text-[var(--text-muted)]">{submission?.id || 'Creating new submission'}</p>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                      ${currentStep >= step.id
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)]'
                      }
                    `}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <div className="ml-2">
                    <div className={`text-xs font-medium ${currentStep >= step.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                      {step.name}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentStepKey === 'upload' && <DocumentUploadStep />}
        {currentStepKey === 'extraction' && <DataExtractionStep />}
        {currentStepKey === 'missing' && <MissingDocumentsStep />}
        {currentStepKey === 'acord' && <AcordFormsStep />}
        {currentStepKey === 'package' && <SubmissionPackageStep />}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => currentStep > 1 && goToStep(steps[currentStep - 2].key)}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'opacity-50 cursor-not-allowed bg-[var(--bg-card)] text-[var(--text-muted)]'
                : 'border border-[var(--border)] hover:bg-[var(--bg-card)]'
            }`}
          >
            ← Previous
          </button>
          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-lg"
            >
              Continue →
            </button>
          ) : (
            <Link
              href="/demo"
              className="bg-[var(--success)] hover:bg-[var(--success)]/90 text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-lg inline-block"
            >
              Complete & Return to Dashboard
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

function DocumentUploadStep() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Step 1: Document Upload</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Upload required documents for AI data extraction. Files will be processed automatically.
      </p>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-12 mb-6 text-center bg-[var(--bg-card)] hover:border-[var(--accent)] transition-colors cursor-pointer">
        <div className="text-4xl mb-3">📁</div>
        <h3 className="text-lg font-semibold mb-2">Drag & Drop Files Here</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          or click to browse your computer
        </p>
        <button className="px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg transition-colors">
          Select Files
        </button>
        <p className="text-xs text-[var(--text-muted)] mt-4">
          Supported: PDF, Excel, Word, Images · Max 50MB per file
        </p>
      </div>

      {/* Documents Needed */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Documents Needed</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {['Dec Pages (Current Coverage)', 'Loss Runs (5 Years)', 'Financial Statements', 'Property Schedule', 'Liquor License Copies', 'Certificate of Occupancy', 'Fire Suppression Reports', 'Auto Schedule (if applicable)'].map((doc) => (
            <div key={doc} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <span className="text-[var(--text-muted)]">•</span>
              {doc}
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded Files */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="font-semibold mb-4">Uploaded Documents ({uploadedDocuments.length})</h3>
        <div className="space-y-2">
          {uploadedDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--accent)]/20 rounded flex items-center justify-center text-xl">
                  📄
                </div>
                <div>
                  <div className="font-medium text-sm">{doc.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{doc.type} · {doc.uploadedAt}</div>
                </div>
              </div>
              <span className="text-[var(--success)] flex items-center gap-1 text-sm">
                <span>✓</span>
                <span>Extracted</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataExtractionStep() {
  const categories = ['Business Info', 'Operations', 'Coverage History', 'Claims History', 'Property Details'];
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return { text: 'text-[var(--success)]', bg: 'bg-[var(--success)]/20', border: 'border-[var(--success)]' };
    if (confidence >= 85) return { text: 'text-[var(--warning)]', bg: 'bg-[var(--warning)]/20', border: 'border-[var(--warning)]' };
    return { text: 'text-[var(--danger)]', bg: 'bg-[var(--danger)]/20', border: 'border-[var(--danger)]' };
  };

  const totalFields = extractedFields.length;
  const verified = extractedFields.filter(f => f.confidence >= 95).length;
  const needsReview = extractedFields.filter(f => f.confidence < 95).length;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Step 2: AI Data Extraction</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Review extracted data. Fields with low confidence are flagged for manual verification.
      </p>

      {/* Summary */}
      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">{totalFields} fields extracted</span>
            <span className="mx-2 text-[var(--text-muted)]">·</span>
            <span className="text-[var(--success)]">{verified} verified ({Math.round(verified / totalFields * 100)}%)</span>
            <span className="mx-2 text-[var(--text-muted)]">·</span>
            <span className="text-[var(--warning)]">{needsReview} need review</span>
          </div>
        </div>
      </div>

      {/* Extracted Data by Category */}
      <div className="space-y-4">
        {categories.map((category) => {
          const fields = extractedFields.filter(f => f.category === category);
          return (
            <div key={category} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6">
              <h3 className="font-semibold mb-4">{category}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {fields.map((field, idx) => {
                  const colors = getConfidenceColor(field.confidence);
                  return (
                    <div key={idx} className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-xs text-[var(--text-muted)]">{field.label}</div>
                        <div className={`text-xs font-semibold ${colors.text}`}>
                          {field.confidence}%
                        </div>
                      </div>
                      <div className="font-medium text-sm mb-1">{field.value}</div>
                      <div className="text-xs text-[var(--text-muted)]">Source: {field.source}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MissingDocumentsStep() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Step 3: Missing Documents & Follow-Up</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Track required documents and manage automated client follow-ups.
      </p>

      {/* Document Checklist */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Document Checklist</h3>
        <div className="space-y-2">
          {requiredDocuments.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`
                  w-6 h-6 rounded flex items-center justify-center text-sm
                  ${doc.status === 'received' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                    doc.status === 'requested' ? 'bg-[var(--warning)]/20 text-[var(--warning)]' :
                    'bg-[var(--danger)]/20 text-[var(--danger)]'}
                `}>
                  {doc.status === 'received' ? '✓' : doc.status === 'requested' ? '⏳' : '✗'}
                </div>
                <div>
                  <div className="font-medium text-sm">{doc.name}</div>
                  {doc.requestedDate && (
                    <div className="text-xs text-[var(--text-muted)]">Requested {doc.requestedDate}</div>
                  )}
                </div>
              </div>
              <div className="text-xs font-medium">
                {doc.status === 'received' && <span className="text-[var(--success)]">Received</span>}
                {doc.status === 'requested' && <span className="text-[var(--warning)]">Awaiting Response</span>}
                {doc.status === 'missing' && <span className="text-[var(--danger)]">Missing</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-Up Email Preview */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Automated Follow-Up Email Preview</h3>
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm font-mono">
          <div className="mb-4 pb-4 border-b border-[var(--border)]">
            <div className="text-[var(--text-muted)]">To:</div>
            <div className="text-[var(--text-primary)]">contact@pacificcoastdining.com</div>
            <div className="text-[var(--text-muted)] mt-2">Subject:</div>
            <div className="text-[var(--text-primary)]">Action Required: Additional Documents for Insurance Submission</div>
          </div>
          <div className="text-[var(--text-secondary)] space-y-2">
            <p>Hi Pacific Coast Dining Team,</p>
            <p>We're making great progress on your insurance submission! To finalize your application, we need the following documents:</p>
            <ul className="list-disc list-inside ml-4 my-2">
              <li>Liquor License Copies (all locations)</li>
              <li>Certificate of Occupancy</li>
            </ul>
            <p>You can upload these securely at: <span className="text-[var(--accent)]">https://submit.submissionai.io/upload/sub-001</span></p>
            <p>If you have any questions, reply to this email or call us at (555) 123-4567.</p>
            <p className="mt-4">Best regards,<br />Your Broker Team</p>
          </div>
        </div>
        <button className="mt-4 px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg transition-colors">
          Send Follow-Up
        </button>
      </div>

      {/* Follow-Up Timeline */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="font-semibold mb-4">Automated Follow-Up Timeline</h3>
        <div className="space-y-4">
          {[
            { day: 'Day 1', action: 'Initial document request sent', status: 'complete' },
            { day: 'Day 3', action: 'First follow-up reminder', status: 'complete' },
            { day: 'Day 5', action: 'Text + Email reminder', status: 'pending' },
            { day: 'Day 7', action: 'Broker escalation alert', status: 'pending' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${item.status === 'complete' ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}`} />
              <div className="flex-1">
                <div className="font-medium text-sm">{item.day}</div>
                <div className="text-xs text-[var(--text-muted)]">{item.action}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AcordFormsStep() {
  const [selectedForm, setSelectedForm] = useState('acord-125');

  const forms = [
    { id: 'acord-125', name: 'ACORD 125', subtitle: 'Commercial Insurance Application', completion: 98.2 },
    { id: 'acord-126', name: 'ACORD 126', subtitle: 'General Liability Section', completion: 99.1 },
    { id: 'acord-140', name: 'ACORD 140', subtitle: 'Property Section', completion: 96.8 },
    { id: 'acord-130', name: 'ACORD 130', subtitle: 'Workers Compensation', completion: 100 },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Step 4: ACORD Forms Auto-Fill</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Review auto-populated ACORD forms. Flagged fields can be edited before approval.
      </p>

      {/* Form Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--border)]">
        {forms.map((form) => (
          <button
            key={form.id}
            onClick={() => setSelectedForm(form.id)}
            className={`px-4 py-3 font-medium transition-colors ${
              selectedForm === form.id
                ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {form.name}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 mb-6">
        {forms.map((form) => {
          if (selectedForm !== form.id) return null;
          return (
            <div key={form.id}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1">{form.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{form.subtitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[var(--success)]">{form.completion}%</div>
                  <div className="text-xs text-[var(--text-muted)]">Auto-filled</div>
                </div>
              </div>

              {/* Simulated Form Preview */}
              <div className="space-y-6">
                <section>
                  <h4 className="font-semibold mb-3 text-sm text-[var(--accent-light)]">SECTION 1: NAMED INSURED</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-[var(--bg-secondary)] rounded">
                      <div className="text-xs text-[var(--text-muted)] mb-1">Legal Name</div>
                      <div className="font-medium">Pacific Coast Dining Group, Inc.</div>
                    </div>
                    <div className="p-3 bg-[var(--bg-secondary)] rounded">
                      <div className="text-xs text-[var(--text-muted)] mb-1">DBA</div>
                      <div className="font-medium">Pacific Coast Dining</div>
                    </div>
                    <div className="p-3 bg-[var(--bg-secondary)] rounded md:col-span-2">
                      <div className="text-xs text-[var(--text-muted)] mb-1">Mailing Address</div>
                      <div className="font-medium">4200 Harbor Boulevard, Suite 300, Costa Mesa, CA 92626</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="font-semibold mb-3 text-sm text-[var(--accent-light)]">SECTION 2: BUSINESS INFORMATION</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 bg-[var(--bg-secondary)] rounded">
                      <div className="text-xs text-[var(--text-muted)] mb-1">NAICS Code</div>
                      <div className="font-medium">722511</div>
                    </div>
                    <div className="p-3 bg-[var(--bg-secondary)] rounded">
                      <div className="text-xs text-[var(--text-muted)] mb-1">Years in Business</div>
                      <div className="font-medium">14</div>
                    </div>
                    <div className="p-3 bg-[var(--bg-secondary)] rounded">
                      <div className="text-xs text-[var(--text-muted)] mb-1">Annual Revenue</div>
                      <div className="font-medium">$12,000,000</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="font-semibold mb-3 text-sm text-[var(--accent-light)]">SECTION 3: COVERAGE REQUESTED</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {['General Liability', 'Property', 'Liquor Liability', 'Workers Compensation', 'Commercial Umbrella'].map((line) => (
                      <div key={line} className="flex items-center gap-2 p-3 bg-[var(--bg-secondary)] rounded">
                        <span className="text-[var(--success)]">☑</span>
                        <span className="font-medium text-sm">{line}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          );
        })}
      </div>

      {/* Approval */}
      <div className="flex items-center justify-between bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg p-4">
        <div>
          <div className="font-semibold">All forms ready for review</div>
          <div className="text-sm text-[var(--text-secondary)]">
            {forms.length} forms generated · Average {(forms.reduce((acc, f) => acc + f.completion, 0) / forms.length).toFixed(1)}% auto-fill rate
          </div>
        </div>
        <button className="px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg transition-colors font-medium">
          Approve All Forms
        </button>
      </div>
    </div>
  );
}

function SubmissionPackageStep() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Step 5: Submission Package</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Your complete submission package is assembled and ready to send to carriers.
      </p>

      {/* Processing Time Banner */}
      <div className="bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-[var(--success)]">✓ Package Complete</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">
              Total processing time: <strong className="text-[var(--success)]">12 minutes</strong> (vs. estimated 4.5 hours manual)
            </div>
          </div>
          <div className="text-4xl">🎉</div>
        </div>
      </div>

      {/* File Tree */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Package Contents</h3>
        <div className="space-y-1 font-mono text-sm">
          <div className="flex items-center gap-2 p-2 hover:bg-[var(--bg-secondary)] rounded">
            <span className="text-xl">📁</span>
            <span className="font-semibold">Pacific Coast Dining Group — Submission Package</span>
          </div>
          <div className="ml-6 space-y-1">
            {submissionPackageFiles.map((file, idx) => (
              <div key={idx}>
                {file.type === 'file' ? (
                  <div className="flex items-center gap-2 p-2 hover:bg-[var(--bg-secondary)] rounded cursor-pointer">
                    <span className="text-lg">📄</span>
                    <span className="text-[var(--text-secondary)]">{file.name}</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 p-2 hover:bg-[var(--bg-secondary)] rounded">
                      <span className="text-xl">📁</span>
                      <span className="font-semibold">{file.name}</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {file.children?.map((child, childIdx) => (
                        <div key={childIdx} className="flex items-center gap-2 p-2 hover:bg-[var(--bg-secondary)] rounded cursor-pointer">
                          <span className="text-lg">📄</span>
                          <span className="text-[var(--text-secondary)]">{child.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cover Letter Preview */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">AI-Generated Cover Letter</h3>
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm whitespace-pre-line text-[var(--text-secondary)] max-h-96 overflow-y-auto">
          {coverLetterPreview}
        </div>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg transition-all font-medium">
          <span className="text-xl">⬇</span>
          <span>Download Package (ZIP)</span>
        </button>
        <button className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--border)] hover:bg-[var(--bg-card)] rounded-lg transition-all font-medium">
          <span className="text-xl">📤</span>
          <span>Export to AMS360</span>
        </button>
      </div>
    </div>
  );
}

export default function SubmissionFlowPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">Loading...</div>}>
      <SubmissionFlowContent />
    </Suspense>
  );
}

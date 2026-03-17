'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { dashboardSubmissions, uploadedDocuments, extractedFields, requiredDocuments, coverLetterPreview, submissionPackageFiles } from '@/lib/synthetic-data';
import { ExtractedField, UploadedDocument, RequiredDocument } from '@/types';

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

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedField[]>([]);
  const [requiredDocs, setRequiredDocs] = useState<RequiredDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formsApproved, setFormsApproved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const submission = dashboardSubmissions.find(s => s.id === submissionId);

  useEffect(() => {
    if (currentStepKey === 'upload' && documents.length === 0) {
      // Auto-load sample data for demo
      setTimeout(() => {
        setDocuments(uploadedDocuments);
      }, 500);
    }
    if (currentStepKey === 'extraction' && extractedData.length === 0 && documents.length > 0) {
      setIsProcessing(true);
      setTimeout(() => {
        setExtractedData(extractedFields);
        setIsProcessing(false);
      }, 2500);
    }
    if (currentStepKey === 'missing' && requiredDocs.length === 0) {
      setRequiredDocs(requiredDocuments);
    }
  }, [currentStepKey, documents, extractedData, requiredDocs]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const goToStep = (stepKey: string) => {
    router.push(`/demo/submission/${submissionId}?step=${stepKey}`);
  };

  const nextStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    const nextIndex = currentStep;
    if (nextIndex < steps.length) {
      goToStep(steps[nextIndex].key);
    }
  };

  const canProceed = () => {
    if (currentStepKey === 'upload') return documents.length > 0;
    if (currentStepKey === 'extraction') return !isProcessing && extractedData.length > 0;
    if (currentStepKey === 'missing') return true;
    if (currentStepKey === 'acord') return formsApproved;
    if (currentStepKey === 'package') return true;
    return false;
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
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[var(--success)] text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

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
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id) || currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isClickable = isCompleted;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <button
                      onClick={() => isClickable && goToStep(step.key)}
                      disabled={!isClickable}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                        ${isCurrent
                          ? 'bg-[var(--accent)] text-white ring-4 ring-[var(--accent)]/20'
                          : isCompleted
                          ? 'bg-[var(--success)] text-white cursor-pointer hover:bg-[var(--success)]/90'
                          : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)]'
                        }
                      `}
                    >
                      {isCompleted ? '✓' : step.id}
                    </button>
                    <div className="ml-2">
                      <div className={`text-xs font-medium ${isCurrent || isCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                        {step.name}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 transition-colors ${isCompleted ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentStepKey === 'upload' && <DocumentUploadStep documents={documents} setDocuments={setDocuments} showToast={showToast} />}
        {currentStepKey === 'extraction' && <DataExtractionStep isProcessing={isProcessing} extractedData={extractedData} setExtractedData={setExtractedData} />}
        {currentStepKey === 'missing' && <MissingDocumentsStep requiredDocs={requiredDocs} setRequiredDocs={setRequiredDocs} showToast={showToast} />}
        {currentStepKey === 'acord' && <AcordFormsStep formsApproved={formsApproved} setFormsApproved={setFormsApproved} showToast={showToast} />}
        {currentStepKey === 'package' && <SubmissionPackageStep showToast={showToast} />}

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
              disabled={!canProceed()}
              className={`px-8 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                canProceed()
                  ? 'bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
              }`}
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

interface DocumentUploadStepProps {
  documents: UploadedDocument[];
  setDocuments: (docs: UploadedDocument[]) => void;
  showToast: (message: string) => void;
}

function DocumentUploadStep({ documents, setDocuments, showToast }: DocumentUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleLoadSampleData = () => {
    setDocuments(uploadedDocuments);
    showToast('Sample documents loaded successfully!');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Simulate file upload
    showToast('Files uploaded successfully!');
    handleLoadSampleData();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Step 1: Document Upload</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Upload required documents for AI data extraction. Files will be processed automatically.
      </p>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 mb-6 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-[var(--accent)] bg-[var(--accent)]/10'
            : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]'
        }`}
      >
        <div className="text-4xl mb-3">📁</div>
        <h3 className="text-lg font-semibold mb-2">Drag & Drop Files Here</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          or click to browse your computer
        </p>
        <button
          onClick={handleLoadSampleData}
          className="px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg transition-colors"
        >
          Load Sample Documents
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
      {documents.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 animate-fade-in">
          <h3 className="font-semibold mb-4">Uploaded Documents ({documents.length})</h3>
          <div className="space-y-2">
            {documents.map((doc, idx) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg animate-slide-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
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
                  <span>Ready</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface DataExtractionStepProps {
  isProcessing: boolean;
  extractedData: ExtractedField[];
  setExtractedData: (data: ExtractedField[]) => void;
}

function DataExtractionStep({ isProcessing, extractedData, setExtractedData }: DataExtractionStepProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const categories = ['Business Info', 'Operations', 'Coverage History', 'Claims History', 'Property Details'];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return { text: 'text-[var(--success)]', bg: 'bg-[var(--success)]/20', border: 'border-[var(--success)]' };
    if (confidence >= 85) return { text: 'text-[var(--warning)]', bg: 'bg-[var(--warning)]/20', border: 'border-[var(--warning)]' };
    return { text: 'text-[var(--danger)]', bg: 'bg-[var(--danger)]/20', border: 'border-[var(--danger)]' };
  };

  const handleEdit = (field: ExtractedField) => {
    setEditingField(`${field.category}-${field.label}`);
    setEditValue(field.value);
  };

  const handleSave = (field: ExtractedField) => {
    const updated = extractedData.map(f =>
      f.category === field.category && f.label === field.label
        ? { ...f, value: editValue, confidence: 100 }
        : f
    );
    setExtractedData(updated);
    setEditingField(null);
  };

  const totalFields = extractedData.length;
  const verified = extractedData.filter(f => f.confidence >= 95).length;
  const needsReview = extractedData.filter(f => f.confidence < 95).length;

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Analyzing Documents...</h2>
        <p className="text-[var(--text-secondary)]">AI is extracting data from uploaded documents</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-2">Step 2: AI Data Extraction</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Review extracted data. Fields with low confidence can be edited. Click any flagged field to correct it.
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
          const fields = extractedData.filter(f => f.category === category);
          return (
            <div key={category} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6">
              <h3 className="font-semibold mb-4">{category}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {fields.map((field) => {
                  const colors = getConfidenceColor(field.confidence);
                  const fieldKey = `${field.category}-${field.label}`;
                  const isEditing = editingField === fieldKey;
                  const needsReview = field.confidence < 95;

                  return (
                    <div
                      key={fieldKey}
                      className={`p-3 rounded-lg border transition-all ${colors.bg} ${colors.border} ${
                        needsReview && !isEditing ? 'cursor-pointer hover:shadow-lg' : ''
                      }`}
                      onClick={() => needsReview && !isEditing && handleEdit(field)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-xs text-[var(--text-muted)]">{field.label}</div>
                        <div className={`text-xs font-semibold ${colors.text}`}>
                          {field.confidence}%
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSave(field);
                              }}
                              className="px-3 py-1 bg-[var(--success)] text-white rounded text-xs hover:bg-[var(--success)]/90"
                            >
                              Save
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingField(null);
                              }}
                              className="px-3 py-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs hover:bg-[var(--bg-card)]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium text-sm mb-1">{field.value}</div>
                          <div className="text-xs text-[var(--text-muted)]">
                            Source: {field.source}
                            {needsReview && <span className="ml-2 text-[var(--warning)]">· Click to edit</span>}
                          </div>
                        </>
                      )}
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

interface MissingDocumentsStepProps {
  requiredDocs: RequiredDocument[];
  setRequiredDocs: (docs: RequiredDocument[]) => void;
  showToast: (message: string) => void;
}

function MissingDocumentsStep({ requiredDocs, setRequiredDocs, showToast }: MissingDocumentsStepProps) {
  const [emailExpanded, setEmailExpanded] = useState(true);

  const handleMarkReceived = (index: number) => {
    const updated = [...requiredDocs];
    updated[index] = { ...updated[index], status: 'received' };
    setRequiredDocs(updated);
    showToast(`${updated[index].name} marked as received`);
  };

  const handleSendFollowUp = () => {
    const updated = requiredDocs.map(doc =>
      doc.status === 'missing' ? { ...doc, status: 'requested' as const, requestedDate: new Date().toISOString().split('T')[0] } : doc
    );
    setRequiredDocs(updated);
    showToast('Follow-up email sent to client!');
  };

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
          {requiredDocs.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className={`
                  w-6 h-6 rounded flex items-center justify-center text-sm
                  ${doc.status === 'received' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                    doc.status === 'requested' ? 'bg-[var(--warning)]/20 text-[var(--warning)]' :
                    'bg-[var(--danger)]/20 text-[var(--danger)]'}
                `}>
                  {doc.status === 'received' ? '✓' : doc.status === 'requested' ? '⏳' : '✗'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{doc.name}</div>
                  {doc.requestedDate && (
                    <div className="text-xs text-[var(--text-muted)]">Requested {doc.requestedDate}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium">
                  {doc.status === 'received' && <span className="text-[var(--success)]">Received</span>}
                  {doc.status === 'requested' && <span className="text-[var(--warning)]">Awaiting</span>}
                  {doc.status === 'missing' && <span className="text-[var(--danger)]">Missing</span>}
                </div>
                {doc.status === 'missing' && (
                  <button
                    onClick={() => handleMarkReceived(idx)}
                    className="px-3 py-1 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded text-xs transition-colors"
                  >
                    Mark Received
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-Up Email Preview */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Automated Follow-Up Email Preview</h3>
          <button
            onClick={() => setEmailExpanded(!emailExpanded)}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            {emailExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
        {emailExpanded && (
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm font-mono animate-fade-in">
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
                {requiredDocs.filter(d => d.status === 'missing').map((doc, idx) => (
                  <li key={idx}>{doc.name}</li>
                ))}
              </ul>
              <p>You can upload these securely at: <span className="text-[var(--accent)] cursor-pointer hover:underline">https://submit.submissionai.io/upload/sub-001</span></p>
              <p>If you have any questions, reply to this email or call us at (555) 123-4567.</p>
              <p className="mt-4">Best regards,<br />Your Broker Team</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSendFollowUp}
          className="mt-4 px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg transition-colors"
        >
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

interface AcordFormsStepProps {
  formsApproved: boolean;
  setFormsApproved: (approved: boolean) => void;
  showToast: (message: string) => void;
}

function AcordFormsStep({ formsApproved, setFormsApproved, showToast }: AcordFormsStepProps) {
  const [selectedForm, setSelectedForm] = useState('acord-125');

  const forms = [
    { id: 'acord-125', name: 'ACORD 125', subtitle: 'Commercial Insurance Application', completion: 98.2 },
    { id: 'acord-126', name: 'ACORD 126', subtitle: 'General Liability Section', completion: 99.1 },
    { id: 'acord-140', name: 'ACORD 140', subtitle: 'Property Section', completion: 96.8 },
    { id: 'acord-130', name: 'ACORD 130', subtitle: 'Workers Compensation', completion: 100 },
  ];

  const handleApproveAll = () => {
    setFormsApproved(true);
    showToast('All forms approved successfully!');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Step 4: ACORD Forms Auto-Fill</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Review auto-populated ACORD forms. Click tabs to switch between forms.
      </p>

      {/* Form Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--border)]">
        {forms.map((form) => (
          <button
            key={form.id}
            onClick={() => setSelectedForm(form.id)}
            className={`px-4 py-3 font-medium transition-colors relative ${
              selectedForm === form.id
                ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {form.name}
            {formsApproved && (
              <span className="absolute -top-1 -right-1 text-[var(--success)] text-xs">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 mb-6 animate-fade-in">
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
      <div className={`flex items-center justify-between rounded-lg p-4 border transition-colors ${
        formsApproved
          ? 'bg-[var(--success)]/10 border-[var(--success)]/30'
          : 'bg-[var(--accent)]/10 border-[var(--accent)]/30'
      }`}>
        <div>
          <div className="font-semibold">
            {formsApproved ? '✓ All forms approved' : 'All forms ready for review'}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            {forms.length} forms generated · Average {(forms.reduce((acc, f) => acc + f.completion, 0) / forms.length).toFixed(1)}% auto-fill rate
          </div>
        </div>
        {!formsApproved && (
          <button
            onClick={handleApproveAll}
            className="px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg transition-colors font-medium"
          >
            Approve All Forms
          </button>
        )}
      </div>
    </div>
  );
}

interface SubmissionPackageStepProps {
  showToast: (message: string) => void;
}

function SubmissionPackageStep({ showToast }: SubmissionPackageStepProps) {
  const [expandedFolder, setExpandedFolder] = useState<string | null>('Supporting Documents');

  const handleDownload = () => {
    showToast('Package downloaded successfully!');
  };

  const handleExport = () => {
    showToast('Data exported to Applied Epic!');
  };

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
                  <div className="flex items-center gap-2 p-2 hover:bg-[var(--bg-secondary)] rounded cursor-pointer transition-colors">
                    <span className="text-lg">📄</span>
                    <span className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">{file.name}</span>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => setExpandedFolder(expandedFolder === file.name ? null : file.name)}
                      className="flex items-center gap-2 p-2 hover:bg-[var(--bg-secondary)] rounded w-full text-left transition-colors"
                    >
                      <span className="text-xl">{expandedFolder === file.name ? '📂' : '📁'}</span>
                      <span className="font-semibold">{file.name}</span>
                    </button>
                    {expandedFolder === file.name && (
                      <div className="ml-6 space-y-1 animate-fade-in">
                        {file.children?.map((child, childIdx) => (
                          <div key={childIdx} className="flex items-center gap-2 p-2 hover:bg-[var(--bg-secondary)] rounded cursor-pointer transition-colors">
                            <span className="text-lg">📄</span>
                            <span className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">{child.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
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

      {/* Summary Stats */}
      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Processing Summary</h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-[var(--accent-light)]">47</div>
            <div className="text-sm text-[var(--text-secondary)]">Fields Processed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--accent-light)]">4</div>
            <div className="text-sm text-[var(--text-secondary)]">Forms Generated</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--success)]">98.2%</div>
            <div className="text-sm text-[var(--text-secondary)]">Auto-Fill Rate</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg transition-all font-medium"
        >
          <span className="text-xl">⬇</span>
          <span>Download Package (ZIP)</span>
        </button>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--border)] hover:bg-[var(--bg-card)] rounded-lg transition-all font-medium"
        >
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

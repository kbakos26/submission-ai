'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  dashboardSubmissions,
  uploadedDocuments,
  extractedFields,
  requiredDocuments,
  enhancedCoverLetter,
  submissionPackageFiles,
  documentScanProgress,
  acordFormData,
} from '@/lib/synthetic-data';
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
  const [scanningDoc, setScanningDoc] = useState<string | null>(null);
  const [formsApproved, setFormsApproved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const submission = dashboardSubmissions.find(s => s.id === submissionId);

  useEffect(() => {
    // Always load documents if missing (for any step)
    if (documents.length === 0) {
      setTimeout(() => {
        setDocuments(uploadedDocuments);
      }, currentStepKey === 'upload' ? 500 : 100);
    }
    if (currentStepKey === 'extraction' && extractedData.length === 0 && documents.length > 0) {
      setIsProcessing(true);
      let totalDelay = 0;
      documentScanProgress.forEach((scan, idx) => {
        totalDelay += scan.delay;
        setTimeout(() => {
          setScanningDoc(scan.status);
        }, totalDelay);
      });
      setTimeout(() => {
        setScanningDoc(null);
        setExtractedData(extractedFields);
        setIsProcessing(false);
      }, totalDelay + 800);
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
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[var(--success)] text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          ✓ {toast}
        </div>
      )}

      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border)] sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/demo" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                ← Dashboard
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">{clientName}</h1>
                <p className="text-sm text-[var(--text-muted)]">{submission?.id || 'Creating new submission'}</p>
              </div>
            </div>
          </div>

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
                          ? 'bg-[var(--accent)] text-white ring-4 ring-[var(--accent-glow)]'
                          : isCompleted
                          ? 'bg-[var(--success)] text-white cursor-pointer hover:bg-[var(--success)]/90'
                          : 'bg-white text-[var(--text-muted)] border border-[var(--border)]'
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentStepKey === 'upload' && <DocumentUploadStep documents={documents} setDocuments={setDocuments} showToast={showToast} />}
        {currentStepKey === 'extraction' && <DataExtractionStep isProcessing={isProcessing} scanningDoc={scanningDoc} extractedData={extractedData} setExtractedData={setExtractedData} />}
        {currentStepKey === 'missing' && <MissingDocumentsStep requiredDocs={requiredDocs} setRequiredDocs={setRequiredDocs} showToast={showToast} />}
        {currentStepKey === 'acord' && <AcordFormsStep formsApproved={formsApproved} setFormsApproved={setFormsApproved} showToast={showToast} />}
        {currentStepKey === 'package' && <SubmissionPackageStep showToast={showToast} />}

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => currentStep > 1 && goToStep(steps[currentStep - 2].key)}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'opacity-50 cursor-not-allowed bg-white text-[var(--text-muted)] border border-[var(--border)]'
                : 'border border-[var(--border)] bg-white hover:bg-[var(--bg-card-hover)] shadow-sm'
            }`}
          >
            ← Previous
          </button>
          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                canProceed()
                  ? 'bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white shadow-sm'
                  : 'bg-gray-100 text-[var(--text-muted)] opacity-50 cursor-not-allowed border border-[var(--border)]'
              }`}
            >
              Continue →
            </button>
          ) : (
            <Link
              href="/demo"
              className="bg-[var(--success)] hover:bg-[var(--success)]/90 text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-sm inline-block"
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
    showToast('Files uploaded successfully!');
    handleLoadSampleData();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Step 1: Document Upload</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Upload required documents for AI data extraction. Files will be processed automatically.
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 mb-6 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-[var(--accent)] bg-[var(--accent-glow)]'
            : 'border-[var(--border)] bg-white hover:border-[var(--accent)]'
        }`}
      >
        <div className="text-4xl mb-3">📁</div>
        <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">Drag & Drop Files Here</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          or click to browse your computer
        </p>
        <button
          onClick={handleLoadSampleData}
          className="px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg transition-colors shadow-sm"
        >
          Load Sample Documents
        </button>
        <p className="text-xs text-[var(--text-muted)] mt-4">
          Supported: PDF, Excel, Word, Images · Max 50MB per file
        </p>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-[var(--text-primary)]">Documents Needed</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {['Dec Pages (Current Coverage)', 'Loss Runs (5 Years)', 'Financial Statements', 'Property Schedule', 'Liquor License Copies', 'Certificate of Occupancy', 'Fire Suppression Reports', 'Auto Schedule (if applicable)'].map((doc) => (
            <div key={doc} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <span className="text-[var(--text-muted)]">•</span>
              {doc}
            </div>
          ))}
        </div>
      </div>

      {documents.length > 0 && (
        <div className="bg-white border border-[var(--border)] rounded-lg p-6 animate-fade-in shadow-sm">
          <h3 className="font-semibold mb-4 text-[var(--text-primary)]">Uploaded Documents ({documents.length})</h3>
          <div className="space-y-2">
            {documents.map((doc, idx) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg animate-slide-in border border-[var(--border)]"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--accent-glow)] rounded flex items-center justify-center text-xl">
                    📄
                  </div>
                  <div>
                    <div className="font-medium text-sm text-[var(--text-primary)]">{doc.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{doc.type} · {doc.uploadedAt}</div>
                  </div>
                </div>
                <span className="text-[var(--success)] flex items-center gap-1 text-sm font-medium">
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
  scanningDoc: string | null;
  extractedData: ExtractedField[];
  setExtractedData: (data: ExtractedField[]) => void;
}

function DataExtractionStep({ isProcessing, scanningDoc, extractedData, setExtractedData }: DataExtractionStepProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const categories = ['Business Info', 'Operations', 'Coverage History', 'Claims History', 'Property Details'];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return { text: 'text-[var(--success)]', bg: 'bg-green-50', border: 'border-green-200' };
    if (confidence >= 85) return { text: 'text-[var(--warning)]', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { text: 'text-[var(--danger)]', bg: 'bg-red-50', border: 'border-red-200' };
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
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl animate-sparkle">✨</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">AI Analyzing Documents...</h2>
        {scanningDoc && (
          <div className="flex items-center gap-2 text-[var(--text-secondary)] animate-fade-in">
            <span className="text-[var(--accent)]">✓</span>
            <span>{scanningDoc}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Step 2: AI Data Extraction</h2>
        <span className="px-2 py-1 bg-[var(--accent-glow)] text-[var(--accent)] text-xs font-semibold rounded flex items-center gap-1">
          <span className="animate-sparkle">✨</span>
          <span>AI Generated</span>
        </span>
      </div>
      <p className="text-[var(--text-secondary)] mb-6">
        Review extracted data. Fields with low confidence can be edited. Click any flagged field to correct it.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-[var(--text-primary)]">{totalFields} fields extracted</span>
            <span className="mx-2 text-[var(--text-muted)]">·</span>
            <span className="text-[var(--success)] font-medium">{verified} verified ({Math.round(verified / totalFields * 100)}%)</span>
            <span className="mx-2 text-[var(--text-muted)]">·</span>
            <span className="text-[var(--warning)] font-medium">{needsReview} need review</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const fields = extractedData.filter(f => f.category === category);
          return (
            <div key={category} className="bg-white border border-[var(--border)] rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4 text-[var(--text-primary)]">{category}</h3>
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
                        needsReview && !isEditing ? 'cursor-pointer hover:shadow-md' : ''
                      }`}
                      onClick={() => needsReview && !isEditing && handleEdit(field)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-xs text-[var(--text-muted)] font-medium">{field.label}</div>
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
                            className="w-full px-2 py-1 bg-white border border-[var(--border)] rounded text-sm"
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
                              className="px-3 py-1 bg-white border border-[var(--border)] rounded text-xs hover:bg-[var(--bg-card-hover)]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium text-sm mb-1 text-[var(--text-primary)]">{field.value}</div>
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
      <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Step 3: Missing Documents & Follow-Up</h2>
      <p className="text-[var(--text-secondary)] mb-6">
        Track required documents and manage automated client follow-ups.
      </p>

      <div className="bg-white border border-[var(--border)] rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-[var(--text-primary)]">Document Checklist</h3>
        <div className="space-y-2">
          {requiredDocs.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-3 flex-1">
                <div className={`
                  w-6 h-6 rounded flex items-center justify-center text-sm font-semibold
                  ${doc.status === 'received' ? 'bg-green-100 text-[var(--success)]' :
                    doc.status === 'requested' ? 'bg-orange-100 text-[var(--warning)]' :
                    'bg-red-100 text-[var(--danger)]'}
                `}>
                  {doc.status === 'received' ? '✓' : doc.status === 'requested' ? '⏳' : '✗'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-[var(--text-primary)]">{doc.name}</div>
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

      <div className="bg-white border border-[var(--border)] rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--text-primary)]">Automated Follow-Up Email Preview</h3>
          <button
            onClick={() => setEmailExpanded(!emailExpanded)}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            {emailExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
        {emailExpanded && (
          <div className="bg-[var(--bg-primary)] rounded-lg p-4 text-sm font-mono animate-fade-in border border-[var(--border)]">
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
          className="mt-4 px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg transition-colors shadow-sm"
        >
          Send Follow-Up
        </button>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-[var(--text-primary)]">Automated Follow-Up Timeline</h3>
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
                <div className="font-medium text-sm text-[var(--text-primary)]">{item.day}</div>
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

  const renderAcord125 = () => (
    <div className="space-y-8">
      {/* Agency Info */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-semibold text-sm text-[var(--accent)]">AGENCY INFORMATION</h4>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[var(--accent)] rounded">Auto-filled ✓</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Agency Name</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.agency.name}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Producer Code</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.agency.producerCode}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)] md:col-span-2">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Address</div>
            <div className="font-medium text-[var(--text-primary)]">
              {acordFormData.acord125.agency.address}, {acordFormData.acord125.agency.city}, {acordFormData.acord125.agency.state} {acordFormData.acord125.agency.zip}
            </div>
          </div>
        </div>
      </section>

      {/* Applicant Information */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-semibold text-sm text-[var(--accent)]">APPLICANT INFORMATION</h4>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[var(--accent)] rounded">Auto-filled ✓</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Legal Name</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.namedInsured.name}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">DBA</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.namedInsured.dba}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)] md:col-span-2">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Mailing Address</div>
            <div className="font-medium text-[var(--text-primary)]">
              {acordFormData.acord125.namedInsured.mailingAddress}, {acordFormData.acord125.namedInsured.city}, {acordFormData.acord125.namedInsured.state} {acordFormData.acord125.namedInsured.zip}
            </div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">FEIN</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.namedInsured.fein}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Entity Type</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.namedInsured.entityType}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Phone</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.namedInsured.phone}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Website</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.namedInsured.website}</div>
          </div>
        </div>
      </section>

      {/* Nature of Business */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-semibold text-sm text-[var(--accent)]">NATURE OF BUSINESS</h4>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[var(--accent)] rounded">Auto-filled ✓</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">NAICS Code</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.businessInfo.naicsCode}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{acordFormData.acord125.businessInfo.naicsDescription}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Years in Business</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.businessInfo.yearsInBusiness}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Years with Agent</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.businessInfo.yearsWithCurrentAgent}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Annual Revenue</div>
            <div className="font-medium text-[var(--text-primary)]">${acordFormData.acord125.businessInfo.totalAnnualRevenue.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Total Employees</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.businessInfo.totalEmployees}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Number of Locations</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.businessInfo.totalLocations}</div>
          </div>
        </div>
        <div className="p-4 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
          <div className="text-xs text-[var(--text-muted)] mb-2 font-medium">Description of Operations</div>
          <div className="text-sm text-[var(--text-primary)] leading-relaxed">{acordFormData.acord125.businessInfo.descriptionOfOperations}</div>
        </div>
      </section>

      {/* Lines of Business */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-semibold text-sm text-[var(--accent)]">COVERAGES REQUESTED</h4>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[var(--accent)] rounded">Auto-filled ✓</span>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {acordFormData.acord125.linesRequested.map((line) => (
            <div key={line.line} className={`flex items-center gap-2 p-3 rounded border ${
              line.checked ? 'bg-green-50 border-green-200' : 'bg-[var(--bg-primary)] border-[var(--border)]'
            }`}>
              <span className={line.checked ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}>
                {line.checked ? '☑' : '☐'}
              </span>
              <span className={`font-medium text-sm ${line.checked ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{line.line}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Prior Coverage */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-semibold text-sm text-[var(--accent)]">PRIOR COVERAGE INFORMATION</h4>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[var(--accent)] rounded">Auto-filled ✓</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Prior Carrier</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.priorCarrier.name}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Policy Number</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.priorCarrier.policyNumber}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Expiration Date</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.priorCarrier.expirationDate}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Total Premium</div>
            <div className="font-medium text-[var(--text-primary)]">${acordFormData.acord125.priorCarrier.totalPremium.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Years with Carrier</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.priorCarrier.yearsWithCarrier}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Reason for Change</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord125.priorCarrier.reasonForChange}</div>
          </div>
        </div>
      </section>

      {/* Loss History */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-semibold text-sm text-[var(--accent)]">LOSS HISTORY (LAST 5 YEARS)</h4>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[var(--accent)] rounded">Auto-filled ✓</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-primary)] border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--text-muted)]">Year</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--text-muted)]">Date of Loss</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--text-muted)]">Type</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--text-muted)]">Description</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-[var(--text-muted)]">Amount Paid</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-[var(--text-muted)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {acordFormData.acord125.lossHistory.map((claim, idx) => (
                <tr key={idx} className="border-b border-[var(--border)]">
                  <td className="px-4 py-3 text-[var(--text-primary)]">{claim.year}</td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">{claim.dateOfLoss}</td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">{claim.claimType}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{claim.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-[var(--text-primary)]">${claim.amountPaid.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 rounded text-xs bg-green-50 text-[var(--success)]">
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
  );

  const renderAcord126 = () => (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-semibold text-sm text-[var(--accent)]">GENERAL LIABILITY CLASSIFICATION</h4>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[var(--accent)] rounded">Auto-filled ✓</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">GL Classification Code</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord126.classification.code}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)] md:col-span-2">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Description</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord126.classification.description}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Gross Receipts</div>
            <div className="font-medium text-[var(--text-primary)]">${acordFormData.acord126.classification.grossReceipts.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Liquor Receipts</div>
            <div className="font-medium text-[var(--text-primary)]">${acordFormData.acord126.classification.liquorReceipts.toLocaleString()}</div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-semibold text-sm text-[var(--accent)]">LIMITS REQUESTED</h4>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[var(--accent)] rounded">Auto-filled ✓</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Each Occurrence</div>
            <div className="font-medium text-[var(--text-primary)]">${acordFormData.acord126.limitsRequested.eachOccurrence.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">General Aggregate</div>
            <div className="font-medium text-[var(--text-primary)]">${acordFormData.acord126.limitsRequested.generalAggregate.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Products/Completed Operations Aggregate</div>
            <div className="font-medium text-[var(--text-primary)]">${acordFormData.acord126.limitsRequested.productsCompletedOpsAggregate.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Personal & Advertising Injury</div>
            <div className="font-medium text-[var(--text-primary)]">${acordFormData.acord126.limitsRequested.personalAdvertisingInjury.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Damage to Rented Premises</div>
            <div className="font-medium text-[var(--text-primary)]">${acordFormData.acord126.limitsRequested.damageToRentedPremises.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Medical Expense (Any One Person)</div>
            <div className="font-medium text-[var(--text-primary)]">${acordFormData.acord126.limitsRequested.medicalExpense.toLocaleString()}</div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-semibold text-sm text-[var(--accent)]">LIQUOR LIABILITY</h4>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[var(--accent)] rounded">Auto-filled ✓</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Each Occurrence Limit</div>
            <div className="font-medium text-[var(--text-primary)]">${acordFormData.acord126.liquorLiability.eachOccurrence.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Aggregate Limit</div>
            <div className="font-medium text-[var(--text-primary)]">${acordFormData.acord126.liquorLiability.aggregate.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Liquor Sales %</div>
            <div className="font-medium text-[var(--text-primary)]">{acordFormData.acord126.liquorLiability.liquorSalesPercentage}%</div>
          </div>
        </div>
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-2 font-medium">Additional Coverages Included</div>
          <div className="grid md:grid-cols-2 gap-2">
            {acordFormData.acord126.additionalCoverages.map((coverage) => (
              <div key={coverage} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                <span className="text-[var(--success)]">✓</span>
                <span className="text-sm text-[var(--text-primary)]">{coverage}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const renderAcord140 = () => (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-semibold text-sm text-[var(--accent)]">PROPERTY SCHEDULE</h4>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[var(--accent)] rounded">Auto-filled ✓</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-primary)] border-b border-[var(--border)]">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-muted)]">Location Address</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--text-muted)]">Building</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--text-muted)]">Contents</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--text-muted)]">BI Limit</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-muted)]">Construction</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-[var(--text-muted)]">Class</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-[var(--text-muted)]">Sprinklered</th>
              </tr>
            </thead>
            <tbody>
              {acordFormData.acord140.locations.map((loc, idx) => (
                <tr key={idx} className="border-b border-[var(--border)]">
                  <td className="px-3 py-2 text-[var(--text-primary)]">{loc.address}</td>
                  <td className="px-3 py-2 text-right text-[var(--text-primary)]">${(loc.buildingValue / 1000).toFixed(0)}K</td>
                  <td className="px-3 py-2 text-right text-[var(--text-primary)]">${(loc.contentsValue / 1000).toFixed(0)}K</td>
                  <td className="px-3 py-2 text-right text-[var(--text-primary)]">${(loc.biLimit / 1000).toFixed(0)}K</td>
                  <td className="px-3 py-2 text-[var(--text-primary)]">{loc.construction}</td>
                  <td className="px-3 py-2 text-center text-[var(--text-primary)]">{loc.protectionClass}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={loc.sprinklered ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}>
                      {loc.sprinklered ? '✓' : '✗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-semibold text-sm text-[var(--accent)]">PROPERTY SUMMARY</h4>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[var(--accent)] rounded">Auto-filled ✓</span>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Total Building Value</div>
            <div className="font-medium text-lg text-[var(--text-primary)]">${(acordFormData.acord140.totalBuildingValue / 1000000).toFixed(1)}M</div>
          </div>
          <div className="p-4 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Total Contents Value</div>
            <div className="font-medium text-lg text-[var(--text-primary)]">${(acordFormData.acord140.totalContentsValue / 1000000).toFixed(1)}M</div>
          </div>
          <div className="p-4 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Total BI Limit</div>
            <div className="font-medium text-lg text-[var(--text-primary)]">${(acordFormData.acord140.totalBILimit / 1000000).toFixed(1)}M</div>
          </div>
          <div className="p-4 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Deductible</div>
            <div className="font-medium text-lg text-[var(--text-primary)]">${acordFormData.acord140.deductible.toLocaleString()}</div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderAcord130 = () => (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-semibold text-sm text-[var(--accent)]">WORKERS COMPENSATION - CALIFORNIA</h4>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[var(--accent)] rounded">Auto-filled ✓</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-primary)] border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--text-muted)]">Class Code</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--text-muted)]">Description</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-[var(--text-muted)]">Payroll</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-[var(--text-muted)]">Rate per $100</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-[var(--text-muted)]">Premium</th>
              </tr>
            </thead>
            <tbody>
              {acordFormData.acord130.classificationCodes.map((cls, idx) => (
                <tr key={idx} className="border-b border-[var(--border)]">
                  <td className="px-4 py-3 text-[var(--text-primary)]">{cls.code}</td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">{cls.description}</td>
                  <td className="px-4 py-3 text-right text-[var(--text-primary)]">${cls.payroll.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-[var(--text-primary)]">${cls.rate.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium text-[var(--text-primary)]">${cls.premium.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-semibold text-sm text-[var(--accent)]">WORKERS COMPENSATION SUMMARY</h4>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[var(--accent)] rounded">Auto-filled ✓</span>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Total Payroll</div>
            <div className="font-medium text-lg text-[var(--text-primary)]">${acordFormData.acord130.totalPayroll.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Experience Mod (EMR)</div>
            <div className="font-medium text-lg text-[var(--text-primary)]">{acordFormData.acord130.emr}</div>
          </div>
          <div className="p-4 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Deductible</div>
            <div className="font-medium text-lg text-[var(--text-primary)]">${acordFormData.acord130.deductible.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-[var(--bg-primary)] rounded border border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] mb-1 font-medium">Estimated Premium</div>
            <div className="font-medium text-lg text-[var(--text-primary)]">${acordFormData.acord130.totalPremium.toLocaleString()}</div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Step 4: ACORD Forms Auto-Fill</h2>
        <span className="px-2 py-1 bg-[var(--accent-glow)] text-[var(--accent)] text-xs font-semibold rounded flex items-center gap-1">
          <span className="animate-sparkle">✨</span>
          <span>AI Generated</span>
        </span>
      </div>
      <p className="text-[var(--text-secondary)] mb-6">
        Review auto-populated ACORD forms. Click tabs to switch between forms. All data extracted from uploaded documents.
      </p>

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

      <div className="bg-white border border-[var(--border)] rounded-lg p-6 mb-6 animate-fade-in shadow-sm">
        {forms.map((form) => {
          if (selectedForm !== form.id) return null;
          return (
            <div key={form.id}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1 text-[var(--text-primary)]">{form.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{form.subtitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[var(--success)]">{form.completion}%</div>
                  <div className="text-xs text-[var(--text-muted)]">Auto-filled</div>
                </div>
              </div>

              {selectedForm === 'acord-125' && renderAcord125()}
              {selectedForm === 'acord-126' && renderAcord126()}
              {selectedForm === 'acord-140' && renderAcord140()}
              {selectedForm === 'acord-130' && renderAcord130()}
            </div>
          );
        })}
      </div>

      <div className={`flex items-center justify-between rounded-lg p-4 border transition-colors shadow-sm ${
        formsApproved
          ? 'bg-green-50 border-green-200'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div>
          <div className="font-semibold text-[var(--text-primary)]">
            {formsApproved ? '✓ All forms approved' : 'All forms ready for review'}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            {forms.length} forms generated · Average {(forms.reduce((acc, f) => acc + f.completion, 0) / forms.length).toFixed(1)}% auto-fill rate
          </div>
        </div>
        {!formsApproved && (
          <button
            onClick={handleApproveAll}
            className="px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg transition-colors font-medium shadow-sm"
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
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Step 5: Submission Package</h2>
        <span className="px-2 py-1 bg-[var(--accent-glow)] text-[var(--accent)] text-xs font-semibold rounded flex items-center gap-1">
          <span className="animate-sparkle">✨</span>
          <span>AI Generated</span>
        </span>
      </div>
      <p className="text-[var(--text-secondary)] mb-6">
        Your complete submission package is assembled and ready to send to carriers.
      </p>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
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

      <div className="bg-white border border-[var(--border)] rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-[var(--text-primary)]">Package Contents</h3>
        <div className="space-y-1 font-mono text-sm">
          <div className="flex items-center gap-2 p-2 hover:bg-[var(--bg-primary)] rounded transition-colors">
            <span className="text-xl">📁</span>
            <span className="font-semibold text-[var(--text-primary)]">Pacific Coast Dining Group — Submission Package</span>
          </div>
          <div className="ml-6 space-y-1">
            {submissionPackageFiles.map((file, idx) => (
              <div key={idx}>
                {file.type === 'file' ? (
                  <div className="flex items-center gap-2 p-2 hover:bg-[var(--bg-primary)] rounded cursor-pointer transition-colors">
                    <span className="text-lg">📄</span>
                    <span className="text-[var(--text-secondary)]">{file.name}</span>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => setExpandedFolder(expandedFolder === file.name ? null : file.name)}
                      className="flex items-center gap-2 p-2 hover:bg-[var(--bg-primary)] rounded w-full text-left transition-colors"
                    >
                      <span className="text-xl">{expandedFolder === file.name ? '📂' : '📁'}</span>
                      <span className="font-semibold text-[var(--text-primary)]">{file.name}</span>
                    </button>
                    {expandedFolder === file.name && (
                      <div className="ml-6 space-y-1 animate-fade-in">
                        {file.children?.map((child, childIdx) => (
                          <div key={childIdx} className="flex items-center gap-2 p-2 hover:bg-[var(--bg-primary)] rounded cursor-pointer transition-colors">
                            <span className="text-lg">📄</span>
                            <span className="text-[var(--text-secondary)]">{child.name}</span>
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

      <div className="bg-white border border-[var(--border)] rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-[var(--text-primary)]">AI-Generated Cover Letter</h3>
        <div className="bg-[var(--bg-primary)] rounded-lg p-4 text-sm whitespace-pre-line text-[var(--text-secondary)] max-h-96 overflow-y-auto border border-[var(--border)]">
          {enhancedCoverLetter}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4 text-[var(--text-primary)]">Processing Summary</h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-[var(--accent)]">47</div>
            <div className="text-sm text-[var(--text-secondary)]">Fields Processed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--accent)]">4</div>
            <div className="text-sm text-[var(--text-secondary)]">Forms Generated</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--success)]">98.2%</div>
            <div className="text-sm text-[var(--text-secondary)]">Auto-Fill Rate</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white rounded-lg transition-all font-medium shadow-sm"
        >
          <span className="text-xl">⬇</span>
          <span>Download Package (ZIP)</span>
        </button>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--border)] bg-white hover:bg-[var(--bg-card-hover)] rounded-lg transition-all font-medium shadow-sm"
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

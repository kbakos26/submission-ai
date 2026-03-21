'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  dashboardSubmissions,
  uploadedDocuments,
  extractedFields,
  requiredDocuments,
  enhancedCoverLetter,
  submissionPackageFiles,
  acordFormData,
  sampleClient,
} from '@/lib/synthetic-data';
import { analyzeDocumentText } from '@/lib/ai-client';
import { ExtractedField, UploadedDocument, RequiredDocument } from '@/types';

// Data requirements by line of business
function getDataRequirements(selectedLines: string[], extractedData: any[], isRealUpload: boolean, parsedResults: any[]): any[] {
  const core: { name: string; category: string; extractKeys: string[]; inputType: string; placeholder?: string; options?: string[] }[] = [
    { name: 'Named Insured / Legal Entity Name', category: 'Business Info', extractKeys: ['named_insured', 'legal_name', 'Legal Name'], inputType: 'text', placeholder: 'e.g. Acme Corp, Inc.' },
    { name: 'FEIN / Tax ID', category: 'Business Info', extractKeys: ['fein', 'tax_id', 'FEIN'], inputType: 'text', placeholder: 'XX-XXXXXXX' },
    { name: 'Business Mailing Address', category: 'Business Info', extractKeys: ['mailing_address', 'address', 'Mailing Address'], inputType: 'text', placeholder: '123 Main St, City, ST 00000' },
    { name: 'Entity Type (Corp, LLC, etc.)', category: 'Business Info', extractKeys: ['entity_type', 'Entity Type'], inputType: 'select', options: ['Corporation', 'LLC', 'Partnership', 'Sole Proprietor', 'Joint Venture', 'Non-Profit', 'Trust'] },
    { name: 'NAICS / SIC Code', category: 'Business Info', extractKeys: ['naics', 'sic', 'NAICS Code'], inputType: 'text', placeholder: 'e.g. 722511' },
    { name: 'Description of Operations', category: 'Operations', extractKeys: ['description', 'operations', 'Description'], inputType: 'text', placeholder: 'Describe primary business operations...' },
    { name: 'Years in Business', category: 'Operations', extractKeys: ['years_in_business', 'Years in Business'], inputType: 'number', placeholder: 'e.g. 10' },
    { name: 'Total Annual Revenue', category: 'Operations', extractKeys: ['annual_revenue', 'revenue', 'Annual Revenue'], inputType: 'number', placeholder: 'e.g. 5000000' },
    { name: 'Number of Employees', category: 'Operations', extractKeys: ['employees', 'employee_count', 'Employee Count'], inputType: 'number', placeholder: 'e.g. 50' },
    { name: 'Current Dec Pages', category: 'Documents', extractKeys: ['dec_page'], inputType: 'file' },
    { name: 'Loss Runs (5 Years)', category: 'Documents', extractKeys: ['loss_run'], inputType: 'file' },
    { name: 'Prior Carrier / Policy Info', category: 'Coverage History', extractKeys: ['prior_carrier', 'Prior Carrier'], inputType: 'text', placeholder: 'Carrier name and policy number' },
  ];
  const lineReqs: Record<string, any[]> = {
    gl: [
      { name: 'GL Classification Code', category: 'General Liability', extractKeys: ['gl_code', 'classification'], inputType: 'text', placeholder: 'e.g. 58241' },
      { name: 'Gross Receipts / Sales by Location', category: 'General Liability', extractKeys: ['gross_receipts', 'sales'], inputType: 'number', placeholder: 'Total gross receipts' },
      { name: 'GL Limits Requested', category: 'General Liability', extractKeys: ['gl_limits', 'occurrence_limit'], inputType: 'select', options: ['$1M/$2M', '$1M/$1M', '$2M/$4M', '$500K/$1M'] },
      { name: 'Subcontractor Costs (if applicable)', category: 'General Liability', extractKeys: ['subcontractor'], inputType: 'number', placeholder: 'Annual subcontractor costs' },
      { name: 'Liquor License (if serving alcohol)', category: 'General Liability', extractKeys: ['liquor_license', 'Liquor'], inputType: 'file' },
    ],
    property: [
      { name: 'Property Schedule / Statement of Values', category: 'Property', extractKeys: ['property_schedule'], inputType: 'file' },
      { name: 'Building Values per Location', category: 'Property', extractKeys: ['building_value', 'Total Building Value'], inputType: 'number', placeholder: 'Total building value' },
      { name: 'Contents / BPP Values per Location', category: 'Property', extractKeys: ['contents_value', 'Total Contents Value'], inputType: 'number', placeholder: 'Total contents value' },
      { name: 'Business Income Limit', category: 'Property', extractKeys: ['business_income', 'Business Income'], inputType: 'number', placeholder: 'Business income limit' },
      { name: 'Construction Type & Year Built', category: 'Property', extractKeys: ['construction', 'year_built', 'Construction Type'], inputType: 'text', placeholder: 'e.g. Frame, 1995' },
      { name: 'Square Footage per Location', category: 'Property', extractKeys: ['sq_footage'], inputType: 'number', placeholder: 'Total sq ft' },
      { name: 'Fire / Burglar Alarm Details', category: 'Property', extractKeys: ['fire_alarm', 'burglar_alarm'], inputType: 'text', placeholder: 'e.g. Central station, local alarm' },
      { name: 'Sprinkler System Details', category: 'Property', extractKeys: ['sprinkler', 'Sprinklered'], inputType: 'select', options: ['Fully Sprinklered', 'Partially Sprinklered', 'Not Sprinklered'] },
      { name: 'Roof Type & Age', category: 'Property', extractKeys: ['roof_type'], inputType: 'text', placeholder: 'e.g. Built-up, 2015' },
    ],
    wc: [
      { name: 'Payroll by Classification Code', category: 'Workers Comp', extractKeys: ['payroll', 'class_code'], inputType: 'file' },
      { name: 'Experience Modification Rate (EMR)', category: 'Workers Comp', extractKeys: ['emr', 'experience_mod'], inputType: 'text', placeholder: 'e.g. 0.95' },
      { name: 'Employee Count by Location', category: 'Workers Comp', extractKeys: ['employee_count_loc'], inputType: 'number', placeholder: 'Per location' },
      { name: 'NCCI Class Codes', category: 'Workers Comp', extractKeys: ['ncci', 'wc_class'], inputType: 'text', placeholder: 'e.g. 8810, 8742' },
      { name: 'Prior WC Policy Info', category: 'Workers Comp', extractKeys: ['wc_policy'], inputType: 'text', placeholder: 'Carrier, policy #, premium' },
      { name: 'OSHA 300 Log (if applicable)', category: 'Workers Comp', extractKeys: ['osha'], inputType: 'file' },
    ],
    auto: [
      { name: 'Vehicle Schedule (Year/Make/Model/VIN)', category: 'Business Auto', extractKeys: ['vehicle', 'vin'], inputType: 'file' },
      { name: 'Driver List with License Numbers', category: 'Business Auto', extractKeys: ['driver', 'license'], inputType: 'file' },
      { name: 'MVR Reports (Motor Vehicle Records)', category: 'Business Auto', extractKeys: ['mvr'], inputType: 'file' },
      { name: 'Radius of Operation', category: 'Business Auto', extractKeys: ['radius'], inputType: 'select', options: ['Local (0-50 miles)', 'Intermediate (50-200 miles)', 'Long Distance (200+ miles)', 'Nationwide'] },
      { name: 'Auto Liability Limits Requested', category: 'Business Auto', extractKeys: ['auto_limits'], inputType: 'select', options: ['$1M CSL', '$500K/$1M', '$1M/$1M', '$250K/$500K'] },
    ],
    umbrella: [
      { name: 'Underlying Policy Declarations', category: 'Umbrella', extractKeys: ['underlying'], inputType: 'file' },
      { name: 'Umbrella Limits Requested', category: 'Umbrella', extractKeys: ['umbrella_limits'], inputType: 'select', options: ['$1M/$1M', '$2M/$2M', '$5M/$5M', '$10M/$10M'] },
      { name: 'Schedule of Underlying Insurance', category: 'Umbrella', extractKeys: ['underlying_schedule'], inputType: 'file' },
    ],
    bop: [{ name: 'Business Description for BOP Eligibility', category: 'BOP', extractKeys: ['bop'], inputType: 'text', placeholder: 'Describe operations' }],
    crime: [
      { name: 'Employee Count Handling Funds', category: 'Crime', extractKeys: ['funds_handling'], inputType: 'number', placeholder: 'Number of employees' },
      { name: 'Financial Controls Description', category: 'Crime', extractKeys: ['financial_controls'], inputType: 'text', placeholder: 'Describe controls in place' },
    ],
    cyber: [
      { name: 'Annual Revenue from Digital Operations', category: 'Cyber', extractKeys: ['digital_revenue'], inputType: 'number', placeholder: 'Digital revenue' },
      { name: 'Number of PII Records Stored', category: 'Cyber', extractKeys: ['pii_records'], inputType: 'number', placeholder: 'Number of records' },
      { name: 'Current Security Measures', category: 'Cyber', extractKeys: ['security_measures'], inputType: 'text', placeholder: 'MFA, encryption, etc.' },
    ],
    epli: [
      { name: 'Employee Handbook', category: 'EPLI', extractKeys: ['handbook'], inputType: 'file' },
      { name: 'HR Policies & Procedures', category: 'EPLI', extractKeys: ['hr_policies'], inputType: 'file' },
    ],
    pl: [
      { name: 'Professional Services Description', category: 'Prof Liability', extractKeys: ['prof_services'], inputType: 'text', placeholder: 'Describe services provided' },
      { name: 'Revenue by Service Type', category: 'Prof Liability', extractKeys: ['service_revenue'], inputType: 'text', placeholder: 'Revenue breakdown' },
    ],
  };
  const allReqs = [...core];
  selectedLines.forEach((line: string) => { if (lineReqs[line]) allReqs.push(...lineReqs[line]); });
  const extractedLabels = new Set(extractedData.map((f: any) => f.fieldName || f.label || ''));
  const uploadedTypes = new Set((parsedResults || []).map((r: any) => r.documentType));
  return allReqs.map(req => {
    const found = req.extractKeys.some((key: string) => {
      if (extractedLabels.has(key)) return true;
      if (uploadedTypes.has(key)) return true;
      for (const label of extractedLabels) {
        if (typeof label === 'string' && label.toLowerCase().includes(key.toLowerCase())) return true;
      }
      return false;
    });
    return { name: req.name, status: found ? 'received' : 'missing', category: req.category, inputType: req.inputType || 'text', placeholder: req.placeholder || '', options: req.options || [], manualValue: '' };
  });
}

const steps = [
  { id: 1, name: 'Document Upload', key: 'upload' },
  { id: 2, name: 'AI Data Extraction', key: 'extraction' },
  { id: 3, name: 'Lines of Business', key: 'lob' },
  { id: 4, name: 'Required Information', key: 'missing' },
  { id: 5, name: 'ACORD Forms', key: 'acord' },
  { id: 6, name: 'Submission Package', key: 'package' },
];

interface ParsedFile {
  file: File;
  status: 'pending' | 'parsing' | 'done' | 'error';
  documentType?: string;
  extractedFields?: ExtractedField[];
  fieldCount?: number;
  error?: string;
}

function SubmissionFlowContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = params.id as string;
  const currentStepKey = searchParams.get('step') || 'upload';
  const currentStep = steps.findIndex(s => s.key === currentStepKey) + 1 || 1;

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<ParsedFile[]>([]);
  const [parsedResults, setParsedResults] = useState<any[]>([]);
  const [isRealUpload, setIsRealUpload] = useState(false);
  const [isParsingAll, setIsParsingAll] = useState(false);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedField[]>([]);
  const [requiredDocs, setRequiredDocs] = useState<RequiredDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formsApproved, setFormsApproved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [acordData, setAcordData] = useState<any>(null);
  const [selectedLines, setSelectedLines] = useState<string[]>(['gl', 'property']);

  // Persist critical state to sessionStorage so it survives step navigation and refresh
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('submission-ai-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.extractedData?.length > 0) setExtractedData(parsed.extractedData.map((f: any) => ({
          ...f,
          value: typeof f.value === 'object' && f.value !== null
          ? Object.entries(f.value).map(([k, v]: [string, any]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join('  |  ')
          : String(f.value ?? ''),
          label: String(f.label ?? ''),
        })));
        if (parsed.parsedResults?.length > 0) setParsedResults(parsed.parsedResults);
        if (parsed.isRealUpload) setIsRealUpload(true);
        if (parsed.coverLetter) setCoverLetter(parsed.coverLetter);
        if (parsed.acordData) setAcordData(parsed.acordData);
        if (parsed.selectedLines) setSelectedLines(parsed.selectedLines);
      }
    } catch (e) {
      sessionStorage.removeItem('submission-ai-state');
    }
  }, []);

  useEffect(() => {
    try {
      if (extractedData.length > 0 || parsedResults.length > 0) {
        sessionStorage.setItem('submission-ai-state', JSON.stringify({
          extractedData,
          parsedResults: parsedResults.map(r => ({ documentType: r.documentType, documentLabel: r.documentLabel, extractedFields: r.extractedFields, fieldCount: r.fieldCount })),
          isRealUpload,
          coverLetter,
          acordData,
          selectedLines,
        }));
      }
    } catch (e) {}
  }, [extractedData, parsedResults, isRealUpload, coverLetter, acordData]);

  const submission = dashboardSubmissions.find(s => s.id === submissionId);

  useEffect(() => {
    if (currentStepKey === 'missing') {
      // Build required data items based on selected lines of business
      const dataRequirements = getDataRequirements(selectedLines, extractedData, isRealUpload, parsedResults);
      setRequiredDocs(dataRequirements);
    }
  }, [currentStepKey, selectedLines, extractedData, isRealUpload, parsedResults]);

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
    // Save state synchronously before navigating
    try {
      sessionStorage.setItem('submission-ai-state', JSON.stringify({
        extractedData,
        parsedResults: parsedResults.map((r: any) => ({ documentType: r.documentType, documentLabel: r.documentLabel, extractedFields: r.extractedFields, fieldCount: r.fieldCount })),
        isRealUpload,
        coverLetter,
        acordData,
      }));
    } catch (e) {}
    const nextIndex = currentStep;
    if (nextIndex < steps.length) {
      goToStep(steps[nextIndex].key);
    }
  };

  const canProceed = () => {
    if (currentStepKey === 'upload') return documents.length > 0;
    if (currentStepKey === 'extraction') return !isProcessing && extractedData.length > 0;
    if (currentStepKey === 'missing') return true;
    if (currentStepKey === 'lob') return selectedLines.length > 0;
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
            {!isRealUpload && documents.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                Demo Mode (Synthetic Data)
              </span>
            )}
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
        {currentStepKey === 'upload' && (
          <DocumentUploadStep
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            parsedResults={parsedResults}
            setParsedResults={setParsedResults}
            isParsingAll={isParsingAll}
            setIsParsingAll={setIsParsingAll}
            documents={documents}
            setDocuments={setDocuments}
            setIsRealUpload={setIsRealUpload}
            setExtractedData={setExtractedData}
            showToast={showToast}
          />
        )}
        {currentStepKey === 'extraction' && (
          <DataExtractionStep
            isRealUpload={isRealUpload}
            parsedResults={parsedResults}
            extractedData={extractedData}
            setExtractedData={setExtractedData}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        )}
        {currentStepKey === 'missing' && (
          <MissingDocumentsStep
            requiredDocs={requiredDocs}
            setRequiredDocs={setRequiredDocs}
            showToast={showToast}
          />
        )}
        {currentStepKey === 'lob' && (
          <LinesOfBusinessStep
            selectedLines={selectedLines}
            setSelectedLines={setSelectedLines}
            showToast={showToast}
          />
        )}
        {currentStepKey === 'acord' && (
          <AcordFormsStep
            formsApproved={formsApproved}
            setFormsApproved={setFormsApproved}
            showToast={showToast}
            extractedData={extractedData}
            isRealUpload={isRealUpload}
            acordData={acordData}
            setAcordData={setAcordData}
          />
        )}
        {currentStepKey === 'package' && (
          <SubmissionPackageStep
            showToast={showToast}
            extractedData={extractedData}
            isRealUpload={isRealUpload}
            coverLetter={coverLetter}
            setCoverLetter={setCoverLetter}
            acordData={acordData}
            selectedLines={selectedLines}
          />
        )}

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
                  ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-light)] shadow-md'
                  : 'bg-white text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed opacity-50'
              }`}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={() => router.push('/demo')}
              className="px-8 py-3 bg-[var(--success)] text-white rounded-lg font-semibold hover:opacity-90 shadow-md transition-all"
            >
              ← Back to Dashboard
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function DocumentUploadStep({
  uploadedFiles,
  setUploadedFiles,
  parsedResults,
  setParsedResults,
  isParsingAll,
  setIsParsingAll,
  documents,
  setDocuments,
  setIsRealUpload,
  setExtractedData,
  showToast,
}: any) {
  const [isDragging, setIsDragging] = useState(false);

  const handleLoadSample = () => {
    setDocuments(uploadedDocuments);
    setIsRealUpload(false);
    setExtractedData(extractedFields);
    showToast('Sample documents loaded (demo mode)');
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: ParsedFile[] = Array.from(files)
      .filter(file => file.type === 'application/pdf')
      .map(file => ({
        file,
        status: 'pending' as const,
      }));

    if (newFiles.length === 0) {
      showToast('Please select PDF files only');
      return;
    }

    setUploadedFiles((prev: ParsedFile[]) => [...prev, ...newFiles]);
  };

    const handleProcessAll = async () => {
    if (uploadedFiles.length === 0) return;

    setIsParsingAll(true);
    const results: any[] = [];
    const processedDocs: UploadedDocument[] = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const fileData = uploadedFiles[i];
      
      try {
        // Step 1: Upload and extract text (fast, <2s)
        setUploadedFiles((prev: ParsedFile[]) => 
          prev.map((f, idx) => idx === i ? { ...f, status: 'parsing' as const } : f)
        );

        const formData = new FormData();
        formData.append('file', fileData.file);

        const uploadResponse = await fetch('/api/parse-document', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || 'Text extraction failed');
        }

        const { text } = await uploadResponse.json();

        if (!text || text.length < 20) {
          throw new Error('No text extracted from PDF');
        }

        // Step 2: AI analysis (15-30s, runs in browser)
        // Update status message to show AI processing
        setUploadedFiles((prev: ParsedFile[]) => 
          prev.map((f, idx) => idx === i ? { ...f, status: 'parsing' as const } : f)
        );

        const aiResult = await analyzeDocumentText(text, fileData.file.name);
        
        results.push(aiResult);

        // Update status to done
        setUploadedFiles((prev: ParsedFile[]) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: 'done' as const,
                  documentType: aiResult.documentType,
                  extractedFields: aiResult.extractedFields,
                  fieldCount: aiResult.fieldCount,
                }
              : f
          )
        );

        // Add to documents list
        processedDocs.push({
          id: `doc-${Date.now()}-${i}`,
          name: fileData.file.name,
          type: aiResult.documentType || 'unknown',
          status: 'extracted',
          uploadedAt: new Date().toLocaleString(),
          extractedFields: aiResult.extractedFields,
        });
      } catch (error: any) {
        console.error(`Error processing ${fileData.file.name}:`, error);
        
        setUploadedFiles((prev: ParsedFile[]) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: 'error' as const, error: error.message }
              : f
          )
        );

        showToast(`Error: ${fileData.file.name} - ${error.message}`);
      }
    }

    setParsedResults(results);
    setDocuments(processedDocs);
    setIsRealUpload(true);
    setIsParsingAll(false);

    // Merge all extracted fields and ensure all values are strings
    const allFields: ExtractedField[] = [];
    results.forEach(result => {
      if (result.extractedFields) {
        result.extractedFields.forEach((field: any) => {
          allFields.push({
            ...field,
            value: typeof field.value === 'object' && field.value !== null
              ? Object.entries(field.value).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join('  |  ')
              : String(field.value ?? ''),
            label: String(field.label ?? ''),
            source: String(field.source ?? ''),
            category: String(field.category ?? 'Other'),
          });
        });
      }
    });
    setExtractedData(allFields);

    showToast(`Successfully processed ${results.length} document(s)`);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev: ParsedFile[]) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Upload Documents</h2>
        <p className="text-[var(--text-muted)] mb-6">
          Upload client documents for AI analysis (Dec Pages, Loss Runs, Financial Statements, Property Schedules)
        </p>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-12 text-center mb-6 transition-all ${
            isDragging
              ? 'border-[var(--accent)] bg-[var(--accent-glow)]'
              : 'border-[var(--border)] bg-[var(--bg-primary)]'
          }`}
        >
          <div className="text-5xl mb-4">📁</div>
          <p className="text-[var(--text-muted)] mb-6">Drag and drop PDFs here, or click to browse</p>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <div className="flex gap-3 justify-center">
            <label
              htmlFor="file-upload"
              className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent-light)] transition-all shadow-md cursor-pointer"
            >
              Browse Files
            </label>
            <button
              onClick={handleLoadSample}
              className="px-6 py-3 border border-[var(--border)] bg-white text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--bg-card-hover)] transition-all"
            >
              Load Sample Documents
            </button>
          </div>
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <>
            <div className="space-y-3 mb-6">
              {uploadedFiles.map((fileData: ParsedFile, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)]"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">📄</div>
                    <div className="flex-1">
                      <div className="font-medium text-[var(--text-primary)]">{fileData.file.name}</div>
                      <div className="text-sm text-[var(--text-muted)]">
                        {formatFileSize(fileData.file.size)}
                        {fileData.documentType && ` • ${fileData.documentType}`}
                        {fileData.fieldCount && ` • ${fileData.fieldCount} fields extracted`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {fileData.status === 'pending' && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                        Pending
                      </span>
                    )}
                    {fileData.status === 'parsing' && (
                      <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1 rounded-full font-medium flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                        Parsing...
                      </span>
                    )}
                    {fileData.status === 'done' && (
                      <span className="text-xs bg-[var(--success)]/10 text-[var(--success)] px-3 py-1 rounded-full font-medium">
                        ✓ Done
                      </span>
                    )}
                    {fileData.status === 'error' && (
                      <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-medium">
                        Error
                      </span>
                    )}
                    {fileData.status === 'pending' && (
                      <button
                        onClick={() => handleRemoveFile(idx)}
                        className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Process Button */}
            {uploadedFiles.some((f: ParsedFile) => f.status === 'pending') && (
              <button
                onClick={handleProcessAll}
                disabled={isParsingAll}
                className={`w-full py-4 rounded-lg font-semibold transition-all ${
                  isParsingAll
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[var(--success)] text-white hover:opacity-90 shadow-md'
                }`}
              >
                {isParsingAll ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Documents...
                  </span>
                ) : (
                  `🤖 Process All Documents (${uploadedFiles.filter((f: ParsedFile) => f.status === 'pending').length})`
                )}
              </button>
            )}
          </>
        )}

        {/* Processed Documents Summary */}
        {documents.length > 0 && !uploadedFiles.some((f: ParsedFile) => f.status === 'pending') && (
          <div className="mt-6 p-4 bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-lg">
            <div className="flex items-center gap-2 text-[var(--success)] font-semibold">
              <span>✓</span>
              <span>
                {documents.length} document{documents.length !== 1 ? 's' : ''} processed successfully
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DataExtractionStep({
  isRealUpload,
  parsedResults,
  extractedData,
  setExtractedData,
  isProcessing,
  setIsProcessing,
}: any) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  const handleEditField = (label: string) => {
    setEditingField(label);
  };

  const handleSaveEdit = (label: string, newValue: string) => {
    setEditedValues({ ...editedValues, [label]: newValue });
    setExtractedData((prev: ExtractedField[]) =>
      prev.map(field =>
        field.label === label ? { ...field, value: newValue, confidence: 100 } : field
      )
    );
    setEditingField(null);
  };

  if (extractedData.length === 0) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-12 shadow-sm">
        <div className="text-center text-[var(--text-muted)]">
          <p className="text-xl mb-2">No data extracted yet</p>
          <p>Please upload and process documents in Step 1</p>
        </div>
      </div>
    );
  }

  const categories = [...new Set(extractedData.map((f: ExtractedField) => f.category))] as string[];

  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">✨</span>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Extracted Data</h2>
            <p className="text-[var(--text-muted)]">
              {isRealUpload ? 'AI-extracted from your documents' : 'Demo data'} • Review and edit any flagged items
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {categories.map((category: string) => (
            <div key={category} className="bg-[var(--bg-primary)] rounded-lg p-5 border border-[var(--border)]">
              <h3 className="font-semibold text-lg mb-4 text-[var(--text-primary)]">{category}</h3>
              <div className="space-y-3">
                {extractedData
                  .filter((f: ExtractedField) => f.category === category)
                  .map((field: ExtractedField) => {
                    const isFlagged = field.confidence < 95;
                    const isEditing = editingField === field.label;
                    const rawValue = editedValues[field.label] || field.value;
                    const displayValue = typeof rawValue === "object" && rawValue !== null ? Object.entries(rawValue).map(([k, v]) => `${(k as string).charAt(0).toUpperCase() + (k as string).slice(1)}: ${v}`).join("  |  ") : String(rawValue ?? "");

                    return (
                      <div
                        key={field.label}
                        className={`p-4 rounded-lg border transition-all ${
                          isFlagged ? 'bg-amber-50 border-amber-200' : 'bg-white border-[var(--border)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-[var(--text-primary)]">
                                {field.label}
                              </span>
                              {isFlagged && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                  Review
                                </span>
                              )}
                            </div>
                            {isEditing ? (
                              <input
                                type="text"
                                defaultValue={displayValue}
                                onBlur={(e) => handleSaveEdit(field.label, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEdit(field.label, e.currentTarget.value);
                                  }
                                }}
                                autoFocus
                                className="w-full px-3 py-1.5 border border-[var(--accent)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-glow)]"
                              />
                            ) : (
                              <div className="text-[var(--text-secondary)]">{displayValue}</div>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                              <span>Source: {field.source}</span>
                              <span>Confidence: {field.confidence}%</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditField(field.label)}
                            className="text-[var(--accent)] hover:text-[var(--accent-light)] text-sm font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MissingDocumentsStep({ requiredDocs, setRequiredDocs, showToast, extractedData, isRealUpload, selectedLines }: any) {
  const handleMarkReceived = (idx: number) => {
    setRequiredDocs((prev: RequiredDocument[]) =>
      prev.map((doc, i) => (i === idx ? { ...doc, status: 'received' } : doc))
    );
    showToast('Document marked as received');
  };

  const handleManualInput = (idx: number, value: string) => {
    setRequiredDocs((prev: any[]) =>
      prev.map((doc, i) => (i === idx ? { ...doc, status: 'received', manualValue: value } : doc))
    );
    showToast('Value saved ✓');
  };

  const handleFileUpload = async (idx: number, file: File) => {
    showToast(`Uploading ${file.name}...`);
    // For now, mark as received. In production, this would parse the document.
    setRequiredDocs((prev: any[]) =>
      prev.map((doc, i) => (i === idx ? { ...doc, status: 'received', manualValue: file.name } : doc))
    );
    showToast(`${file.name} uploaded ✓`);
  };

  const handleSendFollowUp = (idx: number) => {
    setRequiredDocs((prev: RequiredDocument[]) =>
      prev.map((doc, i) =>
        i === idx
          ? { ...doc, status: 'requested', requestedDate: new Date().toISOString().split('T')[0] }
          : doc
      )
    );
    showToast('Follow-up email sent');
  };

  const receivedCount = requiredDocs.filter((d: any) => d.status === 'received').length;
  const missingCount = requiredDocs.filter((d: any) => d.status !== 'received').length;
  const categories = Array.from(new Set(requiredDocs.map((d: any) => d.category))) as string[];

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Required Information</h2>
        <p className="text-[var(--text-muted)] mb-4">Data and documents needed to complete your ACORD forms. Items are checked against what was extracted from your uploads.</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <span className="text-green-600 font-bold text-lg">{receivedCount}</span>
            <span className="text-green-700 text-sm">Found</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
            <span className="text-red-600 font-bold text-lg">{missingCount}</span>
            <span className="text-red-700 text-sm">Missing</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-blue-600 font-bold text-lg">{requiredDocs.length}</span>
            <span className="text-blue-700 text-sm">Total Required</span>
          </div>
        </div>
      </div>

      {/* Categorized requirements */}
      {categories.map((cat: string) => {
        const catDocs = requiredDocs.filter((d: any) => d.category === cat);
        const catMissing = catDocs.filter((d: any) => d.status !== 'received').length;
        return (
          <div key={cat} className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{cat}</h3>
              {catMissing > 0 ? (
                <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">{catMissing} missing</span>
              ) : (
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">✓ Complete</span>
              )}
            </div>
            <div className="space-y-2">
              {catDocs.map((doc: any, idx: number) => {
                const globalIdx = requiredDocs.indexOf(doc);
                return (
                  <div key={idx} className={`p-3 bg-[var(--bg-primary)] rounded-lg border ${doc.status === 'received' ? 'border-green-200' : 'border-[var(--border)]'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                          doc.status === 'received' ? 'bg-green-100 text-green-600' :
                          doc.status === 'requested' ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {doc.status === 'received' ? '✓' : '!'}
                        </div>
                        <div>
                          <span className={`text-sm ${doc.status === 'received' ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)] font-medium'}`}>{doc.name}</span>
                          {doc.status === 'received' && doc.manualValue && (
                            <span className="text-xs text-green-600 ml-2">— {doc.manualValue}</span>
                          )}
                          {doc.status === 'requested' && doc.requestedDate && (
                            <span className="text-xs text-[var(--text-muted)] ml-2">Requested {doc.requestedDate}</span>
                          )}
                        </div>
                      </div>
                      {doc.status !== 'received' && (
                        <button onClick={() => handleSendFollowUp(globalIdx)}
                          className="px-3 py-1.5 border border-[var(--border)] text-xs rounded-lg hover:bg-gray-50 flex-shrink-0">
                          📧 Request
                        </button>
                      )}
                    </div>
                    {doc.status !== 'received' && (
                      <div className="mt-2 ml-9">
                        {doc.inputType === 'file' ? (
                          <div className="flex items-center gap-2">
                            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[var(--accent)] hover:bg-blue-50 transition-all">
                              <span className="text-sm text-[var(--text-muted)]">📎 Upload document</span>
                              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx,.csv,.jpg,.png"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleFileUpload(globalIdx, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        ) : doc.inputType === 'select' ? (
                          <select
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none"
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) handleManualInput(globalIdx, e.target.value);
                            }}
                          >
                            <option value="" disabled>Select...</option>
                            {(doc.options || []).map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type={doc.inputType === 'number' ? 'number' : 'text'}
                              placeholder={doc.placeholder || 'Enter value...'}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = (e.target as HTMLInputElement).value;
                                  if (val) handleManualInput(globalIdx, val);
                                }
                              }}
                            />
                            <button
                              onClick={(e) => {
                                const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                                if (input?.value) handleManualInput(globalIdx, input.value);
                              }}
                              className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--accent-light)]"
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}


function LinesOfBusinessStep({ selectedLines, setSelectedLines, showToast }: any) {
  const lines = [
    { id: 'gl', icon: '🛡️', label: 'General Liability', desc: 'Bodily injury, property damage, personal & advertising injury', forms: ['125', '126'], common: true },
    { id: 'property', icon: '🏢', label: 'Commercial Property', desc: 'Buildings, contents, business income, equipment breakdown', forms: ['125', '140'], common: true },
    { id: 'wc', icon: '👷', label: 'Workers Compensation', desc: 'Employee injuries, employers liability coverage', forms: ['125', '130'], common: true },
    { id: 'auto', icon: '🚛', label: 'Business Auto', desc: 'Commercial vehicles, hired & non-owned auto liability', forms: ['125', '127'], common: true },
    { id: 'umbrella', icon: '☂️', label: 'Umbrella / Excess', desc: 'Additional liability limits above underlying policies', forms: ['125', '131'], common: true },
    { id: 'bop', icon: '📦', label: 'Business Owners (BOP)', desc: 'Combined GL + Property for qualifying small businesses', forms: ['125'], common: false },
    { id: 'crime', icon: '🔒', label: 'Commercial Crime', desc: 'Employee theft, forgery, computer fraud, funds transfer', forms: ['125'], common: false },
    { id: 'cyber', icon: '💻', label: 'Cyber Liability', desc: 'Data breach response, network security, privacy liability', forms: ['125'], common: false },
    { id: 'epli', icon: '⚖️', label: 'Employment Practices (EPLI)', desc: 'Discrimination, wrongful termination, harassment claims', forms: ['125'], common: false },
    { id: 'pl', icon: '📋', label: 'Professional Liability / E&O', desc: 'Professional negligence, errors & omissions coverage', forms: ['125'], common: false },
  ];

  const toggle = (id: string) => {
    setSelectedLines((prev: string[]) => prev.includes(id) ? prev.filter((l: string) => l !== id) : [...prev, id]);
  };

  const allForms = new Set<string>();
  selectedLines.forEach((id: string) => {
    const line = lines.find(l => l.id === id);
    line?.forms.forEach(f => allForms.add(f));
  });

  const formLabels: Record<string, string> = {
    '125': 'ACORD 125 — Commercial Application',
    '126': 'ACORD 126 — General Liability',
    '127': 'ACORD 127 — Business Auto',
    '130': 'ACORD 130 — Workers Compensation',
    '131': 'ACORD 131 — Umbrella / Excess',
    '140': 'ACORD 140 — Property Section',
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Lines of Business</h2>
        <p className="text-[var(--text-muted)] mb-6">Select the coverage lines for this submission. We'll generate the correct ACORD forms automatically.</p>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Common Lines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lines.filter(l => l.common).map(line => (
              <button
                key={line.id}
                onClick={() => toggle(line.id)}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                  selectedLines.includes(line.id)
                    ? 'border-[var(--accent)] bg-blue-50 shadow-sm'
                    : 'border-[var(--border)] bg-[var(--bg-primary)] hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mt-0.5">{line.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)]">{line.label}</span>
                    {selectedLines.includes(line.id) && (
                      <span className="text-xs bg-[var(--accent)] text-white px-2 py-0.5 rounded-full">Selected</span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{line.desc}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1.5">
                    Forms: {line.forms.map(f => `ACORD ${f}`).join(', ')}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
                  selectedLines.includes(line.id) ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-gray-300'
                }`}>
                  {selectedLines.includes(line.id) && <span className="text-white text-xs">✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Specialty Lines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lines.filter(l => !l.common).map(line => (
              <button
                key={line.id}
                onClick={() => toggle(line.id)}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                  selectedLines.includes(line.id)
                    ? 'border-[var(--accent)] bg-blue-50 shadow-sm'
                    : 'border-[var(--border)] bg-[var(--bg-primary)] hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mt-0.5">{line.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)]">{line.label}</span>
                    {selectedLines.includes(line.id) && (
                      <span className="text-xs bg-[var(--accent)] text-white px-2 py-0.5 rounded-full">Selected</span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{line.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
                  selectedLines.includes(line.id) ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-gray-300'
                }`}>
                  {selectedLines.includes(line.id) && <span className="text-white text-xs">✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedLines.length > 0 && (
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Forms to Generate</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">Based on your selections, these ACORD forms will be auto-populated:</p>
          <div className="space-y-2">
            {Array.from(allForms).sort().map(f => (
              <div key={f} className="flex items-center gap-3 p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)]">
                <span className="text-lg">📋</span>
                <span className="font-medium text-[var(--text-primary)]">{formLabels[f] || `ACORD ${f}`}</span>
                {f === '125' && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Always Required</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AcordFormsStep({
  formsApproved,
  setFormsApproved,
  showToast,
  extractedData,
  isRealUpload,
  acordData,
  setAcordData,
}: any) {
  const [activeTab, setActiveTab] = useState('acord125');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!acordData && !isLoading && isRealUpload && extractedData.length > 0) {
      // Generate ACORD forms client-side using AI
      setIsLoading(true);
      
      import('@/lib/ai-client')
        .then(({ generateAcordForms }) => generateAcordForms(extractedData))
        .then(data => {
          setAcordData(data);
        })
        .catch(err => {
          console.error('ACORD generation error:', err);
          showToast('Error generating ACORD forms - using defaults');
          setAcordData(acordFormData);
        })
        .finally(() => setIsLoading(false));
    } else if (!isRealUpload && !acordData) {
      // Use synthetic data in demo mode
      setAcordData(acordFormData);
    }
  }, [extractedData, isRealUpload, acordData, isLoading]);

  const handleApproveAll = () => {
    if (confirm('Approve all ACORD forms and finalize submission package?')) {
      setFormsApproved(true);
      showToast('All forms approved');
    }
  };

  const formData = acordData || acordFormData;

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-12 shadow-sm">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[var(--text-muted)]">Generating ACORD forms from extracted data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] shadow-sm">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">ACORD Forms</h2>
              <p className="text-[var(--text-muted)]">
                {isRealUpload ? 'Generated from your extracted data' : 'Demo forms'}
              </p>
            </div>
            <button
                onClick={handleApproveAll}
                disabled={formsApproved}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  formsApproved
                    ? 'bg-[var(--success)]/10 text-[var(--success)] cursor-not-allowed'
                    : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-light)] shadow-md'
                }`}
              >
                {formsApproved ? '✓ Approved' : 'Approve All Forms'}
              </button>
          </div>
        </div>

        <div className="flex border-b border-[var(--border)] bg-[var(--bg-primary)]">
          {[
            { key: 'acord125', label: 'ACORD 125 — Commercial Application' },
            { key: 'acord126', label: 'ACORD 126 — General Liability' },
            { key: 'acord140', label: 'ACORD 140 — Property Section' },
            { key: 'acord130', label: 'ACORD 130 — Workers Comp' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-[var(--accent)] text-[var(--accent)] bg-white'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 bg-white">
          {activeTab === 'acord125' && (
            <>

              <Acord125Form data={formData.acord125} />
            </>
          )}
          {activeTab === 'acord126' && (
            <>

              <Acord126Form data={formData.acord126} />
            </>
          )}
          {activeTab === 'acord140' && (
            <>

              <Acord140Form data={formData.acord140} />
            </>
          )}
          {activeTab === 'acord130' && (
            <>

              <Acord130Form data={formData.acord130} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SubmissionPackageStep({ showToast, extractedData, isRealUpload, coverLetter, setCoverLetter, acordData, selectedLines }: any) {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!coverLetter && !isLoading && isRealUpload && extractedData.length > 0) {
      // Generate cover letter client-side using AI
      setIsLoading(true);

      const companyInfo = {
        ...sampleClient,
        businessName: extractedData.find((f: ExtractedField) => f.fieldName === 'named_insured')?.value || sampleClient.businessName,
      };

      import('@/lib/ai-client')
        .then(({ generateCoverLetter }) => generateCoverLetter(extractedData))
        .then(letter => {
          setCoverLetter(letter);
        })
        .catch(err => {
          console.error('Cover letter generation error:', err);
          showToast('Error generating cover letter - using default');
          setCoverLetter(enhancedCoverLetter);
        })
        .finally(() => setIsLoading(false));
    } else if (!isRealUpload && !coverLetter) {
      setCoverLetter(enhancedCoverLetter);
    }
  }, [extractedData, isRealUpload, coverLetter, isLoading]);

  const toggleFolder = (name: string) => {
    setExpandedFolders(prev => (prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]));
  };

  const handleDownloadCoverLetter = () => {
    const blob = new Blob([coverLetter || enhancedCoverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cover letter downloaded');
  };

  const handleDownloadAll = () => {
    if (acordData) {
      import('@/lib/acord-pdf').then(({ generateAllAcordPDFs }) => {
        generateAllAcordPDFs(acordData);
      });
    }
    handleDownloadCoverLetter();
    if (acordData) {
      import('@/lib/acord-xml').then(({ generateAcordXML }) => {
        generateAcordXML(acordData);
      });
    }
    showToast('Downloading all package files...');
  };

  const allFormDefs: Record<string, { name: string; icon: string }> = {
    '125': { name: 'ACORD 125 — Commercial Application', icon: '📋' },
    '126': { name: 'ACORD 126 — General Liability', icon: '📋' },
    '127': { name: 'ACORD 127 — Business Auto', icon: '📋' },
    '130': { name: 'ACORD 130 — Workers Compensation', icon: '📋' },
    '131': { name: 'ACORD 131 — Umbrella / Excess', icon: '📋' },
    '140': { name: 'ACORD 140 — Property Section', icon: '📋' },
  };

  const lobFormMap: Record<string, string[]> = {
    gl: ['125', '126'], property: ['125', '140'], wc: ['125', '130'],
    auto: ['125', '127'], umbrella: ['125', '131'], bop: ['125'],
    crime: ['125'], cyber: ['125'], epli: ['125'], pl: ['125'],
  };

  const requiredFormNums = new Set<string>();
  (selectedLines || ['gl', 'property']).forEach((l: string) => {
    lobFormMap[l]?.forEach(f => requiredFormNums.add(f));
  });

  const packageFiles = [
    ...Array.from(requiredFormNums).sort().map(f => ({
      name: allFormDefs[f]?.name || 'ACORD ' + f,
      type: 'acord' + f,
      icon: allFormDefs[f]?.icon || '📋',
    })),
    { name: 'Cover Letter', type: 'cover-letter', icon: '✉️' },
    { name: 'ACORD XML Export', type: 'acord-xml', icon: '📦' },
  ];

  const handleDownloadFile = (fileType: string) => {
    if (fileType === 'cover-letter') {
      handleDownloadCoverLetter();
    } else if (fileType === 'acord-xml') {
      import('@/lib/acord-xml').then(({ generateAcordXML }) => {
        generateAcordXML(acordData || {});
        showToast('ACORD XML downloaded');
      });
    } else if (acordData) {
      const formNum = fileType.replace('acord', '');
      import('@/lib/acord-pdf').then(mod => {
        mod.generateFormPDF(formNum, acordData);
        showToast('ACORD ' + formNum + ' PDF downloaded');
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Submission Package</h2>
            <p className="text-[var(--text-muted)]">Review and download complete submission package</p>
          </div>
          <button
            onClick={handleDownloadAll}
            className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-semibold hover:bg-[var(--accent-light)] shadow-md transition-all flex items-center gap-2"
          >
            📥 Download All Files
          </button>
        </div>

        <div className="space-y-2">
          {packageFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-xl">{file.icon}</span>
                <div>
                  <span className="font-medium text-[var(--text-primary)]">{file.name}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-2">
                    {file.type === 'cover-letter' ? 'TXT' : file.type === 'acord-xml' ? 'XML' : 'PDF'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDownloadFile(file.type)}
                className="px-4 py-2 border border-[var(--border)] bg-white text-[var(--text-primary)] text-sm rounded-lg hover:bg-[var(--bg-card-hover)] transition-all flex items-center gap-2"
              >
                ⬇ Download
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
          Cover Letter Preview
          {isRealUpload && <span className="text-sm font-normal text-[var(--success)] ml-2">✨ AI Generated</span>}
        </h3>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-[var(--text-muted)]">Generating professional cover letter...</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg border border-[var(--border)] text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
            {coverLetter || enhancedCoverLetter}
          </div>
        )}
      </div>
    </div>
  );
}

// Form display components remain the same...
// (Include all the Acord form components here - Acord125Form, Acord126Form, etc.)
// Due to length constraints, I'm including just the structure references

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-primary)] rounded-lg p-5 border border-[var(--border)]">
      <h4 className="font-semibold text-base mb-4 text-[var(--text-primary)]">{title}</h4>
      {children}
    </div>
  );
}

function FormField({
  label,
  value,
  autoFilled,
  multiline,
}: {
  label: string;
  value: string;
  autoFilled?: boolean;
  multiline?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-xs font-medium text-[var(--text-muted)]">{label}</label>
        {autoFilled && (
          <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded font-medium">
            auto-filled
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          value={value}
          readOnly
          rows={3}
          className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded text-sm text-[var(--text-secondary)] resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          readOnly
          className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded text-sm text-[var(--text-secondary)]"
        />
      )}
    </div>
  );
}

// Acord form components
function Acord125Form({ data }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1 rounded-full font-semibold animate-sparkle">
          ✨ AI Generated
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormSection title="Agency Information">
          <FormField label="Agency Name" value={data?.agency?.name || ''} />
          <FormField label="Address" value={data?.agency?.address || ''} />
          <FormField
            label="City, State, ZIP"
            value={`${data?.agency?.city || ''}, ${data?.agency?.state || ''} ${data?.agency?.zip || ''}`}
          />
          <FormField label="Phone" value={data?.agency?.phone || ''} />
          <FormField label="Producer Code" value={data?.agency?.producerCode || ''} />
        </FormSection>

        <FormSection title="Named Insured">
          <FormField label="Legal Name" value={data?.namedInsured?.name || ''} autoFilled={data?.namedInsured?.autoFilled} />
          <FormField label="DBA" value={data?.namedInsured?.dba || ''} autoFilled={data?.namedInsured?.autoFilled} />
          <FormField
            label="Mailing Address"
            value={data?.namedInsured?.mailingAddress || ''}
            autoFilled={data?.namedInsured?.autoFilled}
          />
          <FormField
            label="City, State, ZIP"
            value={`${data?.namedInsured?.city || ''}, ${data?.namedInsured?.state || ''} ${data?.namedInsured?.zip || ''}`}
            autoFilled={data?.namedInsured?.autoFilled}
          />
          <FormField label="Phone" value={data?.namedInsured?.phone || ''} autoFilled={data?.namedInsured?.autoFilled} />
          <FormField label="FEIN" value={data?.namedInsured?.fein || ''} autoFilled={data?.namedInsured?.autoFilled} />
          <FormField
            label="Entity Type"
            value={data?.namedInsured?.entityType || ''}
            autoFilled={data?.namedInsured?.autoFilled}
          />
        </FormSection>
      </div>

      <FormSection title="Business Information">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="NAICS Code" value={data?.businessInfo?.naicsCode || ''} autoFilled={data?.businessInfo?.autoFilled} />
          <FormField
            label="NAICS Description"
            value={data?.businessInfo?.naicsDescription || ''}
            autoFilled={data?.businessInfo?.autoFilled}
          />
          <FormField
            label="Years in Business"
            value={data?.businessInfo?.yearsInBusiness?.toString() || ''}
            autoFilled={data?.businessInfo?.autoFilled}
          />
          <FormField
            label="Total Locations"
            value={data?.businessInfo?.totalLocations?.toString() || ''}
            autoFilled={data?.businessInfo?.autoFilled}
          />
          <FormField
            label="Total Employees"
            value={data?.businessInfo?.totalEmployees?.toString() || ''}
            autoFilled={data?.businessInfo?.autoFilled}
          />
          <FormField
            label="Annual Revenue"
            value={`$${data?.businessInfo?.totalAnnualRevenue?.toLocaleString() || '0'}`}
            autoFilled={data?.businessInfo?.autoFilled}
          />
        </div>
        <FormField
          label="Description of Operations"
          value={data?.businessInfo?.descriptionOfOperations || ''}
          autoFilled={data?.businessInfo?.autoFilled}
          multiline
        />
      </FormSection>

      <FormSection title="Lines of Business Requested">
        <div className="grid grid-cols-2 gap-3">
          {data?.linesRequested?.map((line: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="checkbox" checked={line.checked} readOnly className="w-4 h-4 accent-[var(--accent)]" />
              <span className="text-sm text-[var(--text-secondary)]">{line.line}</span>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="Prior Carrier Information">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Prior Carrier" value={data?.priorCarrier?.name || ''} autoFilled={data?.priorCarrier?.autoFilled} />
          <FormField
            label="Policy Number"
            value={data?.priorCarrier?.policyNumber || ''}
            autoFilled={data?.priorCarrier?.autoFilled}
          />
          <FormField
            label="Expiration Date"
            value={data?.priorCarrier?.expirationDate || ''}
            autoFilled={data?.priorCarrier?.autoFilled}
          />
          <FormField
            label="Total Premium"
            value={`$${data?.priorCarrier?.totalPremium?.toLocaleString() || '0'}`}
            autoFilled={data?.priorCarrier?.autoFilled}
          />
          <FormField
            label="Years with Carrier"
            value={data?.priorCarrier?.yearsWithCarrier?.toString() || ''}
            autoFilled={data?.priorCarrier?.autoFilled}
          />
          <FormField label="Reason for Change" value={data?.priorCarrier?.reasonForChange || ''} />
        </div>
      </FormSection>

      {data?.lossHistory && data.lossHistory.length > 0 && (
        <FormSection title="Loss History (Last 5 Years)">
          <div className="space-y-3">
            {data.lossHistory.map((claim: any, idx: number) => (
              <div key={idx} className="p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)]">
                <div className="grid grid-cols-5 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Date of Loss</div>
                    <div className="font-medium text-[var(--text-primary)]">{claim.dateOfLoss}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Claim Type</div>
                    <div className="font-medium text-[var(--text-primary)]">{claim.claimType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Amount Paid</div>
                    <div className="font-semibold text-[var(--text-primary)]">${claim.amountPaid?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Status</div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        claim.status === 'Closed'
                          ? 'bg-[var(--success)]/10 text-[var(--success)]'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>
                  <div className="col-span-5">
                    <div className="text-xs text-[var(--text-muted)] mb-1">Description</div>
                    <div className="text-sm text-[var(--text-secondary)]">{claim.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      )}
    </div>
  );
}

function Acord126Form({ data }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1 rounded-full font-semibold animate-sparkle">
          ✨ AI Generated
        </span>
      </div>

      <FormSection title="Classification">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="GL Classification Code" value={data?.classification?.code || ''} autoFilled />
          <FormField label="Description" value={data?.classification?.description || ''} autoFilled />
          <FormField
            label="Total Gross Receipts"
            value={`$${data?.classification?.grossReceipts?.toLocaleString() || '0'}`}
            autoFilled
          />
          <FormField
            label="Liquor Receipts"
            value={`$${data?.classification?.liquorReceipts?.toLocaleString() || '0'}`}
            autoFilled
          />
        </div>
      </FormSection>

      <FormSection title="Limits Requested">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Each Occurrence"
            value={`$${(Number(data?.limitsRequested?.eachOccurrence || 0) / 1000000).toFixed(1)}M`}
            autoFilled
          />
          <FormField
            label="General Aggregate"
            value={`$${(Number(data?.limitsRequested?.generalAggregate || 0) / 1000000).toFixed(1)}M`}
            autoFilled
          />
          <FormField
            label="Products/Completed Ops Agg"
            value={`$${(Number(data?.limitsRequested?.productsCompletedOpsAggregate || 0) / 1000000).toFixed(1)}M`}
            autoFilled
          />
          <FormField
            label="Personal & Advertising Injury"
            value={`$${(Number(data?.limitsRequested?.personalAdvertisingInjury || 0) / 1000000).toFixed(1)}M`}
            autoFilled
          />
          <FormField
            label="Damage to Rented Premises"
            value={`$${(Number(data?.limitsRequested?.damageToRentedPremises || 0) / 1000).toFixed(0)}K`}
            autoFilled
          />
          <FormField
            label="Medical Expense"
            value={`$${(Number(data?.limitsRequested?.medicalExpense || 0) / 1000).toFixed(0)}K`}
            autoFilled
          />
        </div>
      </FormSection>

      <FormSection title="Liquor Liability Coverage">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Liquor Liability Included" value={data?.liquorLiability?.included ? 'Yes' : 'No'} autoFilled />
          <FormField label="Liquor Sales %" value={`${data?.liquorLiability?.liquorSalesPercentage || 0}%`} autoFilled />
          <FormField
            label="Each Occurrence"
            value={`$${(Number(data?.liquorLiability?.eachOccurrence || 0) / 1000000).toFixed(1)}M`}
            autoFilled
          />
          <FormField
            label="Aggregate"
            value={`$${(Number(data?.liquorLiability?.aggregate || 0) / 1000000).toFixed(1)}M`}
            autoFilled
          />
        </div>
      </FormSection>

      <FormSection title="Additional Coverages">
        <div className="space-y-2">
          {data?.additionalCoverages?.map((coverage: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-[var(--text-secondary)]">
                {typeof coverage === 'object' ? (coverage.name || JSON.stringify(coverage)) : String(coverage)}
              </span>
            </div>
          ))}
        </div>
      </FormSection>
    </div>
  );
}

function Acord140Form({ data }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1 rounded-full font-semibold animate-sparkle">
          ✨ AI Generated
        </span>
      </div>

      <FormSection title="Property Summary">
        <div className="grid grid-cols-3 gap-4">
          <FormField
            label="Total Building Value"
            value={`$${data?.totalBuildingValue?.toLocaleString() || '0'}`}
            autoFilled
          />
          <FormField
            label="Total Contents Value"
            value={`$${data?.totalContentsValue?.toLocaleString() || '0'}`}
            autoFilled
          />
          <FormField label="Business Income Limit" value={`$${data?.totalBILimit?.toLocaleString() || '0'}`} autoFilled />
          <FormField label="Deductible" value={`$${data?.deductible?.toLocaleString() || '0'}`} />
          <FormField label="Valuation" value={data?.valuation || ''} />
          <FormField label="Coinsurance" value={data?.coinsurance || ''} />
        </div>
      </FormSection>

      {data?.locations && data.locations.length > 0 && (
        <FormSection title="Locations">
          <div className="space-y-3">
            {data.locations.map((loc: any, idx: number) => (
              <div key={idx} className="p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)]">
                <div className="font-medium text-[var(--text-primary)] mb-3">{loc.address}</div>
                <div className="grid grid-cols-6 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Building</div>
                    <div className="font-semibold text-[var(--text-primary)]">
                      ${((loc.buildingValue || 0) / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Contents</div>
                    <div className="font-semibold text-[var(--text-primary)]">
                      ${((loc.contentsValue || 0) / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">BI Limit</div>
                    <div className="font-semibold text-[var(--text-primary)]">${((loc.biLimit || 0) / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Construction</div>
                    <div className="text-[var(--text-secondary)]">{loc.construction}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Protection Class</div>
                    <div className="text-[var(--text-secondary)]">{loc.protectionClass}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Sprinklered</div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        loc.sprinklered ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {loc.sprinklered ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      )}
    </div>
  );
}

function Acord130Form({ data }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1 rounded-full font-semibold animate-sparkle">
          ✨ AI Generated
        </span>
      </div>

      <FormSection title="State & Coverage">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="State" value={data?.state || ''} autoFilled />
          <FormField label="Total Payroll" value={`$${data?.totalPayroll?.toLocaleString() || '0'}`} autoFilled />
          <FormField label="Experience Mod (EMR)" value={data?.emr?.toString() || ''} autoFilled />
        </div>
      </FormSection>

      {data?.classificationCodes && data.classificationCodes.length > 0 && (
        <FormSection title="Classification Codes">
          <div className="space-y-3">
            {data.classificationCodes.map((classCode: any, idx: number) => (
              <div key={idx} className="p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)]">
                <div className="grid grid-cols-5 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Code</div>
                    <div className="font-medium text-[var(--text-primary)]">{classCode.code}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-[var(--text-muted)] mb-1">Description</div>
                    <div className="text-[var(--text-secondary)]">{classCode.description}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Payroll</div>
                    <div className="font-semibold text-[var(--text-primary)]">
                      ${classCode.payroll?.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Rate</div>
                    <div className="text-[var(--text-secondary)]">{classCode.rate?.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      )}

      <FormSection title="Premium Summary">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Total Estimated Premium"
            value={`$${data?.totalPremium?.toLocaleString() || '0'}`}
            autoFilled
          />
          <FormField
            label="Deductible"
            value={data?.deductible === 0 ? 'None' : `$${data?.deductible?.toLocaleString() || '0'}`}
          />
        </div>
      </FormSection>
    </div>
  );
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: string}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message + '\n' + error.stack };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:'40px',fontFamily:'monospace',background:'#fff',minHeight:'100vh'}}>
          <h2 style={{color:'red'}}>Error Details (for debugging):</h2>
          <pre style={{whiteSpace:'pre-wrap',color:'#333'}}>{this.state.error}</pre>
          <button onClick={() => { sessionStorage.removeItem('submission-ai-state'); window.location.href = '/demo'; }}
            style={{marginTop:'20px',padding:'10px 20px',background:'#2563eb',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer'}}>
            Reset & Go Back
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SubmissionFlowPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
            <div className="text-xl">Loading...</div>
          </div>
        }
      >
        <SubmissionFlowContent />
      </Suspense>
    </ErrorBoundary>
  );
}

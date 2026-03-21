'use client';
import { useState } from 'react';

export default function TestPDF() {
  const [log, setLog] = useState<string[]>([]);
  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  const testDownload = async () => {
    try {
      addLog('Fetching master template...');
      const resp = await fetch('/templates/acord-master-template.pdf');
      addLog(`Response: ${resp.status} ${resp.statusText}, type: ${resp.headers.get('content-type')}`);
      if (!resp.ok) { addLog('FAILED'); return; }
      const bytes = await resp.arrayBuffer();
      addLog(`Template size: ${bytes.byteLength} bytes`);
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(bytes);
      const form = doc.getForm();
      addLog(`Fields: ${form.getFields().length}`);
      try { form.getTextField('ACORD_Policy_Insured1_Name').setText('TEST COMPANY INC'); addLog('✓ Insured name'); } catch(e: any) { addLog('✗ ' + e.message); }
      try { form.getTextField('ACORD_CurrentDate').setText('03/21/2026'); addLog('✓ Date'); } catch(e: any) { addLog('✗ ' + e.message); }
      try { form.getTextField('GeneralLiability_EachOccurrence_LimitAmount_A').setText('2,000,000'); addLog('✓ GL limit'); } catch(e: any) { addLog('✗ ' + e.message); }
      try { form.getTextField('CommercialProperty_Premises_LimitAmount_A').setText('1,500,000'); addLog('✓ Property limit'); } catch(e: any) { addLog('✗ ' + e.message); }
      form.flatten();
      addLog('Flattened. Extracting pages...');
      const outDoc = await PDFDocument.create();
      const pages = await outDoc.copyPages(doc, [0, 1, 2, 3]);
      pages.forEach(p => outDoc.addPage(p));
      const outBytes = await outDoc.save();
      addLog(`Output: ${outBytes.byteLength} bytes. Downloading...`);
      const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'test-filled-125.pdf'; a.click();
      URL.revokeObjectURL(url);
      addLog('Done!');
    } catch(e: any) { addLog('ERROR: ' + e.message); console.error(e); }
  };

  return (
    <div style={{ padding: 40, fontFamily: 'monospace' }}>
      <h1>PDF Fill Test</h1>
      <button onClick={testDownload} style={{ padding: '12px 24px', fontSize: 16, cursor: 'pointer', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8 }}>Test PDF Download</button>
      <pre style={{ marginTop: 20, background: '#f5f5f5', padding: 20, borderRadius: 8, whiteSpace: 'pre-wrap' }}>{log.join('\n') || 'Click to test...'}</pre>
    </div>
  );
}

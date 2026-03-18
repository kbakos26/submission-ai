import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';

// Step 1 only: Extract text from PDF. Fast, stays within 10s Hobby limit.
// AI analysis happens client-side.

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const uint8 = new Uint8Array(bytes);

    let pdfText = '';
    try {
      const result = await extractText(uint8);
      if (Array.isArray(result.text)) {
        pdfText = result.text.join('\n\n--- PAGE BREAK ---\n\n');
      } else {
        pdfText = result.text;
      }
    } catch (pdfError) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF.' },
        { status: 400 }
      );
    }

    if (pdfText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. It may be image-based.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      text: pdfText.slice(0, 25000),
    });
  } catch (error: any) {
    console.error('Parse document error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

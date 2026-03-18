import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI assistant specialized in extracting structured data from commercial insurance documents.

Your task is to:
1. Classify the document type (dec_page, loss_run, financial, property_schedule, vehicle_schedule, payroll, supplemental, other)
2. Extract ALL relevant fields based on document type
3. Assign a confidence score (0-100) for each extracted field
4. Identify the source location (e.g., "Page 1, Section: Named Insured")

DOCUMENT TYPE DEFINITIONS:

**dec_page (Declarations Page):**
Extract: named_insured, dba, policy_number, carrier_name, effective_date, expiration_date, agent_name, agent_code, business_address, city, state, zip, phone, fein, entity_type, naics_code, sic_code, description_of_operations, coverages (array with: line, limit, deductible, premium), locations (array), endorsements (array), total_premium

**loss_run (Loss History Report):**
Extract: insured_name, policy_period, carrier_name, claims (array with: claim_number, date_of_loss, claim_type, description, amount_paid, amount_reserved, status, claimant_name)

**financial (Financial Statement):**
Extract: business_name, period_end_date, total_revenue, gross_sales, payroll, employee_count, assets, liabilities, net_income

**property_schedule (Property Schedule):**
Extract: locations (array with: address, city, state, zip, building_value, contents_value, bi_limit, construction_type, year_built, square_footage, stories, occupancy, protection_class, sprinklered, alarm_type)

Return your response as valid JSON in this exact format:
{
  "documentType": "dec_page|loss_run|financial|property_schedule|other",
  "extractedFields": [
    {
      "category": "Business Info|Coverage Info|Claims History|Property Details|Financial|Other",
      "fieldName": "named_insured",
      "label": "Named Insured",
      "value": "ABC Company, Inc.",
      "confidence": 98,
      "source": "Page 1, Section: Named Insured"
    }
  ]
}

IMPORTANT:
- Use null for fields that are not present
- Confidence should reflect OCR quality and field clarity (90-100 = clear, 70-89 = somewhat clear, <70 = unclear/assumed)
- Always include the source page number and section if identifiable`;

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // @ts-ignore - Dynamic import to avoid type issues
    const pdfParseMod = await import('pdf-parse');
    // @ts-ignore
    const pdfParse = pdfParseMod.default || pdfParseMod;
    const pdfData = await pdfParse(buffer);
    return pdfData.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    // Fallback: return a portion of the buffer as UTF-8
    return buffer.toString('utf-8', 0, Math.min(50000, buffer.length));
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    let extractedText = '';
    try {
      extractedText = await extractTextFromPDF(buffer);
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json(
        { error: 'Failed to parse PDF file. Please ensure it contains readable text.' },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json(
        { error: 'PDF appears to be empty or image-based. Text extraction requires text-based PDFs.' },
        { status: 400 }
      );
    }

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Extract structured data from this commercial insurance document:\n\n${extractedText.slice(0, 15000)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });
    } catch (apiError: any) {
      clearTimeout(timeout);
      console.error('OpenAI API error:', apiError);
      
      if (apiError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'AI processing timeout. Please try again.' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { error: 'AI processing failed. Please try again later.' },
        { status: 500 }
      );
    }

    clearTimeout(timeout);

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({
      success: true,
      fileName: file.name,
      documentType: result.documentType || 'other',
      extractedFields: result.extractedFields || [],
      fieldCount: result.extractedFields?.length || 0,
    });
  } catch (error: any) {
    console.error('Parse document error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

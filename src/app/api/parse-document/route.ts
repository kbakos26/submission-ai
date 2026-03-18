import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractText } from 'unpdf';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert at extracting structured data from commercial insurance documents.

Your task:
1. Classify the document type: dec_page, loss_run, financial, property_schedule, vehicle_schedule, payroll, supplemental, or other
2. Extract ALL relevant fields
3. Assign a confidence score (0-100) for each field
4. Identify where each field was found (page/section)

For dec_page: Extract named_insured, dba, policy_number, carrier_name, effective_date, expiration_date, agent_name, agency_name, business_address, city, state, zip, phone, fein, entity_type, naics_code, sic_code, description_of_operations, each coverage line (with limit, deductible, premium), locations, endorsements, total_premium

For loss_run: Extract insured_name, carrier, policy_periods, and each claim (claim_number, date_of_loss, type, description, amount_paid, amount_reserved, total_incurred, status), plus summary totals and loss ratios

For property_schedule: Extract each location (address, building_value, bpp_value, bi_value, construction_type, year_built, sq_footage, stories, sprinklered, alarm, roof_type, protection_class)

For financial: Extract business_name, revenue, payroll, employee_count, net_income

Return valid JSON:
{
  "documentType": "dec_page|loss_run|financial|property_schedule|other",
  "documentLabel": "Human-readable label like Declarations Page - Mountain View Brewing",
  "extractedFields": [
    {
      "category": "Business Info|Coverage|Claims|Property|Financial",
      "fieldName": "named_insured",
      "label": "Named Insured",
      "value": "The extracted value",
      "confidence": 98,
      "source": "Page 1, Named Insured section"
    }
  ]
}

Extract EVERY field you can find. Be thorough. For coverage tables, extract each line item separately with limit, deductible, and premium as separate fields. For claims, extract each claim as separate fields.`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const uint8 = new Uint8Array(bytes);

    // Extract text from PDF using unpdf
    let extractedText = '';
    try {
      const result = await extractText(uint8);
      // result.text can be a string or array of strings (per page)
      if (Array.isArray(result.text)) {
        extractedText = result.text.join('\n\n--- PAGE BREAK ---\n\n');
      } else {
        extractedText = result.text;
      }
    } catch (pdfError) {
      console.error('PDF parse error:', pdfError);
      return NextResponse.json(
        { error: 'Could not extract text from PDF.' },
        { status: 400 }
      );
    }

    if (extractedText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. It may be image-based.' },
        { status: 400 }
      );
    }

    // Send to GPT-4o for structured extraction
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Extract all structured data from this commercial insurance document:\n\n' + extractedText.slice(0, 25000) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 4096,
    });

    const content = completion.choices[0].message.content || '{}';
    const result = JSON.parse(content);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      documentType: result.documentType || 'other',
      documentLabel: result.documentLabel || file.name,
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

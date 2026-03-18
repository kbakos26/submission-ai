const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

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

Extract EVERY field you can find. Be thorough. For coverage tables, extract each line item separately.`;

export async function analyzeDocumentText(text: string, fileName: string): Promise<{
  documentType: string;
  documentLabel: string;
  extractedFields: any[];
  fieldCount: number;
}> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Extract all structured data from this commercial insurance document (${fileName}):\n\n${text}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content || '{}');

  return {
    documentType: result.documentType || 'other',
    documentLabel: result.documentLabel || fileName,
    extractedFields: result.extractedFields || [],
    fieldCount: result.extractedFields?.length || 0,
  };
}

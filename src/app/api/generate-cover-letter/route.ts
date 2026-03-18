import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a professional commercial insurance broker writing a submission cover letter to an underwriter.

Write a professional, well-structured cover letter that includes:

1. **Opening paragraph**: Introduce the submission and the insured company
2. **Risk Profile section**: Describe the business operations, years in business, revenue, employee count, locations, and key operational details
3. **Loss History section**: Summarize the claims history, total incurred, loss ratio, and any notable claims with explanations
4. **Coverage Requested section**: List the specific coverages and limits being requested (use bullet points)
5. **Risk Quality section**: Highlight positive risk factors such as safety programs, fire suppression systems, modern equipment, strong management, etc.
6. **Closing paragraph**: Express confidence in the quality of the risk and request a competitive indication

STYLE GUIDELINES:
- Professional and formal tone
- Use proper insurance terminology
- Be concise but thorough
- Use bullet points for coverages
- Include specific numbers and details
- Sign off as the broker

Format the letter with proper spacing and sections. Do not use markdown formatting - just plain text with line breaks.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientData } = body;

    if (!clientData) {
      return NextResponse.json(
        { error: 'Client data is required' },
        { status: 400 }
      );
    }

    // Build the prompt with client data
    const userPrompt = `Write a professional commercial insurance submission cover letter for the following client:

Business Name: ${clientData.businessName || 'N/A'}
DBA: ${clientData.dba || 'N/A'}
Entity Type: ${clientData.entityType || 'Corporation'}
NAICS Code: ${clientData.naicsCode || 'N/A'}
Address: ${clientData.mailingAddress || 'N/A'}, ${clientData.city || 'N/A'}, ${clientData.state || 'N/A'} ${clientData.zip || 'N/A'}
Years in Business: ${clientData.yearsInBusiness || 'N/A'}
Annual Revenue: $${clientData.annualRevenue?.toLocaleString() || 'N/A'}
Employee Count: ${clientData.employeeCount || 'N/A'}
Number of Locations: ${clientData.locationCount || 'N/A'}
Description: ${clientData.descriptionOfOperations || 'N/A'}

Lines of Business Requested: ${clientData.linesOfBusiness?.join(', ') || 'N/A'}

Prior Carrier: ${clientData.priorCarrier || 'N/A'}
Prior Premium: $${clientData.priorPremium?.toLocaleString() || 'N/A'}

Claims History:
${clientData.claimsHistory?.map((claim: any) => 
  `- ${claim.year}: ${claim.type} - $${claim.amount?.toLocaleString()} (${claim.status}) - ${claim.description}`
).join('\n') || 'No claims history provided'}

Risk Positives:
- All locations equipped with fire suppression systems
- Active safety training program
- Modern equipment and systems
- Experienced management team

Sign the letter as:
${clientData.brokerName || 'Sarah Chen, CPCU'}
${clientData.brokerTitle || 'Commercial Lines Broker'}
${clientData.agencyName || 'Summit Ridge Insurance Group'}`;

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
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

    const coverLetter = completion.choices[0].message.content || '';

    return NextResponse.json({
      success: true,
      coverLetter,
    });
  } catch (error: any) {
    console.error('Generate cover letter error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

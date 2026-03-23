# SubmissionAI

AI-powered commercial insurance submission automation. Upload broker documents, select lines of business, and generate complete ACORD form packages in minutes instead of hours.

## What It Does

Commercial insurance brokers spend 4-7 hours per submission manually transferring data between documents and ACORD forms. SubmissionAI reduces that to under 30 minutes.

**The Flow:**
1. **Upload Documents** — Drag & drop dec pages, loss runs, property schedules. AI extracts and structures the data.
2. **Select Lines of Business** — Pick coverage lines (GL, Property, WC, Auto, Umbrella, etc.). System maps to required ACORD forms.
3. **Review & Complete** — See what data was found vs. what's missing. Fill in gaps inline.
4. **Download Package** — Get filled ACORD PDFs (125, 126, 127, 130, 131, 140), cover letter, and XML export.

## Tech Stack

- **Next.js 15** / React 19 / TypeScript
- **OpenAI GPT-4o** — Document parsing, data extraction, cover letter generation
- **pdf-lib** — Fills real ACORD AcroForm templates (not generated PDFs)
- **Vercel** — Deployment

## Key Technical Decisions

- **Client-side AI pipeline** — PDF text extraction happens server-side, AI analysis runs client-side to bypass Vercel's 10-second function timeout
- **Real ACORD templates** — Uses actual fillable ACORD form PDFs with 924+ AcroForm fields, filled via pdf-lib with embedded Helvetica font
- **SessionStorage persistence** — Parsed data persists across step navigation and page refresh
- **Dynamic form mapping** — Lines of business selection determines which ACORD forms are required and what data fields are needed

## Running Locally

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_OPENAI_API_KEY` in `.env.local` for AI features.

## Live Demo

[submission-ai.vercel.app](https://submission-ai.vercel.app)

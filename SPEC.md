# SubmissionAI — AI-Powered Commercial Insurance Submission Engine

## Overview
A web app that demonstrates how AI can transform the commercial insurance submission workflow. Built as a "Build First" submission for Tenex (tenex.co) AI Strategist role.

## The Problem
Commercial insurance brokers spend 3-5 hours per submission manually:
- Gathering client data from scattered docs/emails
- Filling out ACORD forms (125, 126, 140) by hand
- Re-entering the same data into multiple carrier portals
- Manually comparing quotes that come back in different formats
- Building client-facing proposal documents

A 10-broker agency with 50 submissions/month wastes 1,500-2,500 hours/year on this.

## What This App Does

### 1. Smart Intake (Single Entry)
- User fills out ONE unified intake form with client business details
- OR uploads existing documents (loss runs, prior dec pages) and AI extracts the data
- Fields: Business name, type, revenue, employees, locations, years in business, claims history, coverage lines needed (GL, Property, WC, Auto, Umbrella)

### 2. Auto-Generate ACORD Forms
- From the intake data, auto-generates completed ACORD 125 (master commercial app) + relevant supplemental forms
- Displays a preview of the generated forms
- Broker can review/edit before proceeding

### 3. Carrier Matching & Submission Prep
- Based on the risk profile (industry type, revenue, claims history, coverage needs), AI recommends best-fit carriers
- Shows WHY each carrier is recommended (their appetite, strengths for this risk class)
- Generates carrier-specific submission summaries

### 4. Quote Comparison Dashboard
- Input area for quotes received from carriers (or demo with pre-loaded synthetic quotes)
- Side-by-side comparison matrix: carrier name, premium, deductibles, coverage limits, exclusions, AM Best rating
- Visual scoring/ranking of quotes
- Auto-generates a client-ready proposal summary

### 5. ROI Dashboard
- Shows metrics for the demo scenario:
  - Time saved per submission (from ~4 hours to ~30 minutes)
  - Monthly/annual hours recovered
  - Revenue impact (faster binding = more policies written per broker)
  - Error reduction estimate
  - Cost per broker saved annually

## Synthetic Data
ALL data is fake/synthetic:
- **Fake brokerage:** "Summit Ridge Insurance Group" - mid-size commercial brokerage, 12 brokers
- **Fake client:** "Pacific Coast Dining Group" - restaurant chain, 8 locations, $12M revenue, 180 employees, need GL + Property + Liquor Liability + WC + Umbrella
- **Fake carriers & quotes:**
  - Carrier A: "Hartford Commercial" - $47,200/yr, $2,500 deductible, $2M GL limit
  - Carrier B: "Travelers Select" - $44,800/yr, $5,000 deductible, $2M GL limit
  - Carrier C: "CNA Paramount" - $51,100/yr, $1,000 deductible, $3M GL limit
  - Carrier D: "Liberty Mutual Commercial" - $46,500/yr, $2,500 deductible, $2M GL limit
  - Carrier E: "Zurich North America" - $49,800/yr, $5,000 deductible, $2M GL limit

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- OpenAI API (GPT-4o-mini for form generation, carrier matching, proposal writing)
- Deployed on Vercel
- No database needed - all client-side with synthetic data

## Design
- Clean, professional, dark mode
- Dashboard-style layout
- Left sidebar navigation: Intake -> ACORD Forms -> Carrier Match -> Quote Compare -> ROI
- Step-by-step wizard flow
- Should look production-grade, not a hackathon project

## Pages / Routes
- `/` - Landing/hero page explaining what it does + "Start Demo" button
- `/demo` - Main dashboard with sidebar nav and step-by-step flow
  - Step 1: Client Intake Form (pre-filled with synthetic data, editable)
  - Step 2: Generated ACORD Forms (preview)
  - Step 3: Carrier Recommendations (AI-generated)
  - Step 4: Quote Comparison Matrix
  - Step 5: ROI Summary Dashboard

## Important Notes
- This is a DEMO/PROTOTYPE - not production software
- All data is synthetic
- OpenAI API calls should have a fallback (pre-generated responses) so the demo works even without an API key
- Focus on UX polish - this needs to look like something a strategist would present to a C-suite client
- No authentication needed
- Responsive but desktop-first (this will be screen-recorded)

## ACORD Form Details (for realistic generation)

### ACORD 125 - Commercial Insurance Application
Key fields to show populated:
- Named Insured, DBA, Mailing Address
- Business type (Corporation/LLC/etc), SIC/NAICS code
- Years in business, Years with current agent
- Description of operations
- Lines of business requested (checkboxes)
- Prior carrier info, policy numbers, expiration dates
- Total annual revenue, employee count
- Any prior claims (last 5 years)

### ACORD 126 - Commercial General Liability Section
- GL Classification codes
- Premises/Operations limits
- Products/Completed Operations
- Personal & Advertising Injury
- Each Occurrence / General Aggregate / Products Aggregate limits
- Additional coverages (Liquor Liability for restaurants)

## Tailwind CSS v4 Setup
In globals.css use:
```css
@import "tailwindcss";
```
Do NOT use @tailwind directives. Tailwind v4 uses @import syntax.

## File Structure
```
src/
  app/
    page.tsx                    # Landing page
    demo/
      page.tsx                  # Main demo dashboard
      layout.tsx                # Dashboard layout with sidebar
  components/
    landing/
      Hero.tsx
    demo/
      Sidebar.tsx
      IntakeForm.tsx            # Step 1
      AcordForms.tsx            # Step 2
      CarrierMatch.tsx          # Step 3
      QuoteComparison.tsx       # Step 4
      RoiDashboard.tsx          # Step 5
  lib/
    synthetic-data.ts           # All fake data
    openai.ts                   # OpenAI integration with fallbacks
    acord-generator.ts          # ACORD form generation logic
    carrier-matching.ts         # Carrier recommendation logic
  types/
    index.ts                    # TypeScript interfaces
```

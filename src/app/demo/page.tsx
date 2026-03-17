import { Suspense } from 'react';
import IntakeForm from '@/components/demo/IntakeForm';
import AcordForms from '@/components/demo/AcordForms';
import CarrierMatch from '@/components/demo/CarrierMatch';
import QuoteComparison from '@/components/demo/QuoteComparison';
import RoiDashboard from '@/components/demo/RoiDashboard';
import { DemoStep } from '@/types';

function DemoContent({ searchParams }: { searchParams: { step?: string } }) {
  const step = (searchParams.step as DemoStep) || 'intake';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {step === 'intake' && <IntakeForm />}
      {step === 'acord' && <AcordForms />}
      {step === 'carriers' && <CarrierMatch />}
      {step === 'quotes' && <QuoteComparison />}
      {step === 'roi' && <RoiDashboard />}
    </div>
  );
}

export default function DemoPage({ searchParams }: { searchParams: { step?: string } }) {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <DemoContent searchParams={searchParams} />
    </Suspense>
  );
}

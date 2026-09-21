import SubPageLayout from "../Components/SubPageLayout";

export default function AboutDenari() {
  return (
    <SubPageLayout title="About DENARI">
      <div className="space-y-6">
        <div className="rounded-3xl border border-neutral-200 bg-orange-50 px-6 py-8 text-center">
          <p className="text-2xl font-bold tracking-tight text-neutral-900">DENARI</p>
          <p className="mt-2 text-sm font-medium text-orange-700">Version 1.0.0</p>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold text-neutral-500">About the application</h2>
          <p className="text-sm leading-6 text-neutral-600">
            DENARI helps you understand your money, plan spending, and build savings goals from one trusted financial record.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">Features</h2>
          <div className="grid grid-cols-2 gap-3">
            {["Track expenses", "Set savings goals", "Plan budgets", "Understand trends"].map((feature) => (
              <div key={feature} className="rounded-2xl border border-neutral-200 px-4 py-4 text-sm font-medium text-neutral-800">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SubPageLayout>
  );
}
function StepCard({ number, title, description }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow border border-gray-200 hover:shadow-lg transition">
      <div className="text-blue-600 font-bold text-3xl mb-4">{number}.</div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function HowItWorks() {
  const steps = [
    { number: 1, title: "Request Access", description: "Complete the form with your college details." },
    { number: 2, title: "Super Admin Approval", description: "We verify details and confirm payment." },
    { number: 3, title: "Login & Manage", description: "Use sent credentials to start managing your portal." },
  ];

  return (
    <section className="bg-white py-20" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-center mb-16">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}

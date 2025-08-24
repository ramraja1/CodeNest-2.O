function FeatureCard({ title, description }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition border border-gray-200">
      <h4 className="text-xl font-semibold mb-3">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function Features() {
  const features = [
    { title: "Contest Management", description: "Create and manage contests with ease." },
    { title: "Student Tracking", description: "Monitor performance and leaderboards." },
    { title: "Reports & Analytics", description: "Detailed insights into student activity." },
  ];

  return (
    <section className="bg-gray-50 py-20" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-center mb-16">Key Features</h3>
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((f, i) => <FeatureCard key={i} {...f} />)}
        </div>
      </div>
    </section>
  );
}

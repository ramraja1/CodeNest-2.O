export default function SectionWrapper({ title, children, className }) {
  return (
    <section className={`bg-white rounded-xl shadow p-6 mb-8 ${className || ""}`}>
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
      {children}
    </section>
  );
}

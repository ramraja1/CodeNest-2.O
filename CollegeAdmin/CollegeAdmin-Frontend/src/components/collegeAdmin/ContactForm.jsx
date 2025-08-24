import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", college: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const changeHandler = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/collegeadmin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      res.ok
        ? (alert("Request submitted!"), setFormData({ name: "", email: "", college: "", phone: "", message: "" }))
        : alert("Error submitting");
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white py-20" id="contact">
      <div className="max-w-3xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-center mb-10">Get Started</h3>
        <form onSubmit={submitHandler} className="grid gap-6">
          {["name","email","college","phone"].map((field) => (
            <input
              key={field}
              type={field === "email" ? "email" : "text"}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData[field]}
              onChange={changeHandler}
              className="p-4 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400"
              required
            />
          ))}
          <textarea
            name="message"
            placeholder="Message (optional)"
            value={formData.message}
            onChange={changeHandler}
            rows="4"
            className="p-4 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400"
          ></textarea>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Submit Request"}
          </button>
        </form>
      </div>
    </section>
  );
}

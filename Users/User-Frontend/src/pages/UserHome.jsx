// src/AdminLanding.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

 function UserLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogin=()=>{
      navigate("/user-login")
  }

  return (
    <div className="relative w-full min-h-screen bg-white text-gray-900">
      {/* ===== NAVBAR ===== */}
      <header className="fixed top-0 left-0 right-0 z-40">
        <nav
          aria-label="Main Navigation"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between bg-gray-900/70 text-white backdrop-blur rounded-b-2xl shadow"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-emerald-500" />
            <span className="font-bold tracking-wide">CodeNest</span>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-8 text-sm text-gray-200">
            {["Explore", "Product", "Docs", "Sign in"].map((item) => (
              <li key={item} className="hover:text-white cursor-pointer">{item}</li>
            ))}
            <li>
              <button className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 font-semibold" onClick={handleLogin}>
                Create Account
              </button>
            </li>
          </ul>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg px-3 py-2 bg-white/10"
          >
            ☰
          </button>
        </nav>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-x-0 top-16 bg-gray-900/95 backdrop-blur-md text-white md:hidden py-4 z-50">
            <ul className="flex flex-col items-center gap-4">
              {["Explore", "Product", "Docs", "Sign in"].map((item) => (
                <li
                  key={item}
                  className="hover:text-emerald-300 cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </li>
              ))}
              <li>
                <button className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 font-semibold" onClick={handleLogin}>
                  Create Account
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Background Shapes */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gray-900"
        >
          <div className="absolute -left-40 -top-20 h-72 w-96 rotate-6 bg-gray-800/70 rounded-3xl" />
          <div className="absolute left-28 top-10 h-72 w-96 -rotate-3 bg-gray-800/50 rounded-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl pt-28 md:pt-32 pb-24 md:pb-40 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            
            {/* Diagram */}
            <motion.div
              initial={{ opacity: 0, x: -40, rotate: -3 }}
              whileInView={{ opacity: 1, x: 0, rotate: -6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="relative z-0 order-2 md:order-1"
            >
              <div className="mx-auto md:ml-0 w-full max-w-xs sm:max-w-sm md:max-w-md">
                <div className="rounded-3xl bg-white shadow-2xl p-6">
                  <div className="flex gap-3 mb-5">
                    <span className="h-8 w-8 rounded-lg bg-cyan-400" />
                    <span className="h-8 w-8 rounded-lg bg-lime-400" />
                    <span className="h-8 w-8 rounded-lg bg-amber-400" />
                    <span className="h-8 w-8 rounded-lg bg-sky-400" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-3 rounded bg-gray-200 ${idx % 2 ? "w-3/4" : "w-full"}`}
                      />
                    ))}
                    <div className="mt-4 h-28 rounded-xl bg-gray-100" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="text-white order-1 md:order-2 z-20"
            >
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                A New Way to Manage <br className="hidden sm:block" /> Your Coding Platform
              </h1>
              <p className="mt-5 text-gray-200 text-lg max-w-xl">
                Build contests, add questions, monitor submissions and insights — 
                everything your college needs to run coding at scale.
              </p>
              <div className="mt-8 flex items-center gap-4 flex-wrap">
              
                <a
                  href="#features"
                  className="text-emerald-300 text-2xl px-1.5 font-semibold hover:text-white"
                >
                  See features →
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* White Diagonal */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-full h-32 md:h-44 z-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon points="0,40 100,65 100,100 0,100" fill="#ffffff" />
        </svg>
      </section>

      {/* ===== SECTION: Start Exploring ===== */}
      <section id="explore" className="bg-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20"
        >
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-emerald-600">Start Exploring</h2>
              <p className="mt-4 text-gray-600 max-w-xl">
                Structured paths for Student: Solve Precised SDE, Daily Problem of the day,
                join contests, and track Progress — step by step.
              </p>
              <a className="mt-6 inline-block font-semibold text-emerald-600 hover:underline">
                Student Guide →
              </a>
            </div>
            <div className="flex justify-center md:justify-end gap-4">
              {["bg-emerald-50", "bg-cyan-50", "bg-amber-50"].map((color, idx) => (
                <div
                  key={color}
                  className={`h-48 w-28 sm:w-36 rounded-2xl shadow ${color} ${idx === 1 ? "-mt-6" : idx === 2 ? "-mt-12" : ""}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== SECTION: Features ===== */}
      <section id="features" className="bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 grid gap-8 sm:grid-cols-2 md:grid-cols-3"
        >
          {[
            ["Contest Management", "Create, schedule, proctor, and analyze contests effortlessly."],
            ["Question Bank", "Curate problems, test cases, tags, and difficulty levels."],
            ["Insights & Reports", "Track performance, plagiarism flags, and growth metrics."]
          ].map(([t, d]) => (
            <div
              key={t}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-gray-600">{d}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center">
          © {new Date().getFullYear()} CodeNest • Built with ❤ in India
        </div>
      </footer>
    </div>
  );
}

export default UserLanding
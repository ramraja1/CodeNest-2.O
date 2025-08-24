import hero from "../../assets/hero.png";

export default function Hero() {
  return (
    <section className="relative bg-white pt-32 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row items-center gap-20 md:gap-32">
        
        {/* Left Content */}
        <div className="flex-1 max-w-xl">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-8 tracking-tight">
            Empower Your College with <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">
              Contests, Leaderboards & Analytics
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-12 leading-relaxed tracking-wide">
            Manage coding contests, track student progress, and build a vibrant learning culture — all from a single powerful, easy-to-use portal designed just for your college.
          </p>
          <a
            href="#contact"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-12 py-5 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition transform font-semibold text-lg md:text-xl"
            aria-label="Get Started with Codenest"
          >
            Get Started
          </a>
        </div>

        {/* Right Side: Image */}
        <div className="flex-1 w-full max-w-lg h-[450px] rounded-3xl shadow-2xl bg-white flex items-center justify-center select-none">
          <img
            src={hero}
            alt="Codenest branded student illustration"
            className="h-[80%] w-auto rounded-2xl object-contain shadow-xl"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logoCodenest.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Contact", href: "#contact" },
  ];

  const isActive = (path) => {
    // Handles both anchors and route paths
    if (path.startsWith("#")) return false;
    return location.pathname === path;
  };

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md transition-all ${
        scrolled ? "bg-white/90 shadow-lg" : "bg-white/70"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <img
            src={logo}
            alt="CodeNest Logo"
            className="w-11 h-11 object-contain drop-shadow-md"
          />
          <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text select-none">
            CodeNest
          </span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6 font-medium text-gray-700">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`relative py-1 transition-colors duration-300
                ${isActive(item.href) ? "text-blue-600" : "hover:text-blue-600"}
              `}
            >
              {item.name}
              <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Login Button */}
        <div className="hidden md:block">
          <Link
            to="/college-login"
            className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition"
          >
            Login
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col justify-center space-y-1 focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          <span
            className={`w-6 h-0.5 bg-gray-800 transition-transform ${
              isOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-gray-800 transition-opacity ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-gray-800 transition-transform ${
              isOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile dropdown menu with animation */}
      <div
        className={`md:hidden bg-white/95 border-t border-gray-200 shadow-lg overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="flex flex-col px-6 py-4 space-y-4">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="hover:text-blue-600 transition font-medium"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <Link
            to="/college-login"
            onClick={() => setIsOpen(false)}
            className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition text-center"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}

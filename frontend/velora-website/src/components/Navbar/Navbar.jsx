import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/projects", label: "Projects" },
    { to: "/3d", label: "3D Showroom" },
    { to: "/gallery", label: "Gallery" },
    { to: "/guide", label: "Guide" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/offering", label: "Offering" },
    { to: "/more", label: "More" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#c9a227]/95 px-4 py-3 sm:py-4 text-white shadow-lg backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="/" className="bg-white px-5 py-1 rounded-full shadow-md border border-amber-100/50 flex items-center justify-center transition hover:bg-amber-50" aria-label="Velora home">
          <img src="/logo.png" alt="Velora logo" className="h-13 sm:h-15 w-auto object-contain" />
        </a>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-6 lg:gap-8 font-medium text-sm">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `transition duration-300 hover:text-amber-100 py-1.5 border-b-2 ${isActive ? "border-white text-white font-semibold" : "border-transparent text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="block md:hidden p-2 text-white hover:bg-amber-800/40 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/20">
          <ul className="flex flex-col gap-2 pb-2">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block py-2.5 px-4 rounded-xl text-sm font-medium transition ${isActive ? "bg-white/20 text-white font-semibold" : "hover:bg-white/10 text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

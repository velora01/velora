import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-yellow-600/95 px-4 py-4 text-white shadow-lg backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <a href="/" className="bg-white/10 p-1" aria-label="Velora home">
          <img src="/logo.png" alt="Velora logo" className="h-10 w-auto object-contain" />
        </a>

        <ul className="flex flex-1 justify-center gap-4  font-medium sm:gap-8 text-sm ">
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/projects">Projects</NavLink>
          </li>

          <li>
            <NavLink to="/gallery">Gallery</NavLink>
          </li>
          <li>
            <NavLink to="/guide">Guide</NavLink>
          </li>
          <li>
            <NavLink to="/about">About</NavLink>
          </li>
          <li>
            <NavLink to="/contact">Contact</NavLink>
          </li>
          <li>
            <NavLink to="/offering">Offering</NavLink>
          </li>
          <li>
            <NavLink to="/more">More</NavLink>
          </li>

        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

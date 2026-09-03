const Footer = () => {
  return (
    <footer className="bg-[#111111] text-white pt-12 sm:pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-[#C9A227]">Velora Antaraal</h2>
          <p className="text-gray-300 leading-8">
            Velora Antaraal is a premium luxury interior design studio based in Pune, specializing in bespoke residential and boutique commercial spaces.
            We create timeless living environments with curated materials, custom modular furniture, and architectural finishes.
          </p>
          <div className="space-y-2 text-gray-400">
            <p className="font-semibold text-gray-200">Studio</p>
            <p>Velora Antaraal</p>
            <p>Wakad Chowk, Aundh Road, Pune, Maharashtra 411057</p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-6">Contact</h3>
          <ul className="space-y-4 text-gray-400">
            <li>
              <span className="font-semibold text-gray-200">Phone:</span> +91 88 88 88 8888
            </li>
            <li>
              <span className="font-semibold text-gray-200">Email:</span> info@velora.family
            </li>
            <li>
              <span className="font-semibold text-gray-200">Hours:</span> Mon - sun, 10:00am - 10:00pm
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-6">Quick Links</h3>
          <ul className="space-y-4 text-gray-400">
            <li> <a href="/" className="hover:text-[#C9A227] transition">Home</a></li>
            <li> <a href="/about" className="hover:text-[#C9A227] transition">About</a></li>
            <li> <a href="/projects" className="hover:text-[#C9A227] transition">Projects</a></li>
            <li> <a href="/contact" className="hover:text-[#C9A227] transition">Contact</a></li>
            <li> <a href="/offering" className="hover:text-[#C9A227] transition">Offering</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-6">Follow Us</h3>
          <ul className="space-y-4 text-gray-400">
            <li> <a href="https://www.instagram.com/velora_family/" className="hover:text-[#C9A227] transition" target="_blank" rel="noopener noreferrer">Instagram: @velora.family</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-12 pt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-gray-400 text-sm">
          <p>© 2026 Velora. All rights reserved.</p>
          <p>Designed for elevated interiors and exceptional client experiences.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

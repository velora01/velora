const Footer = () => {
  return (
    <footer className="bg-[#111111] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid gap-10 lg:grid-cols-4">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-[#C9A227]">Velora</h2>
          <p className="text-gray-300 leading-8">
            Velora is a premium interior design studio based in Nettle Creek, specializing in luxury residential and boutique commercial spaces.
            We create bespoke living environments with curated materials, custom furniture, and timeless finishes.
          </p>
          <div className="space-y-2 text-gray-400">
            <p className="font-semibold text-gray-200">Studio</p>
            <p>velora antraal</p>
            <p>wakad chauk , aundh raod, pune maharashtra 411008</p>
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
            <li> <a href="/" className="hover:text-[#C9A227]">Home</a></li>
            <li> <a href="/about" className="hover:text-[#C9A227]">About</a></li>
            <li> <a href="/projects" className="hover:text-[#C9A227]">Projects</a></li>
            <li> <a href="/contact" className="hover:text-[#C9A227]">Contact</a></li>
            <li> <a href="/services" className="hover:text-[#C9A227]">Services</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-6">Follow Us</h3>
          <ul className="space-y-4 text-gray-400">
            <li> <a href="https://www.instagram.com/velora.family/" className="hover:text-[#C9A227]" target="_blank" rel="noopener noreferrer">Instagram: @velora.family</a></li>
            <li> <a href="https://www.pinterest.com/velora_interiors/" className="hover:text-[#C9A227]" target="_blank" rel="noopener noreferrer">Pinterest: /velora-interiors</a></li>
            <li> <a href="https://www.linkedin.com/company/velora-studio/" className="hover:text-[#C9A227]" target="_blank" rel="noopener noreferrer">LinkedIn: Velora Studio</a></li>
            <li> <a href="https://www.facebook.com/velora.interiors/" className="hover:text-[#C9A227]" target="_blank" rel="noopener noreferrer">Facebook: Velora Interiors</a></li>
            <li> <a href="https://www.google.com/maps/place/Velora+antraal/@18.520454,73.856789,17z/data=!3m1!4b1!4m5!3m4!1s0x3bc2b1d8e8e8e8e8:0x3b3b3b3b3b3b3b3b!8m2!3d18.520454!4d73.856789" className="hover:text-[#C9A227]" target="_blank" rel="noopener noreferrer">Google Business: Velora antraal</a></li>
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

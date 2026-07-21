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
            <p>145 Nettle Creek Road,</p>
            <p>Marigold Hill, CA 90210</p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-6">Contact</h3>
          <ul className="space-y-4 text-gray-400">
            <li>
              <span className="font-semibold text-gray-200">Phone:</span> +1 (555) 678-9101
            </li>
            <li>
              <span className="font-semibold text-gray-200">Email:</span> contact@velora.com
            </li>
            <li>
              <span className="font-semibold text-gray-200">Hours:</span> Mon - Fri, 9:00am - 6:00pm
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-6">Quick Links</h3>
          <ul className="space-y-4 text-gray-400">
            <li>Home</li>
            <li>About</li>
            <li>Projects</li>
            <li>Contact</li>
            <li>Services</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-6">Follow Us</h3>
          <ul className="space-y-4 text-gray-400">
            <li>Instagram: @velora.design</li>
            <li>Pinterest: /velora-interiors</li>
            <li>LinkedIn: Velora Studio</li>
            <li>Facebook: Velora Interiors</li>
            <li>Google Business: Velora Nettle Creek</li>
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

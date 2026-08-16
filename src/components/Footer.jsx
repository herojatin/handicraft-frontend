import logo from "../assets/logo/logo.png";
import { Link } from "react-router-dom";


export default function Footer() {
  return (
    <footer className="bg-[#2b2b2b] text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">

        {/* Brand + About */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Haswani Handicrafts" className="h-12 w-auto" />
            <div>
              <h3 className="text-white text-lg tracking-widest font-semibold">
                HASWANI HANDICRAFTS
              </h3>
              <p className="text-xs text-gray-400 tracking-wide">
                Estd. 1967 • Govt. Recognized Export House
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-gray-400">
            Manufacturers & exporters of antique reproduction furniture,
            jharokhas, arches, doors, windows, tables and handcrafted décor.
            Trusted globally for decades of craftsmanship.
          </p>
        </div>

       
        <div>
          <h4 className="text-white text-sm tracking-[0.3em] mb-6">
            QUICK LINKS
          </h4>
          <ul className="space-y-3 text-sm">
            <li> <Link to = "/"  className="hover:text-white transition cursor-pointer">Home</Link></li>
            <li> <Link to = "/shop"  className="hover:text-white transition cursor-pointer">Our Products</Link></li>
            <li> <Link to = "/about"  className="hover:text-white transition cursor-pointer">About Us</Link></li>
            <li> <Link to = "/contact"  className="hover:text-white transition cursor-pointer">Contact</Link></li>
          </ul>
        </div>

       
        <div>
          <h4 className="text-white text-sm tracking-[0.3em] mb-6">
            CONTACT
          </h4>

          <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
            <p>
              C-13 B, Basni First Phase,<br />
              Near Basni Railway Station,<br />
              Jodhpur - 342001 (Raj.) India
            </p>

            <p>
              +91-98290-23455 <br />
              +91-98293-11703
            </p>

            <p>info@haswanihandicrafts.com</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Haswani Handicrafts. All Rights Reserved.</p>
          <p className="tracking-wide">
            Crafted with precision & tradition
          </p>
        </div>
      </div>
    </footer>
  );
}

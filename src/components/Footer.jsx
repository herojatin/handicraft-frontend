
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import logo from "../assets/logo/HaswaniLogo.png";

export default function Footer() {
  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Our Products", path: "/shop" },
    { name: "About Us", path: "/about" },
    { name: "Fair & Events", path: "/fairandevents" },
    { name: "Product Tour", path: "/product-tour" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <footer className="w-full bg-[#2b2b2b] text-gray-300 border-t border-white/10">

      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8 lg:py-9">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1.25fr] gap-8 lg:gap-6 items-start">

          {/* BRAND */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">

            {/* LARGE LOGO WITH CROPPED WHITESPACE */}
            <Link
              to="/"
              className="relative block w-[290px] max-w-full h-[105px] overflow-hidden mb-3"
            >
              <img
                src={logo}
                alt="Haswani Handicrafts"
                className="
                  absolute
                  left-1/2 top-1/2
                  -translate-x-1/2 -translate-y-1/2
                  w-[380px] max-w-none h-auto
                  object-contain
                  brightness-0 invert
                "
              />
            </Link>

            <p className="max-w-[320px] text-[13px] leading-[22px] text-gray-400">
              Manufacturers and exporters of antique
              reproduction furniture and handcrafted décor,
              celebrating traditional Indian craftsmanship.
            </p>

          </div>

         
          {/* QUICK LINKS */}
<div className="w-full flex flex-col items-center text-center">

  <h4 className="text-white text-[13px] font-semibold tracking-[0.18em] mb-4">
    QUICK LINKS
  </h4>

  <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-left">
    {quickLinks.map((link) => (
      <li key={link.path}>
        <Link
          to={link.path}
          className="text-[13px] text-gray-400 hover:text-white transition-colors duration-300"
        >
          {link.name}
        </Link>
      </li>
    ))}
  </ul>

</div>

          {/* CONTACT */}
          <div className="md:col-span-2 lg:col-span-1 text-center md:text-left">

            <h4 className="text-white text-[13px] font-semibold tracking-[0.18em] mb-4 translate-x-12">
  CONTACT
</h4>

            <div className="space-y-3 text-[13px] leading-[22px] text-gray-400">

              {/* ADDRESS */}
              <div className="flex items-start justify-center md:justify-start gap-3">
                <MapPin size={16} className="shrink-0 mt-1 text-gray-300" />

                <p>
                  C-13 B, Basni First Phase,
                  <br />
                  Near Basni Railway Station,
                  <br />
                  Jodhpur - 342001 (Raj.) India
                </p>
              </div>

              {/* PHONE */}
              <div className="flex items-start justify-center md:justify-start gap-3">
                <Phone size={16} className="shrink-0 mt-1 text-gray-300" />

                <div className="flex flex-col items-start">
                  <a
                    href="tel:+919829023455"
                    className="hover:text-white transition-colors"
                  >
                    +91-98290-23455
                  </a>

                  <a
                    href="tel:+919829311703"
                    className="hover:text-white transition-colors"
                  >
                    +91-98293-11703
                  </a>
                </div>
              </div>

              {/* EMAIL */}
              <div className="flex items-start justify-center md:justify-start gap-3">
                <Mail size={16} className="shrink-0 mt-1 text-gray-300" />

                <a
                  href="mailto:info@haswanihandicrafts.com"
                  className="hover:text-white transition-colors break-all"
                >
                  info@haswanihandicrafts.com
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px] text-gray-500">

          <p>
            © {new Date().getFullYear()} Haswani Handicrafts.
            All Rights Reserved.
          </p>

          <p>
            Crafted with precision & tradition
          </p>

        </div>
      </div>

    </footer>
  );
}

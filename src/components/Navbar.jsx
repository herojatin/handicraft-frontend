import { Link, useLocation } from "react-router-dom";
import HaswaniLogo from "../assets/logo/HaswaniLogo.png";

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const textColor = isHome ? "text-white" : "text-[#3e2a1d]";

  const underlineColor = isHome
    ? "after:bg-white"
    : "after:bg-[#3e2a1d]";

  const navItem =
    `relative px-2 py-1 transition duration-300 ${textColor} ` +
    `after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 ${underlineColor} after:transition-all after:duration-300 hover:after:w-full`;

  return (
    <header
      className={`
        ${
          isHome
            ? "absolute top-0 bg-transparent"
            : "sticky top-0 bg-white shadow-sm"
        }
        left-0 w-full z-50
      `}
    >
      {/* Logo section */}
      <div className="relative w-full h-[125px] flex items-center justify-center">

        <img
          src={HaswaniLogo}
          alt="Haswani Handicrafts"
          className={`
            absolute
            left-1/2
            top-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-[350px]
            sm:w-[420px]
            lg:w-[500px]
            max-w-none
            h-auto
            object-contain
            ${
              isHome
                ? "mix-blend-screen brightness-0 invert"
                : ""
            }
          `}
        />

      </div>

      {/* Navigation links */}
      <nav className="relative w-full pb-5">
        <div className="max-w-7xl w-full mx-auto px-6">
          <div className="flex flex-nowrap justify-between items-center text-xs tracking-widest gap-4">

            <Link to="/" className={navItem}>
              HOME
            </Link>

            <Link to="/about" className={navItem}>
              ABOUT US
            </Link>

            <Link to="/fairandevents" className={navItem}>
              FAIR & EVENTS
            </Link>

            <Link to="/product-tour" className={navItem}>
              PRODUCT TOUR
            </Link>

            <Link to="/testimonials" className={navItem}>
              TESTIMONIALS
            </Link>

            <Link to="/contact" className={navItem}>
              CONTACT US
            </Link>

            <Link to="/dealer-login" className={navItem}>
              DEALER LOGIN
            </Link>

          </div>
        </div>
      </nav>
    </header>
  );
}
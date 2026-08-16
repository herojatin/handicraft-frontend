import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const textColor = isHome ? "text-white" : "text-[#3e2a1d]";
  const underlineColor = isHome ? "after:bg-white" : "after:bg-[#3e2a1d]";

  const navItem =
    `relative px-2 py-1 transition duration-300 ${textColor} ` +
    `after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 ${underlineColor} after:transition-all after:duration-300 hover:after:w-full`;

  return (
    <header
      className={`${
        isHome
          ? "absolute top-6"
          : "sticky top-0 bg-white shadow-sm"
      } left-0 w-full z-50`}
    >
      {/* Logo + Tagline */}
      <div className={`flex flex-col items-center ${textColor}`}>
        <div className="text-4xl font-semibold tracking-widest">HH</div>

        <div className="text-[11px] tracking-wider mt-1 opacity-90">
          (Estd. 1967)
        </div>

        <div className="text-[10px] tracking-widest uppercase opacity-80 mt-[2px]">
          A Govt. Recognized Export House
        </div>
      </div>

      {/* Nav links */}
      <nav className="mt-6">
        <div className="max-w-7xl w-full mx-auto px-6">
          <div className="flex flex-nowrap justify-between items-center text-xs tracking-widest">
            <Link to="/" className={navItem}>HOME</Link>
            <Link to="/about" className={navItem}>ABOUT US</Link>
            <Link to="/fairandevents" className={navItem}>FAIR & EVENTS</Link>
            <Link to="/product-tour" className={navItem}>PRODUCT TOUR</Link>
            <Link to="/testimonials" className={navItem}>TESTIMONIALS</Link>
            <Link to="/contact" className={navItem}>CONTACT US</Link>
            <Link to="/dealer-login" className={navItem}>DEALER LOGIN</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  ArrowUpRight,
} from "lucide-react";

import logo from "../assets/logo/haswaniLogo.png";

export default function SocialSection() {
  const facebookUrl =
    "https://www.facebook.com/haswanihandicrafts";

  // Replace this with your actual Instagram profile URL
  const instagramUrl = "https://www.instagram.com/";

  return (
   <section className="relative w-full overflow-hidden bg-[#2b2b2b] text-white py-12 sm:py-14 lg:py-16 px-5 sm:px-8">

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1fr] items-center gap-10 lg:gap-6">

          {/* CENTER COMPANY SECTION */}
          <div className="order-1 lg:order-2 flex flex-col items-center text-center">

            {/* LOGO */}
            <div className="relative w-full max-w-[360px] h-[130px] sm:h-[150px] flex items-center justify-center mb-5">
              <img
                src={logo}
                alt="Haswani Handicrafts"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[380px] max-w-none h-auto object-contain brightness-0 invert"
              />
            </div>

            {/* ESTABLISHED */}
            <p className="text-[#d8b989] text-xs tracking-[0.35em] uppercase mb-4">
              Established 1967
            </p>

            {/* HEADING */}
            <h2 className="text-xl sm:text-2xl lg:text-[28px] font-semibold tracking-[0.12em] leading-snug">
              HASWANI HANDICRAFTS
            </h2>

            {/* DIVIDER */}
            <div className="w-16 h-[1px] bg-[#c9a675] my-6" />

            {/* DESCRIPTION */}
            <p className="max-w-[460px] text-gray-300 text-sm sm:text-[15px] leading-7">
              Celebrating generations of craftsmanship,
              Haswani Handicrafts creates distinctive
              antique reproduction furniture and handcrafted
              décor inspired by timeless Indian artistry.
            </p>

            {/* CTA */}
            <Link
              to="/about"
              className="mt-7 inline-flex items-center gap-2 text-xs tracking-[0.18em] text-[#e2c497] hover:text-white transition-colors duration-300 group"
            >
              DISCOVER OUR STORY
              <ArrowUpRight
                size={16}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
              />
            </Link>

          </div>

          {/* SOCIAL LINKS - MOBILE SIDE BY SIDE */}
          <div className="order-2 lg:contents">

            <div className="grid grid-cols-2 lg:contents gap-4 sm:gap-6">

              {/* FACEBOOK */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Haswani Handicrafts on Facebook"
                className="lg:order-1 group flex flex-col items-center justify-center text-center min-h-[180px] sm:min-h-[230px] lg:min-h-[320px] border border-[#74634d]/40 rounded-xl lg:rounded-none lg:border-0 lg:border-r lg:border-[#74634d]/40 px-3 sm:px-6 transition-colors duration-500 hover:bg-white/5"
              >
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-[#bfa079]/60 flex items-center justify-center mb-5 group-hover:bg-[#c9a675] transition-all duration-500">
                  <Facebook
                    size={28}
                    strokeWidth={1.5}
                    className="text-[#d8b989] group-hover:text-[#292929] transition-colors duration-500"
                  />
                </div>

                <h3 className="text-xs sm:text-sm font-semibold tracking-[0.15em] sm:tracking-[0.25em]">
                  FACEBOOK
                </h3>

                <p className="hidden sm:block text-gray-400 text-xs mt-3 leading-6">
                  Follow our latest news,
                  <br />
                  events and updates.
                </p>

                <div className="flex items-center gap-1 text-[#d8b989] text-[10px] sm:text-xs mt-4 tracking-wider">
                  FOLLOW US
                  <ArrowUpRight
                    size={15}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                </div>
              </a>

              {/* INSTAGRAM */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Haswani Handicrafts on Instagram"
                className="lg:order-3 group flex flex-col items-center justify-center text-center min-h-[180px] sm:min-h-[230px] lg:min-h-[320px] border border-[#74634d]/40 rounded-xl lg:rounded-none lg:border-0 lg:border-l lg:border-[#74634d]/40 px-3 sm:px-6 transition-colors duration-500 hover:bg-white/5"
              >
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-[#bfa079]/60 flex items-center justify-center mb-5 group-hover:bg-[#c9a675] transition-all duration-500">
                  <Instagram
                    size={28}
                    strokeWidth={1.5}
                    className="text-[#d8b989] group-hover:text-[#292929] transition-colors duration-500"
                  />
                </div>

                <h3 className="text-xs sm:text-sm font-semibold tracking-[0.15em] sm:tracking-[0.25em]">
                  INSTAGRAM
                </h3>

                <p className="hidden sm:block text-gray-400 text-xs mt-3 leading-6">
                  Explore our creations
                  <br />
                  and craftsmanship.
                </p>

                <div className="flex items-center gap-1 text-[#d8b989] text-[10px] sm:text-xs mt-4 tracking-wider">
                  EXPLORE
                  <ArrowUpRight
                    size={15}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                </div>
              </a>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

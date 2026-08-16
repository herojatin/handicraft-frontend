import { useEffect, useState } from "react";
import slide1 from "../assets/hero/slide1.jpg";
import slide2 from "../assets/hero/slide2.jpg";
import slide3 from "../assets/hero/slide3.jpg";
import OurProducts from "../components/OurProducts";
import Inspirations from "../components/Inspirations";
import SocialSection from "../components/SocialSection";
import Footer from "../components/Footer";

export default function Home() {
  const slides = [slide1, slide2, slide3];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <>
     {/* HERO SECTION */}
<section className="relative min-h-[100svh] w-full overflow-hidden">
  {slides.map((img, index) => (
    <div
      key={index}
      className={`absolute inset-0 transition-opacity duration-1000 ${
        index === current ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundImage: `url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/55 md:bg-black/40" />
    </div>
  ))}

  {/* CONTENT */}
  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white 
                  px-5 sm:px-8 md:px-12 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">

    {/* Subheading */}
    <h2 className="text-[11px] sm:text-xs md:text-lg tracking-[0.22em] md:tracking-[0.32em] mb-4 md:mb-6 opacity-90">
      We Make Things With Love
    </h2>

    {/* Main Heading */}
    <h1 className="text-[32px] sm:text-4xl md:text-6xl font-semibold 
                   tracking-[0.15em] md:tracking-[0.25em] leading-[1.15] md:leading-tight mb-5 md:mb-8">
      ARTS & CRAFTS
    </h1>

    {/* Description */}
    <p className="max-w-[280px] sm:max-w-md md:max-w-xl 
                  text-[13px] sm:text-sm md:text-base leading-relaxed mb-8 md:mb-10 opacity-90">
      Haswani Handicrafts is a recognized export house manufacturing
      exquisite wooden, iron and handcrafted products with decades of
      craftsmanship and trust.
    </p>

    {/* CTA */}
    <button className="border border-white px-7 py-2.5 sm:px-9 sm:py-3 md:px-12 md:py-3 
                       tracking-[0.2em] text-[11px] sm:text-xs font-medium
                       hover:bg-white hover:text-black transition duration-300">
      FACTORY TOUR
    </button>
  </div>

  {/* DOTS */}
  <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
    {slides.map((_, index) => (
      <button
        key={index}
        onClick={() => setCurrent(index)}
        className={`h-2 w-2 md:h-2.5 md:w-2.5 rounded-full transition-all duration-300 ${
          current === index ? "bg-white scale-125" : "bg-white/50"
        }`}
      />
    ))}
  </div>
</section>

      <OurProducts />
      <Inspirations />
      <SocialSection />
      <Footer />
    </>
  );
}
import { useEffect, useState } from "react";
import slide1 from "../assets/hero/slide1.jpg";
import slide2 from "../assets/hero/slide2.jpg";
import slide3 from "../assets/hero/slide3.jpg";
import { Link } from "react-router-dom";

// product section images
import productLeft from "../assets/products/left.jpg";
import productRight from "../assets/products/right.png";

export default function Home() {
  const slides = [slide1, slide2, slide3];
  const [current, setCurrent] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <>


      {/* ================= OUR PRODUCTS SECTION ================= */}
      <section className="w-full h-screen flex">
        {/* LEFT SIDE (Background + Text) */}
        <div
          className="w-1/2 h-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${productLeft})` }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Text Content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-20 text-white">
            <h4 className="tracking-[0.4em] text-sm mb-6">OUR PRODUCTS</h4>

            <div className="w-24 h-[1px] bg-[#c7a17a] mb-8" />

            <p className="text-lg leading-relaxed max-w-xl mb-10 opacity-90">
              Haswani Handicrafts Jodhpur spent decades in manufacturing and
              exporting of handicrafts products and it is not an unknown name in
              handicraft industry around the globe.
            </p>

            <p className="text-sm leading-relaxed max-w-xl mb-10 opacity-80">
              We are the manufacturer and exporter of industrial, recycled,
              reclaimed, teakwood and many other decorative antique crafted
              products that you are looking for.
            </p>

           <Link
  to="/product-tour"
  className="bg-[#c7a17a] text-black px-10 py-4 tracking-[0.3em] text-xs font-semibold w-max hover:opacity-90 transition inline-block"
>
  PRODUCT TOUR
</Link>
          </div>
        </div>

        {/* RIGHT SIDE (Centered Image) */}
        <div className="w-1/2 h-full flex items-center justify-center bg-[#f5f5f5]">
          <img
            src={productRight}
            alt="product"
            className="h-[85%] object-contain"
          />
        </div>
      </section>
    </>
  );
}

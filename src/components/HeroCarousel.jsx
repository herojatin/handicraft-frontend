import { useState } from "react";

const slides = [
  {
    title: "ARTS & CRAFTS",
    subtitle: "We Make Things With Love",
    description:
      "Art and Crafts give the society to see the offices, home and world with artistic eyes. Antiques defines our style of living.",
    image: "/images/hero1.jpg",
  },
  {
    title: "REFINED",
    subtitle: "Handcrafted Excellence",
    description:
      "Haswani Handicrafts is not just a name but it defines the word handicraft with eye to fulfill the need of their clients.",
    image: "/images/hero2.jpg",
  },
  {
    title: "HANDMADE",
    subtitle: "Since 1967",
    description:
      "Blending tradition with contemporary design, creating timeless pieces loved worldwide.",
    image: "/images/hero3.jpg",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${slides[current].image})` }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
        <p className="italic tracking-wide mb-4">
          {slides[current].subtitle}
        </p>

        <h1 className="text-5xl md:text-7xl tracking-[0.3em] mb-6">
          {slides[current].title}
        </h1>

        <div className="w-24 h-[1px] bg-[#c7a77b] mb-6" />

        <p className="max-w-2xl text-sm md:text-base leading-7 opacity-90">
          {slides[current].description}
        </p>

        <button className="mt-10 bg-[#c7a77b] text-black px-10 py-4 tracking-widest text-sm hover:opacity-90">
          FACTORY TOUR
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-10 w-full flex justify-center gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full border border-white ${
              current === index ? "bg-white" : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

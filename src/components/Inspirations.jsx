import { useState, useEffect } from "react";
import axios from "axios";
import bg from "../assets/inspiration/bg.jpg";
import { BASE_URL } from "../config/api";
const defaultTestimonials = [
  {
    message:
      "We are working with the Haswani firm for many years, it is a family company that takes care of you and your business. The younger generation that takes over comes with new ideas, is innovative and evolves well. You are looking for quality objects and furniture? This is a good address in India.",
    name: "Antique Jodhpur Luxembourg",
    city: "",
    rating: 5,
  },
  {
    message:
      "Haswani Handicrafts consistently delivers exceptional handcrafted furniture with attention to detail and authentic craftsmanship.",
    name: "Global Decor Imports",
    city: "",
    rating: 5,
  },
  {
    message:
      "A trustworthy export house with decades of experience and beautiful reclaimed wood products.",
    name: "Vintage Homes UK",
    city: "",
    rating: 5,
  },
];

export default function Inspirations() {
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/testimonials/approved`
        );

        if (res.data && res.data.length > 0) {
          setTestimonials([
            ...defaultTestimonials,
            ...res.data,
          ]);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials]);

  return (
    <section
      className="relative h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/70" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl text-center px-6">

        <h2 className="tracking-[0.4em] text-xl md:text-2xl mb-4 text-gray-700">
          AWESOME INSPIRATIONS
        </h2>

        <div className="w-24 h-[1px] bg-gray-400 mx-auto mb-6" />

        <p className="text-sm md:text-base text-gray-600 mb-10">
          Our inspiration is our client success and their trust in our
          products and services. Keep inspiring us!!
        </p>

        {/* Testimonial Card */}
        <div className="bg-white/90 shadow-lg rounded-lg px-10 py-8">

          <p className="italic text-gray-700 text-lg leading-8">
            "{testimonials[index].message}"
          </p>

          <div className="mt-6 text-gray-600 font-semibold">
            {testimonials[index].name}
            {testimonials[index].city &&
              ` - ${testimonials[index].city}`}
          </div>

          <div className="mt-2 text-yellow-500 text-xl">
            {"⭐".repeat(testimonials[index].rating)}
          </div>

        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-3 w-3 rounded-full transition ${
                i === index
                  ? "bg-[#b89b72]"
                  : "bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <button className="mt-10 bg-[#b89b72] text-white px-10 py-3 tracking-[0.3em] text-xs hover:opacity-90 transition">
          INSPIRE US
        </button>

      </div>
    </section>
  );
}
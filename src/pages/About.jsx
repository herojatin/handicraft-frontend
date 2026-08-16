import React from "react";
import founderImg from "../assets/aboutUs/01.jpg";
import s2p1 from "../assets/aboutUs/02.jpg";
import s2p2 from "../assets/aboutUs/03.jpg";
import s2p3 from "../assets/aboutUs/04.jpg";
import s2p4 from "../assets/aboutUs/05.jpg";
import s3p1 from "../assets/aboutUs/06.jpg";
import s3p2 from "../assets/aboutUs/07.jpg";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="bg-[#faf7f2] ">
      
      {/* WE MAKE THINGS WITH LOVE */}
      <section className="text-center mb-12 px-6">
        <h2 className="text-sm tracking-[0.4em] text-[#a67c52]">
          WE MAKE THINGS WITH LOVE
        </h2>
      </section>

      {/* ABOUT HEADING + CONTENT (CENTERED PROPERLY) */}
      <section className="max-w-5xl mx-auto text-center px-6 mb-24">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-[0.2em] text-[#5a3e2b] mb-10">
          ABOUT US
        </h1>

        <p className="text-gray-800 leading-relaxed mt-6">
          Haswani Handicrafts is a Govt. Recognized Export House established in
          1967. With decades of expertise in manufacturing handcrafted wooden,
          iron and artisanal products, we have built a legacy of trust,
          craftsmanship, and timeless design.
        </p>

        <p className="text-gray-600 leading-relaxed mt-6">
          Our journey spans three generations, blending traditional artistry
          with modern innovation. Each product reflects passion, dedication and
          the love we put into our work — delivering authentic handicrafts to
          customers across the globe.
        </p>
      </section>

      {/* GENERATIONS SECTION */}
      <section className="bg-[#f8f3ea] py-20 px-6 text-center">
        <div className="max-w-6xl mx-auto">

          {/* Founder */}
          <h2 className="text-3xl font-bold mb-10 text-[#5a3e2b]">
            Our Founder
          </h2>

          <div className="flex flex-col items-center mb-24">
            <img
              src={founderImg}
              alt="Founder"
             className="w-56 h-56 object-cover rounded-full shadow-xl border-4 border-white 
             transition duration-500 ease-in-out transform hover:scale-105 hover:shadow-2xl"

            />
            <h3 className="mt-6 text-xl font-semibold text-[#5a3e2b]">
              Late Shri Ladharam Haswani
            </h3>
            <p className="text-gray-600 text-sm mt-3 max-w-md leading-relaxed">
  The founding force behind Haswani Handicrafts, whose vision in 1967 built a legacy of trust, craftsmanship, and timeless design. His principles continue to inspire every generation that carries the brand forward.
            </p>
            
            <p className="text-gray-600 text-sm tracking-wide">
              Founder & Visionary
            </p>
          </div>

          {/* Second Generation */}
          <h2 className="text-3xl font-bold mb-12 text-[#5a3e2b]">
            Second Generation
          </h2>

          <div className="grid md:grid-cols-4 gap-10 mb-24">
            {[
              { img: s2p1, name: "Shri Chander Kumar Haswani" },
              { img: s2p2, name: "Shri Prakash Haswani" },
              { img: s2p3, name: "Shri Khushal Das Haswani" },
              { img: s2p4, name: "Shri Harish Haswani" },
            ].map((person, i) => (
              <div key={i} className="flex flex-col items-center">
               <div className="w-56 h-56 rounded-full overflow-hidden shadow-xl border-4 border-white transition duration-500 hover:scale-105 hover:shadow-2xl flex items-center justify-center">
  <img
    src={person.img}
    alt={person.name}
    className="w-full h-full object-cover object-center scale-125"
  />
</div>

                
                <h3 className="mt-4 text-lg font-semibold text-[#5a3e2b]">
                  {person.name}
                </h3>
                <p className="text-gray-600 text-sm">Director</p>
              </div>
            ))}
          </div>

          {/* Third Generation */}
          <h2 className="text-3xl font-bold mb-12 text-[#5a3e2b]">
            Third Generation
          </h2>

          <div className="grid md:grid-cols-2 gap-12 max-w-3xl mx-auto">
            {[
              { img: s3p1 , name: "Raj Kumar Haswani" },
              { img: s3p2 , name: "Jitendra Haswani" },
            ].map((person, i) => (
              <div key={i} className="flex flex-col items-center w-full h-full object-cover scale-110">
                <img
                  src={person.img}
                  alt={person.name}
                 className="w-56 h-56 object-cover rounded-full shadow-xl border-4 border-white 
                 transition duration-500 ease-in-out transform hover:scale-105 hover:shadow-2xl"

                />
                <h3 className="mt-4 text-lg font-semibold text-[#5a3e2b]">
                  {person.name}
                </h3>
                <p className="text-gray-600 text-sm">Management</p>
              </div>
            ))}
          </div>
          {/* BRAND HIGHLIGHTS */}
<section className="bg-[#faf7f2] py-16 px-6 border-t border-[#eee2cf]">
  <div className="max-w-6xl mx-auto text-center">
    <h2 className="text-sm tracking-[0.4em] text-[#a67c52] mb-12">
      WHY CHOOSE US
    </h2>

    <div className="grid md:grid-cols-3 gap-10">
      
      <div className="p-8 bg-white rounded-2xl shadow-lg border border-[#f1e7d6]">
        <h3 className="text-xl font-semibold text-[#5a3e2b] mb-3">
          Timeless Craftsmanship
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Every product reflects decades of handcrafted excellence, blending
          traditional techniques with modern design sensibilities.
        </p>
      </div>

      <div className="p-8 bg-white rounded-2xl shadow-lg border border-[#f1e7d6]">
        <h3 className="text-xl font-semibold text-[#5a3e2b] mb-3">
          Legacy Since 1967
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          With three generations of expertise, we have built a legacy rooted in
          trust, authenticity, and uncompromising quality.
        </p>
      </div>

      <div className="p-8 bg-white rounded-2xl shadow-lg border border-[#f1e7d6]">
        <h3 className="text-xl font-semibold text-[#5a3e2b] mb-3">
          Global Export Excellence
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          As a Govt. recognized export house, our handcrafted collections are
          trusted by partners and customers worldwide.
        </p>
      </div>

    </div>
  </div>
</section>

        </div>
      </section>
      <Footer />
    </div>
    
    
  );
  
}
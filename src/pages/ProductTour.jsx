import React, { useEffect, useState } from "react";
import axios from "axios";
import Footer from "../components/Footer";
import { BASE_URL } from "../config/api";

export default function ProductTour() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/products`)
      .then((res) => {
        console.log("DATA:", res.data);
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("ERROR:", err);
      });
  }, []);

  return (
    <div className="bg-[#faf7f2] pt-40">

      <section className="text-center mb-16 px-6">
        <h2 className="text-sm tracking-[0.4em] text-[#a67c52]">
          OUR COLLECTION
        </h2>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-[0.2em] text-[#5a3e2b] mt-4">
          PRODUCT TOUR
        </h1>
      </section>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 lg:grid-cols-4 gap-10">

       {Array.isArray(products) &&
        products.map((p) => (
          <div
            key={product._id}
            className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-500"
          >

            <div className="h-60 overflow-hidden">
              <img
                src={`${BASE_URL}/${product.image}`}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
            </div>

            <div className="p-5 text-center">
              <h3 className="text-lg font-semibold text-[#5a3e2b]">
                {product.name}
              </h3>
            </div>

          </div>

        ))}

      </div>

      <Footer />
    </div>
  );
}
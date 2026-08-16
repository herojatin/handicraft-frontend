import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/api";
export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/products/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    getProduct();
  }, [id]);

  if (!product) return <h2 className="text-center mt-20">Loading...</h2>;

  return (
    <div className="max-w-6xl mx-auto py-16 grid md:grid-cols-2 gap-10">

      <img
        src={`${BASE_URL}/${product.image}`}
        alt={product.name}
        className="w-full h-[400px] object-cover"
      />

      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-xl mt-4">₹{product.price}</p>
        <p className="mt-6 text-gray-600">{product.description}</p>
      </div>

    </div>
  );
}
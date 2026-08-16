import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config/api";

const Testimonials = () => {
  const [form, setForm] = useState({
    name: "",
    city: "",
    rating: 5,
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitTestimonial = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(
        `${BASE_URL}/api/testimonials`,
        form
      );

      alert(
        "Thank you! Your testimonial has been submitted."
      );

      setForm({
        name: "",
        city: "",
        rating: 5,
        message: "",
      });

    } catch (err) {
      alert("Unable to submit testimonial.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto py-16 px-5">

      <h2 className="text-4xl font-bold text-center mb-3">
        Share Your Experience
      </h2>

      <p className="text-center text-gray-500 mb-10">
        We'd love to hear your feedback.
      </p>

      <form
        onSubmit={submitTestimonial}
        className="bg-white shadow-lg rounded-xl p-8 space-y-5"
      >

        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg"
        />

        <select
          name="rating"
          value={form.rating}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        >
          <option value={5}>★★★★★ Excellent</option>
          <option value={4}>★★★★☆ Very Good</option>
          <option value={3}>★★★☆☆ Good</option>
          <option value={2}>★★☆☆☆ Fair</option>
          <option value={1}>★☆☆☆☆ Poor</option>
        </select>

        <textarea
          rows="6"
          name="message"
          placeholder="Write your experience..."
          value={form.message}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-lg"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-[#8B5E3C] hover:bg-[#70492d] text-white px-8 py-3 rounded-lg"
        >
          {loading ? "Submitting..." : "Submit Testimonial"}
        </button>

      </form>
    </section>
  );
};

export default Testimonials;
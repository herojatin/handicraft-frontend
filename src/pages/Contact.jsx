import { useState } from "react";
import axios from "axios";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await axios.post(
        `${BASE_URL}/api/contact`,
        form
      );

      setSuccess(
        "Your message has been sent successfully. We will get back to you soon."
      );

      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-[#f6efe4] via-[#fdfaf6] to-[#efe4d2] min-h-screen pt-44 pb-16 px-6 border-t border-[#e6d9c3]">
      
      {/* Decorative blurred background circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#e6d3b3] rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#d8c3a5] rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-center text-[#5a3e2b] mb-4">
          Get in Touch
        </h1>

        <p className="text-center text-gray-600 mb-12">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>

        {/* Top Grid */}
        <div className="grid md:grid-cols-2 gap-10">

          {/* Left Info Section */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#f1e7d6]">
              <h2 className="text-2xl font-semibold text-[#5a3e2b] mb-4">
                Contact Information
              </h2>

              <div className="space-y-4 text-gray-700">
                <div className="flex items-center gap-3">
                  <Phone className="text-[#a67c52]" />
                  <span>+91 98290-23455, +91 98293-11703</span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="text-[#a67c52]" />
                  <span>info@haswanihandicrafts.com</span>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="text-[#a67c52]" />
                  <span>
                    C-13 B, Basni First Phase, Near Basni Railway Station,
                    Jodhpur, Rajasthan (342001), India
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#f1e7d6]">

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-300">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>

                <textarea
                  rows="5"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message..."
                  required
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#a67c52] hover:bg-[#8b6843] disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition duration-300"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>

              <p className="text-center text-sm text-gray-600">
                Messages submitted through this form are sent directly to our
                email inbox along with the contact details provided by the customer.
              </p>

            </form>
          </div>
        </div>

        {/* MAP SECTION */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-[#5a3e2b] mb-8">
            Visit Our Store
          </h2>

          <div className="w-full h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-[#f1e7d6]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.2262022112004!2d73.0117035!3d26.221838699999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39418be963b9ecc5%3A0x95b85352de12368c!2sHaswani%20Handicrafts%20Basni!5e0!3m2!1sen!2sin!4v1771530282250!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Haswani Handicrafts Location"
            ></iframe>
          </div>

          {/* Directions Button */}
          <div className="text-center mt-6">
            <a
              href="https://maps.app.goo.gl/6MSYrSVPoFhYVhG37"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#5a3e2b] hover:bg-[#3e2a1d] text-white px-8 py-3 rounded-full tracking-wide shadow-lg transition duration-300"
            >
              Get Directions
            </a>
          </div>
        </div>

      </div>

  </div>
);
}

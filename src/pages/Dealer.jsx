import React, { useState } from "react";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { BASE_URL } from "../config/api";

export default function DealerAuth() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  
  // ---------------- LOGIN ----------------

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  // ---------------- REGISTER ----------------

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    companyName:"",
    email: "",
    mobile: "",

    country: "",
    state: "",
    city: "",

    address: "",

    password: "",
    confirmPassword: "",
  });

  const countries = Country.getAllCountries();

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // ---------------- LOGIN ----------------

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;

    setLoginData({
      ...loginData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ---------------- REGISTER ----------------

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCountryChange = (e) => {
    const code = e.target.value;

    const selected = countries.find((c) => c.isoCode === code);

    setRegisterData({
      ...registerData,
      country: selected?.name || "",
      state: "",
      city: "",
    });

    setStates(State.getStatesOfCountry(code));
    setCities([]);
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;

    const country = countries.find(
      (c) => c.name === registerData.country
    );

    const selectedState = states.find(
      (s) => s.isoCode === stateCode
    );

    setRegisterData({
      ...registerData,
      state: selectedState?.name || "",
      city: "",
    });

    setCities(
      City.getCitiesOfState(
        country.isoCode,
        stateCode
      )
    );
  };

  const handleCityChange = (e) => {
    setRegisterData({
      ...registerData,
      city: e.target.value,
    });
  };

  // ---------------- LOGIN SUBMIT ----------------

  const handleLoginSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      `${BASE_URL}/api/dealers/login`,
      loginData
    );

    // Save token
    localStorage.setItem("dealerToken", response.data.token);

    // Save dealer information
    localStorage.setItem(
      "dealer",
      JSON.stringify(response.data.dealer)
    );

    // Redirect to Dealer Home
    navigate("/dealer");

  } catch (error) {
    alert(error.response?.data?.message || "Login failed");
  }
};

  // ---------------- REGISTER SUBMIT ----------------

  const handleRegisterSubmit = async (e) => {
  e.preventDefault();

  if (registerData.password !== registerData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/api/dealers/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert(data.message);

    // ✅ Reset the form after successful registration
    setRegisterData({
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      country: "",
      state: "",
      city: "",
      address: "",
      password: "",
      confirmPassword: "",
    });

    // Optional: Switch back to Login tab
    setActiveTab("login");

  } catch (error) {
    console.error(error);
    alert("Registration failed.");
  }
};

  return (
    <section className="bg-[#faf7f2] min-h-screen pt-44 pb-20 px-6">

      <div
        className={`mx-auto transition-all duration-500 ${
          activeTab === "login"
            ? "max-w-lg"
            : "max-w-6xl"
        }`}
      >

        <div className="bg-white rounded-[30px] shadow-xl border border-[#ede1d1] overflow-hidden">

          {/* Header */}

          <div className="px-10 pt-10">

            <div className="flex">

              <button
                onClick={() => setActiveTab("login")}
                className={`w-1/2 pb-5 text-[17px] tracking-[3px] font-semibold transition ${
                  activeTab === "login"
                    ? "text-[#5a3e2b] border-b-[3px] border-[#b18152]"
                    : "text-gray-400"
                }`}
              >
                DEALER LOGIN
              </button>

              <button
                onClick={() => setActiveTab("register")}
                className={`w-1/2 pb-5 text-[17px] tracking-[3px] font-semibold transition ${
                  activeTab === "register"
                    ? "text-[#5a3e2b] border-b-[3px] border-[#b18152]"
                    : "text-gray-400"
                }`}
              >
                REGISTER
              </button>

            </div>

          </div>

          {/* Login */}

          {activeTab === "login" && (

            <div className="px-10 py-10">

              <form
                onSubmit={handleLoginSubmit}
                className="space-y-6"
              >

                <div>

                  <label className="block mb-2 text-sm font-medium">

                    Email Address

                  </label>

                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="Enter Email Address"
                    className="w-full h-14 px-5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#d7b28b] outline-none"
                  />

                </div>

                <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Password"
    value={loginData.password}
    onChange={handleLoginChange}
    className="w-full h-14 rounded-xl border border-gray-300 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#b18152]"
    required
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#b18152]"
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>

                <div className="flex justify-between text-sm">

                  <label className="flex items-center gap-2">

                    <input
                      type="checkbox"
                      name="remember"
                      checked={loginData.remember}
                      onChange={handleLoginChange}
                    />

                    Remember Me

                  </label>

                  <button
                    type="button"
                    className="text-[#b18152]"
                  >
                    Forgot Password?
                  </button>

                </div>

                <button
                  className="w-full h-14 rounded-xl bg-[#b18152] hover:bg-[#936740] text-white text-lg font-semibold transition"
                >
                  Login
                </button>

              </form>

            </div>

          )}

         {/* ================= REGISTER ================= */}

{activeTab === "register" && (
  <div className="px-10 py-10">

    {/* Heading */}

    <div className="text-center mb-10">
      <h2 className="text-3xl font-bold text-[#5a3e2b]">
        Dealer Registration
      </h2>

      <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
        Complete the form below to apply as an authorized Haswani Handicrafts
        dealer. Our team will review your application and contact you shortly.
      </p>
    </div>

    <form
      onSubmit={handleRegisterSubmit}
      className="space-y-10"
    >

      {/* ================= Personal Information ================= */}

      <div className="border border-[#ede1d1] rounded-2xl p-8">

        <h3 className="text-xl font-semibold text-[#5a3e2b] mb-6">
          Personal Information
        </h3>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block mb-2 font-medium">
              First Name
            </label>

            <input
              type="text"
              name="firstName"
              value={registerData.firstName}
              onChange={handleRegisterChange}
              placeholder="Enter First Name"
              className="w-full h-14 px-5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#d7b28b] outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Last Name
            </label>

            <input
              type="text"
              name="lastName"
              value={registerData.lastName}
              onChange={handleRegisterChange}
              placeholder="Enter Last Name"
              className="w-full h-14 px-5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#d7b28b] outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              placeholder="Enter Email Address"
              className="w-full h-14 px-5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#d7b28b] outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Mobile Number
            </label>

            <input
              type="text"
              name="mobile"
              value={registerData.mobile}
              onChange={handleRegisterChange}
              placeholder="Enter Mobile Number"
              className="w-full h-14 px-5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#d7b28b] outline-none"
              required
            />
          </div>

        </div>

      </div>

      {/* ================= Business Information ================= */}

      <div className="border border-[#ede1d1] rounded-2xl p-8">

        <h3 className="text-xl font-semibold text-[#5a3e2b] mb-6">
          Business Information
        </h3>

        <div>

          <label className="block mb-2 font-medium">
            Company Name
          </label>

          <input
            type="text"
            name="companyName"
            value={registerData.companyName}
            onChange={handleRegisterChange}
            placeholder="Enter Company Name"
            className="w-full h-14 px-5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#d7b28b] outline-none"
            required
          />

        </div>

      </div>

      {/* ================= Location ================= */}

      <div className="border border-[#ede1d1] rounded-2xl p-8">

        <h3 className="text-xl font-semibold text-[#5a3e2b] mb-6">
          Location Details
        </h3>

        <div className="grid md:grid-cols-3 gap-6">

          <div>

            <label className="block mb-2 font-medium">
              Country
            </label>

            <select
              onChange={handleCountryChange}
              className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#d7b28b] outline-none"
              required
            >
              <option value="">Select Country</option>

              {countries.map((country) => (
                <option
                  key={country.isoCode}
                  value={country.isoCode}
                >
                  {country.name}
                </option>
              ))}

            </select>

          </div>

          <div>

            <label className="block mb-2 font-medium">
              State
            </label>

            <select
              onChange={handleStateChange}
              className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#d7b28b] outline-none"
              required
            >
              <option value="">Select State</option>

              {states.map((state) => (
                <option
                  key={state.isoCode}
                  value={state.isoCode}
                >
                  {state.name}
                </option>
              ))}

            </select>

          </div>

          <div>

            <label className="block mb-2 font-medium">
              City
            </label>

            <select
              onChange={handleCityChange}
              className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#d7b28b] outline-none"
              required
            >
              <option value="">Select City</option>

              {cities.map((city, index) => (
                <option
                  key={index}
                  value={city.name}
                >
                  {city.name}
                </option>
              ))}

            </select>

          </div>

        </div>

        <div className="mt-6">

          <label className="block mb-2 font-medium">
            Address
          </label>

          <textarea
            rows={4}
            name="address"
            value={registerData.address}
            onChange={handleRegisterChange}
            placeholder="Enter Complete Address"
            className="w-full rounded-xl border border-gray-300 p-5 focus:ring-2 focus:ring-[#d7b28b] outline-none resize-none"
            required
          />

        </div>

      </div>

      {/* ================= Account Security ================= */}

      <div className="border border-[#ede1d1] rounded-2xl p-8">

        <h3 className="text-xl font-semibold text-[#5a3e2b] mb-6">
          Account Security
        </h3>

        <div className="grid md:grid-cols-2 gap-6">

          <div>

            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              placeholder="Create Password"
              className="w-full h-14 px-5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#d7b28b] outline-none"
              required
            />

          </div>

          <div>

            <label className="block mb-2 font-medium">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={registerData.confirmPassword}
              onChange={handleRegisterChange}
              placeholder="Confirm Password"
              className="w-full h-14 px-5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#d7b28b] outline-none"
              required
            />

          </div>

        </div>

      </div>

      {/* ================= Register Button ================= */}

      <div>

        <button
          type="submit"
          className="w-full h-14 rounded-xl bg-[#b18152] hover:bg-[#94663f] text-white text-lg font-semibold tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Register as Dealer
        </button>

      </div>

      {/* ================= Login Link ================= */}

      <div className="text-center">

        <p className="text-gray-600">

          Already have a dealer account?

          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className="ml-2 text-[#b18152] font-semibold hover:underline"
          >
            Login Here
          </button>

        </p>

      </div>

    </form>

  </div>

             )}
    </div>
  </div>
</section>
);
}

        
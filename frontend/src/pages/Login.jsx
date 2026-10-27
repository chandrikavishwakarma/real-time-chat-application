import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          Email,
          Password,
        },
      );

      // console.log(response.data);
      alert("Login successful!");
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Login failed!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-50 via-white to-emerald-100 px-4 py-8">

      <div className="w-full max-w-md">

        {/* Logo and Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lime-600 text-white shadow-lg shadow-lime-200 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-800">
            Real Time Chat
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Connect instantly. Chat effortlessly.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-lime-900/10 border border-lime-100 p-7 sm:p-9">

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome back!
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Please enter your details to sign in.
            </p>
          </div>

          <form
            action=""
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                type="text"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 outline-none transition focus:border-lime-500 focus:ring-4 focus:ring-lime-100 focus:bg-white"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 outline-none transition focus:border-lime-500 focus:ring-4 focus:ring-lime-100 focus:bg-white"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3.5 mt-2 rounded-xl bg-lime-600 hover:bg-lime-700 active:scale-[0.98] text-white font-semibold shadow-lg shadow-lime-200 transition duration-200 cursor-pointer"
            >
              Login to your account
            </button>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-500 mt-2">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-lime-700 hover:text-lime-800 hover:underline transition"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Your conversations, all in one place.
        </p>

      </div>
    </div>
  );
};

export default Login
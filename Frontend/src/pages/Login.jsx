import React from "react";
import { Github, CircleUserRound } from "lucide-react";
import GoogleIcon from "../components/common/GoogleIcon";

function Login() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1b0c3f] to-[#0d061f] px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md text-black space-y-6">
        <h2 className="text-3xl font-bold text-center">Welcome Back 👋</h2>
        <p className="text-center text-sm text-gray-600">Login to continue</p>

       
        <div className="flex flex-col gap-4">
          <button className="flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition">
            <GoogleIcon className="w-6 h-6" />
            <span className="font-medium">Continue with Google</span>
          </button>
          <button className="flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition">
            <Github className="w-6 h-6" />
            <span className="font-medium">Continue with GitHub</span>
          </button>
        </div>

        <div className="text-center text-gray-500 text-sm">
          — or login with email —
        </div>

      
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b0c3f]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b0c3f]"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#1b0c3f] hover:bg-[#2a1364] text-white font-semibold py-2 rounded-lg transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center text-gray-500">
          Don’t have an account?{" "}
          <span className="text-[#1b0c3f] font-medium cursor-pointer hover:underline">
            Sign up
          </span>
        </p>
      </div>
    </section>
  );
}

export default Login;

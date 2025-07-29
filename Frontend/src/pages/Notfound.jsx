import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        
        {/* Indigo-themed 404 Typography */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-indigo-600 mb-4 tracking-tight drop-shadow-sm">
            404
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 mx-auto rounded-full shadow-sm"></div>
        </div>

        {/* Clean Content with Indigo Accents */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-indigo-900 mb-3">
            Page not found
          </h2>
          <p className="text-indigo-700/70 text-base leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Indigo-themed Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="group inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center justify-center gap-2 border border-indigo-200 text-indigo-700 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Subtle Indigo Footer */}
        <p className="text-indigo-400 text-xs mt-12">
          Error 404 • Page Not Found
        </p>
      </div>
    </div>
  );
};

export default NotFound;

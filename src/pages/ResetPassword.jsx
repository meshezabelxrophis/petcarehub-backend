import React, { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../services/authService";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-teal-600"
          >
            <path d="M9 7.2C10.2 7.2 11.2 6.2 11.2 5C11.2 3.8 10.2 2.8 9 2.8C7.8 2.8 6.8 3.8 6.8 5C6.8 6.2 7.8 7.2 9 7.2Z" fill="currentColor" />
            <path d="M23 7.2C24.2 7.2 25.2 6.2 25.2 5C25.2 3.8 24.2 2.8 23 2.8C21.8 2.8 20.8 3.8 20.8 5C20.8 6.2 21.8 7.2 23 7.2Z" fill="currentColor" />
            <path d="M6 16.5C7.7 16.5 9 15.2 9 13.5C9 11.8 7.7 10.5 6 10.5C4.3 10.5 3 11.8 3 13.5C3 15.2 4.3 16.5 6 16.5Z" fill="currentColor" />
            <path d="M26 16.5C27.7 16.5 29 15.2 29 13.5C29 11.8 27.7 10.5 26 10.5C24.3 10.5 23 11.8 23 13.5C23 15.2 24.3 16.5 26 16.5Z" fill="currentColor" />
            <path d="M16 29C19.9 29 23 25.9 23 22C23 18.1 19.9 15 16 15C12.1 15 9 18.1 9 22C9 25.9 12.1 29 16 29Z" fill="currentColor" fillOpacity="0.2" />
          </svg>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email and we'll send you a password reset link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Email sent!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Check your email for a password reset link. If you don't see it, check your spam folder.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="/login"
                      className="text-sm font-medium text-green-800 hover:text-green-700"
                    >
                      ← Back to login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="text-center">
                <Link to="/login" className="text-sm text-teal-600 hover:text-teal-500">
                  ← Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;


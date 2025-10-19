
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post('/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setMessage('Login successful!');
      if (res.data.user.role === 'service_provider') {
        navigate('/dashboard');
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMessage('Logged out');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">PetCare Login</h1>

        {!user ? (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
          </>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Welcome, {user.name}</h2>
              <p className="mb-4">Logged in as: {user.role}</p>
              <button
                onClick={logout}
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </>
        )}

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default Home;

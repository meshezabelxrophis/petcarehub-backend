import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { API_ENDPOINTS } from '../config/backend';

const ServiceAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    topServices: [],
    revenue: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('daily');
  // eslint-disable-next-line no-unused-vars
  const [currentUser, setCurrentUser] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    loadAnalyticsData(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAnalyticsData = async (providerId) => {
    try {
      setLoading(true);
      
      // Fetch bookings data
      const bookingsResponse = await axios.get(API_ENDPOINTS.PROVIDER_BOOKINGS(providerId));
      const bookings = bookingsResponse.data;
      
      // Process data for different time ranges
      const processedData = processAnalyticsData(bookings);
      setAnalyticsData(processedData);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (bookings) => {
    const now = new Date();
    
    // Daily data (last 7 days)
    const daily = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayBookings = bookings.filter(booking => 
        new Date(booking.booking_date).toDateString() === date.toDateString()
      );
      
      daily.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        bookings: dayBookings.length,
        revenue: dayBookings.reduce((sum, booking) => sum + (booking.price || 0), 0)
      });
    }

    // Weekly data (last 8 weeks)
    const weekly = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.booking_date);
        return bookingDate >= weekStart && bookingDate <= weekEnd;
      });
      
      weekly.push({
        week: `Week ${8-i}`,
        bookings: weekBookings.length,
        revenue: weekBookings.reduce((sum, booking) => sum + (booking.price || 0), 0)
      });
    }

    // Monthly data (last 6 months)
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.booking_date);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });
      
      monthly.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        bookings: monthBookings.length,
        revenue: monthBookings.reduce((sum, booking) => sum + (booking.price || 0), 0)
      });
    }

    // Top services
    const serviceCounts = {};
    bookings.forEach(booking => {
      const serviceName = booking.service_name || 'Unknown Service';
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });

    const topServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { daily, weekly, monthly, topServices, revenue: [] };
  };

  const getCurrentData = () => {
    switch (timeRange) {
      case 'daily': return analyticsData.daily;
      case 'weekly': return analyticsData.weekly;
      case 'monthly': return analyticsData.monthly;
      default: return analyticsData.daily;
    }
  };

  const getTotalBookings = () => {
    return getCurrentData().reduce((sum, item) => sum + item.bookings, 0);
  };

  const getTotalRevenue = () => {
    return getCurrentData().reduce((sum, item) => sum + item.revenue, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📈 Service Analytics</h1>
              <p className="text-gray-600 mt-1">Track your service performance and customer insights</p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['daily', 'weekly', 'monthly'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-white text-teal-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalBookings()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₨{getTotalRevenue().toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Revenue/Booking</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₨{getTotalBookings() > 0 ? (getTotalRevenue() / getTotalBookings()).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bookings Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📊 Bookings Trend ({timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getCurrentData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={timeRange === 'daily' ? 'date' : timeRange === 'weekly' ? 'week' : 'month'} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              💰 Revenue Trend ({timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getCurrentData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={timeRange === 'daily' ? 'date' : timeRange === 'weekly' ? 'week' : 'month'} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₨${value}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🏆 Most Popular Services
            </h3>
            {analyticsData.topServices.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.topServices}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.topServices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">📊</span>
                  <p>No service data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Service Performance Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📋 Service Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Popularity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.topServices.map((service, index) => (
                    <tr key={service.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(service.count / Math.max(...analyticsData.topServices.map(s => s.count))) * 100}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round((service.count / Math.max(...analyticsData.topServices.map(s => s.count))) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            💡 Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📈 Growth Trend</h4>
              <p className="text-blue-700 text-sm">
                {getCurrentData().length > 1 && 
                  getCurrentData()[getCurrentData().length - 1].bookings > getCurrentData()[0].bookings
                  ? 'Your bookings are trending upward! Great job on growing your business.'
                  : 'Consider implementing marketing strategies to boost your bookings.'}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🎯 Top Performer</h4>
              <p className="text-green-700 text-sm">
                {analyticsData.topServices.length > 0
                  ? `${analyticsData.topServices[0].name} is your most popular service with ${analyticsData.topServices[0].count} bookings.`
                  : 'Start adding services to track performance.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceAnalytics;

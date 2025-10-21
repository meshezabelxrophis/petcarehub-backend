import React, { useState } from 'react';
import ProfileCompletionGuard from './ProfileCompletionGuard';

const AddServiceForm = ({ onServiceAdded, providerId, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? (value === '' ? '' : parseFloat(value)) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.price) {
      setError('Service name and price are required');
      return;
    }
    
    // Validate price is a positive number
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Price must be a valid positive number');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Submitting service with data:', {
        provider_id: providerId || 101,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
      });

      const token = localStorage.getItem('token');
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          provider_id: providerId || 101, // Default to Adan Chug if no provider ID
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
        }),
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      
      const responseText = await res.text();
      console.log('Response body:', responseText);
      
      if (!res.ok) {
        let errorMessage = `Failed to add service (${res.status})`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const newService = JSON.parse(responseText);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
      });
      
      // Notify parent component
      if (onServiceAdded) {
        onServiceAdded(newService);
      }
    } catch (err) {
      console.error('Error adding service:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileCompletionGuard action="add new services">
      <div>
        <h2 className="text-xl font-semibold mb-4">Add New Service</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Service Name*
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows="3"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Price (₨)*
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Service'}
          </button>
        </div>
      </form>
      </div>
    </ProfileCompletionGuard>
  );
};

export default AddServiceForm; 
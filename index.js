import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import './styles/globals.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 


// Get all bookings for a provider (with pet & owner info)
app.get('/api/bookings/provider/:id', (req, res) => {
  const providerId = req.params.id;
  const query = `
    SELECT b.id, b.status, p.name AS pet_name, u.name AS owner_name
    FROM bookings b
    JOIN pets p ON b.pet_id = p.id
    JOIN users u ON b.pet_owner_id = u.id
    JOIN services s ON b.service_id = s.id
    WHERE s.provider_id = ?
  `;

  db.all(query, [providerId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

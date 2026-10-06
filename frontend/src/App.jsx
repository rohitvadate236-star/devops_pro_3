import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    mobile_no: '',
    invoice: '',
    driver_pass: '',
    consignment_place: '',
    vehicle_source: '',
    vehicle_no: '',
    supplier_driver_name: '',
    items_in_container: ''
  });

  const [tracks, setTracks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchTracks();
    fetchSuggestions();
    
    // Click outside to close suggestions
    function handleClickOutside(event) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTracks = async () => {
    try {
      const res = await fetch(`${API_URL}/tracks`);
      const data = await res.json();
      if (data.data) {
        setTracks(data.data);
      }
    } catch (error) {
      console.error("Error fetching tracks", error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`${API_URL}/suggestions/names`);
      const data = await res.json();
      if (data.data) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error("Error fetching suggestions", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'supplier_driver_name') {
      if (value.trim() === '') {
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      } else {
        const filtered = suggestions.filter(s => 
          s.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(true);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, supplier_driver_name: suggestion });
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({
          mobile_no: '',
          invoice: '',
          driver_pass: '',
          consignment_place: '',
          vehicle_source: '',
          vehicle_no: '',
          supplier_driver_name: '',
          items_in_container: ''
        });
        fetchTracks();
        fetchSuggestions(); // Update suggestions list
        alert("Entry saved successfully!");
      }
    } catch (error) {
      console.error("Error submitting form", error);
      alert("Error saving entry");
    }
  };

  return (
    <div className="app-container">
      <header className="hero-section">
        <h1>Vehicle Tracking & Supply System</h1>
        <p>Monitor operations, fleets, and container assignments efficiently.</p>
      </header>

      <main className="main-content">
        <section className="form-section">
          <h2>New Consignment Entry</h2>
          <form className="glass-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              
              <div className="input-group autocomplete" ref={suggestionRef}>
                <label>Supplier / Driver Name</label>
                <input
                  type="text"
                  name="supplier_driver_name"
                  value={formData.supplier_driver_name}
                  onChange={handleChange}
                  placeholder="Start typing name..."
                  required
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {filteredSuggestions.map((s, idx) => (
                      <li key={idx} onClick={() => handleSuggestionClick(s)}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="input-group">
                <label>Mobile No.</label>
                <input
                  type="tel"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={handleChange}
                  placeholder="e.g. +1 234 567 890"
                  required
                />
              </div>

              <div className="input-group">
                <label>Vehicle No.</label>
                <input
                  type="text"
                  name="vehicle_no"
                  value={formData.vehicle_no}
                  onChange={handleChange}
                  placeholder="e.g. MH-12-AB-1234"
                  required
                />
              </div>

              <div className="input-group">
                <label>Vehicle Source</label>
                <input
                  type="text"
                  name="vehicle_source"
                  value={formData.vehicle_source}
                  onChange={handleChange}
                  placeholder="Origin point"
                  required
                />
              </div>

              <div className="input-group">
                <label>Consignment Place (Dest)</label>
                <input
                  type="text"
                  name="consignment_place"
                  value={formData.consignment_place}
                  onChange={handleChange}
                  placeholder="Destination point"
                  required
                />
              </div>

              <div className="input-group">
                <label>Invoice No.</label>
                <input
                  type="text"
                  name="invoice"
                  value={formData.invoice}
                  onChange={handleChange}
                  placeholder="INV-0001"
                  required
                />
              </div>

              <div className="input-group">
                <label>Driver Pass</label>
                <input
                  type="text"
                  name="driver_pass"
                  value={formData.driver_pass}
                  onChange={handleChange}
                  placeholder="Pass ID"
                />
              </div>

              <div className="input-group full-width">
                <label>Items in Container</label>
                <textarea
                  name="items_in_container"
                  value={formData.items_in_container}
                  onChange={handleChange}
                  placeholder="List of items..."
                  rows="3"
                  required
                ></textarea>
              </div>

            </div>
            <button type="submit" className="submit-btn">Save Entry</button>
          </form>
        </section>

        <section className="records-section">
          <h2>Recent Activity & Portfolio</h2>
          <div className="records-grid">
            {tracks.length === 0 ? (
              <p className="no-data">No vehicle records found.</p>
            ) : (
              tracks.map((track) => (
                <div key={track.id} className="record-card glass-card">
                  <div className="card-header">
                    <span className="vehicle-badge">{track.vehicle_no}</span>
                    <span className="invoice-tag">#{track.invoice}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>Supplier/Driver:</strong> {track.supplier_driver_name}</p>
                    <p><strong>Mobile:</strong> {track.mobile_no}</p>
                    <p><strong>Route:</strong> {track.vehicle_source} ➔ {track.consignment_place}</p>
                    <p className="items"><strong>Container:</strong> {track.items_in_container}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

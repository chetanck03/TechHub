import React, { useState } from 'react';
import { FiMapPin, FiX } from 'react-icons/fi';
import './LocationPrompt.css';

const LocationPrompt = ({ onAllow, onDeny }) => {
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    try {
      await onAllow();
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="location-prompt-overlay">
      <div className="location-prompt-card">
        <div className="location-prompt-icon">
          <FiMapPin />
        </div>
        
        <h2>Enable Location Access</h2>
        <p>
          We need your location to show nearby doctors and medical stores.
          Your location will be used to provide better healthcare services.
        </p>

        <div className="location-prompt-actions">
          <button 
            onClick={handleAllow} 
            className="btn-allow"
            disabled={loading}
          >
            {loading ? 'Getting Location...' : 'Allow Location'}
          </button>
          <button 
            onClick={onDeny} 
            className="btn-deny"
            disabled={loading}
          >
            <FiX /> Skip for Now
          </button>
        </div>

        <p className="location-prompt-note">
          You can change this setting later in your profile.
        </p>
      </div>
    </div>
  );
};

export default LocationPrompt;

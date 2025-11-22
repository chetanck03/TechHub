import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, Calendar, Shield, Search, MapPin, Zap, Heart } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search term');
      return;
    }

    setSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const response = await fetch(`http://localhost:5000/api/stores/search?query=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.message) {
        // Error response from backend
        setSearchError(data.message);
        setSearchResults([]);
      } else if (Array.isArray(data)) {
        setSearchResults(data);
        if (data.length === 0) {
          setSearchError('No medical stores found. Try a different search term.');
        }
      } else {
        setSearchError('Unexpected response format');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search stores. Please check if the backend server is running.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <div className="header-logo" onClick={() => window.location.href = '/'}>
            <Heart className="logo-icon" />
            <h1>Telehealth</h1>
          </div>

          {/* Medical Store Search */}
          <div className="header-search">
            <form onSubmit={handleSearch} className="search-form">
              <MapPin className="search-icon-left" />
              <input
                type="text"
                placeholder="Search by city or store name (e.g., Mumbai, India or pharmacy)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button" disabled={searching}>
                <Search size={18} />
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Auth Buttons */}
          <div className="header-auth">
            <button onClick={() => navigate('/login')} className="btn-login">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="btn-signup">
              Sign Up
            </button>
          </div>
        </div>
      </header>

        {/* Search Results */}
      {(searchResults.length > 0 || searchError) && (
        <section className="search-results-section">
          <div className="container">
            {searchError && (
              <div className="search-error">
                <p>{searchError}</p>
              </div>
            )}
            
            {searchResults.length > 0 && (
              <>
                <h2 className="section-title">Medical Stores Near You</h2>
                <div className="stores-grid">
                  {searchResults.map((store, index) => (
                    <div key={index} className="store-card">
                      <MapPin className="store-icon" />
                      <h3>{store.name}</h3>
                      <div className="store-location">
                        <p className="store-city">{store.city}, {store.state}</p>
                        <p className="store-country">{store.country}</p>
                      </div>
                      <p className="store-address">{store.street}</p>
                      {store.phone !== 'N/A' && (
                        <p className="store-phone">📞 {store.phone}</p>
                      )}
                      <p className="store-distance">📍 {store.distance} km away</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Hero Section with Modern Design */}
      <section className="hero-section-modern">
        <div className="hero-background-circles">
          <div className="circle-outer">
            <div className="circle-middle">
              <div className="circle-inner"></div>
            </div>
          </div>
        </div>

        <div className="hero-container-modern">
          <div className="hero-content-modern">
            <span className="hero-icon-badge">
              <Activity className="badge-icon" />
            </span>
            
            <h1 className="hero-title-modern">
              Your Health, Our Priority
            </h1>
            
            <p className="hero-description-modern">
              Connect with certified doctors online. Book consultations, get prescriptions, 
              and access quality healthcare from the comfort of your home.
            </p>
            
            <div className="hero-buttons-modern">
              <button onClick={() => navigate('/register')} className="btn-hero-primary">
                Get Started
                <Zap className="btn-icon" />
              </button>
            </div>
            
            <div className="hero-trust-text">
              Trusted by 25,000+ Patients Nationwide
            </div>
          </div>

          <div className="hero-image-modern">
            <img 
              src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&h=800&fit=crop&q=80" 
              alt="Professional doctors team in white coats providing healthcare services" 
              className="hero-img"
            />
          </div>
        </div>
      </section>

    

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Telehealth?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Users className="feature-icon" />
              </div>
              <h3>Expert Doctors</h3>
              <p>Connect with certified and experienced healthcare professionals</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Calendar className="feature-icon" />
              </div>
              <h3>Easy Booking</h3>
              <p>Book appointments instantly with our simple slot system</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Activity className="feature-icon" />
              </div>
              <h3>Video Consultations</h3>
              <p>Face-to-face consultations from anywhere, anytime</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Shield className="feature-icon" />
              </div>
              <h3>Secure & Private</h3>
              <p>Your health data is encrypted and completely confidential</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your account in minutes</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Find a Doctor</h3>
              <p>Browse and select from our network of specialists</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Book Appointment</h3>
              <p>Choose a convenient time slot</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Get Consultation</h3>
              <p>Connect via video call and receive care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Technology Section */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-content">
            <div className="trust-text">
              <h2 className="section-title">Trusted Healthcare Technology</h2>
              <p className="trust-description">
                Our platform uses cutting-edge technology to ensure secure, reliable, and 
                high-quality healthcare delivery. With end-to-end encryption and HIPAA-compliant 
                infrastructure, your health information is always protected.
              </p>
              <div className="trust-stats">
                <div className="stat-item">
                  <h3>25,000+</h3>
                  <p>Happy Patients</p>
                </div>
                <div className="stat-item">
                  <h3>500+</h3>
                  <p>Certified Doctors</p>
                </div>
                <div className="stat-item">
                  <h3>99.9%</h3>
                  <p>Uptime Guarantee</p>
                </div>
              </div>
            </div>
            <div className="trust-image">
              <img 
                src="https://tse3.mm.bing.net/th/id/OIP.y6MfZGviJZLZlKOYkA_FjAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3" 
                alt="Confident doctor with stethoscope ready to provide medical consultation" 
                className="trust-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of patients who trust Telehealth for their healthcare needs</p>
          <button onClick={() => navigate('/register')} className="btn-cta">
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <Heart className="footer-logo-icon" />
              <h3>Telehealth</h3>
            </div>
            <p>Quality healthcare, accessible to everyone</p>
          </div>
          <div className="footer-section">
            <h4>For Patients</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Find Doctors</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Sign Up</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Login</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>For Doctors</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/doctor/register'); }}>Register as Doctor</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Doctor Login</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Help Center</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Contact Us</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Telehealth Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

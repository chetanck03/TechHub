const express = require('express');
const router = express.Router();
const MedicalStore = require('../models/MedicalStore');
const { protect } = require('../middleware/auth');
const axios = require('axios');

// Search medical stores using Geoapify API
router.get('/search', async (req, res) => {
  try {
    const { query, lat, lng } = req.query;
    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: 'Geoapify API key not configured' });
    }

    let latitude = lat ? parseFloat(lat) : null;
    let longitude = lng ? parseFloat(lng) : null;

    // If query looks like a location (contains comma or common location words), geocode it
    const locationKeywords = ['city', 'india', 'usa', 'uk', 'delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad'];
    const isLocationQuery = query && (query.includes(',') || locationKeywords.some(keyword => query.toLowerCase().includes(keyword)));

    if (isLocationQuery && !latitude && !longitude) {
      // Geocode the location query
      try {
        const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&limit=1&apiKey=${apiKey}`;
        const geocodeResponse = await axios.get(geocodeUrl);
        
        if (geocodeResponse.data.features && geocodeResponse.data.features.length > 0) {
          const location = geocodeResponse.data.features[0];
          longitude = location.geometry.coordinates[0];
          latitude = location.geometry.coordinates[1];
          console.log(`Geocoded "${query}" to: ${latitude}, ${longitude}`);
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError.message);
      }
    }

    // If still no location, use default
    if (!latitude || !longitude) {
      latitude = 28.6139; // Default to Delhi, India
      longitude = 77.2090;
    }

    // Search for pharmacies/medical stores using Geoapify
    const categories = 'healthcare.pharmacy,commercial.supermarket';
    const radius = 5000; // 5km radius
    
    let url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${longitude},${latitude},${radius}&limit=20&apiKey=${apiKey}`;
    
    // Only add name filter if query is NOT a location
    if (query && query.trim() && !isLocationQuery) {
      url += `&name=${encodeURIComponent(query)}`;
    }

    const response = await axios.get(url);
    
    // Format the results with detailed location information
    const stores = response.data.features.map(feature => {
      const props = feature.properties;
      
      // Extract location details
      const storeName = props.name || props.address_line1 || 'Medical Store';
      const city = props.city || props.county || props.suburb || 'N/A';
      const state = props.state || props.state_district || props.region || 'N/A';
      const country = props.country || 'N/A';
      const postcode = props.postcode || '';
      
      // Build detailed address
      const addressParts = [
        props.street || props.address_line1,
        props.suburb || props.district,
        city !== 'N/A' ? city : null,
        postcode,
        state !== 'N/A' ? state : null,
        country !== 'N/A' ? country : null
      ].filter(Boolean);
      
      const detailedAddress = addressParts.join(', ');
      
      return {
        // Store Information
        name: storeName,
        
        // Location Details
        city: city,
        state: state,
        country: country,
        postcode: postcode,
        
        // Full Address
        address: props.formatted || detailedAddress || 'Address not available',
        street: props.street || props.address_line1 || 'N/A',
        
        // Additional Info
        distance: props.distance ? (props.distance / 1000).toFixed(2) : 'N/A',
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        phone: props.contact?.phone || 'N/A',
        opening_hours: props.opening_hours || 'N/A',
        
        // Category
        category: props.categories ? props.categories[0] : 'healthcare.pharmacy'
      };
    });

    res.json(stores);
  } catch (error) {
    console.error('Store search error:', error.message);
    res.status(500).json({ message: 'Failed to search stores', error: error.message });
  }
});

// Get nearby medical stores
router.get('/nearby', protect, async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location required' });
    }

    const stores = await MedicalStore.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isActive: true
    });

    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all stores
router.get('/', async (req, res) => {
  try {
    const stores = await MedicalStore.find({ isActive: true });
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require('express');
const { Country, State, City } = require('../models/Location');
const router = express.Router();

// Get all countries
router.get('/countries', async (req, res) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    res.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Server error while fetching countries' });
  }
});

// Get states by country
router.get('/states/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;
    const states = await State.find({ countryCode }).sort({ name: 1 });
    res.json(states);
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Server error while fetching states' });
  }
});

// Get cities by state
router.get('/cities/:stateId', async (req, res) => {
  try {
    const { stateId } = req.params;
    const cities = await City.find({ stateId }).sort({ name: 1 });
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Server error while fetching cities' });
  }
});

// Seed initial location data (admin only route in real app)
router.post('/seed', async (req, res) => {
  try {
    // Check if data already exists
    const countryCount = await Country.countDocuments();
    if (countryCount > 0) {
      return res.status(400).json({ message: 'Location data already seeded' });
    }

    // Sample data
    const countries = [
      { name: 'United States', code: 'US' },
      { name: 'Canada', code: 'CA' },
      { name: 'United Kingdom', code: 'GB' },
      { name: 'Australia', code: 'AU' },
      { name: 'India', code: 'IN' }
    ];

    // Insert countries
    const savedCountries = await Country.insertMany(countries);
    
    // Sample states data
    const states = [
      // US States
      { name: 'California', countryCode: 'US' },
      { name: 'New York', countryCode: 'US' },
      { name: 'Texas', countryCode: 'US' },
      // Canadian Provinces
      { name: 'Ontario', countryCode: 'CA' },
      { name: 'Quebec', countryCode: 'CA' },
      { name: 'British Columbia', countryCode: 'CA' },
      // UK
      { name: 'England', countryCode: 'GB' },
      { name: 'Scotland', countryCode: 'GB' },
      { name: 'Wales', countryCode: 'GB' },
      // Australia
      { name: 'New South Wales', countryCode: 'AU' },
      { name: 'Victoria', countryCode: 'AU' },
      { name: 'Queensland', countryCode: 'AU' },
      // India
      { name: 'Maharashtra', countryCode: 'IN' },
      { name: 'Karnataka', countryCode: 'IN' },
      { name: 'Tamil Nadu', countryCode: 'IN' }
    ];

    // Insert states
    const savedStates = await State.insertMany(states);
    
    // Map to hold state ID by name for city references
    const stateIdMap = savedStates.reduce((map, state) => {
      map[state.name] = state._id;
      return map;
    }, {});

    // Sample cities data
    const cities = [
      // California cities
      { name: 'Los Angeles', stateId: stateIdMap['California'] },
      { name: 'San Francisco', stateId: stateIdMap['California'] },
      { name: 'San Diego', stateId: stateIdMap['California'] },
      
      // New York cities
      { name: 'New York City', stateId: stateIdMap['New York'] },
      { name: 'Buffalo', stateId: stateIdMap['New York'] },
      { name: 'Rochester', stateId: stateIdMap['New York'] },
      
      // Texas cities
      { name: 'Houston', stateId: stateIdMap['Texas'] },
      { name: 'Austin', stateId: stateIdMap['Texas'] },
      { name: 'Dallas', stateId: stateIdMap['Texas'] },
      
      // Ontario cities
      { name: 'Toronto', stateId: stateIdMap['Ontario'] },
      { name: 'Ottawa', stateId: stateIdMap['Ontario'] },
      { name: 'Hamilton', stateId: stateIdMap['Ontario'] },
      
      // Quebec cities
      { name: 'Montreal', stateId: stateIdMap['Quebec'] },
      { name: 'Quebec City', stateId: stateIdMap['Quebec'] },
      { name: 'Laval', stateId: stateIdMap['Quebec'] },
      
      // British Columbia cities
      { name: 'Vancouver', stateId: stateIdMap['British Columbia'] },
      { name: 'Victoria', stateId: stateIdMap['British Columbia'] },
      { name: 'Surrey', stateId: stateIdMap['British Columbia'] },
      
      // England cities
      { name: 'London', stateId: stateIdMap['England'] },
      { name: 'Manchester', stateId: stateIdMap['England'] },
      { name: 'Birmingham', stateId: stateIdMap['England'] },
      
      // Scotland cities
      { name: 'Edinburgh', stateId: stateIdMap['Scotland'] },
      { name: 'Glasgow', stateId: stateIdMap['Scotland'] },
      { name: 'Aberdeen', stateId: stateIdMap['Scotland'] },
      
      // Wales cities
      { name: 'Cardiff', stateId: stateIdMap['Wales'] },
      { name: 'Swansea', stateId: stateIdMap['Wales'] },
      { name: 'Newport', stateId: stateIdMap['Wales'] },
      
      // NSW cities
      { name: 'Sydney', stateId: stateIdMap['New South Wales'] },
      { name: 'Newcastle', stateId: stateIdMap['New South Wales'] },
      { name: 'Wollongong', stateId: stateIdMap['New South Wales'] },
      
      // Victoria cities
      { name: 'Melbourne', stateId: stateIdMap['Victoria'] },
      { name: 'Geelong', stateId: stateIdMap['Victoria'] },
      { name: 'Ballarat', stateId: stateIdMap['Victoria'] },
      
      // Queensland cities
      { name: 'Brisbane', stateId: stateIdMap['Queensland'] },
      { name: 'Gold Coast', stateId: stateIdMap['Queensland'] },
      { name: 'Townsville', stateId: stateIdMap['Queensland'] },
      
      // Maharashtra cities
      { name: 'Mumbai', stateId: stateIdMap['Maharashtra'] },
      { name: 'Pune', stateId: stateIdMap['Maharashtra'] },
      { name: 'Nagpur', stateId: stateIdMap['Maharashtra'] },
      
      // Karnataka cities
      { name: 'Bangalore', stateId: stateIdMap['Karnataka'] },
      { name: 'Mysore', stateId: stateIdMap['Karnataka'] },
      { name: 'Hubli', stateId: stateIdMap['Karnataka'] },
      
      // Tamil Nadu cities
      { name: 'Chennai', stateId: stateIdMap['Tamil Nadu'] },
      { name: 'Coimbatore', stateId: stateIdMap['Tamil Nadu'] },
      { name: 'Madurai', stateId: stateIdMap['Tamil Nadu'] }
    ];

    // Insert cities
    await City.insertMany(cities);

    res.status(201).json({
      message: 'Location data seeded successfully',
      counts: {
        countries: countries.length,
        states: states.length,
        cities: cities.length
      }
    });
  } catch (error) {
    console.error('Error seeding location data:', error);
    res.status(500).json({ error: 'Server error while seeding location data' });
  }
});

module.exports = router; 
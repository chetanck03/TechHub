import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiSave } from 'react-icons/fi';


const Settings = () => {
  const [settings, setSettings] = useState({
    creditPricing: 10,
    consultationLimit: 5,
    platformFeePercentage: 10,
    refundPolicy: '',
    termsAndConditions: '',
    notificationMessage: ''
  });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchCategories();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      await api.post('/categories', { name: newCategory });
      toast.success('Category added successfully');
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await api.delete(`/categories/${categoryId}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="admin-page">
        <h1>Content & Settings Management</h1>

        <div className="settings-section">
          <h2>Global App Settings</h2>
          
          <div className="form-group">
            <label>Credit Pricing (₹ per Credit)</label>
            <input
              type="number"
              value={settings.creditPricing}
              onChange={(e) => setSettings({ ...settings, creditPricing: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Daily Consultation Limit</label>
            <input
              type="number"
              value={settings.consultationLimit}
              onChange={(e) => setSettings({ ...settings, consultationLimit: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Platform Fee (%)</label>
            <input
              type="number"
              value={settings.platformFeePercentage}
              onChange={(e) => setSettings({ ...settings, platformFeePercentage: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Refund Policy</label>
            <textarea
              rows="4"
              value={settings.refundPolicy}
              onChange={(e) => setSettings({ ...settings, refundPolicy: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Terms & Conditions</label>
            <textarea
              rows="6"
              value={settings.termsAndConditions}
              onChange={(e) => setSettings({ ...settings, termsAndConditions: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Push Notification Message</label>
            <textarea
              rows="3"
              value={settings.notificationMessage}
              onChange={(e) => setSettings({ ...settings, notificationMessage: e.target.value })}
            />
          </div>

          <button className="btn-primary" onClick={handleSaveSettings}>
            <FiSave /> Save Settings
          </button>
        </div>

        <div className="settings-section">
          <h2>Category Management</h2>
          
          <div className="add-category">
            <input
              type="text"
              placeholder="New category name..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button className="btn-primary" onClick={handleAddCategory}>
              Add Category
            </button>
          </div>

          <div className="categories-list">
            {categories.map((category) => (
              <div key={category._id} className="category-item">
                <span>{category.name}</span>
                <button
                  className="btn-danger btn-small"
                  onClick={() => handleDeleteCategory(category._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

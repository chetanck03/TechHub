import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './Doctor.css';

const ManageSlots = () => {
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get('/slots/my-slots');
      // Filter out any null or invalid slots
      const validSlots = (response.data || []).filter(slot => slot && slot._id);
      setSlots(validSlots);
      console.log('Fetched slots:', validSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      // Don't show error toast if it's just a 404 (no slots yet)
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to fetch slots');
      }
      setSlots([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    
    // Validate times
    if (newSlot.startTime >= newSlot.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/slots', newSlot);
      console.log('Slot created:', response.data);
      toast.success('Slot added successfully!');
      setNewSlot({ date: '', startTime: '', endTime: '' });
      fetchSlots();
    } catch (error) {
      console.error('Error adding slot:', error);
      toast.error(error.response?.data?.message || 'Failed to add slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;

    try {
      await api.delete(`/slots/${slotId}`);
      toast.success('Slot deleted successfully!');
      fetchSlots();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete slot');
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <h1>Manage Availability</h1>

        <div className="slots-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Add New Slot</h2>
          </div>
          <form onSubmit={handleAddSlot} className="add-slot-form">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Slot'}
            </button>
          </form>

          <h2>Your Slots</h2>
          {slots.length === 0 ? (
            <p>No slots created yet. Add your first slot above to start accepting appointments.</p>
          ) : (
            <>
              <div className="slots-summary">
                <p>Total Slots: <strong>{slots.length}</strong></p>
                <p>Available: <strong>{slots.filter(s => !s.isBooked).length}</strong></p>
                <p>Booked: <strong>{slots.filter(s => s.isBooked).length}</strong></p>
              </div>
              <div className="slots-list">
                {slots.map((slot) => {
                  // Safety check for null slot
                  if (!slot || !slot._id) return null;
                  
                  const slotDate = new Date(slot.date);
                  const isPast = slotDate < new Date(new Date().setHours(0, 0, 0, 0));
                  
                  return (
                    <div key={slot._id} className={`slot-item ${isPast ? 'past-slot' : ''}`}>
                      <div className="slot-info">
                        <div>
                          <label>Date</label>
                          <strong>{slotDate.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</strong>
                        </div>
                        <div>
                          <label>Time</label>
                          <strong>{slot.startTime || 'N/A'} - {slot.endTime || 'N/A'}</strong>
                        </div>
                        <div>
                          <label>Status</label>
                          <strong className={slot.isBooked ? 'status-booked' : 'status-available'}>
                            {slot.isBooked ? '🔴 Booked' : '🟢 Available'}
                          </strong>
                        </div>
                      </div>
                      {!slot.isBooked && !isPast && (
                        <button 
                          onClick={() => handleDeleteSlot(slot._id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ManageSlots;

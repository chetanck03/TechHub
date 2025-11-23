import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';


const BookConsultation = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [consultationType, setConsultationType] = useState('online');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [doctorId]);

  const fetchData = async () => {
    try {
      const [doctorRes, slotsRes] = await Promise.all([
        api.get(`/doctors/${doctorId}`),
        api.get(`/slots/doctor/${doctorId}`)
      ]);
      setDoctor(doctorRes.data);
      setSlots(slotsRes.data);
    } catch (error) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) {
      toast.error('Please select a slot');
      return;
    }

    try {
      await api.post('/consultations/book', {
        doctorId,
        slotId: selectedSlot,
        type: consultationType
      });
      toast.success('Consultation booked successfully!');
      navigate('/consultations');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  const fee = consultationType === 'online' 
    ? doctor.consultationFee?.video 
    : doctor.consultationFee?.physical;

  return (
    <Layout>
      <div className="dashboard">
        <h1>Book Consultation</h1>
        <p>Dr. {doctor.userId?.name} - {doctor.specialization?.name}</p>

        <div className="booking-container">
          <div className="form-group">
            <label>Consultation Type</label>
            <select value={consultationType} onChange={(e) => setConsultationType(e.target.value)}>
              <option value="online">Online ({doctor.consultationFee?.video} credits)</option>
              <option value="physical">Physical ({doctor.consultationFee?.physical} credits)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select Time Slot</label>
            {slots.length === 0 ? (
              <p>No available slots</p>
            ) : (
              <div className="slots-grid">
                {slots.map((slot) => (
                  <div
                    key={slot._id}
                    className={`slot-card ${selectedSlot === slot._id ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot._id)}
                  >
                    <div>{new Date(slot.date).toLocaleDateString()}</div>
                    <div>{slot.startTime} - {slot.endTime}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-item">
              <span>Consultation Fee:</span>
              <strong>{fee} credits</strong>
            </div>
          </div>

          <button onClick={handleBook} className="btn-primary" style={{ width: '100%' }}>
            Confirm Booking
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default BookConsultation;

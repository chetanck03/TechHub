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

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <span className="ml-3 text-secondary-600">Loading...</span>
      </div>
    </Layout>
  );

  const fee = consultationType === 'online' 
    ? doctor.consultationFee?.video 
    : doctor.consultationFee?.physical;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Book Consultation</h1>
          <p className="text-lg text-secondary-600">
            Dr. {doctor.userId?.name} - <span className="text-primary-600">{doctor.specialization?.name}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-secondary-900">Consultation Type</h2>
              </div>
              <div className="card-body">
                <select 
                  value={consultationType} 
                  onChange={(e) => setConsultationType(e.target.value)}
                  className="form-input"
                >
                  <option value="online">
                    📹 Online Consultation ({doctor.consultationFee?.video} credits)
                  </option>
                  <option value="physical">
                    🏥 Physical Visit ({doctor.consultationFee?.physical} credits)
                  </option>
                </select>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-secondary-900">Select Time Slot</h2>
              </div>
              <div className="card-body">
                {slots.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-secondary-500">No available slots</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {slots.map((slot) => (
                      <div
                        key={slot._id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedSlot === slot._id 
                            ? 'border-primary-500 bg-primary-50 shadow-md' 
                            : 'border-secondary-200 hover:border-primary-300'
                        }`}
                        onClick={() => setSelectedSlot(slot._id)}
                      >
                        <div className="text-center">
                          <div className="font-semibold text-secondary-900 mb-1">
                            {new Date(slot.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-secondary-600">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <div className="card-header">
                <h3 className="text-xl font-semibold text-secondary-900">Booking Summary</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-secondary-200">
                  <span className="text-secondary-600">Doctor</span>
                  <span className="font-medium text-secondary-900">Dr. {doctor.userId?.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-secondary-200">
                  <span className="text-secondary-600">Specialization</span>
                  <span className="font-medium text-secondary-900">{doctor.specialization?.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-secondary-200">
                  <span className="text-secondary-600">Type</span>
                  <span className="font-medium text-secondary-900 capitalize">{consultationType}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-secondary-200">
                  <span className="text-secondary-600">Consultation Fee</span>
                  <span className="font-bold text-success-600 text-lg">{fee} credits</span>
                </div>
                {selectedSlot && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                    <p className="text-sm text-primary-700 font-medium">Selected Slot:</p>
                    <p className="text-primary-800">
                      {slots.find(s => s._id === selectedSlot) && 
                        `${new Date(slots.find(s => s._id === selectedSlot).date).toLocaleDateString()} 
                        ${slots.find(s => s._id === selectedSlot).startTime} - 
                        ${slots.find(s => s._id === selectedSlot).endTime}`
                      }
                    </p>
                  </div>
                )}
              </div>
              <div className="card-footer">
                <button 
                  onClick={handleBook} 
                  className="btn btn-primary w-full"
                  disabled={!selectedSlot}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookConsultation;

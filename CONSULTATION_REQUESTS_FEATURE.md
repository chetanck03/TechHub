# Consultation Requests Feature

## Overview
Added a comprehensive "Request Future Consultation" feature that allows patients to submit consultation requests when doctors are currently unavailable, and enables doctors to review and respond to these requests.

## Problem Solved
When doctors show "Currently Unavailable" (no immediate slots), patients had no way to request future consultations. This feature bridges that gap by allowing patients to submit requests that doctors can review and approve.

## Features Implemented

### 1. **Patient Side - Request Consultation**
- **Location**: Doctor Profile page when doctor is unavailable and has no upcoming slots
- **Form Fields**:
  - Preferred Date (date picker, minimum today)
  - Preferred Time (dropdown with common time slots)
  - Consultation Type (Video/Physical)
  - Reason for Consultation (required text area)
  - Urgency Level (Low/Medium/High)

### 2. **Patient Side - View My Requests**
- **Route**: `/consultation-requests`
- **Navigation**: Added "My Requests" to patient sidebar
- **Features**:
  - View all submitted requests with status
  - See doctor responses and proposed slots
  - Cancel pending requests
  - Book approved slots directly

### 3. **Doctor Side - Manage Requests**
- **Route**: `/doctor/consultation-requests`
- **Navigation**: Added "Requests" to doctor sidebar
- **Features**:
  - View all patient requests with full details
  - Approve requests with proposed time slots
  - Decline requests with explanation
  - Automatic slot creation when approving

### 4. **Smart Integration**
- **Automatic Availability**: When doctors approve requests, slots are auto-created and doctor becomes available
- **Duplicate Prevention**: Patients can't submit multiple pending requests to the same doctor
- **Status Tracking**: Real-time status updates (pending → approved/declined → scheduled)

## Database Schema

### ConsultationRequest Model
```javascript
{
  patientId: ObjectId (ref: User),
  doctorId: ObjectId (ref: Doctor),
  preferredDate: Date,
  preferredTime: String,
  consultationType: 'video' | 'physical',
  reasonForConsultation: String,
  urgencyLevel: 'low' | 'medium' | 'high',
  status: 'pending' | 'approved' | 'declined' | 'scheduled',
  doctorResponse: String,
  proposedSlot: {
    date: Date,
    startTime: String,
    endTime: String
  },
  respondedAt: Date,
  timestamps: true
}
```

## API Endpoints

### Patient Endpoints
- `POST /api/consultation-requests` - Submit new request
- `GET /api/consultation-requests/my-requests` - Get my requests
- `DELETE /api/consultation-requests/:id` - Cancel pending request

### Doctor Endpoints
- `GET /api/consultation-requests/doctor-requests` - Get requests for doctor
- `PUT /api/consultation-requests/:id/respond` - Approve/decline request

## User Experience Flow

### Patient Flow
1. **Visit Doctor Profile** → Doctor shows "Currently Unavailable"
2. **No Available Slots** → "Request Future Consultation" form appears
3. **Fill Request Form** → Submit with preferred details
4. **Track Request** → View in "My Requests" page
5. **Get Response** → Doctor approves with proposed slot
6. **Book Slot** → Direct link to book the approved slot

### Doctor Flow
1. **Receive Request** → Notification in "Requests" page
2. **Review Details** → See patient info, preferred time, reason
3. **Respond** → Approve with proposed slot or decline with reason
4. **Auto-Slot Creation** → Approved requests automatically create slots
5. **Patient Books** → Patient can book the proposed slot

## Files Created/Modified

### Backend
- ✅ `backend/models/ConsultationRequest.js` - New model
- ✅ `backend/routes/consultationRequests.js` - New API routes
- ✅ `backend/server.js` - Added route registration

### Frontend
- ✅ `frontend/src/components/RequestConsultationForm.js` - New form component
- ✅ `frontend/src/pages/Patient/ConsultationRequests.js` - Patient requests page
- ✅ `frontend/src/pages/Doctor/ConsultationRequests.js` - Doctor requests page
- ✅ `frontend/src/pages/Patient/DoctorProfile.js` - Modified to show request form
- ✅ `frontend/src/App.js` - Added new routes
- ✅ `frontend/src/components/Layout.js` - Added navigation links

## Benefits

### For Patients
- ✅ Can request consultations even when doctor is unavailable
- ✅ Clear communication about their needs and urgency
- ✅ Track request status and responses
- ✅ Direct booking when approved

### For Doctors
- ✅ Better patient engagement and retention
- ✅ Flexible scheduling based on patient needs
- ✅ Clear patient information before creating slots
- ✅ Streamlined approval process

### For Platform
- ✅ Reduced patient frustration with unavailable doctors
- ✅ Increased consultation bookings
- ✅ Better doctor-patient communication
- ✅ More flexible scheduling system

## Testing Scenarios

1. **Patient submits request** → Form validation and submission
2. **Doctor receives request** → Appears in doctor's requests page
3. **Doctor approves** → Slot created, patient notified
4. **Doctor declines** → Patient sees reason
5. **Patient cancels** → Request removed from system
6. **Duplicate prevention** → Can't submit multiple pending requests
7. **Auto-availability** → Doctor becomes available when approving requests

The feature is now fully implemented and ready for testing!
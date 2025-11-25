# MegaHealth Platform - Backend API

## Features Implemented

### Authentication & Authorization
- Email/Password registration with OTP verification
- JWT-based authentication
- Role-based access control (Patient, Doctor, Admin)

### Patient Features
- Profile management with location
- Browse doctors by category
- Filter doctors by experience, rating, fees
- Credit wallet system
- Book video consultations
- In-consultation notepad (auto-save)
- Post-consultation chat
- View nearby medical stores
- Rate and review doctors

### Doctor Features
- Registration with document upload (license, ID proof)
- Admin approval workflow
- Platform fee payment (10 credits)
- Slot management (add/remove availability)
- Attend consultations
- Upload prescriptions
- Chat with patients (post-consultation)
- View consultation history

### Admin Features
- Dashboard with analytics
- Approve/Reject doctor registrations
- View all transactions
- Manage complaints (doctor & patient)
- Customer support interface
- User management

### Credit System
- 100 USD = 1000 credits
- Online consultation: 10 credits
- Physical consultation: 5 credits
- Doctor platform fee: 10 credits

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
- MongoDB connection string
- JWT secret
- Email credentials (for OTP)
- Razorpay/Stripe keys (for payments)

3. Start the server:
```bash
npm run dev
```

## API Endpoints

### Auth
- POST /api/auth/register - Register user
- POST /api/auth/verify-otp - Verify OTP
- POST /api/auth/login - Login
- POST /api/auth/resend-otp - Resend OTP

### Users
- GET /api/users/profile - Get profile
- PUT /api/users/profile - Update profile
- GET /api/users/credits - Get credit balance

### Doctors
- POST /api/doctors/register - Register as doctor
- GET /api/doctors - Get all doctors (with filters)
- GET /api/doctors/:id - Get doctor details

### Categories
- GET /api/categories - Get all specializations

### Credits
- GET /api/credits/packages - Get credit packages
- POST /api/credits/create-order - Create payment order
- POST /api/credits/verify-payment - Verify and add credits
- GET /api/credits/transactions - Get transaction history

### Slots
- POST /api/slots - Create slot (Doctor)
- GET /api/slots/doctor/:doctorId - Get doctor's available slots
- GET /api/slots/my-slots - Get my slots (Doctor)
- DELETE /api/slots/:id - Delete slot

### Consultations
- POST /api/consultations/book - Book consultation
- GET /api/consultations/my-consultations - Get my consultations
- PUT /api/consultations/:id/status - Update status
- PUT /api/consultations/:id/notes - Save notes
- PUT /api/consultations/:id/rating - Add rating

### Chat
- POST /api/chat - Send message
- GET /api/chat/:consultationId - Get chat history
- PUT /api/chat/:id/read - Mark as read

### Complaints
- POST /api/complaints - Create complaint
- GET /api/complaints/my-complaints - Get my complaints
- GET /api/complaints/:id - Get complaint details

### Medical Stores
- GET /api/stores/nearby - Get nearby stores
- GET /api/stores - Get all stores

### Admin
- GET /api/admin/dashboard - Dashboard stats
- GET /api/admin/doctors/pending - Pending approvals
- PUT /api/admin/doctors/:id/status - Approve/Reject doctor
- GET /api/admin/complaints - Get all complaints
- PUT /api/admin/complaints/:id - Update complaint
- GET /api/admin/transactions - Get all transactions
- GET /api/admin/users - Get all users

## Socket.io Events

- `join-consultation` - Join consultation room
- `send-message` - Send chat message
- `receive-message` - Receive chat message

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.io (Real-time chat)
- Multer (File uploads)
- Nodemailer (Email OTP)
- Razorpay (Payments)

# 🔐 Admin Portal Login Guide

## Admin Credentials

---

## 📧 ADMIN LOGIN CREDENTIALS

### Default Admin Account:
```
Email:    admin@telehealth.com
Password: Admin@123
```

---

## 🌐 HOW TO LOGIN

### Step 1: Open Login Page
Go to: **http://localhost:3000/login**

### Step 2: Enter Credentials
- **Email**: `admin@telehealth.com`
- **Password**: `Admin@123`

### Step 3: Click Login
You'll be redirected to the Admin Dashboard

---

## 🎯 ADMIN DASHBOARD ACCESS

After login, you'll have access to:

### 1. **Dashboard** (`/dashboard`)
- View system statistics
- Total users, doctors, patients
- Revenue and transactions
- Recent activities
- Charts and analytics

### 2. **Doctor Management** (`/admin/doctors`)
- View all doctors
- Edit doctor profiles
- Block/unblock doctors
- View doctor details

### 3. **Patient Management** (`/admin/patients`)
- View all patients
- Edit patient profiles
- Block/unblock patients
- View patient details

### 4. **Doctor Approvals** (`/admin/approvals`)
- Review pending doctor registrations
- Approve or reject doctors
- View submitted documents
- Verify credentials

### 5. **Appointments** (`/admin/appointments`)
- View all consultations
- Monitor ongoing appointments
- View appointment history
- Generate reports

### 6. **Transactions** (`/admin/transactions`)
- View all credit transactions
- Monitor revenue
- View payment history
- Generate financial reports

### 7. **Complaints** (`/admin/complaints`)
- View all complaints
- Respond to complaints
- Update complaint status
- Resolve issues

### 8. **Settings** (`/admin/settings`)
- Manage categories/specializations
- Add new categories
- Edit existing categories
- System configuration

---

## 🔑 ADMIN PRIVILEGES

As an admin, you can:

### User Management:
- ✅ View all users (patients, doctors, admins)
- ✅ Block/unblock users
- ✅ Edit user profiles
- ✅ Delete users (if implemented)
- ✅ View user activity

### Doctor Management:
- ✅ Approve doctor registrations
- ✅ Reject doctor applications
- ✅ View doctor documents
- ✅ Verify credentials
- ✅ Manage doctor profiles

### System Management:
- ✅ View system statistics
- ✅ Monitor transactions
- ✅ Handle complaints
- ✅ Manage categories
- ✅ Configure settings

### Financial:
- ✅ View all transactions
- ✅ Monitor revenue
- ✅ Generate reports
- ✅ Track credit usage

---

## 🚀 QUICK START

### 1. Login
```
1. Go to http://localhost:3000/login
2. Enter: admin@telehealth.com
3. Enter: Admin@123
4. Click "Login"
```

### 2. Navigate Dashboard
```
After login, you'll see:
- Statistics cards
- Recent activities
- Charts
- Quick actions
```

### 3. Approve Doctors
```
1. Click "Approvals" in sidebar
2. View pending doctors
3. Review documents
4. Click "Approve" or "Reject"
```

### 4. Manage Users
```
1. Click "Doctors" or "Patients"
2. View user list
3. Click on user to view details
4. Edit or block as needed
```

---

## 🔒 SECURITY

### Change Default Password:
For security, change the default password:

1. Login with default credentials
2. Go to Profile/Settings
3. Change password
4. Use a strong password

### Password Requirements:
- Minimum 8 characters
- Include uppercase and lowercase
- Include numbers
- Include special characters

### Recommended Password:
```
Example: Admin@TeleHealth2025!
```

---

## 🛠️ CREATE ADDITIONAL ADMINS

### Method 1: Using Script
```bash
cd backend
node scripts/createAdmin.js
```

### Method 2: Manually in Database
```javascript
// Connect to MongoDB
// Create user with role: 'admin'
{
  email: "newadmin@telehealth.com",
  password: "hashed_password",
  role: "admin",
  name: "Admin Name",
  isVerified: true,
  isActive: true
}
```

### Method 3: Via Admin Panel (if implemented)
- Login as admin
- Go to User Management
- Create new user
- Set role as "admin"

---

## 📊 ADMIN DASHBOARD FEATURES

### Statistics Cards:
- 📊 Total Users
- 👨‍⚕️ Total Doctors
- 👥 Total Patients
- 💰 Total Revenue
- 📅 Total Appointments
- ⚠️ Pending Approvals

### Charts:
- 📈 User Growth
- 💵 Revenue Trends
- 📊 Appointment Statistics
- 🎯 Category Distribution

### Recent Activities:
- Latest registrations
- Recent appointments
- New complaints
- Recent transactions

---

## 🎯 COMMON ADMIN TASKS

### 1. Approve a Doctor
```
1. Go to /admin/approvals
2. Click on pending doctor
3. Review:
   - Personal information
   - Qualifications
   - Documents (certificates, ID)
   - Experience
4. Click "Approve" or "Reject"
5. Add comments if rejecting
```

### 2. Handle Complaint
```
1. Go to /admin/complaints
2. Click on complaint
3. Review details
4. Update status
5. Add response
6. Mark as resolved
```

### 3. Manage Categories
```
1. Go to /admin/settings
2. View existing categories
3. Add new category:
   - Name
   - Description
   - Icon
4. Edit or delete categories
```

### 4. View Transactions
```
1. Go to /admin/transactions
2. Filter by:
   - Date range
   - User
   - Type
3. Export reports
4. View details
```

---

## 🐛 TROUBLESHOOTING

### Can't Login?
1. **Check credentials**:
   - Email: admin@telehealth.com
   - Password: Admin@123
2. **Check if admin exists**:
   ```bash
   cd backend
   node scripts/createAdmin.js
   ```
3. **Check MongoDB connection**
4. **Clear browser cache**

### Admin Not Created?
```bash
cd backend
node scripts/createAdmin.js
```

### Forgot Admin Password?
1. Reset via database:
   ```javascript
   // In MongoDB
   db.users.updateOne(
     { email: "admin@telehealth.com" },
     { $set: { password: "new_hashed_password" } }
   )
   ```
2. Or recreate admin user

### Dashboard Not Loading?
1. Check backend is running
2. Check MongoDB connection
3. Check browser console for errors
4. Verify admin role in database

---

## 📱 ADMIN MOBILE ACCESS

The admin panel is fully responsive:
- ✅ Works on mobile devices
- ✅ Touch-friendly interface
- ✅ Responsive tables
- ✅ Mobile-optimized charts

Access from mobile:
```
http://localhost:3000/login
(or your deployed URL)
```

---

## 🎨 ADMIN UI FEATURES

### Navigation:
- Sidebar with all admin sections
- Quick access to key features
- Breadcrumb navigation
- Search functionality

### Tables:
- Sortable columns
- Filterable data
- Pagination
- Export options

### Forms:
- Validation
- Error messages
- Success notifications
- Auto-save

### Notifications:
- Toast messages
- Real-time updates
- Email notifications
- System alerts

---

## 📞 SUPPORT

### If You Need Help:
1. Check browser console (F12)
2. Check backend logs
3. Verify MongoDB connection
4. Review error messages

### Documentation:
- APPLICATION_AUDIT_REPORT.md
- FINAL_APPLICATION_STATUS.md
- This guide

---

## ✅ QUICK CHECKLIST

### Before Login:
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 3000)
- [ ] MongoDB connected
- [ ] Admin user exists

### After Login:
- [ ] Dashboard loads
- [ ] Statistics display
- [ ] Sidebar navigation works
- [ ] All admin pages accessible

### Test Admin Features:
- [ ] View doctors
- [ ] View patients
- [ ] Approve a doctor
- [ ] Handle a complaint
- [ ] View transactions
- [ ] Manage categories

---

## 🎉 SUCCESS!

You now have full admin access to:
- ✅ User management
- ✅ Doctor approvals
- ✅ System monitoring
- ✅ Financial reports
- ✅ Complaint handling
- ✅ System configuration

**Login now at: http://localhost:3000/login**

---

## 📊 ADMIN CREDENTIALS SUMMARY

```
═══════════════════════════════════════
        ADMIN LOGIN CREDENTIALS
═══════════════════════════════════════

📧 Email:    admin@telehealth.com
🔑 Password: Admin@123

🌐 Login URL: http://localhost:3000/login

⚠️  IMPORTANT: Change password after first login!

═══════════════════════════════════════
```

---

**Created**: November 23, 2025
**Status**: ✅ Active
**Access Level**: Full Admin
**Security**: Change default password!

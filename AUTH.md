# Authentication & RBAC Documentation

## Overview

This application includes a complete authentication and Role-Based Access Control (RBAC) system with:
- Login flow with demo accounts
- User authentication with localStorage persistence
- Role-based navigation and page access
- Protected routes with role verification

## Authentication System

### How It Works

1. **User logs in** via the login page
2. **Auth context** validates credentials against mock users
3. **User data is stored** in localStorage for session persistence
4. **Protected routes** check authentication on every page
5. **User logout** clears session and redirects to login

### Auth Context (`src/context/AuthContext.jsx`)

Provides authentication state and methods across the app:

```javascript
const { user, login, logout, hasRole, isAuthenticated } = useAuth();
```

**Available Methods:**
- `login(email, password)` - Authenticate user
- `logout()` - Clear session and localStorage
- `hasRole(roles)` - Check if user has required role(s)
- `isAuthenticated` - Boolean, true if logged in
- `user` - Current user object with name, email, role, department

### Protected Route Component

```javascript
<ProtectedRoute requiredRoles="Admin">
  <AdminPanel />
</ProtectedRoute>
```

Supports single role or array of roles:
- `requiredRoles="Admin"` - Only admins
- `requiredRoles={['Admin', 'Manager']}` - Admins or managers
- `<ProtectedRoute>` - Any authenticated user

## User Roles & Permissions

### Available Roles

| Role | Permissions |
|------|-------------|
| **User** | Submit requests, view own requests, view reports, manage notifications |
| **Manager** | All User permissions + Approve/reject pending requests |
| **Admin** | All permissions + Admin panel (manage users, departments, categories) |

### Role-Based Features

#### User Features
- Dashboard (view stats)
- Submit Request
- My Requests (filter & view)
- View Request Details
- Reports (view & export)
- Notifications

#### Manager Features
- All User features +
- **Approvals** (review & approve/reject requests)
- Can comment on requests

#### Admin Features
- All features +
- **Admin Panel**
  - Manage Users (Add/Edit/Delete)
  - Manage Departments
  - Manage Categories
- Full system access

### Navigation by Role

**Sidebar dynamically shows:**
- Dashboard (all)
- Submit Request (all)
- My Requests (all)
- **Approvals** (Manager & Admin only)
- Reports (all)
- Notifications (all)
- **Admin Panel** (Admin only)

## Demo Users

Test different roles using these demo accounts:

```
1. John Smith (User)
   Email: john.smith@company.com
   Role: User
   Department: Engineering

2. Sarah Johnson (Manager)
   Email: sarah.johnson@company.com
   Role: Manager
   Department: Design

3. Emily Rodriguez (Admin)
   Email: emily.rodriguez@company.com
   Role: Admin
   Department: HR

4. Robert Wilson (Admin)
   Email: robert.wilson@company.com
   Role: Admin
   Department: Operations

5. Lisa Anderson (Manager)
   Email: lisa.anderson@company.com
   Role: Manager
   Department: Finance

6. Mike Chen (User)
   Email: mike.chen@company.com
   Role: User
   Department: Data Analytics

7. David Park (User)
   Email: david.park@company.com
   Role: User
   Department: IT

8. Jennifer Taylor (User)
   Email: jennifer.taylor@company.com
   Role: User
   Department: Marketing
```

### How to Login

**Method 1: Demo Buttons**
- Go to login page
- Click any demo user card to auto-login

**Method 2: Manual Login**
- Enter any demo user's email
- Enter any password (demo mode accepts all)
- Click Login

## Login Flow Implementation

### 1. Login Page (`src/pages/Login.jsx`)

- Email input field
- Password field
- Login button
- Demo account quick-select buttons
- Auto-login functionality

### 2. Authentication Process

```javascript
// In Login.jsx
const result = login(email, password);

if (result.success) {
  navigate('/');  // Redirect to dashboard
} else {
  setError(result.error);  // Show error message
}
```

### 3. Session Persistence

User session is saved to localStorage:

```javascript
// On login
localStorage.setItem('currentUser', JSON.stringify(user));

// On app load (AuthContext useEffect)
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
  setUser(JSON.parse(savedUser));
}

// On logout
localStorage.removeItem('currentUser');
```

## Usage Examples

### Using Auth in Components

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, logout, hasRole } = useAuth();

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      
      {hasRole('Admin') && (
        <button>Admin Actions</button>
      )}
      
      {hasRole(['Admin', 'Manager']) && (
        <button>Approve Requests</button>
      )}
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Creating Protected Routes

```javascript
// In App.jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRoles="Admin">
      <AdminPanel />
    </ProtectedRoute>
  }
/>

// For multiple roles
<Route
  path="/approvals"
  element={
    <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
      <Approvals />
    </ProtectedRoute>
  }
/>
```

### Conditional UI Rendering

```javascript
const { hasRole } = useAuth();

return (
  <>
    {hasRole('Admin') && <AdminMenu />}
    
    {hasRole(['Admin', 'Manager']) && <ApprovalQueue />}
    
    {!hasRole('User') && <RestrictedContent />}
  </>
);
```

## File Structure

```
src/
├── context/
│   └── AuthContext.jsx          # Authentication context & hooks
├── components/
│   └── ProtectedRoute.jsx       # Protected route wrapper
├── pages/
│   └── Login.jsx                # Login page
└── App.jsx                      # Routes with auth integration
```

## Backend Integration (Future)

Currently uses dummy data. To integrate with backend:

1. **Update login method** in AuthContext to call API:
```javascript
const login = async (email, password) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  setUser(data.user);
  localStorage.setItem('token', data.token);
  return data;
};
```

2. **Add JWT token handling**:
```javascript
// Store token
localStorage.setItem('authToken', token);

// Send with requests
fetch('/api/requests', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
});
```

3. **Update ProtectedRoute** to validate tokens with backend

4. **Replace mockUsers** with API calls

5. **Add password validation** with backend

## Security Considerations

### Current Demo Mode
- No password validation (demo only)
- Data stored in localStorage (not secure)
- No encryption
- All data is public mock data

### For Production
- ✅ Validate passwords with backend
- ✅ Use secure HTTP-only cookies for tokens
- ✅ Implement JWT or OAuth
- ✅ Add CSRF protection
- ✅ Use HTTPS only
- ✅ Implement rate limiting
- ✅ Add refresh token mechanism
- ✅ Secure password hashing (bcrypt)
- ✅ Add 2FA support

## Testing the Auth System

1. **Test Login**
   - Go to http://localhost:3000/login
   - Try demo accounts
   - Verify redirect to dashboard

2. **Test Role-Based Access**
   - Login as User → Approvals page should be forbidden
   - Login as Manager → Approvals page accessible
   - Login as Admin → All pages accessible

3. **Test Session Persistence**
   - Login
   - Refresh page → Should stay logged in
   - Clear localStorage → Should redirect to login

4. **Test Logout**
   - Click logout button
   - Should redirect to login
   - Session should clear

5. **Test Protected Routes**
   - Try accessing /admin as User → Should show access denied
   - Try accessing /approvals as User → Should show access denied

## Troubleshooting

### "You don't have permission to access this page"
- Current user role doesn't match required roles
- Login with appropriate role (e.g., Admin for /admin)

### Session not persisting
- Check browser localStorage is enabled
- Clear cache and login again

### Login button not working
- Ensure email matches a demo user
- Check browser console for errors

### Stuck on loading spinner
- Check if AuthContext is wrapping the app
- Verify ProtectedRoute component is used correctly

## Future Enhancements

- [ ] Implement remember me functionality
- [ ] Add password reset flow
- [ ] Add 2FA/MFA support
- [ ] Implement session timeout
- [ ] Add audit logging
- [ ] Implement role assignment via admin panel
- [ ] Add permission-based features (not just role-based)
- [ ] Implement OAuth/SSO integration
- [ ] Add email verification
- [ ] Create user profile settings page

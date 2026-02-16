# Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
```

Output files will be in the `dist/` directory.

## Default User

Current logged-in user: **Emily Rodriguez** (Admin)
- Role: Admin
- Department: HR
- Email: emily.rodriguez@company.com

This role has access to all features including the Admin Panel.

## Testing Different Features

### Dashboard
- View at home page `/`
- Shows stats, recent requests, and status summary

### Submit Request
- Navigate to `/submit-request`
- Fill form and upload attachments
- Submit creates a new request (demo only)

### My Requests
- Navigate to `/my-requests`
- Filter by status
- Click "View Details" to see request details

### Request Details
- Click any request in My Requests
- View timeline, comments, and attachments
- Add comments to the request

### Approvals
- Navigate to `/approvals`
- Approve or reject pending requests (if in manager/admin role)
- Add comments for approval decision

### Reports
- Navigate to `/reports`
- Apply filters by date and category
- View analytics and export options

### Notifications
- Navigate to `/notifications`
- View notification list
- Mark as read individually or in bulk

### Admin Panel
- Navigate to `/admin`
- Manage users, departments, and categories
- Add, edit, and delete items

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page-level components
├── layouts/         # Layout wrapper components
├── data/            # Mock data files
├── App.jsx          # Main application component
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (if configured)

## Key Features Implemented

✅ Responsive sidebar with mobile menu toggle
✅ Top navigation bar with search and profile dropdown
✅ Dashboard with stats and charts
✅ Request submission form with file upload
✅ Request list with filtering and sorting
✅ Request details page with timeline and comments
✅ Approval workflow (for managers/admins)
✅ Analytics and reporting
✅ Notification system
✅ Admin panel for system management
✅ Role-based UI visibility
✅ Professional Tailwind CSS styling
✅ Smooth transitions and animations

## Styling

This project uses **Tailwind CSS** for all styling:
- Custom configuration in `tailwind.config.js`
- Global styles in `src/index.css`
- Component-level utility classes throughout

## Icons

Uses **Lucide React** for icons:
- Import: `import { IconName } from 'lucide-react'`
- Example: `<Users size={20} />`

## Mock Data

All data is mock/dummy data stored in `src/data/mockData.js`:
- 5 sample requests with full details
- 5 sample users with different roles
- 4 sample notifications
- 5 sample departments
- 4 sample categories
- Reports data with monthly trends

## No Backend Integration

This is a **frontend-only** application:
- All data is stored in mock files
- No API calls or backend connections
- Perfect for UI/UX development and prototyping
- Ready for backend integration later

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port 3000 already in use
```bash
# Use a different port
npm run dev -- --port 3001
```

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Build errors
```bash
# Clear dist folder and rebuild
rm -rf dist
npm run build
```

## Next Steps

To extend this application:

1. **Add Backend Integration** - Replace mock data with API calls
2. **Add Authentication** - Implement login/logout functionality
3. **Add File Upload** - Connect file upload to backend storage
4. **Add Notifications** - Implement real-time notifications
5. **Add Export** - Implement PDF/Excel export functionality
6. **Add Email** - Send email notifications
7. **Add Search** - Implement full-text search
8. **Add Filters** - Add advanced filtering options

## Support

For questions or issues, refer to:
- React Documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- React Router: https://reactrouter.com
- Lucide Icons: https://lucide.dev

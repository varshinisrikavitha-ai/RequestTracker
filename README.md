# Online Request Status Tracker - Frontend

A modern React.js frontend for a web-based request tracking application with a professional dashboard UI.

## Features

✅ **Dashboard** - Overview of active requests, stats, and recent submissions
✅ **Submit Request** - Form to create new requests with file attachments
✅ **My Requests** - View all submitted requests with filtering
✅ **Request Details** - View full request info, timeline, and comments
✅ **Approvals** - Approve/reject pending requests (Manager role)
✅ **Reports** - Analytics and export options
✅ **Notifications** - Real-time notification management
✅ **Admin Panel** - Manage users, departments, and categories
✅ **Responsive Design** - Mobile, tablet, and desktop support
✅ **Role-Based UI** - Admin Panel only visible to admins

## Tech Stack

- **React 18** - UI framework
- **React Router v6** - Navigation
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Sidebar.jsx
│   ├── TopBar.jsx
│   ├── Card.jsx
│   ├── Table.jsx
│   ├── Badge.jsx
│   ├── Modal.jsx
│   ├── Timeline.jsx
│   ├── FormInput.jsx
│   ├── TextArea.jsx
│   └── Select.jsx
├── pages/              # Page components
│   ├── Dashboard.jsx
│   ├── SubmitRequest.jsx
│   ├── MyRequests.jsx
│   ├── RequestDetails.jsx
│   ├── Approvals.jsx
│   ├── Reports.jsx
│   ├── Notifications.jsx
│   └── AdminPanel.jsx
├── layouts/            # Layout components
│   └── MainLayout.jsx
├── data/              # Mock data
│   └── mockData.js
├── App.jsx            # Main app component
├── index.css          # Global styles
└── main.jsx           # Entry point
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Features in Detail

### Core Components

- **Sidebar Navigation** - Responsive menu with role-based visibility
- **Top Bar** - Search, notifications, and user profile dropdown
- **Cards** - Reusable container components with consistent styling
- **Tables** - Sortable data display with actions
- **Badges** - Color-coded status indicators
- **Modal** - Reusable dialog component
- **Timeline** - Visual status progression
- **Form Components** - Input, TextArea, Select fields

### Pages

1. **Dashboard**
   - Stats cards (Active, Pending, Completed, Rejected)
   - Recent requests table
   - Status summary with pie charts

2. **Submit Request**
   - Multi-field form with validation
   - Drag-and-drop file upload
   - Category and priority selection

3. **My Requests**
   - Filterable requests table
   - Status badges with color coding
   - Quick access to request details

4. **Request Details**
   - Full request information
   - Timeline visualization
   - Comment section
   - Attachment management

5. **Approvals**
   - Pending requests for review
   - Approve/reject with comments
   - Session processing stats

6. **Reports**
   - Analytics dashboard
   - Monthly trends
   - Category breakdown
   - Export options (PDF, Excel, CSV)

7. **Notifications**
   - Notification list with filtering
   - Read/unread status
   - Bulk mark as read

8. **Admin Panel**
   - User management (Add, Edit, Delete)
   - Department management
   - Category management

## Color Scheme

### Status Badges
- **Submitted** - Gray
- **Under Review** - Yellow
- **Approved** - Blue
- **Processing** - Purple
- **Completed** - Green
- **Rejected** - Red

### Priority Badges
- **Low** - Blue
- **Medium** - Yellow
- **High** - Orange
- **Critical** - Red

## Mock Data

The application uses mock data for demonstration. All data is stored in `src/data/mockData.js` and includes:
- Sample requests with full details
- User profiles with roles
- Notifications
- Departments
- Categories
- Reports data

## Responsive Breakpoints

- **Mobile** - < 768px
- **Tablet** - 768px - 1024px
- **Desktop** - > 1024px

## Future Enhancements

- Backend API integration
- Real authentication
- Advanced filtering and search
- Request export functionality
- Email notifications
- File preview functionality
- Request templates
- Bulk operations
- Analytics dashboard enhancements

## License

MIT License - feel free to use this template for your projects!

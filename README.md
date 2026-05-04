# Sri Basaveshwara Fertilizer Management System

A comprehensive fertilizer inventory and billing management application built with React, Vite, and Supabase.

## 📋 Project Overview

Sri Basaveshwara is a full-stack web application designed to manage fertilizer inventory, generate invoices, track stock transactions, and maintain audit logs. It features role-based access control, customer management, and comprehensive reporting capabilities.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React Icons, Motion (Framer Motion)
- **State Management**: Context API
- **HTTP Client**: Axios
- **Routing**: React Router
- **Authentication**: Custom Auth Context with JWT

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Email Service**: Resend
- **Security**: bcryptjs for password hashing

## 📁 Project Structure

```
Sri Basaveshwara-fertilizer-management/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/            # Page components
│   ├── context/          # Context API providers
│   ├── services/         # API client services
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── backend/
│   ├── server.js         # Express server
│   ├── package.json
│   └── README.md         # Backend documentation
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Supabase account
- Environment variables configured

### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Create a `.env.local` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=http://localhost:3000
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file:
   ```
   PORT=3000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   RESEND_API_KEY=your-resend-api-key
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:3000`

## 📱 Features

### Dashboard
- Real-time inventory overview
- Quick statistics
- Recent transactions
- Sales performance metrics

### Billing System
- Create itemized invoices
- Customer information management
- Tax calculation (CGST/SGST - 18%)
- Bill preview and printing
- Digital receipt generation

### Inventory Management
- Add/edit/delete fertilizer products
- Stock tracking
- Price management
- Batch size configuration

### Stock Management
- Record sales transactions
- Automatic stock deduction
- Transaction history
- Batch processing

### Reports
- Sales analytics
- Revenue reports
- Inventory reports
- Customer insights

### User Management
- Role-based access control (Admin, User)
- User profiles
- Password management
- Activity tracking

### Audit Logs
- Complete action history
- User activity tracking
- IP address logging
- Timestamp records

## 🔐 Authentication

- Email/password login and registration
- JWT token-based sessions
- Secure password hashing with bcryptjs
- Token refresh mechanism
- Automatic logout on auth failure

## 📊 Database Schema

### Key Tables
- `profiles` - User accounts and profiles
- `fertilizers` - Fertilizer products
- `sales` - Sales transactions
- `audit_logs` - System audit trail
- `system_settings` - Configuration

## 🔌 API Endpoints

See `backend/README.md` for complete API documentation.

### Main Endpoints
- `GET /api/health` - Health check
- `GET /api/fertilizers` - List all fertilizers
- `POST /api/sales` - Create sale transaction
- `GET /api/sales` - Get all sales
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/audit-logs` - Retrieve audit logs

## 📦 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend Deployment (Render/Railway)
```bash
# Push to Git repository
# Connect to deployment platform
# Set environment variables in dashboard
# Deploy from main branch
```

## 🧪 Testing

### Development Testing
```bash
npm run dev          # Frontend
cd backend && npm start  # Backend
```

### Production Build Testing
```bash
npm run build
npm run preview
```

## 📝 Environment Variables

### Frontend (.env.local)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
```

### Backend (.env)
```
PORT=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
VITE_SUPABASE_URL=
RESEND_API_KEY=
```

## 🐛 Troubleshooting

### Common Issues

**404 on POST /api/sales**
- Ensure backend endpoint is correctly defined
- Check CORS configuration
- Verify Supabase tables exist

**Login failures**
- Verify Supabase connection
- Check environment variables
- Ensure user exists in profiles table

**Stock not updating**
- Verify fertilizer IDs match
- Check stock column data type
- Review audit logs for errors

## 📚 Documentation

- [Backend API Documentation](./backend/README.md)
- Frontend API: `src/services/api.js`
- Auth Flow: `src/context/AuthContext.jsx`
- Inventory Context: `src/context/InventoryContext.jsx`

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Sri Basaveshwara Solutions P. Ltd.

## 📞 Support

For issues, contact: support@sribasaveshwara.com

---

**Version**: 1.0.0  
**Last Updated**: May 2026

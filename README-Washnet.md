# WASHNET Laundry Management System - Complete Documentation

## System Overview
WASHNET Laundry Management System is a full-stack web application built with React (Frontend) and Laravel (Backend) that helps manage laundry orders, track customer information, and provide analytics for business insights.

---

## User Roles & Access Levels

### 1. **Customer (Public Access)**
- No login required
- Access to public features only

### 2. **Employee**
- Requires registration with special access code
- Can create and view their own orders
- Cannot edit or delete orders

### 3. **Admin**
- Must be created manually in database
- Full system access
- Can manage all orders and view analytics

---

## Customer Features (Public Access)

### 1. **Home Page**
- **Location:** `/`
- **Description:** Public landing page for customers

#### Features:
- **Weather Forecast**
  - Displays current weather for Manila, Philippines
  - Shows 5-day weather forecast
  - "Best Day for Laundry" recommendation based on weather conditions
  - Interactive buttons:
    - **Refresh Button:** Manually update weather data
    - **More/Less Toggle:** Switch between simple and detailed forecast view
  - Detailed view includes:
    - Current temperature with "Today at [time]" label
    - Feels like temperature
    - Humidity percentage
    - Wind speed
    - Expandable daily forecast with hourly breakdowns

- **Order Search**
  - Customers can search for their orders by entering their full name
  - Displays all matching orders with:
    - Order ID
    - Order status (Pending, Processing, Ready, Completed, Cancelled)
    - Total amount (₱)
    - Service type (Wash & Dry, Wash Only, Dry Only, Mixed)
    - Delivery method (Pickup Only or Delivery Only)
    - Pickup/Delivery dates
    - Items list with quantities
    - Order creation date

---

## Employee Features

### 1. **Employee Registration**
- **Location:** `/signup`
- **Description:** Allows new employees to create accounts
- **Requirements:**
  - Full name (trimmed, no whitespace-only)
  - Valid email address (must be unique)
  - Password (minimum 8 characters)
  - Password confirmation (must match)
  - Special access code: `blackrosemoneygas`
- **Error Handling:**
  - Email already used: "Request failed: Email already used"
  - Password mismatch validation
  - All fields are validated on both frontend and backend

### 2. **Employee Login**
- **Location:** `/login`
- **Description:** Employee authentication
- **Requirements:**
  - Valid email and password
  - Redirects to Employee Dashboard after successful login

### 3. **Employee Dashboard**
- **Location:** `/employee`
- **Description:** Main workspace for employees

#### Features:

- **Create New Order (Point of Sale)**
  - **Customer Information:**
    - Customer name (required, trimmed)
    - Phone number (required, 10-11 digits, numbers only - Philippines format)
    - Email (optional, validated if provided)
  
  - **Service Method:**
    - Delivery Only (requires delivery date)
    - Pickup Only (requires pickup date)
  
  - **Items Management:**
    - Add multiple items per order
    - Each item requires:
      - Item description/name (required, trimmed)
      - Quantity (minimum 1, positive integer only, max 1000)
      - Service type per item:
        - Wash & Dry - ₱100
        - Wash Only - ₱60
        - Dry Only - ₱50
    - Total amount calculated automatically based on items
  
  - **Date Selection:**
    - Pickup date or Delivery date (based on service method)
    - Cannot select past dates
    - Date validated on frontend and backend
  
  - **Optional Notes:**
    - Special instructions
    - Fragile items notices
    - Other comments (max 1000 characters)
  
  - **Order Summary:**
    - Shows calculated subtotal and total
    - Real-time calculation as items are added/removed

- **View Orders**
  - Employees see only their own created orders
  - Displayed in a table format showing:
    - Order ID
    - Customer name
    - Service type
    - Total amount
    - Status
    - Pickup/Delivery dates
    - Creation date
    - Items preview

---

## Admin Features

### 1. **Admin Login**
- **Location:** `/login`
- **Description:** Admin authentication
- **Requirements:**
  - Admin email and password (created manually in database)
  - Redirects to Admin Dashboard after successful login

### 2. **Admin Dashboard**
- **Location:** `/admin`
- **Description:** Full system management interface

#### Tab 1: **Dashboard**
- **Statistics Cards:**
  - Total Orders (all time)
  - Pending Orders
  - Processing Orders
  - Ready Orders
  - Completed Orders
  - Total Revenue (from completed orders only)

- **Orders Management:**
  - View ALL orders from all employees
  - **Filters:**
    - **Customer Search:** Real-time search by customer name
    - **Date Filter:** Filter orders by creation date
    - **Refresh Button:** Reset all filters and reload data
  
  - **Order Actions:**
    - **Edit Order:**
      - Modify customer information (name, phone, email)
      - Update items (add, remove, modify quantities and service types)
      - Change order status
      - Update pickup/delivery dates
      - Edit notes
      - Total amount recalculates automatically
      - All validations apply (phone numbers, dates, quantities)
    
    - **Delete Order:**
      - Permanent deletion with confirmation prompt
      - Only admin can delete orders

#### Tab 2: **Analytics**
- **Service Type Distribution**
  - Pie chart showing:
    - Wash & Dry orders
    - Wash Only orders
    - Dry Only orders
    - Mixed services orders

- **Orders by Day of Week**
  - Bar chart showing order frequency by weekday
  - Helps identify busiest days

- **Revenue Trends**
  - Bar chart showing monthly revenue (last 6 months)
  - Only includes completed orders
  - Helps track business growth

- **Top Customers by Order Count**
  - Bar chart of top 10 customers
  - Shows customer name and order frequency
  - Helps identify loyal customers

#### Tab 3: **Employee Overview**
- View all registered employees
- Shows for each employee:
  - Employee name and email
  - Total orders created
  - Account creation date
  - Employee ID
- Refresh button to reload employee data

---

## Backend API Endpoints

### **Public Endpoints (No Authentication Required)**

#### 1. `GET /api/orders/search`
- **Description:** Search orders by customer name
- **Parameters:**
  - `customer_name` (query parameter) - Customer's full name
- **Returns:** Array of matching orders
- **Usage:** Used by customers on home page

#### 2. `POST /api/register`
- **Description:** Register new employee account
- **Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "password_confirmation": "string",
    "special_code": "string"
  }
  ```
- **Returns:** User object and authentication token
- **Validation:**
  - Name: Required, max 255 chars, not whitespace-only
  - Email: Required, valid format, unique
  - Password: Required, min 8 chars, must match confirmation
  - Special Code: Required, must match `blackrosemoneygas`

#### 3. `POST /api/login`
- **Description:** Authenticate user
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Returns:** User object and authentication token

---

### **Protected Endpoints (Requires Authentication)**

#### Authentication Endpoints

#### 1. `POST /api/logout`
- **Description:** Logout current user
- **Returns:** Success message

#### 2. `GET /api/me`
- **Description:** Get current authenticated user information
- **Returns:** User object with role

---

#### Order Management Endpoints

#### 1. `GET /api/orders`
- **Description:** Get orders list
- **Access:**
  - Admin: All orders
  - Employee: Only their own orders
- **Query Parameters:**
  - `date` - Filter by creation date (YYYY-MM-DD)
  - `start_date` - Start date for range filter
  - `end_date` - End date for range filter
- **Returns:** Array of orders with user relationship

#### 2. `POST /api/orders`
- **Description:** Create new order
- **Access:** Employee only
- **Body:**
  ```json
  {
    "customer_name": "string",
    "customer_phone": "string (10-11 digits)",
    "customer_email": "string (optional)",
    "items": [
      {
        "name": "string",
        "quantity": "integer (1-1000)",
        "service_type": "wash_dry|wash_only|dry_only"
      }
    ],
    "delivery_method": "pickup|deliver",
    "pickup_date": "date (if pickup)",
    "delivery_date": "date (if deliver)",
    "notes": "string (optional, max 1000 chars)"
  }
  ```
- **Auto-calculated:**
  - `total_amount` - Based on item service types and quantities
  - `service_type` - Determined from items (wash_dry, wash_only, dry_only, or mixed)
- **Validation:**
  - Customer name: Required, trimmed, not empty
  - Phone: Required, 10-11 digits only
  - Email: Optional, valid format if provided
  - Items: Required, at least 1 item, all with names and quantities
  - Dates: Must be today or future
  - Pickup date required if delivery_method is "pickup"
  - Delivery date required if delivery_method is "deliver"

#### 3. `GET /api/orders/{id}`
- **Description:** Get specific order details
- **Access:**
  - Admin: Any order
  - Employee: Only their own orders
- **Returns:** Single order object with user relationship

#### 4. `PUT /api/orders/{id}`
- **Description:** Update order
- **Access:** Admin only
- **Body:** Same as POST, but all fields optional (only provided fields updated)
- **Auto-calculates:** Total amount and service type if items are updated

#### 5. `DELETE /api/orders/{id}`
- **Description:** Delete order
- **Access:** Admin only
- **Returns:** Success message

#### 6. `GET /api/orders/statistics`
- **Description:** Get order statistics
- **Access:** Admin only
- **Returns:**
  ```json
  {
    "total_orders": "integer",
    "pending_orders": "integer",
    "processing_orders": "integer",
    "ready_orders": "integer",
    "completed_orders": "integer",
    "total_revenue": "decimal"
  }
  ```

#### 7. `GET /api/orders/employee-overview`
- **Description:** Get employee statistics
- **Access:** Admin only
- **Returns:** Array of employees with order counts and creation dates

---

#### Analytics Endpoints

#### 1. `GET /api/analytics`
- **Description:** Get comprehensive analytics data
- **Access:** Admin only
- **Returns:**
  ```json
  {
    "serviceTypes": [
      {
        "service_type": "string",
        "count": "integer"
      }
    ],
    "dayOfWeek": [
      {
        "day": "string",
        "count": "integer"
      }
    ],
    "revenue": [
      {
        "period": "string (M Y format)",
        "amount": "decimal"
      }
    ],
    "customerFrequency": [
      {
        "customer_name": "string",
        "order_count": "integer",
        "total_spent": "decimal"
      }
    ],
    "peakHours": [
      {
        "hour": "string",
        "count": "integer"
      }
    ],
    "statusDistribution": [
      {
        "status": "string",
        "count": "integer"
      }
    ]
  }
  ```

---

## Data Models

### **User Model**
- **Fields:**
  - `id` - Primary key
  - `name` - User's full name
  - `email` - Unique email address
  - `password` - Hashed password
  - `role` - Either "admin" or "employee"
  - `created_at` - Account creation timestamp
  - `updated_at` - Last update timestamp

- **Relationships:**
  - Has many Orders
  - Methods:
    - `isAdmin()` - Returns true if role is admin
    - `isEmployee()` - Returns true if role is employee

### **Order Model**
- **Fields:**
  - `id` - Primary key
  - `user_id` - Foreign key to User (employee who created)
  - `customer_name` - Customer's full name
  - `customer_phone` - Customer phone (10-11 digits)
  - `customer_email` - Customer email (optional)
  - `items` - JSON array of items with name, quantity, service_type
  - `service_type` - Enum: wash_dry, wash_only, dry_only, mixed
  - `total_amount` - Decimal (2 places)
  - `status` - Enum: pending, processing, ready, completed, cancelled
  - `delivery_method` - Enum: pickup, deliver
  - `pickup_date` - Date (nullable, if pickup method)
  - `delivery_date` - Date (nullable, if deliver method)
  - `notes` - Text (optional, max 1000 chars)
  - `created_at` - Order creation timestamp
  - `updated_at` - Last update timestamp

- **Relationships:**
  - Belongs to User (employee)
  
- **Static Methods:**
  - `calculateTotalAmount($items)` - Calculates total based on service types and quantities
  - `determineServiceType($items)` - Determines if order is wash_dry, wash_only, dry_only, or mixed
  - `getServicePrice($serviceType)` - Returns price for service type

---

## Validation Rules

### **Phone Numbers**
- Format: 10-11 digits only (Philippines format: 09XXXXXXXXX)
- Frontend: Automatically strips non-numeric characters, limits to 11 digits
- Backend: Regex validation `^[0-9]{10,11}$`

### **Customer Names**
- Cannot be empty or whitespace-only
- Trimmed on both frontend and backend
- Maximum 255 characters

### **Email Addresses**
- Valid email format
- Unique for user registration
- Optional for orders
- Trimmed before saving

### **Quantities**
- Minimum: 1
- Maximum: 1000
- Must be positive integer
- Cannot be zero or negative

### **Dates**
- Pickup/Delivery dates cannot be in the past
- Delivery date must be after pickup date (if both set)
- Format: YYYY-MM-DD
- Required based on delivery method

### **Total Amount**
- Automatically calculated from items
- Minimum: ₱0.01
- Decimal precision: 2 places

---

## Service Types & Pricing

### **Service Types:**
1. **Wash & Dry** - ₱100 per item
2. **Wash Only** - ₱60 per item
3. **Dry Only** - ₱50 per item
4. **Mixed** - Automatically assigned when order contains multiple service types

### **Order Service Type Logic:**
- If all items have same service type → Uses that type
- If items have different service types → Assigned "mixed"
- Each item can have individual service type for flexible pricing

---

## Order Statuses

1. **Pending** - Order just created, awaiting processing
2. **Processing** - Order is being washed/dried
3. **Ready** - Order is complete and ready for pickup/delivery
4. **Completed** - Order has been picked up/delivered
5. **Cancelled** - Order was cancelled

---

## Security Features

1. **Authentication:**
   - Laravel Sanctum token-based authentication
   - Tokens stored securely
   - Auto-logout on token expiration

2. **Authorization:**
   - Role-based access control
   - Employees can only access their own orders
   - Admins have full system access
   - Special code required for employee registration

3. **Input Validation:**
   - Frontend validation for immediate feedback
   - Backend validation for security
   - Data sanitization (trimming, type casting)
   - SQL injection protection via Laravel ORM

4. **Password Security:**
   - Minimum 8 characters required
   - Passwords hashed using bcrypt
   - Never stored in plain text

---

## Weather Integration

- **API:** OpenWeatherMap
- **Location:** Manila, Philippines
- **Features:**
  - Current weather conditions
  - 5-day forecast
  - Hourly breakdowns (in detailed view)
  - Best day recommendation for laundry
  - Manual refresh capability
  - Fallback to demo data if API fails

---

## Technology Stack

### **Frontend:**
- React.js
- React Router (Navigation)
- Axios (API calls)
- Context API (State management)

### **Backend:**
- Laravel (PHP Framework)
- Laravel Sanctum (Authentication)
- SQLite Database (can be changed to MySQL/PostgreSQL)

### **External Services:**
- OpenWeatherMap API (Weather data)

---

## File Structure

```
laundry-frontend/
├── src/
│   ├── components/
│   │   ├── CustomerHome.js      # Public customer page
│   │   ├── Login.js              # Login form
│   │   ├── Signup.js             # Employee registration
│   │   ├── EmployeeDashboard.js  # Employee workspace
│   │   ├── AdminDashboard.js     # Admin workspace
│   │   └── Analytics.js          # Analytics charts
│   ├── contexts/
│   │   └── AuthContext.js        # Authentication state
│   └── App.js                    # Main app router

laundry-backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           ├── AuthController.php      # Authentication
│   │           ├── OrderController.php      # Order management
│   │           └── AnalyticsController.php  # Analytics
│   └── Models/
│       ├── User.php              # User model
│       └── Order.php             # Order model
├── routes/
│   └── api.php                   # API routes
└── database/
    └── migrations/               # Database schema
```

---

## Getting Started

### **Setup Instructions:**

1. **Backend Setup:**
   ```bash
   cd laundry-backend
   composer install
   php artisan migrate
   php artisan serve
   ```

2. **Frontend Setup:**
   ```bash
   cd laundry-frontend
   npm install
   npm start
   ```

3. **Create Admin User:**
   - Use database seeder or create manually in database
   - Role must be set to "admin"

### **Default Configuration:**
- Backend API: `http://localhost:8000/api`
- Frontend: `http://localhost:3000`
- Weather API Key: Must be set in `CustomerHome.js`

---

## Future Enhancements (Potential)

- Email notifications for order status changes
- SMS notifications via Twilio
- Payment integration
- Customer accounts and login
- Order history for customers
- Receipt generation/printing
- Inventory management
- Employee performance metrics
- Advanced reporting and exports
- Multi-location support
- Mobile app version

---

## Support & Contact

For issues or questions:
- Check browser console for errors
- Check Laravel logs: `storage/logs/laravel.log`
- Verify API endpoints are accessible
- Ensure database migrations are run

---

**Last Updated:** 2025
**Version:** 1.0
**System:** WASHNET Laundry Management System


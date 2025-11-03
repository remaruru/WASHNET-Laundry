import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { apiConfig } from '../config/api';

// Utility function to determine service type based on items
const determineServiceType = (items) => {
  if (!items || items.length === 0) return 'wash_dry';
  
  const serviceTypes = items.map(item => item.service_type).filter(Boolean);
  const uniqueServiceTypes = [...new Set(serviceTypes)];
  
  // If only one type of service
  if (uniqueServiceTypes.length === 1) {
    return uniqueServiceTypes[0];
  }
  
  // If multiple different service types, it's mixed
  if (uniqueServiceTypes.length > 1) {
    return 'mixed';
  }
  
  // Default fallback
  return 'wash_dry';
};

function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(apiConfig.endpoints.orders);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (orderData) => {
    console.log('handleCreateOrder called with:', orderData);
    try {
      const response = await axios.post(apiConfig.endpoints.orders, orderData);
      console.log('Order created successfully:', response.data);
      setShowCreateModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
        alert('Validation errors:\n' + errorMessages);
      } else {
        alert('Error creating order: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      processing: '#17a2b8',
      ready: '#28a745',
      completed: '#28a745', // Changed to green
      cancelled: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Employee Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            type="button"
          >
            Create New Order
          </button>
        </div>

        <div className="orders-section">
          <h2>My Orders</h2>
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Service Type</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Pickup Date</th>
                  <th>Delivery Date</th>
                  <th>Created</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>
                      <span className="service-type-badge">
                        {order.service_type === 'wash_dry' ? 'Wash & Dry' : 
                         order.service_type === 'wash_only' ? 'Wash Only' : 
                         order.service_type === 'dry_only' ? 'Dry Only' : 
                         order.service_type === 'mixed' ? 'Mixed Services' : 'Wash & Dry'}
                      </span>
                    </td>
                    <td>₱{order.total_amount}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>{order.pickup_date ? new Date(order.pickup_date).toLocaleDateString() : 'Not set'}</td>
                    <td>{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not set'}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="items-preview">
                        {order.items?.map((item, index) => (
                          <div key={index} className="item-tag">
                            {item.name} (x{item.quantity}) - {item.service_type === 'wash_dry' ? 'Wash & Dry' : 
                             item.service_type === 'wash_only' ? 'Wash Only' : 
                             item.service_type === 'dry_only' ? 'Dry Only' : 'Wash & Dry'}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateOrder}
        />
      )}
    </div>
  );
}

// Create Order Modal Component
function CreateOrderModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    items: [{ name: '', quantity: 1, service_type: 'wash_dry' }],
    service_type: 'mixed', // Default to mixed since we now support per-item service types
    total_amount: 0,
    notes: '',
    pickup_date: '',
    delivery_date: '',
    delivery_method: 'deliver', // 'pickup' or 'deliver'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = {
      ...formData,
      [name]: value,
    };
    
    // Phone number validation - numbers only
    if (name === 'customer_phone') {
      // Remove any non-numeric characters
      const numericOnly = value.replace(/\D/g, '');
      // Limit to 11 digits (Philippines format)
      const limited = numericOnly.slice(0, 11);
      newFormData[name] = limited;
    }
    
    // Customer name - trim whitespace
    if (name === 'customer_name') {
      newFormData[name] = value.trim();
    }
    
    // If delivery method changes, clear the opposite date
    if (name === 'delivery_method') {
      if (value === 'pickup') {
        newFormData.delivery_date = '';
      } else if (value === 'deliver') {
        newFormData.pickup_date = '';
      }
    }
    
    // Validate dates
    if (name === 'pickup_date' && formData.delivery_date && value > formData.delivery_date) {
      // If pickup date is after delivery date, clear delivery date
      newFormData.delivery_date = '';
    }
    
    setFormData(newFormData);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    
    // Validate quantity - ensure positive integer
    if (field === 'quantity') {
      const numValue = parseInt(value) || 0;
      if (numValue < 1) {
        newItems[index][field] = 1; // Minimum is 1
      } else {
        newItems[index][field] = numValue;
      }
    } else if (field === 'name') {
      // Trim item name whitespace
      newItems[index][field] = value.trim();
    } else {
      newItems[index][field] = value;
    }
    
    // Calculate total based on individual item service types and quantities
    const servicePrices = {
      'wash_dry': 100,
      'wash_only': 60,
      'dry_only': 50
    };
    
    let total = 0;
    newItems.forEach(item => {
      const serviceType = item.service_type || 'wash_dry';
      const quantity = parseInt(item.quantity || 0);
      const price = servicePrices[serviceType] || 100;
      total += price * quantity;
    });
    
    // Determine service type based on items
    const determinedServiceType = determineServiceType(newItems);
    
    setFormData({
      ...formData,
      items: newItems,
      total_amount: total,
      service_type: determinedServiceType,
    });
  };

  const addItem = () => {
    const newItems = [...formData.items, { name: '', quantity: 1, service_type: 'wash_dry' }];
    const determinedServiceType = determineServiceType(newItems);
    
    setFormData({
      ...formData,
      items: newItems,
      service_type: determinedServiceType,
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      
      // Calculate total based on individual item service types and quantities
      const servicePrices = {
        'wash_dry': 100,
        'wash_only': 60,
        'dry_only': 50
      };
      
      let total = 0;
      newItems.forEach(item => {
        const serviceType = item.service_type || 'wash_dry';
        const quantity = parseInt(item.quantity || 0);
        const price = servicePrices[serviceType] || 100;
        total += price * quantity;
      });
      
      // Determine service type based on remaining items
      const determinedServiceType = determineServiceType(newItems);
      
      setFormData({
        ...formData,
        items: newItems,
        total_amount: total,
        service_type: determinedServiceType,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Validate customer name - must not be empty after trimming
    const trimmedName = formData.customer_name.trim();
    if (!trimmedName) {
      alert('Customer name is required');
      return;
    }
    
    // Validate phone number - must be at least 10 digits (Philippines format)
    const phoneDigits = formData.customer_phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      alert('Phone number must be 10-11 digits (Philippines format: 09XXXXXXXXX)');
      return;
    }
    
    // Validate email format if provided
    if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email.trim())) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Validate items - ensure all items have names and valid quantities
    const validItems = formData.items.filter(item => item.name && item.name.trim());
    if (validItems.length === 0) {
      alert('At least one item with a name is required');
      return;
    }
    
    // Check for empty item names
    const hasEmptyItems = formData.items.some(item => !item.name || !item.name.trim());
    if (hasEmptyItems) {
      alert('All items must have a name');
      return;
    }
    
    // Validate dates - prevent past dates
    const today = new Date().toISOString().split('T')[0];
    if (formData.delivery_method === 'pickup' && formData.pickup_date) {
      if (formData.pickup_date < today) {
        alert('Pickup date cannot be in the past');
        return;
      }
    } else if (formData.delivery_method === 'deliver' && formData.delivery_date) {
      if (formData.delivery_date < today) {
        alert('Delivery date cannot be in the past');
        return;
      }
    }
    
    // Validate based on delivery method
    if (formData.delivery_method === 'pickup') {
      if (!formData.pickup_date) {
        alert('Pickup date is required for pickup orders');
        return;
      }
      // Clear delivery date for pickup-only orders
      formData.delivery_date = '';
    } else if (formData.delivery_method === 'deliver') {
      if (!formData.delivery_date) {
        alert('Delivery date is required for delivery orders');
        return;
      }
      // Clear pickup date for delivery-only orders
      formData.pickup_date = '';
    }
    
    // Validate dates if both are set (shouldn't happen with the logic above)
    if (formData.pickup_date && formData.delivery_date && formData.delivery_date <= formData.pickup_date) {
      alert('Delivery date must be after pickup date');
      return;
    }
    
    // Remove the top-level service_type since we're using per-item service types
    const { service_type, delivery_method, ...orderData } = formData;
    
    // Trim customer name and email
    orderData.customer_name = trimmedName;
    if (orderData.customer_email) {
      orderData.customer_email = orderData.customer_email.trim();
    }
    
    // Ensure phone is numeric only
    orderData.customer_phone = phoneDigits;
    
    // Trim item names
    orderData.items = orderData.items.map(item => ({
      ...item,
      name: item.name.trim()
    }));
    
    // Add delivery_method to the order data
    orderData.delivery_method = delivery_method;
    
    console.log('Sending order data:', orderData);
    
    onSave(orderData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-pos">
        <div className="modal-header">
          <h3>📋 Point of Sale - New Order</h3>
          <button onClick={onClose} className="btn-close">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="pos-grid">
            {/* Customer Information Section */}
            <div className="pos-section">
              <h4>👤 Customer Information</h4>
            <div className="form-group">
              <label>Customer Name *</label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                placeholder="Enter customer name"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="text"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  required
                  placeholder="09XXXXXXXXX"
                  pattern="[0-9]{10,11}"
                  maxLength="11"
                  title="Phone number must be 10-11 digits (e.g., 09123456789)"
                />
                {formData.customer_phone && formData.customer_phone.replace(/\D/g, '').length < 10 && (
                  <small style={{color: 'red', display: 'block', marginTop: '5px'}}>
                    Phone number must be at least 10 digits
                  </small>
                )}
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                />
              </div>
            </div>
            </div>

            {/* Service Method Section */}
            <div className="pos-section">
              <h4>🚚 Service Method</h4>
              <div className="delivery-method">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="delivery_method"
                    value="deliver"
                    checked={formData.delivery_method === 'deliver'}
                    onChange={handleChange}
                  />
                  <span>📦 Delivery Only</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="delivery_method"
                    value="pickup"
                    checked={formData.delivery_method === 'pickup'}
                    onChange={handleChange}
                  />
                  <span>🏠 Pickup Only</span>
                </label>
              </div>
            </div>

            {/* Items Section */}
            <div className="pos-section">
              <h4>🛍️ Items</h4>


            {formData.items.map((item, index) => (
              <div key={index} className="item-row-pos">
                <input
                  type="text"
                  placeholder="Item description (e.g., 5 pcs t-shirts, 3 pairs jeans)"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  required
                  className="item-name-input"
                  style={{ height: '45px', padding: '12px' }}
                />
                <div className="item-controls">
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    handleItemChange(index, 'quantity', val < 1 ? 1 : val);
                  }}
                  min="1"
                  step="1"
                  required
                  className="quantity-input"
                />
                  <select
                    value={item.service_type}
                    onChange={(e) => handleItemChange(index, 'service_type', e.target.value)}
                    required
                    className="service-select"
                  >
                    <option value="wash_dry">Wash & Dry - ₱100</option>
                    <option value="wash_only">Wash Only - ₱60</option>
                    <option value="dry_only">Dry Only - ₱50</option>
                  </select>
                  {formData.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="btn-remove">✕</button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={addItem} className="btn btn-sm btn-secondary add-item-btn">
              + Add Item
            </button>
            </div>

            {/* Date Section - Conditionally render based on delivery method */}
            <div className="pos-section">
              <h4>📅 {formData.delivery_method === 'pickup' ? 'Pickup Date' : 'Delivery Date'}</h4>
              <div className="form-group">
                <label>{formData.delivery_method === 'pickup' ? 'Pickup Date *' : 'Delivery Date *'}</label>
                <input
                  type="date"
                  name={formData.delivery_method === 'pickup' ? 'pickup_date' : 'delivery_date'}
                  value={formData.delivery_method === 'pickup' ? formData.pickup_date : formData.delivery_date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Summary Section */}
            <div className="pos-section pos-summary">
              <h4>💰 Order Summary</h4>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₱{formData.total_amount.toFixed(2)}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total:</span>
                  <span className="total-amount">₱{formData.total_amount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Special instructions, fragile items, etc."
                />
              </div>
            </div>
          </div>

          <div className="modal-actions modal-actions-pos">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-create-order">
              ✓ Create Order - ₱{formData.total_amount.toFixed(2)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeDashboard;

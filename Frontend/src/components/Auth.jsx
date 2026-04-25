import React, { useState } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import './Auth.css';

// 🎨 Custom SVG Logo: Represents "Observation (Problem) -> Verification (Solution)"
const BrandLogo = ({ className = "logo-icon", checkColor = "#2563eb" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="45" cy="45" r="35" stroke="currentColor" strokeWidth="8" />
    <line x1="70" y1="70" x2="90" y2="90" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
    <path d="M30 45L40 55L65 35" stroke={checkColor} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Auth = ({ show, onHide, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('user'); // 'user' or 'admin'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    department: '',
    designation: '',
    // Admin jurisdiction fields
    adminJurisdiction: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      coordinates: { latitude: null, longitude: null },
      serviceRadius: 10
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Don't render if not shown
  if (!show) return null;

  // Government departments for admin signup
  const departments = [
    { value: 'mla', label: '👤 MLA Office', desc: 'Member of Legislative Assembly' },
    { value: 'mcd', label: '🏛️ MCD', desc: 'Municipal Corporation of Delhi' },
    { value: 'road_department', label: '🛣️ Road Department', desc: 'Public Works Department - Roads' },
    { value: 'jal_board', label: '💧 Jal Board', desc: 'Delhi Water Board' },
    { value: 'bijli_vibhag', label: '⚡ Bijli Vibhag', desc: 'Electricity Department' },
    { value: 'police', label: '👮 Police Department', desc: 'Law & Order' },
    { value: 'fire_department', label: '🚒 Fire Department', desc: 'Fire & Emergency Services' },
    { value: 'health_department', label: '🏥 Health Department', desc: 'Public Health Services' },
    { value: 'education', label: '📚 Education Department', desc: 'Public Education' },
    { value: 'transport', label: '🚌 Transport Department', desc: 'Public Transportation' },
    { value: 'environment', label: '🌱 Environment Department', desc: 'Pollution Control & Environment' },
    { value: 'other', label: '📋 Other', desc: 'Other Government Department' }
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else if (name.startsWith('adminJurisdiction.')) {
      const jurisdictionField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        adminJurisdiction: {
          ...prev.adminJurisdiction,
          [jurisdictionField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = isLogin ? buildApiUrl(API_ENDPOINTS.LOGIN) : buildApiUrl(API_ENDPOINTS.REGISTER);
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            userType: userType,
            ...(userType === 'user' ? {
              location: formData.location
            } : {
              department: formData.department,
              designation: formData.designation,
              adminJurisdiction: formData.adminJurisdiction
            })
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Auth successful:', data); // Debug log
        setMessage({ type: 'success', text: data.message || (isLogin ? 'Login successful!' : 'Registration successful!') });
        
        if (data.data?.token) {
          console.log('💾 Storing token and user data:', data.data); // Debug log
          localStorage.setItem('authToken', data.data.token);
          localStorage.setItem('userData', JSON.stringify(data.data.user));
          
          // Brief delay so the user can see the success message
          setTimeout(() => {
            console.log('📤 Calling onLogin callback');
            onLogin(data.data, data.data.token);
            onHide();
          }, 1200);
        }
      } else {
        console.log('❌ Login failed:', data.message); // Debug log
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      location: {
        address: '',
        city: '',
        state: '',
        pincode: ''
      },
      department: '',
      designation: '',
      adminJurisdiction: {
        address: '',
        city: '',
        state: '',
        pincode: '',
        coordinates: { latitude: null, longitude: null },
        serviceRadius: 10
      }
    });
    setMessage({ type: '', text: '' });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const toggleUserType = (type) => {
    setUserType(type);
    resetForm();
  };

  return (
    <div className="auth-overlay" onClick={onHide}>
      <div className="auth-container" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <button className="auth-close" onClick={onHide}>
            ✕
          </button>
          <div className="auth-logo">
            <BrandLogo className="logo-img" />
            <span className="brand-name">CivicSense</span>
          </div>
        </div>

        <div className="auth-content">
          {/* Mode Toggle */}
          <div className="auth-mode-toggle">
            <button 
              className={`mode-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              🔑 Login
            </button>
            <button 
              className={`mode-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              📝 Sign Up
            </button>
          </div>

          {/* User Type Toggle (Only for Signup) */}
          {!isLogin && (
            <div className="user-type-toggle">
              <div className="user-type-header">
                <h4>Choose Your Role</h4>
                <p>Select whether you're a citizen or government official</p>
              </div>
              <div className="user-type-options">
                <button
                  className={`user-type-btn ${userType === 'user' ? 'active' : ''}`}
                  onClick={() => toggleUserType('user')}
                >
                  <div className="user-type-icon">👥</div>
                  <div className="user-type-info">
                    <h5>Citizen</h5>
                    <p>Report and track civic issues</p>
                  </div>
                </button>
                <button
                  className={`user-type-btn ${userType === 'admin' ? 'active' : ''}`}
                  onClick={() => toggleUserType('admin')}
                >
                  <div className="user-type-icon">🏛️</div>
                  <div className="user-type-info">
                    <h5>Government Official</h5>
                    <p>Manage and resolve issues</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name (Signup only) */}
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">
                  👤 Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">
                🔐 Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your password"
                required
              />
              {!isLogin && (
                <small className="form-hint">
                  Password should be at least 6 characters long
                </small>
              )}
            </div>

            {/* Phone (Signup only) */}
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">
                  📱 Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            )}

            {/* User-specific fields */}
            {!isLogin && userType === 'user' && (
              <div className="location-section">
                <h4 className="section-title">📍 Your Location</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="House/Flat number, Street"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="City name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <select
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select State</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input
                      type="text"
                      name="location.pincode"
                      value={formData.location.pincode}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="6-digit pincode"
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Admin-specific fields */}
            {!isLogin && userType === 'admin' && (
              <div className="admin-section">
                <h4 className="section-title">🏛️ Government Details</h4>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="form-select department-select"
                    required
                  >
                    <option value="">Select Your Department</option>
                    {departments.map(dept => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                  {formData.department && (
                    <div className="department-info">
                      <span className="dept-desc">
                        {departments.find(d => d.value === formData.department)?.desc}
                      </span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Designation/Position</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Assistant Engineer, Officer, etc."
                    required
                  />
                </div>

                {/* Admin Jurisdiction/Service Area */}
                <h4 className="section-title">📍 Your Service Area/Jurisdiction</h4>
                <p className="section-description">
                  You will only see and manage issues from this area
                </p>
                
                <div className="form-group">
                  <label className="form-label">Office/Service Address</label>
                  <input
                    type="text"
                    name="adminJurisdiction.address"
                    value={formData.adminJurisdiction.address}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your office address or service area"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="adminJurisdiction.city"
                      value={formData.adminJurisdiction.city}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <select
                      name="adminJurisdiction.state"
                      value={formData.adminJurisdiction.state}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select State</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input
                      type="text"
                      name="adminJurisdiction.pincode"
                      value={formData.adminJurisdiction.pincode}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Service area pincode"
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Radius (km)</label>
                    <select
                      name="adminJurisdiction.serviceRadius"
                      value={formData.adminJurisdiction.serviceRadius}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value={5}>5 km</option>
                      <option value={10}>10 km</option>
                      <option value={15}>15 km</option>
                      <option value={20}>20 km</option>
                      <option value={50}>50 km (District Level)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.type === 'success' ? '✅' : '❌'} {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`btn btn-primary btn-lg auth-submit ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>⏳ Processing...</>
              ) : (
                <>
                  {isLogin ? '🔑 Login' : '🚀 Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="auth-toggle">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button className="toggle-link" onClick={toggleMode}>
                  Sign up here
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button className="toggle-link" onClick={toggleMode}>
                  Login here
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

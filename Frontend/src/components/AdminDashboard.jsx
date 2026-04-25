// 👨‍💼 Admin Dashboard - Minimal Interface for Authorities
import React, { useState, useEffect, useCallback } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import AIChatbot from './AIChatbot'; // Re-added AI Assistant
import './AdminDashboard.css';

// 🎨 Custom SVG Logo: Represents "Observation (Problem) -> Verification (Solution)"
const BrandLogo = ({ className = "logo-icon", checkColor = "#2563eb" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="45" cy="45" r="35" stroke="currentColor" strokeWidth="8" />
    <line x1="70" y1="70" x2="90" y2="90" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
    <path d="M30 45L40 55L65 35" stroke={checkColor} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AdminDashboard = ({ user, onLogout }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchLocation, setSearchLocation] = useState('');

  // Server-side filtering is now handled by the backend API

  // Fetch issues from backend
  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ISSUES), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Admin fetched issues:', data); // Debug log
      if (data.success) {
        // Server already filters issues based on admin's jurisdiction
        setIssues(data.data.issues);
        console.log('Received filtered issues from server:', data.data.issues.length, 'issues'); // Debug log
        if (data.data.jurisdiction) {
          console.log('Admin jurisdiction info:', data.data.jurisdiction);
          console.log('Original total issues:', data.data.originalTotal);
        }
      } else {
        console.error('Failed to fetch issues:', data.message);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Toggle issue resolved status
  const toggleResolved = async (issueId, currentStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const newStatus = currentStatus === 'Resolved' ? 'Open' : 'Resolved';
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.UPDATE_ISSUE_STATUS(issueId)), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setIssues(issues.map(issue => 
          issue._id === issueId 
            ? { ...issue, status: newStatus }
            : issue
        ));
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  // Filter issues based on status and location
  const filteredIssues = issues.filter(issue => {
    const statusMatch = filter === 'all' || 
                       (filter === 'resolved' && issue.status === 'Resolved') ||
                       (filter === 'open' && issue.status !== 'Resolved');
    
    const locationText = typeof issue.location === 'string' 
      ? issue.location 
      : issue.location?.address || '';
    
    const locationMatch = !searchLocation || 
                         locationText.toLowerCase().includes(searchLocation.toLowerCase());
    
    return statusMatch && locationMatch;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading issues...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="logo-section" onClick={() => window.location.href = '/'}>
            <BrandLogo className="dashboard-logo-svg" />
            <span className="brand-name">CivicSense</span>
          </div>
          
          <div className="admin-user-info">
            <p className="admin-subtitle">
              Welcome, <strong>{user.name}</strong> | {user.department}
            </p>
            {user.adminJurisdiction && (
              <p className="jurisdiction-info">
                📍 Service Area: {user.adminJurisdiction.city}, {user.adminJurisdiction.state} 
              </p>
            )}
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">All Issues</option>
            <option value="open">Open Issues</option>
            <option value="resolved">Resolved Issues</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Search Location:</label>
          <input
            type="text"
            placeholder="Enter area/location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="stats-summary">
          <span className="stat-item">
            📊 Total: <strong>{filteredIssues.length}</strong>
          </span>
          <span className="stat-item">
            ✅ Resolved: <strong>{filteredIssues.filter(i => i.status === 'Resolved').length}</strong>
          </span>
          <span className="stat-item">
            🔓 Open: <strong>{filteredIssues.filter(i => i.status !== 'Resolved').length}</strong>
          </span>
        </div>
      </div>

      {/* Issues Table */}
      <div className="admin-table-container">
        <table className="admin-issues-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Issue Type</th>
              <th>Description</th>
              <th>Area/Location</th>
              <th>Department</th>
              <th>Reported By</th>
              <th>Date</th>
              <th>Votes</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue, index) => (
                <tr key={issue._id} className={issue.status === 'Resolved' ? 'resolved-row' : ''}>
                  <td>{index + 1}</td>
                  <td>
                    <span className="issue-category">
                      {issue.category}
                    </span>
                  </td>
                  <td>
                    <div className="issue-description">
                      {issue.title}
                      {issue.description.length > 50 && (
                        <div className="description-full">
                          {issue.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="location-cell">
                    {typeof issue.location === 'string' 
                      ? issue.location 
                      : issue.location?.address || 'N/A'}
                  </td>
                  <td>
                    <span className="department-tag">
                      {issue.category === 'Infrastructure' ? 'PWD' :
                       issue.category === 'Water Supply' ? 'Water Dept' :
                       issue.category === 'Waste Management' ? 'Sanitation' :
                       issue.category === 'Traffic' ? 'Traffic Police' :
                       'Municipal'}
                    </span>
                  </td>
                  <td>
                    {typeof issue.reportedBy === 'string' 
                      ? issue.reportedBy 
                      : issue.reportedBy?.name || 'Anonymous'}
                  </td>
                  <td className="date-cell">
                    {new Date(issue.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="votes-cell">
                    <span className="votes-count">
                      👍 {issue.upvotes || 0} 👎 {issue.downvotes || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${issue.status.toLowerCase()}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td>
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={issue.status === 'Resolved'}
                        onChange={() => toggleResolved(issue._id, issue.status)}
                        className="status-checkbox"
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-label">
                        {issue.status === 'Resolved' ? 'Resolved' : 'Mark as Resolved'}
                      </span>
                    </label>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-issues">
                  <div className="no-issues-message">
                    <p>📭 No issues found matching your criteria.</p>
                    <p>Try adjusting the filters above.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer className="admin-footer">
        <p>🏛️ CivicSense Admin Panel - Serving the Community</p>
      </footer>

      {/* 🤖 AI Chatbot Assistant */}
      <AIChatbot user={user} />
    </div>
  );
};

export default AdminDashboard;

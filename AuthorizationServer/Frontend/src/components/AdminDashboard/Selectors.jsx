import React from "react";
import PropTypes from "prop-types";

const VendorSelector = ({ vendors, selectedVendor, onChange, isLoading }) => {
  return (
    <div className="selector-container">
      <label className="selector-label">Select Vendor</label>
      <div className="select-wrapper">
        {isLoading ? (
          <div className="selector-loading">Loading vendors...</div>
        ) : (
          <select
            value={selectedVendor}
            onChange={(e) => onChange(e.target.value)}
            className="styled-select"
            disabled={isLoading}
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor.clientId} value={vendor.clientId}>
                {vendor.orgName} ({vendor.clientId})
              </option>
            ))}
          </select>
        )}
        <div className="select-arrow"></div>
      </div>
    </div>
  );
};

VendorSelector.propTypes = {
  vendors: PropTypes.array.isRequired,
  selectedVendor: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

const UserSelector = ({ users, selectedUser, onChange, isLoading }) => {
  return (
    <div className="selector-container">
      <label className="selector-label">Filter by User</label>
      <div className="select-wrapper">
        {isLoading ? (
          <div className="selector-loading">Loading users...</div>
        ) : (
          <select
            value={selectedUser}
            onChange={(e) => onChange(e.target.value)}
            className="styled-select"
            disabled={isLoading}
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.fullName} ({user.userId})
              </option>
            ))}
          </select>
        )}
        <div className="select-arrow"></div>
      </div>
    </div>
  );
};

UserSelector.propTypes = {
  users: PropTypes.array.isRequired,
  selectedUser: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export { VendorSelector, UserSelector };
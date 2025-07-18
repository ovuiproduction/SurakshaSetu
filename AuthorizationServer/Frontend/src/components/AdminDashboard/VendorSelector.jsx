import React from "react";

const VendorSelector = ({ vendors, selectedVendor, onChange }) => {
  return (
    <div>
      <label>Select Vendor:</label>
      <select value={selectedVendor} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- Select --</option>
        {vendors.map((vendor) => (
          <option key={vendor.clientId} value={vendor.clientId}>
            {vendor.orgName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VendorSelector;

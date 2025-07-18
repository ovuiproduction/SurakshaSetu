import axios from "axios";

const BASE_URL = "http://localhost:5001"; // Change this to your backend

export const fetchAllVendors = async () => {
  const response = await axios.get(`${BASE_URL}/api/admin/fetch-vendors`);
  return response.data;
};

export const fetchLogsByVendor = async (vendorId) => {
  const response = await axios.post(`${BASE_URL}/api/admin/fetch-logs`,
    {vendorId},
    {
        headers:{
            "Content-Type":"application/json",
        }
    }
  );
  return response.data;
};

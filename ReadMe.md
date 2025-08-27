# Bank Suraksha – Secure Data Exchange System

## 📌 What is it?

**Bank Suraksha** is a secure data exchange system designed to manage and protect the flow of information between banks and third-party vendors.  
The system ensures **granular user consent**, protects **user privacy**, and ensures compliance with **DPDP (Digital Personal Data Protection Act)** and **GDPR (General Data Protection Regulation)** by preventing unauthorized access and misuse of sensitive data.

---

## 🎯 Why Bank Suraksha?

1. Prevent misuse of user data.  
2. Involve users in every step of the data exchange process.  
3. Ensure compliance with **DPDP** and **GDPR**.  
4. Prevent unauthorized access and exploitation of sensitive information.  

---

## 👥 Beneficiaries

### 🧑 Users
- Gain control over their personal data.  
- Ensure privacy and transparency in data usage.  

### 🏦 Banks
- Avoid fines and penalties due to DPDP/GDPR violations.  
- Build stronger trust with customers.  
- Reduce workload on central banking systems.  

### 📊 Vendors
- Receive only the **required data fields**, avoiding unnecessary filtering.  
- Faster, secure, and consent-based access to user data.  

---

## 🏗️ System Architecture

### Existing System
- Banks communicate directly with vendors, often lacking consent validation and security layers.  

### Proposed System
Introduces **two additional secure layers** between the Bank and Vendors:  

1. **Authorization Server**
   - Vendor registration.  
   - Authentication and authorization of vendors.  
   - Token generation for secure data access.  

2. **API Gateway Server**
   - Token validation.  
   - Data fetching from banks.  
   - Secure data delivery to vendors.  

---

## 🔄 System Flow

1. **Vendor Registration**  
   - Vendor registers through the **Authorization Server**.  
   - Receives a **Client ID** and **Client Secret** for authentication.  
   - Specifies required data fields during registration.  

2. **Consent Request**  
   - Vendor requests user consent for specific data fields.  
   - Authorization Server:  
     - Authenticates vendor using ID & Secret.  
     - Validates requested data fields.  
     - Verifies user identity.  
   - Consent request is then sent to the user.  

3. **User Action**  
   - If **approved**, the Authorization Server issues a **short-lived JWT token** to the vendor.  
   - If **rejected**, the vendor is notified of consent denial.  

4. **Data Access via API Gateway**  
   - Vendor sends request to **API Gateway** with the JWT token.  
   - API Gateway:  
     - Validates consent.  
     - Decodes and verifies the JWT token.  
     - Requests user data from the Bank Server.  
     - **Data Minimization Engine** filters only required fields.  
     - **Data Masking** is applied to sensitive fields.  
     - **Watermarking** is added for traceability.  
   - Final **processed data** is securely sent to the vendor.  

---

## ⚙️ Core Features

- ✅ Consent Management  
- ✅ Token Generation  
- ✅ Data Minimization & Masking  
- ✅ Watermarking  
- ✅ Logs & Audit Trail  
- ✅ LLM-based Auditing  

---

## 💻 Technology Stack

- **Frontend:** React, HTML, CSS, JavaScript  
- **Backend:** Node.js & Flask  
- **Database:** MongoDB  
- **Security:** JWT Authentication, Digital Signatures  
- **AI Integration:** Google Gemini 1.5 Flash Model for auditing and analysis  

---

## 🚀 Future Scope

1. Integration with **SIEM (Security Information and Event Management)** tools.  
2. **Machine Learning-based anomaly detection** for real-time log monitoring.  
3. Expansion to cross-border data sharing compliance frameworks.  
4. Integration with blockchain for **tamper-proof audit logs**.  

---

## 📜 License

This project is licensed under the [**MIT License**]() – feel free to use and modify with attribution.  

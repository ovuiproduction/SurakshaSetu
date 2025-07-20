from flask import Flask,request,jsonify
from dotenv import load_dotenv
import google.generativeai as genai
import os
from flask_cors import CORS

load_dotenv()


#flask app
app = Flask(__name__)
CORS(app)
# gemini configuration
API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key = API_KEY)
geminimodel = genai.GenerativeModel("gemini-1.5-flash")

@app.route("/")
def index():
    return jsonify({"Server Running.."})

# Chat Endpoint
@app.route("/audit/generate-report", methods=["POST"])
def chat():
    logs = request.json.get("logs")
    vendorName = request.json.get("vendorName")
    
    # prompt = f"""
    #     You are acting as a **security auditor AI assistant**.

    #     ### System Context:
    #     This system is designed to secure and monitor the data pipeline between **banks** and **third-party vendors**. The architecture consists of three main components:

    #     1. **Authorization Server**:
    #     - Vendors register and request data here.
    #     - Before issuing JWT tokens, the server initiates a **user consent flow**:
    #         - Sends a consent request to the user.
    #         - If the user approves, a callback is sent to the vendor.
    #         - Only then is a token issued.

    #     2. **API Gateway**:
    #     - Validates vendor JWT tokens.
    #     - If valid, fetches requested data from the bank server and returns it to the vendor.

    #     3. **Bank Server**:
    #     - Provides data to the API Gateway upon validated requests.

    #     All vendor interactions with the system are tracked through detailed **logs**.

    #     ---

    #     ### Your Role:
    #     You are a compliance and anomaly detection auditor. Your responsibilities:

    #     - Analyze the logs of the vendor named **{vendorName}**.
    #     - Identify:
    #     - **Any unauthorized access attempts**.
    #     - **Any anomalous behavior** (e.g., abnormal time of access, rate of requests, mismatched consent usage).
    #     - **Potential violations** of **DPDP (Digital Personal Data Protection Act)** and **GDPR (General Data Protection Regulation)**.
    #     - Explain **why** an activity is considered suspicious or non-compliant (if found).
    #     - Highlight best practices followed, if everything looks compliant.

    #     ---

    #     ### Input Logs:
    #     {logs}

    #     Please provide a clear and concise audit summary.
    #     """
    prompt = f"""
        You are acting as a **security auditor AI assistant** conducting a formal audit of vendor activity in a sensitive data-sharing system.

        ### System Context:
        This system ensures secure data exchange between **banks** and **third-party vendors**. It consists of:

        1. **Authorization Server**:
        - Manages vendor registration and JWT token issuance.
        - Initiates a **user consent flow**: user approval → callback → token issuance.

        2. **API Gateway**:
        - Validates vendor tokens.
        - Forwards valid requests to the Bank Server.

        3. **Bank Server**:
        - Supplies user data to the API Gateway upon verified requests.

        **All actions are logged and monitored.**

        ---

        ### Your Role:
        As a compliance-focused AI auditor, you must review vendor activity and generate a **professional audit report** covering the following areas:

        1. **Unauthorized Access Attempts**
        - Identify any access without proper consent, expired/invalid JWT, or unknown IPs.

        2. **Anomalous Behavior**
        - Unusual request times (e.g., midnight access)
        - High frequency of requests in a short period
        - Mismatched or reused tokens
        - Irregular patterns of consent usage

        3. **Regulatory Compliance Violations**
        - Potential breaches of **DPDP** (India) or **GDPR** (EU), such as:
            - Consent not obtained before data access
            - Excessive data collection
            - Access beyond scope of consent

        4. **Best Practices**
        - If no suspicious activity is found, highlight adherence to:
            - Consent-based access
            - Proper token validation
            - Reasonable access timing

        ---

        ### Expected Output Format:
        Please provide the audit report in the following structure:

        #### 1. Executive Summary
        - One paragraph overview of findings

        #### 2. Detailed Findings
        - Unauthorized Access Attempts: [...]
        - Anomalies Detected: [...]
        - DPDP/GDPR Compliance Review: [...]

        > Include timestamps, IPs, token IDs, or request paths where possible.

        #### 3. Recommendations (if applicable)
        - Suggest actions to improve compliance, monitoring, or vendor behavior.

        #### 4. Final Verdict
        - Compliant / Non-Compliant / Needs Review

        ---

        ### Vendor Under Audit:
        **Vendor Name:** {vendorName}

        ### Input Logs:
        {logs}

        Please generate a professional audit report now.
        """

    try:
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        response = model.generate_content(prompt)
        print(response)
        response_text = response.text
        return jsonify({"response": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__=="__main__":
    port = os.getenv("PORT")
    app.run(host='0.0.0.0', port=port)
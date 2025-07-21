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
def auditreport():
    logs = request.json.get("logs")
    vendorName = request.json.get("vendorName")
    print("audit report")
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
        response_text = response.text
        return jsonify({"response": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/audit/generate-dpdp-report", methods=["POST"])
def dpdpreport():
    logs = request.json.get("logs")
    vendorName = request.json.get("vendorName")
    print("dpdp report")
    prompt = f"""
                You are a **Security Auditor AI** reviewing vendor activity in a regulated data-sharing system.

                ### System Overview:
                - **Authorization Server**: Issues JWT tokens after user consent.
                - **API Gateway**: Validates tokens, forwards valid requests.
                - **Bank Server**: Shares user data only on verified consent.

                All actions are logged.

                ---

                ### Audit Goals:
                Produce a professional report evaluating:

                1. **Unauthorized Access**
                - Invalid/expired JWT
                - Unknown IPs
                - No or invalid user consent

                2. **Anomalous Behavior**
                - Odd access times (e.g., midnight)
                - High request bursts
                - Reused or mismatched tokens

                3. **DPDP/GDPR Violations**
                If a violation is found, **clearly state the exact rule or article broken**, such as:
                - **DPDP Sec.6** - No explicit user consent
                - **DPDP Sec.7** - Data used beyond consent scope
                - **DPDP Sec.9** - Data retention misuse
                - **GDPR Art.6** - No legal basis for processing
                - **GDPR Art.5(1)(c)** - Excessive data collected
                - **GDPR Art.33** - Breach not reported

                4. **Best Practices (If No Issues)**
                - Consent-based access, valid tokens, appropriate usage

                ---

                ### Report Format:

                #### 2. Findings
                - Unauthorized Access Attempts: [...]
                - Anomalies Detected: [...]
                - Regulatory Violations: [...]
                > Include exact **rule/article broken**, with timestamps, IPs, token IDs, consent references

                #### 4. Final Verdict
                - One of: **Compliant / Non-Compliant / Needs Review**

                ---

                ### Vendor Audited:
                **Vendor Name:** {vendorName}

                ### Input Logs:
                {logs}

                Generate the audit report now.
                """
    try:
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        response = model.generate_content(prompt)
        response_text = response.text
        return jsonify({"response": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__=="__main__":
    port = os.getenv("PORT")
    app.run(host='0.0.0.0', port=port)
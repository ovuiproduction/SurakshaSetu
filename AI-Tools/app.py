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
    
    # prompt = """
    # Background : This is the systems motive is to secure the data pipeline between bank and third party vendors. This system divide into 3 main parts
    # 1. Authorization server (vendor register here and from here they can request the data of users. this server authenticate and authorize the vendor and provide the jwt token to them for request data from api gateway but before token issuse it sent the consent request to users when user approve that request then it sent callback to vendor then vendor request the token and then token is issued.)
    # 2. API Gateway server (API gateway verify the token and fetch data from bank sever and sent to vendor )
    # 3. Bank server (As data request comes from apigateway sent data to apigateway)
    
    # here system keep track of every action of vendor in the forms of logs
    
    # Role : you are the auditer and you task is to check all the logs of specific vendor and check is their unathorized access or anamolus behavior,is it follow the *DPDP* and *GDPR* guidelines or not
    
    # Logs of vendor {vendorName} : {logs}
    # """
    
    prompt = f"""
        You are acting as a **security auditor AI assistant**.

        ### System Context:
        This system is designed to secure and monitor the data pipeline between **banks** and **third-party vendors**. The architecture consists of three main components:

        1. **Authorization Server**:
        - Vendors register and request data here.
        - Before issuing JWT tokens, the server initiates a **user consent flow**:
            - Sends a consent request to the user.
            - If the user approves, a callback is sent to the vendor.
            - Only then is a token issued.

        2. **API Gateway**:
        - Validates vendor JWT tokens.
        - If valid, fetches requested data from the bank server and returns it to the vendor.

        3. **Bank Server**:
        - Provides data to the API Gateway upon validated requests.

        All vendor interactions with the system are tracked through detailed **logs**.

        ---

        ### Your Role:
        You are a compliance and anomaly detection auditor. Your responsibilities:

        - Analyze the logs of the vendor named **{vendorName}**.
        - Identify:
        - **Any unauthorized access attempts**.
        - **Any anomalous behavior** (e.g., abnormal time of access, rate of requests, mismatched consent usage).
        - **Potential violations** of **DPDP (Digital Personal Data Protection Act)** and **GDPR (General Data Protection Regulation)**.
        - Explain **why** an activity is considered suspicious or non-compliant (if found).
        - Highlight best practices followed, if everything looks compliant.

        ---

        ### Input Logs:
        {logs}

        Please provide a clear and concise audit summary.
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
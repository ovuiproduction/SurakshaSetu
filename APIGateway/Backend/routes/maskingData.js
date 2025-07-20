const maskField = (key, value) => {
  switch (key) {
    case "kyc:name":
      return value.replace(/(\w{1})\w+/g, "$1***");
    case "kyc:pan":
      return value.replace(/^(.{5})(.{4})(.)$/, "$1****$3");
    case "kyc:aadhaar":
      return value.replace(/^(.{4})(.{4})(.{4})$/, "XXXX-XXXX-$3");
    case "kyc:address":
      return "REDACTED";
    case "kyc:dob":
      return value; // allow as is
    case "kyc:gender":
      return value; // allow as is
    case "contact:email":
      return value.replace(/(.{1}).*?(@.*)/, "$1***$2");
    case "contact:phone":
      return value.replace(/^(.{2}).*(.{2})$/, "$1****$2");
    case "account:accountNumber":
      return value.replace(/^.*(\d{4})$/, "XXXXXX$1");
    case "account:bankBalance":
      return "₹" + (Math.floor(value / 1000) * 1000).toLocaleString() + "+";
    case "account:salary":
      return `₹${Math.floor(value / 10000) * 10}K–₹${
        Math.ceil(value / 10000) * 10
      }K`;
    case "transactions:transactions":
      return value.map((txn) => ({
        date: txn.date,
        amount: "₹" + txn.amount,
        type: txn.type,
        description: "REDACTED",
      }));
    default:
      return "REDACTED";
  }
};

function maskData(scope, response) {
  const userId = response.userId;
  const responseData = response.data;
  console.log("MaskData");
  const maskedData = {};
  for (const key of scope) {
    const field = key.split(":")[1];
    if (responseData[field] !== undefined) {
      maskedData[field] = maskField(key, responseData[field]);
    }
  }
  console.log("MaskData Done");
  const data = { userId: userId, data: maskedData };
  return data;
}

module.exports = maskData;

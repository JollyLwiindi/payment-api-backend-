// Validate payment input
export const validatePayment = (req, res, next) => {
  const { amount, type, provider, phoneNumber } = req.body;
  
  // Check amount
  if (!amount || amount < 1 || amount > 10000) {
    return res.status(400).json({
      success: false,
      message: "Amount must be between K1 and K10,000"
    });
  }
  
  // Check phone number based on provider
  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required"
    });
  }
  
  // Remove any spaces or special characters for validation
  const cleanPhone = phoneNumber.replace(/\s/g, '');
  
  let isValidPhone = false;
  let expectedFormat = "";
  
  switch (provider) {
    case "MTN":
      // MTN: +26096xxxxxxx or +26076xxxxxxx
      if (/^\+260(96|76)[0-9]{7}$/.test(cleanPhone)) {
        isValidPhone = true;
      }
      expectedFormat = "+26096xxxxxxx or +26076xxxxxxx";
      break;
      
    case "Airtel":
      // Airtel: +26097xxxxxxx, +26077xxxxxxx, +26057xxxxxxx
      if (/^\+260(97|77|57)[0-9]{7}$/.test(cleanPhone)) {
        isValidPhone = true;
      }
      expectedFormat = "+26097xxxxxxx, +26077xxxxxxx, or +26057xxxxxxx";
      break;
      
    case "Zamtel":
      // Zamtel: +26095xxxxxxx
      if (/^\+26095[0-9]{7}$/.test(cleanPhone)) {
        isValidPhone = true;
      }
      expectedFormat = "+26095xxxxxxx";
      break;
      
    default:
      return res.status(400).json({
        success: false,
        message: "Invalid provider. Use: MTN, Airtel, or Zamtel"
      });
  }
  
  if (!isValidPhone) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${provider} phone number. Expected format: ${expectedFormat}`
    });
  }
  
  next();
};

// Validate registration input
export const validateRegistration = (req, res, next) => {
  const { name, email, phone, password } = req.body;
  
  // Check name
  if (!name || name.length < 2) {
    return res.status(400).json({
      success: false,
      message: "Name must be at least 2 characters"
    });
  }
  
  // Check email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format"
    });
  }
  
  // Check phone (Zambian format for any provider during registration)
  const phoneRegex = /^\+260(95|96|97|76|77|57)[0-9]{7}$/;
  if (!phone || !phoneRegex.test(phone.replace(/\s/g, ''))) {
    return res.status(400).json({
      success: false,
      message: "Invalid Zambian phone number. Format: +260XXXXXXXXX (e.g., +260961234567)"
    });
  }
  
  // Check password
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters"
    });
  }
  
  next();
};
const BASE_URL = "http://localhost:5000/api";

async function verifyFlow() {
  try {
    console.log("--- Starting Verification Flow ---");

    // 1. Register a User (if not exists)
    // We'll use a random email to ensure uniqueness for this run
    const timestamp = Date.now();
    const userPayload = {
      name: `Test User ${timestamp}`,
      email: `test_user_${timestamp}@example.com`,
      password: "password123",
      phoneNumber: `+1${timestamp.toString().slice(-10)}`, // Mock phone
    };

    console.log("1. Registering User...");
    let res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload),
    });

    let data = await res.json();
    if (!data.success) {
      throw new Error(`User Registration Failed: ${data.message}`);
    }
    const token = data.data.accessToken;
    console.log("   User Registered! Token acquired.");

    // 2. Register a Church
    const churchPayload = {
      church: {
        name: `Grace Chapel ${timestamp}`,
        website: "https://gracechapel.org",
        foundedYear: 2012,
        logoUrl: "http://example.com/logo.png",
      },
      contact: {
        email: "info@gracechapel.org",
        phone: "+2348012345678",
      },
      address: {
        country: "Nigeria",
        state: "Lagos",
        city: "Lagos",
        street: "12 Allen Avenue",
        postalCode: "100001",
      },
      settings: {
        timezone: "Africa/Lagos",
        currency: "NGN",
        language: "en",
      },
    };

    console.log("2. Registering Church...");
    res = await fetch(`${BASE_URL}/church/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(churchPayload),
    });

    data = await res.json();
    if (!data.success) {
      throw new Error(`Church Registration Failed: ${data.message}`);
    }
    const churchId = data.data._id;
    console.log(`   Church Registered! ID: ${churchId}`);

    // 3. Verify User Link
    console.log("3. Verifying User Link...");
    res = await fetch(`${BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    data = await res.json();
    // Note: The User model might need Populate to show the church object, or it just shows ID.
    // Current 'getMe' controller returns specific fields. We might need to check if 'getMe' returns the church.
    // Looking at authController.js getMe, it returns id, name, email, role. It does NOT return church yet.
    // But we can check via /api/church/registration/status

    console.log("4. Checking Registration Status...");
    res = await fetch(`${BASE_URL}/church/registration/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    data = await res.json();
    if (data.status === "COMPLETED" && data.churchId === churchId) {
      console.log(
        "   SUCCESS: Registration Status is COMPLETED and Church ID matches.",
      );
    } else {
      console.error("   FAILURE: Registration Status mismatch.", data);
    }

    console.log("--- Verification Complete ---");
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

verifyFlow();

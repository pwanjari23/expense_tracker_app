require("dotenv").config();

const token = localStorage.getItem("token");
if (token) {
  console.log("User already logged in, redirecting to dashboard");
  window.location.href = "/dashboard.html";
}

const form = document.getElementById("login-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = form.querySelector("input[type='email']").value.trim();
  const password = form.querySelector("input[type='password']").value.trim();

  if (!email || !password) {
    alert("Please fill in both fields");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address");
    return;
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters long");
    return;
  }

  try {
    const response = await fetch(`${process.env.APPLICATION_BACKEND_BASE_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userDetails", JSON.stringify(data.user));
      alert("Login successful! Welcome, " + data.user.name);
      form.reset();
      window.location.href = "/dashboard.html";
    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Please try again later.");
  }
});

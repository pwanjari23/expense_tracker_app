const form = document.getElementById("reset-password-form");

// Get the UUID from URL
const resetId = window.location.pathname.split("/").pop();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const passwordInput = form.querySelector("input");
  const password = passwordInput.value.trim();

  if (!password) {
    alert("Please enter a new password");
    return;
  }

  try {
    const response = await axios.post(
      `http://localhost:5000/api/password/resetpassword/${resetId}`,
      { password }
    );

    alert(response.data.message || "Password reset successfully!");
    passwordInput.value = "";
    window.location.href = "/login/index.html"; // redirect to login page
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Error resetting password");
  }
});

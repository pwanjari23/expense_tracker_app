const form = document.getElementById("forgot-password-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = form.querySelector("input[type='email']").value.trim();
  console.log("Form submitted with email:", email);

  try {
    const response = await axios.post(
      "http://localhost:5000/api/password/forgotpassword",
      { email },
    );
    console.log("Server response:", response.data);
    alert(response.data.message);
  } catch (error) {
    console.error("Error calling API:", error);
    alert(error.response?.data?.message || "Something went wrong");
  }
});

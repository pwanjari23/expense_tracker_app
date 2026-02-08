const Sib = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const ForgotPasswordRequest = require("../models/forgotPasswordRequest");

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // 1. Find user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Create a forgot password request
    const resetId = uuidv4();
    await ForgotPasswordRequest.create({
      id: resetId,
      userId: user.id,
      isActive: true,
    });

    // 3. Send reset email
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

    const tranEmailApi = new Sib.TransactionalEmailsApi();

    const resetLink = `http://localhost:5000/password/resetpassword/${resetId}`;

    const sendSmtpEmail = {
      to: [{ email: process.env.EMAIL_RECEIVER }],
      sender: { email: process.env.EMAIL_SENDER, name: "Expense Tracker" },
      subject: "Password Reset Request",
      htmlContent: `<h3>Password Reset</h3>
        <p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    };

    await tranEmailApi.sendTransacEmail(sendSmtpEmail);

    res.status(200).json({ message: "Password reset link sent successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error sending email", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    // 1. Check if request exists and is active
    const resetRequest = await ForgotPasswordRequest.findOne({
      where: { id, isActive: true },
    });
    if (!resetRequest)
      return res.status(400).json({ message: "Invalid or expired link" });

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Update user's password
    await User.update(
      { password: hashedPassword },
      { where: { id: resetRequest.userId } },
    );

    // 4. Mark request as used
    await ForgotPasswordRequest.update({ isActive: false }, { where: { id } });

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};

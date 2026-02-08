require("dotenv").config();
const app = require("./app");
const cors = require("cors");
app.use(cors("*"));
const sequelize = require("./config/sequelize");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log("✅ Database synced");
  } catch (err) {
    console.error("❌ DB sync failed:", err);
  }
}

// // Call the function
syncDatabase();

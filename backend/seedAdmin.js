require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "ojhaaditya913@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Kaditya@67";
    const adminName = process.env.ADMIN_NAME || "Aditya Ojha";

    let admin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!admin) {
      await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: "admin",
      });
      console.log(`✅ Default admin account ready: ${adminEmail}`);
    } else {
      console.log(`ℹ️ Default admin account already exists: ${adminEmail}`);
    }
  } catch (error) {
    console.error("Seed admin error:", error.message);
  }
};

module.exports = seedAdmin;

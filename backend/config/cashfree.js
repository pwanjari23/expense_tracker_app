const { Cashfree } = require("cashfree-pg");
require("dotenv").config();

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = process.env.CASHFREE_ENV;

module.exports = Cashfree;

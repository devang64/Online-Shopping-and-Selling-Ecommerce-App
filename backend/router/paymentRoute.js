
const express = require("express");
const {
    processPayment,
    sendStripeApiKey,
} = require("../controller/paymentControllers");
const router = express.Router();
const { verifyUserAuthenticate } = require("../middleware/auth");

router.route("/payment/process").post(verifyUserAuthenticate, processPayment);

router.route("/stripeapikey").get(verifyUserAuthenticate, sendStripeApiKey);

module.exports = router;
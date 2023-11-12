const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();
exports.processPayment = async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      metadata: {
        company: "Ecommerce",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
  
    res
      .status(200)
      .send({client_secret: myPayment.client_secret});
  };
  
  exports.sendStripeApiKey = async (req, res, next) => {
    res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
  };

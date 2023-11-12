const express = require("express");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controller/orderController");
const router = express.Router();

const { verifyUserAuthenticate, authorizeRoles } = require("../middleware/auth");

router.route("/order/new").post(verifyUserAuthenticate, newOrder);

router.route("/order/:id").get(verifyUserAuthenticate, getSingleOrder);

router.route("/orders/me").get(verifyUserAuthenticate, myOrders);

router
  .route("/admin/orders")
  .get(verifyUserAuthenticate, authorizeRoles("admin"), getAllOrders);

router
  .route("/admin/order/:id")
  .put(verifyUserAuthenticate, authorizeRoles("admin"), updateOrder)
  .delete(verifyUserAuthenticate, authorizeRoles("admin"), deleteOrder);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getAllProduct, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview, getAdminProducts } = require('../controller/productController');
const auth = require('../Middleware/auth');
router
    .route('/products')
    // .get(auth.verifyUserAuthenticate, getAllProduct);
    .get(getAllProduct);

router
    .route("/admin/products")
    .get(auth.verifyUserAuthenticate,  auth.authorizeRoles("admin"), getAdminProducts);
router
    .route('/admin/product/new')
    .post(auth.verifyUserAuthenticate, auth.authorizeRoles('admin'), createProduct);

router
    .route('/admin/product/:id')
    .put(auth.verifyUserAuthenticate, auth.authorizeRoles('admin'), updateProduct)
    .delete(auth.verifyUserAuthenticate, auth.authorizeRoles('admin'), deleteProduct)

router.route('/product/:id').get(getProductDetails)
router.route('/review').post(auth.verifyUserAuthenticate, createProductReview)
router
    .route('/reviews')
    .get(getProductReviews)
    .delete(auth.verifyUserAuthenticate, deleteReview)



module.exports = router;


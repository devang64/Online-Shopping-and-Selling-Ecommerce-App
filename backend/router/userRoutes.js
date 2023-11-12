 const express = require('express');
const { registerUser, loginUser, logoutUser, resetPasswordToken, resetPassword, getUserDetails, updatePassword, updateProfile ,updateUserRole, getAllUser , getSingleUser , deleteUser} = require('../controller/userController');
const verifyToken = require('../Middleware/auth');
const router = express.Router();
const { verifyUserAuthenticate , authorizeRoles} = require('../Middleware/auth')



router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/logout').post(logoutUser);

router.route('/password/forgot').post(resetPasswordToken);

router.route('/password/reset/:token').post(resetPassword);

router.route('/password/update').put(verifyUserAuthenticate, updatePassword);

router.route('/profile').get(verifyUserAuthenticate, getUserDetails);

router.route('/profile/update').post(verifyUserAuthenticate, updateProfile);

router.route('/admin/users').get(verifyUserAuthenticate, authorizeRoles('admin'), getAllUser)

router
    .route('/admin/users/:id')
    .get(verifyUserAuthenticate, authorizeRoles('admin'), getSingleUser)
    .put(verifyUserAuthenticate, authorizeRoles('admin'),updateUserRole)
    .delete(verifyUserAuthenticate, authorizeRoles('admin'),deleteUser)



module.exports = router;

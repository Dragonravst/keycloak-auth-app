const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const authMiddleware=require('../../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/verify', authController.verify);
router.post('/refresh', authController.refresh);
router.post('/signup', authController.signup);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset', authMiddleware.authenticate, authController.reset);
router.get('/users/:realm', authMiddleware.authenticate, authController.getUsers); 
router.get('/user/:realm', authMiddleware.authenticate, authController.getUser);

module.exports = router;
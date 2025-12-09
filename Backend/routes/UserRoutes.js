const express = require('express');
const router = express.Router();
const { userVerification } = require('../middlewares/AuthMiddleware'); 
const { requireAdmin } = require('../middlewares/RequireMiddleware');
const { 
    createUser, getUserById, getAllUsers, getUserByRole, updateUser, 
    getCurrentUser, deactivateUser, reactivateUser, updateAccountSettings
} = require('../controllers/UserController');

router.get('/me', userVerification, getCurrentUser);
router.put('/deactivate/:userId', userVerification, requireAdmin, deactivateUser);
router.put('/reactivate/:userId', userVerification, requireAdmin, reactivateUser);
router.put('/update-account/:userId', userVerification,  updateAccountSettings);
router.post('/', userVerification, requireAdmin, createUser);
router.get('/', userVerification, getAllUsers);
router.get('/:role', userVerification, getUserByRole);     
router.get('/:userId', userVerification, getUserById);      
router.put('/:userId', userVerification, updateUser);

module.exports = router;

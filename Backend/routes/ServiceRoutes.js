const express = require('express');
const router = express.Router();
const { 
    createServiceType, 
    getAllServiceTypes, 
    getServiceTypeById, 
    updateServiceType, 
    updateServiceStatus, 
    deleteServiceType 
} = require('../controllers/ServiceType');
const { userVerification } = require('../middlewares/AuthMiddleware');
const { requireAdmin } = require('../middlewares/RequireMiddleware');
const upload = require('../middlewares/upload')

router.post('/', userVerification, requireAdmin, upload.array("images", 5), createServiceType);
router.get('/', getAllServiceTypes);
router.get('/:id', userVerification, getServiceTypeById);
router.put('/status/:id', userVerification, requireAdmin, updateServiceStatus);
router.put('/:id', userVerification, requireAdmin, upload.array("images", 5), updateServiceType);
router.delete('/:id', userVerification, requireAdmin, deleteServiceType);

module.exports = router;

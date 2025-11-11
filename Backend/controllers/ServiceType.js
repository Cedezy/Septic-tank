const ServiceType = require('../models/ServiceType');
const fs = require("fs");
const path = require("path");

exports.createServiceType = async (req, res) => {
  try {
    const { name, description, hasTankSize, fixedPrice, fixedDuration, status, showOnHome  } = req.body;

    const hasTankSizeBool = hasTankSize === 'true' || hasTankSize === true;
    let tankOptions = {};
    if (hasTankSizeBool) {
      tankOptions = req.body.tankOptions ? JSON.parse(req.body.tankOptions) : {};
    }

    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const service = new ServiceType({
      name,
      description,
      hasTankSize: hasTankSizeBool,
      tankOptions,
      fixedPrice: hasTankSizeBool ? null : fixedPrice,
      fixedDuration: hasTankSizeBool ? null : fixedDuration,
      status,
      images: imagePaths,
      showOnHome: showOnHome === 'true' || showOnHome === true,
    });

    await service.save();
    res.status(201).json({ message: "Service created successfully", service });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




exports.getAllServiceTypes = async (req, res) => {
    try{
        const services = await ServiceType.find();
        res.json({ success: true, services });
    } 
    catch(err){
        res.status(500).json({ success: false, message: 'Failed to fetch service types.', error: err.message });
    }
};

exports.getServiceTypeById = async (req, res) => {
    try{
        const service = await ServiceType.findById(req.params.id);
        if(!service){
            return res.status(404).json({ success: false, message: 'Service type not found.' });
        }
        res.json({ success: true, service });
    } 
    catch(err){
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.updateServiceType = async (req, res) => {
  try {
    const { name, description, hasTankSize, tankOptions, fixedPrice, fixedDuration, status, removedImages, showOnHome } = req.body;
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const service = await ServiceType.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Handle images
    let updatedImages = [...service.images];
    if (removedImages) {
      const removed = JSON.parse(removedImages);
      updatedImages = updatedImages.filter(img => !removed.includes(img));
      removed.forEach(imgPath => {
        const fullPath = path.join(__dirname, `../${imgPath}`);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    }
    if (imagePaths.length > 0) {
      updatedImages = [...updatedImages, ...imagePaths];
    }

    // Update fields
    const hasTankSizeBool = hasTankSize === 'true' || hasTankSize === true;

    service.name = name || service.name;
    service.description = description || service.description;
    service.hasTankSize = hasTankSizeBool;
    service.tankOptions = hasTankSizeBool ? (tankOptions ? JSON.parse(tankOptions) : {}) : {};
    service.fixedPrice = hasTankSizeBool ? null : fixedPrice;
    service.fixedDuration = hasTankSizeBool ? null : fixedDuration;
    service.status = status || service.status;
    service.images = updatedImages;
    service.showOnHome = showOnHome === 'true' || showOnHome === true ? true : false;

    const updated = await service.save();
    res.json({ message: "Service updated successfully", service: updated });
  } catch (err) {
    console.log('req.body:', req.body);
console.log('req.files:', req.files);

    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.updateServiceStatus = async (req, res) => { 
    try{ const { status } = req.body; 
    
    const updatedService = await ServiceType.findByIdAndUpdate( 
        req.params.id, { status }, { new: true } ); 
        if(!updatedService){ 
            return res.status(404).json({ message: 'Service not found' }); 
        } 
        res.status(200).json({ message: 'Status updated successfully', service: updatedService }); 
    } 
    catch(error){ 
        res.status(500).json({ message: 'Failed to update status' }); } };

exports.deleteServiceType = async (req, res) => {
    try{
        const deleted = await ServiceType.findByIdAndDelete(req.params.id);

        if(!deleted){
            return res.status(404).json({ success: false, message: 'Service type not found.' });
        }
        res.json({ success: true, message: 'Service deleted successfully.' });
    } 
    catch(err){
        res.status(500).json({ success: false, error: err.message });
    }
};

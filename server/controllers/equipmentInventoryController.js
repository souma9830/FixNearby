import EquipmentInventory from '../models/EquipmentInventory.js';

export const addInventoryItem = async (req, res) => {
  try {
    const { itemName, category, stockQuantity, unitPrice, reorderThreshold, sku } = req.body;
    const workerId = req.user._id;

    const item = await EquipmentInventory.create({
      workerId,
      itemName,
      category,
      stockQuantity,
      unitPrice,
      reorderThreshold,
      sku
    });

    return res.status(201).json({ success: true, message: 'Equipment inventory item added', data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorkerInventory = async (req, res) => {
  try {
    const items = await EquipmentInventory.find({ workerId: req.user._id }).sort({ itemName: 1 });
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

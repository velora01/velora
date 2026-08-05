import Production from "../models/Production.js";
import { logActivity } from "../services/auditService.js";
import { emitNotification } from "../services/socketService.js";

export const getProductionItems = async (req, res) => {
  try {
    const items = await Production.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProductionOrder = async (req, res) => {
  try {
    const code = "FAC-" + Math.floor(1000 + Math.random() * 9000);
    const prod = await Production.create({ ...req.body, productionCode: code });
    await logActivity({ userName: req.user?.name || "Factory Manager", action: "Created", module: "Production", description: `Queued manufacturing order ${code}` });
    res.status(201).json({ success: true, data: prod });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateProductionStatus = async (req, res) => {
  try {
    const prod = await Production.findById(req.params.id);
    if (!prod) return res.status(404).json({ success: false, message: "Production order not found" });

    prod.status = req.body.status;
    prod.stagesLog.push({
      stageName: req.body.status,
      updatedBy: req.user?.name || "Factory Manager"
    });
    await prod.save();

    await logActivity({ userName: req.user?.name || "Factory Manager", action: "Updated", module: "Production", description: `Updated production status for ${prod.projectName} to ${prod.status}` });
    emitNotification("factory-update", { message: `Production stage updated to ${prod.status} for ${prod.projectName}`, prod });

    res.json({ success: true, data: prod });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

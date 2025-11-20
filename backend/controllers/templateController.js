const Template = require("../models/Template");

// ➕ Create Template
exports.createTemplate = async (req, res) => {
  try {
    const template = await Template.create(req.body);
    res.status(201).json(template);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📋 Get All Templates (grouped by type)
exports.getTemplates = async (req, res) => {
  try {
    const { agentCode } = req.query;
    const templates = await Template.find({ agentCode });

    // Group by type
    const grouped = {
      Daily: templates.filter(t => t.templateType === "Daily"),
      Weekly: templates.filter(t => t.templateType === "Weekly"),
      Monthly: templates.filter(t => t.templateType === "Monthly"),
      AddOn: templates.filter(t => t.templateType === "AddOn"),
    };

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🛒 Get Templates by Type
exports.getByType = async (req, res) => {
  try {
    const { agentCode, type } = req.query;
    const templates = await Template.find({ agentCode, templateType: type });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

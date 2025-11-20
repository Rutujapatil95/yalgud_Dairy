const Agent = require("../models/Agent");

// GET Agent by AgentCode
exports.getAgentByCode = async (req, res) => {
  try {
    const { agentCode } = req.params;

    const agent = await Agent.findOne({ AgentCode: agentCode });

    if (!agent) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }

    return res.json({
      success: true,
      message: "Agent found",
      data: agent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

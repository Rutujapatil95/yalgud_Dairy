const express = require("express");
const router = express.Router();
const Agent = require("../models/Agent"); 

router.get("/:agentCode", async (req, res) => {
  try {
    const agentCode = Number(req.params.agentCode); 

    const agent = await Agent.findOne({ AgentCode: agentCode });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "एजंट कोड सापडला नाही",
      });
    }

    res.json({
      success: true,
      message: "एजंट कोड सापडला",
      data: agent,
    });
  } catch (error) {
    console.error("Error fetching agent:", error);
    res.status(500).json({
      success: false,
      message: "सर्व्हर मध्ये त्रुटी आली आहे",
      error: error.message,
    });
  }
});

module.exports = router;

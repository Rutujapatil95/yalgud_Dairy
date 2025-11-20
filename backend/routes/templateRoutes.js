// routes/templates.js
const express = require('express');
const router = express.Router();
const Template = require('../models/Template');

/**
 * Helper: normalize incoming body
 * Accepts either { item: { ... } } OR { items: [ ... ] } (will pick first item).
 */
function normalizeBody(body = {}) {
  const payload = { ...body };
  if (!payload.item && Array.isArray(payload.items) && payload.items.length > 0) {
    payload.item = payload.items[0];
    delete payload.items;
  }
  return payload;
}

/**
 * POST /api/templates
 * Create a template. Required fields: agentCode, templateName, templateType ('template'|'add on'), item
 */
router.post('/', async (req, res) => {
  try {
    const payload = normalizeBody(req.body);
    const { agentCode, templateName, templateType, item } = payload;

    if (!agentCode || !templateName || !templateType || !item) {
      return res.status(400).json({ message: 'agentCode, templateName, templateType and item are required.' });
    }

    // enforce only allowed types 'template' or 'add on'
    const normalizedType = templateType.toString().trim().toLowerCase();
    if (normalizedType !== 'template' && normalizedType !== 'add on') {
      return res.status(400).json({ message: "templateType must be 'template' or 'add on'." });
    }
    payload.templateType = normalizedType;

    const created = new Template(payload);
    await created.save();

    return res.status(201).json({ message: 'Template saved successfully', data: created });
  } catch (error) {
    console.error('Error creating template:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Template with this agentCode + templateName already exists.' });
    }
    return res.status(500).json({ message: 'Error saving template', error: error.message });
  }
});

/**
 * GET /api/templates
 * Query params:
 *  - agentCode (optional): filter by agent
 * Returns grouped response with two sections:
 *  { Popular: [...], AddOn: [...] }
 */
router.get('/', async (req, res) => {
  try {
    const { agentCode } = req.query;
    const filter = {};
    if (agentCode) filter.agentCode = agentCode;

    const templates = await Template.find(filter).lean().sort({ updatedAt: -1 });

    const grouped = templates.reduce(
      (acc, t) => {
        const type = (t.templateType || 'template').toString().trim().toLowerCase();
        if (type === 'add on') {
          acc.AddOn.push(t);
        } else {
          acc.Popular.push(t); // all 'template' types go to Popular
        }
        return acc;
      },
      { Popular: [], AddOn: [] }
    );

    return res.status(200).json(grouped);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({ message: 'Error fetching templates', error: error.message });
  }
});

/**
 * GET /api/templates/type
 * Params: ?agentCode=&type=template|add%20on
 * Returns list (not grouped)
 */
router.get('/type', async (req, res) => {
  try {
    const { agentCode, type } = req.query;
    if (!type) return res.status(400).json({ message: "Query param 'type' is required." });

    const normalized = type.toString().trim().toLowerCase();
    if (normalized !== 'template' && normalized !== 'add on') {
      return res.status(400).json({ message: "type must be 'template' or 'add on'." });
    }

    const filter = { templateType: normalized };
    if (agentCode) filter.agentCode = agentCode;

    const templates = await Template.find(filter).lean().sort({ updatedAt: -1 });
    return res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching by type:', error);
    return res.status(500).json({ message: 'Error fetching templates by type', error: error.message });
  }
});

/**
 * GET /api/templates/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id).lean();
    if (!template) return res.status(404).json({ message: 'Template not found' });
    return res.status(200).json(template);
  } catch (error) {
    console.error('Error fetching template by id:', error);
    return res.status(500).json({ message: 'Error fetching template', error: error.message });
  }
});

/**
 * PUT /api/templates/:id
 * Update template (partial or full). Normalizes items -> item if needed.
 */
router.put('/:id', async (req, res) => {
  try {
    const payload = normalizeBody(req.body);

    // optional: prevent converting templateType to invalid value
    if (payload.templateType) {
      const t = payload.templateType.toString().trim().toLowerCase();
      if (t !== 'template' && t !== 'add on') {
        return res.status(400).json({ message: "templateType must be 'template' or 'add on'." });
      }
      payload.templateType = t;
    }

    const updated = await Template.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Template not found' });

    return res.status(200).json({ message: 'Template updated', data: updated });
  } catch (error) {
    console.error('Error updating template:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Duplicate template (agentCode + templateName).' });
    }
    return res.status(400).json({ message: 'Error updating template', error: error.message });
  }
});

/**
 * DELETE /api/templates/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Template.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Template not found' });
    return res.status(200).json({ message: 'Template deleted', data: deleted });
  } catch (error) {
    console.error('Error deleting template:', error);
    return res.status(500).json({ message: 'Error deleting template', error: error.message });
  }
});

module.exports = router;

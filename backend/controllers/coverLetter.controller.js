const { callGemini } = require('../utils/gemini');

function validateCoverLetterPayload(body) {
  const requiredFields = ['jobRole', 'companyName', 'resumeSummary'];
  const missing = requiredFields.filter(field => body[field] == null || body[field] === '');

  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  return {
    jobRole: String(body.jobRole).trim(),
    companyName: String(body.companyName).trim(),
    resumeSummary: String(body.resumeSummary).trim()
  };
}

function buildCoverLetterPrompt(payload) {
  const { jobRole, companyName, resumeSummary } = payload;

  return `
You are an expert career coach and professional cover letter writer.

Write a personalized, professional cover letter for the role of "${jobRole}" at "${companyName}".

Constraints:
- Length: 300 to 400 words (strict).
- Tone: confident, warm, and tailored to the company/role.
- Content: must be based ONLY on the resume summary provided (do not invent employers, degrees, certifications, or metrics).
- Formatting: plain text only, clean paragraphs, no markdown, no bullet lists, no headings, no code fences.
- Include a clear opening, 1–2 short body paragraphs showing fit, and a concise closing with a call to action.

Resume summary (source of truth):
${resumeSummary}

Return ONLY the final cover letter text.
`.trim();
}

const generateCoverLetter = async (req, res, next) => {
  try {
    const payload = validateCoverLetterPayload(req.body || {});
    const prompt = buildCoverLetterPrompt(payload);

    const coverLetterText = await callGemini(prompt);

    return res.status(200).type('text/plain').send(coverLetterText.trim());
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  generateCoverLetter
};


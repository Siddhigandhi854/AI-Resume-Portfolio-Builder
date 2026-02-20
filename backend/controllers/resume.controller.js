const { callGemini } = require('../utils/gemini');
const pdfParse = require('pdf-parse');

function validateResumePayload(body) {
  const requiredFields = [
    'name',
    'email',
    'phone',
    'skills',
    'education',
    'experience',
    'projects',
    'targetRole'
  ];

  const missing = requiredFields.filter(field => body[field] == null || body[field] === '');

  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  return {
    name: String(body.name).trim(),
    email: String(body.email).trim(),
    phone: String(body.phone).trim(),
    skills: Array.isArray(body.skills) ? body.skills : String(body.skills).split(','),
    education: body.education,
    experience: body.experience,
    projects: body.projects,
    targetRole: String(body.targetRole).trim()
  };
}

function buildAtsFriendlyPrompt(payload) {
  const { name, email, phone, skills, education, experience, projects, targetRole } = payload;

  const skillsList = Array.isArray(skills)
    ? skills.map(s => `- ${String(s).trim()}`).join('\n')
    : String(skills);

  return `
You are an expert resume writer and ATS optimization specialist.

Generate a **professional, concise, ATS-friendly resume** in **Markdown format only** for the following candidate.

Guidelines:
- Use clear section headings with Markdown (e.g. "# Name", "## Summary", "## Skills").
- Optimize for Applicant Tracking Systems (ATS) using relevant keywords for the target role.
- Keep formatting simple (no tables, no images).
- Use bullet points for responsibilities and achievements.
- Focus on measurable impact where possible.
- Do not include placeholder text or instructions, only final resume content.

Candidate profile:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Target Role: ${targetRole}

Skills:
${skillsList}

Education (as provided, you can reformat it):
${JSON.stringify(education, null, 2)}

Experience (as provided, you can reformat it into bullet points):
${JSON.stringify(experience, null, 2)}

Projects (as provided, you can reformat it into bullet points and impact statements):
${JSON.stringify(projects, null, 2)}

Return **only** the final resume in Markdown, no explanations or additional commentary.
`.trim();
}

const generateResume = async (req, res, next) => {
  try {
    const payload = validateResumePayload(req.body || {});
    const prompt = buildAtsFriendlyPrompt(payload);

    const resumeContent = await callGemini(prompt);

    return res.status(200).json({
      success: true,
      data: resumeContent
    });
  } catch (err) {
    return next(err);
  }
};

const analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('Resume PDF file is required (field name: "resume")');
      error.statusCode = 400;
      throw error;
    }

    const { jobDescription } = req.body || {};

    if (!jobDescription || !String(jobDescription).trim()) {
      const error = new Error('jobDescription is required');
      error.statusCode = 400;
      throw error;
    }

    const parsed = await pdfParse(req.file.buffer);
    const resumeText = (parsed.text || '').trim();

    if (!resumeText) {
      const error = new Error('Could not extract text from the provided PDF');
      error.statusCode = 400;
      throw error;
    }

    const prompt = `
You are an ATS (Applicant Tracking System) and resume optimization expert.

Analyze the following resume text against the provided job description and respond in **strict JSON**.

Requirements:
- Calculate an overall ATS score from 0 to 100 (integer) based on keyword match, structure, and relevance.
- Identify important missing or underrepresented keywords as an array of strings.
- Provide high-level suggestions to improve the resume as an array of strings.
- Rewrite weak or generic bullet points into stronger, impact-focused bullet points as an array of strings.
- Do not include any explanations outside of the JSON. No markdown, no code fences.

Return a single JSON object with this exact shape:
{
  "atsScore": number,
  "missingKeywords": string[],
  "suggestions": string[],
  "improvedBullets": string[]
}

Job description:
${String(jobDescription).trim()}

Resume text:
${resumeText}
`.trim();

    const rawResponse = await callGemini(prompt);
    const cleaned = rawResponse
      .trim()
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/i, '')
      .trim();

    let parsedJson;

    try {
      parsedJson = JSON.parse(cleaned);
    } catch (parseErr) {
      const error = new Error('Failed to parse analysis response from Gemini');
      error.statusCode = 502;
      throw error;
    }

    const {
      atsScore,
      missingKeywords,
      suggestions,
      improvedBullets
    } = parsedJson;

    return res.status(200).json({
      atsScore,
      missingKeywords,
      suggestions,
      improvedBullets
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  generateResume,
  analyzeResume
};


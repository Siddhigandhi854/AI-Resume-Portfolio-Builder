const { callGemini } = require('../utils/gemini');

function validatePortfolioPayload(body) {
  const requiredFields = ['bio', 'skills', 'projects', 'github', 'linkedin'];

  const missing = requiredFields.filter(field => body[field] == null || body[field] === '');

  if (missing.length) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  return {
    bio: String(body.bio).trim(),
    skills: Array.isArray(body.skills) ? body.skills : String(body.skills).split(','),
    projects: body.projects,
    github: String(body.github).trim(),
    linkedin: String(body.linkedin).trim()
  };
}

function buildPortfolioHtmlPrompt(payload) {
  const { bio, skills, projects, github, linkedin } = payload;

  const skillsList = Array.isArray(skills)
    ? skills.map(s => `- ${String(s).trim()}`).join('\n')
    : String(skills);

  return `
You are helping to build a personal portfolio website.

Using only the data provided below (do not fabricate or invent any new projects, links, or details), generate clean, semantic HTML for a portfolio page.

Requirements:
- Use these sections in order: About, Skills, Projects, Contact.
- Use clear, semantic HTML structure with headings (h1, h2, etc.), paragraphs, and lists.
- Do not include <html>, <head>, or <body> tags. Return only the inner HTML content for the page.
- Use only the data provided by the user. Do not add any fake companies, projects, dates, or links.
- Keep the HTML readable and consistently formatted.

User data:

Bio:
${bio}

Skills:
${skillsList}

Projects (as provided; you may reformat but not invent new ones):
${JSON.stringify(projects, null, 2)}

GitHub URL:
${github}

LinkedIn URL:
${linkedin}

Return only the HTML markup, no explanations or surrounding markdown/code fences.
`.trim();
}

const generatePortfolio = async (req, res, next) => {
  try {
    const payload = validatePortfolioPayload(req.body || {});
    const prompt = buildPortfolioHtmlPrompt(payload);

    const html = await callGemini(prompt);

    return res.status(200).json({
      success: true,
      data: html.trim()
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  generatePortfolio
};


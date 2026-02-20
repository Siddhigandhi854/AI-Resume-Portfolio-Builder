const API_BASE_URL = 'https://ai-resume-api.onrender.com';

function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function initTabs() {
  const tabs = Array.from(document.querySelectorAll('.nav-tab'));
  const panels = Array.from(document.querySelectorAll('.tab-panel'));
  const heroCtas = Array.from(document.querySelectorAll('[data-tab-target]'));
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  function activateTab(key) {
    if (!key) return;

    // Update desktop tabs
    tabs.forEach(tab => {
      const tabKey = tab.getAttribute('data-tab');
      if (tabKey === key) {
        tab.classList.add('bg-white/20', 'text-white');
        tab.classList.remove('hover:bg-white/10');
      } else {
        tab.classList.remove('bg-white/20', 'text-white');
        tab.classList.add('hover:bg-white/10');
      }
    });

    // Update mobile tabs
    const mobileTabs = mobileMenu?.querySelectorAll('.nav-tab');
    if (mobileTabs) {
      mobileTabs.forEach(tab => {
        const tabKey = tab.getAttribute('data-tab');
        if (tabKey === key) {
          tab.classList.add('bg-white/20', 'text-white');
          tab.classList.remove('hover:bg-white/10');
        } else {
          tab.classList.remove('bg-white/20', 'text-white');
          tab.classList.add('hover:bg-white/10');
        }
      });
    }

    // Update panels
    panels.forEach(panel => {
      const panelKey = panel.getAttribute('data-tab-panel');
      if (panelKey === key) {
        panel.classList.remove('hidden');
        panel.classList.add('animate-slide-up');
      } else {
        panel.classList.add('hidden');
        panel.classList.remove('animate-slide-up');
      }
    });

    // Close mobile menu after selection
    if (mobileMenu && mobileMenuBtn) {
      mobileMenu.classList.add('hidden');
    }
  }

  // Desktop tab clicks
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-tab');
      activateTab(key);
    });
  });

  // Mobile menu toggle
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Mobile tab clicks
  const mobileTabs = mobileMenu?.querySelectorAll('.nav-tab');
  if (mobileTabs) {
    mobileTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-tab');
        activateTab(key);
      });
    });
  }

  // Hero CTA clicks
  heroCtas.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-tab-target');
      if (key) {
        activateTab(key);
        const main = document.querySelector('main');
        if (main) {
          main.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Set initial active state
  const activeTab = document.querySelector('.nav-tab[data-tab="resume-generator"]');
  if (activeTab) {
    activeTab.classList.add('bg-white/20', 'text-white');
    activeTab.classList.remove('hover:bg-white/10');
  }
}

function showToast(message, type = 'error', timeout = 3500) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  
  // Set background color based on type
  toast.className = 'fixed bottom-8 right-8 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50';
  
  if (type === 'error') {
    toast.classList.add('bg-red-500', 'text-white');
  } else if (type === 'success') {
    toast.classList.add('bg-green-500', 'text-white');
  } else {
    toast.classList.add('bg-blue-500', 'text-white');
  }
  
  // Show toast
  setTimeout(() => {
    toast.classList.remove('translate-y-full');
  }, 100);

  if (timeout > 0) {
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => {
      toast.classList.add('translate-y-full');
    }, timeout);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMarkdownToHtml(markdown, container) {
  if (!container) return;
  if (!markdown) {
    container.innerHTML = '';
    return;
  }

  const lines = String(markdown).split('\n');
  let html = '';
  let inList = false;

  lines.forEach(rawLine => {
    const line = rawLine.replace(/\r$/, '');
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += '<p class="mb-4"></p>';
      return;
    }

    if (trimmed.startsWith('### ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h3 class="text-xl font-semibold mb-3 text-white">${escapeHtml(trimmed.slice(4))}</h3>`;
      return;
    }

    if (trimmed.startsWith('## ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h2 class="text-2xl font-bold mb-4 text-white">${escapeHtml(trimmed.slice(3))}</h2>`;
      return;
    }

    if (trimmed.startsWith('# ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h1 class="text-3xl font-bold mb-6 text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">${escapeHtml(trimmed.slice(2))}</h1>`;
      return;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        html += '<ul class="list-disc list-inside mb-4 space-y-2">';
        inList = true;
      }
      html += `<li class="text-gray-300 ml-4">${escapeHtml(trimmed.slice(2))}</li>`;
      return;
    }

    if (inList) {
      html += '</ul>';
      inList = false;
    }
    html += `<p class="text-gray-300 mb-4 leading-relaxed">${escapeHtml(trimmed)}</p>`;
  });

  if (inList) {
    html += '</ul>';
  }

  container.innerHTML = `<div class="bg-white/5 rounded-xl p-6 border border-white/10">${html}</div>`;
}

async function handleResumeGeneratorSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const output = document.getElementById('resume-generator-output');
  const submitBtn = form.querySelector('button[type="submit"]');
  const spinner = submitBtn?.querySelector('.submit-spinner');
  
  if (!output) return;

  // Show loading state
  output.innerHTML = '<div class="text-center py-8"><p class="text-gray-300">Generating resume… this usually takes just a moment.</p></div>';
  output.classList.remove('hidden');
  
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
  if (spinner) {
    spinner.classList.remove('hidden');
  }

  const formData = new FormData(form);

  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    skills: formData.get('skills'),
    education: formData.get('education'),
    experience: formData.get('experience'),
    projects: formData.get('projects'),
    targetRole: formData.get('targetRole')
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/resume/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody.message || `Request failed with status ${res.status}`;
      showToast(message, 'error');
      output.innerHTML = `<div class="text-center py-8"><p class="text-red-300">Error: ${escapeHtml(message)}</p></div>`;
      return;
    }

    const data = await res.json();
    const markdown = data && typeof data.data === 'string' ? data.data : '';
    
    // Convert markdown to HTML and style with Tailwind classes
    renderMarkdownToHtml(markdown, output);
    output.classList.add('animate-slide-up');

    const downloadBtn = document.getElementById('resume-download-btn');
    if (downloadBtn) {
      if (markdown) {
        downloadBtn.classList.remove('hidden');
        downloadBtn.onclick = () => {
          const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'resume.md';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };
      } else {
        downloadBtn.classList.add('hidden');
      }
    }
  } catch (err) {
    const message = 'Unexpected error while generating resume.';
    showToast(message, 'error');
    output.innerHTML = `<div class="text-center py-8"><p class="text-red-300">${escapeHtml(message)}</p></div>`;
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    if (spinner) {
      spinner.classList.add('hidden');
    }
  }
}

async function handleResumeAnalyzerSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const output = document.getElementById('resume-analyzer-output');
  const submitBtn = form.querySelector('button[type="submit"]');
  const spinner = submitBtn?.querySelector('.submit-spinner');
  
  const scoreValueEl = document.getElementById('ats-score-value');
  const scoreBarEl = document.getElementById('ats-score-bar');
  const keywordsList = document.getElementById('missing-keywords-list');
  const suggestionsList = document.getElementById('ats-suggestions-list');
  const bulletsList = document.getElementById('ats-bullets-list');

  // Reset UI state
  if (scoreValueEl) scoreValueEl.textContent = '–/100';
  if (scoreBarEl) scoreBarEl.style.setProperty('--value', 0);
  if (keywordsList) {
    keywordsList.innerHTML = '<li class="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">Analyzing for relevant keywords...</li>';
  }
  if (suggestionsList) {
    suggestionsList.innerHTML = '<li class="text-gray-400">We\'re reviewing structure, clarity, and role alignment.</li>';
  }
  if (bulletsList) {
    bulletsList.innerHTML = '<li class="text-gray-400">We\'re identifying bullets that can be rewritten more strongly.</li>';
  }

  // Show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
  if (spinner) {
    spinner.classList.remove('hidden');
  }
  
  output.classList.remove('hidden');
  output.classList.add('animate-slide-up');

  const formData = new FormData(form);

  try {
    const res = await fetch(`${API_BASE_URL}/api/resume/analyze`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody.message || `Request failed with status ${res.status}`;
      showToast(message, 'error');
      if (keywordsList) {
        keywordsList.innerHTML = `<li class="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">${escapeHtml(message)}</li>`;
      }
      return;
    }

    const data = await res.json();
    const scoreRaw = typeof data.atsScore === 'number' ? data.atsScore : Number(data.atsScore);
    const score =
      Number.isFinite(scoreRaw) && scoreRaw >= 0
        ? Math.max(0, Math.min(100, Math.round(scoreRaw)))
        : null;

    if (scoreValueEl) {
      scoreValueEl.textContent = score != null ? `${score}/100` : 'N/A';
    }
    if (scoreBarEl) {
      scoreBarEl.style.setProperty('--value', score != null ? score : 0);
    }

    const missingKeywords = Array.isArray(data.missingKeywords) ? data.missingKeywords : [];
    if (keywordsList) {
      if (missingKeywords.length) {
        keywordsList.innerHTML = '';
        missingKeywords.forEach(keyword => {
          const li = document.createElement('li');
          li.textContent = keyword;
          li.className = 'px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm';
          keywordsList.appendChild(li);
        });
      } else {
        keywordsList.innerHTML = '<li class="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">No major keyword gaps detected.</li>';
      }
    }

    const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
    if (suggestionsList) {
      if (suggestions.length) {
        suggestionsList.innerHTML = '';
        suggestions.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          li.className = 'text-gray-300 mb-2';
          suggestionsList.appendChild(li);
        });
      } else {
        suggestionsList.innerHTML = '<li class="text-gray-400">No additional suggestions were returned.</li>';
      }
    }

    const improvedBullets = Array.isArray(data.improvedBullets) ? data.improvedBullets : [];
    if (bulletsList) {
      if (improvedBullets.length) {
        bulletsList.innerHTML = '';
        improvedBullets.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          li.className = 'text-gray-300 mb-2';
          bulletsList.appendChild(li);
        });
      } else {
        bulletsList.innerHTML = '<li class="text-gray-400">No improved bullets were provided.</li>';
      }
    }
  } catch (err) {
    const message = 'Unexpected error while analyzing resume.';
    showToast(message, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    if (spinner) {
      spinner.classList.add('hidden');
    }
  }
}

async function handlePortfolioGeneratorSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const output = document.getElementById('portfolio-generator-output');
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!output) return;

  output.innerHTML =
    '<article class="portfolio-card"><p class="placeholder">Generating portfolio preview&hellip;</p></article>';
  submitBtn && submitBtn.classList.add('is-loading');

  const formData = new FormData(form);

  const payload = {
    bio: formData.get('bio'),
    skills: formData.get('skills'),
    projects: formData.get('projects'),
    github: formData.get('github'),
    linkedin: formData.get('linkedin')
  };

  const sanitizeHtml = html => {
    const template = document.createElement('template');
    template.innerHTML = html || '';

    const disallowedTags = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'];
    disallowedTags.forEach(tag => {
      template.content.querySelectorAll(tag).forEach(node => node.remove());
    });

    template.content.querySelectorAll('*').forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (/^on/i.test(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return template.innerHTML;
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/portfolio/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody.message || `Request failed with status ${res.status}`;
      showToast(message);
      output.innerHTML = `<article class="portfolio-card"><p class="placeholder">${escapeHtml(
        message
      )}</p></article>`;
      return;
    }

    const data = await res.json();
    const htmlSnippet = data && typeof data.data === 'string' ? data.data : '';

    if (!htmlSnippet) {
      output.innerHTML =
        '<article class="portfolio-card"><p class="placeholder">No portfolio HTML was returned.</p></article>';
      return;
    }

    const safeHtml = sanitizeHtml(htmlSnippet);
    const card = document.createElement('article');
    card.className = 'portfolio-card';
    card.innerHTML = safeHtml;

    output.innerHTML = '';
    output.appendChild(card);
  } catch (err) {
    const message = 'Unexpected error while generating portfolio.';
    showToast(message);
    output.innerHTML = `<article class="portfolio-card"><p class="placeholder">${escapeHtml(
      message
    )}</p></article>`;
  } finally {
    submitBtn && submitBtn.classList.remove('is-loading');
  }
}

async function handleCoverLetterGeneratorSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const output = document.getElementById('coverletter-generator-output');
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!output) return;

  output.innerHTML =
    '<p class="placeholder">Generating cover letter&hellip; tailoring language to your role and company.</p>';
  submitBtn && submitBtn.classList.add('is-loading');

  const formData = new FormData(form);

  const payload = {
    jobRole: formData.get('jobRole'),
    companyName: formData.get('companyName'),
    resumeSummary: formData.get('resumeSummary')
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/coverletter/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody.message || `Request failed with status ${res.status}`;
      showToast(message);
      output.innerHTML = `<p class="placeholder">${escapeHtml(message)}</p>`;

      const downloadBtn = document.getElementById('coverletter-download-btn');
      if (downloadBtn) {
        downloadBtn.classList.remove('is-visible');
        downloadBtn.onclick = null;
      }
      return;
    }

    const text = await res.text();
    const cleaned = (text || '').trim();

    if (!cleaned) {
      output.innerHTML =
        '<p class="placeholder">No cover letter text was returned. Try adjusting your summary and submitting again.</p>';
      return;
    }

    const paragraphs = cleaned.split(/\n{2,}/);
    const html = paragraphs
      .map(p => `<p>${escapeHtml(p.trim())}</p>`)
      .join('') || `<p>${escapeHtml(cleaned)}</p>`;

    output.innerHTML = html;

    const downloadBtn = document.getElementById('coverletter-download-btn');
    if (downloadBtn) {
      downloadBtn.classList.add('is-visible');
      downloadBtn.onclick = () => {
        const blob = new Blob([cleaned], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cover-letter.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
    }
  } catch (err) {
    const message = 'Unexpected error while generating cover letter.';
    showToast(message);
    output.innerHTML = `<p class="placeholder">${escapeHtml(message)}</p>`;

    const downloadBtn = document.getElementById('coverletter-download-btn');
    if (downloadBtn) {
      downloadBtn.classList.remove('is-visible');
      downloadBtn.onclick = null;
    }
  } finally {
    submitBtn && submitBtn.classList.remove('is-loading');
  }
}

function initForms() {
  const resumeGenForm = document.getElementById('resume-generator-form');
  if (resumeGenForm) {
    resumeGenForm.addEventListener('submit', handleResumeGeneratorSubmit);
  }

  const resumeAnalyzerForm = document.getElementById('resume-analyzer-form');
  if (resumeAnalyzerForm) {
    resumeAnalyzerForm.addEventListener('submit', handleResumeAnalyzerSubmit);
  }

  const portfolioForm = document.getElementById('portfolio-generator-form');
  if (portfolioForm) {
    portfolioForm.addEventListener('submit', handlePortfolioGeneratorSubmit);
  }

  const coverLetterForm = document.getElementById('coverletter-generator-form');
  if (coverLetterForm) {
    coverLetterForm.addEventListener('submit', handleCoverLetterGeneratorSubmit);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initTabs();
  initForms();
});


import axios from 'axios';
import { sendMessageToGemini } from './gemini';

const normalizeGithubInput = (input) => {
  if (!input) return '';
  const trimmed = String(input).trim();
  // handle @username
  if (trimmed.startsWith('@')) return trimmed.slice(1);
  // handle URL formats
  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    if (url.hostname.includes('github.com')) {
      const parts = url.pathname.split('/').filter(Boolean);
      // https://github.com/<user> or https://github.com/<user>/<repo>
      if (parts.length >= 1) return parts[0];
    }
  } catch (_) {
    // not a URL, assume it's already a username
  }
  return trimmed;
};

const extractRolesFromResume = (text = '') => {
  const roles = [];
  const map = [
    { key: /full\s*stack|backend|frontend|software\s*engineer|developer/i, role: 'Software Engineer' },
    { key: /data\s*scientist|machine\s*learning|ai\s*engineer|ml\s*engineer/i, role: 'AI/ML Engineer' },
    { key: /data\s*analyst|business\s*intelligence/i, role: 'Data Analyst' },
    { key: /devops|sre|site\s*reliability/i, role: 'DevOps Engineer' },
    { key: /ui\s*\/\s*ux|designer/i, role: 'UI/UX Designer' },
    { key: /product\s*manager|pm\b/i, role: 'Product Manager' },
    { key: /marketing\s*manager|digital\s*marketing|growth\s*marketing|seo\b|content\s*marketing|social\s*media|brand\s*manager/i, role: 'Marketing' },
  ];
  map.forEach(({ key, role }) => { if (key.test(text) && !roles.includes(role)) roles.push(role); });
  // Do NOT default to Software Engineer; if unknown, return empty and let UI/user hint decide
  return roles;
};

const extractSkillsWithGemini = async (resumeText) => {
  if (!resumeText) return [];
  const system = 'You extract skills from resume text. Return a compact JSON array of lower-case skill names only, like ["react","node.js","mongodb"]. No prose.';
  try {
    const raw = await sendMessageToGemini(resumeText, system);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const json = jsonMatch ? jsonMatch[0] : raw;
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.map((s) => String(s).trim()) : [];
  } catch (e) {
    console.warn('Gemini skills extraction failed, falling back:', e.message);
    // naive fallback: pick capitalized words as pseudo skills
    const words = (resumeText.match(/\b[A-Z][a-zA-Z+.#\-]{1,}\b/g) || []).slice(0, 12);
    return [...new Set(words.map((w) => w.toLowerCase()))];
  }
};

const fetchGithubRepos = async (username) => {
  if (!username) return [];
  const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=20&sort=updated`;
  try {
    const { data } = await axios.get(url, { headers: { Accept: 'application/vnd.github+json' } });
    return (data || []).map((r) => ({
      id: String(r.id),
      name: r.name,
      description: r.description || '',
      language: r.language || '',
      url: r.html_url,
      topics: r.topics || [],
      languages_url: r.languages_url,
    }));
  } catch (e) {
    console.warn('GitHub fetch failed:', e.message);
    return [];
  }
};

const enrichLanguagesFromRepos = async (repos, limit = 6) => {
  // Query languages_url for top N repos to derive language-based skills
  const headers = { Accept: 'application/vnd.github+json' };
  const selected = repos.slice(0, limit).filter((r) => r.languages_url);
  const languageCounts = {};
  for (const repo of selected) {
    try {
      const { data } = await axios.get(repo.languages_url, { headers });
      Object.entries(data || {}).forEach(([lang, bytes]) => {
        languageCounts[lang.toLowerCase()] = (languageCounts[lang.toLowerCase()] || 0) + Number(bytes || 0);
      });
    } catch (e) {
      // ignore per-repo errors to stay resilient
    }
  }
  // return top languages by bytes
  return Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => lang)
    .slice(0, 12);
};

const fetchLeetCodeStats = async (username) => {
  if (!username) return null;
  // normalize if a full URL is given
  try {
    if (/^https?:\/\//i.test(username)) {
      const u = new URL(username);
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0]) username = parts[0];
    }
  } catch (_) {}
  try {
    // Community API; may be rate-limited or unavailable. Gracefully fallback.
    const { data } = await axios.get(`https://leetcode-stats-api.herokuapp.com/${encodeURIComponent(username)}`);
    if (data && typeof data.totalSolved !== 'undefined') {
      return {
        totalSolved: data.totalSolved,
        easySolved: data.easySolved,
        mediumSolved: data.mediumSolved,
        hardSolved: data.hardSolved,
        ranking: data.ranking,
      };
    }
    return null;
  } catch (e) {
    console.warn('LeetCode fetch failed:', e.message);
    return null;
  }
};

const buildEdges = (skills, projects, roles) => {
  const edges = [];
  // link skills -> projects by name/desc/topic contains skill token
  projects.forEach((p) => {
    const text = [p.name, p.description, ...(p.topics || [])].join(' ').toLowerCase();
    skills.forEach((s) => {
      const token = s.toLowerCase();
      if (token.length > 2 && text.includes(token)) {
        edges.push({ source: `skill:${s}`, target: `project:${p.name}` });
      }
    });
  });
  // link roles -> skills with coarse mapping
  roles.forEach((role) => {
    const map = role.match(/ai|ml|data/i)
      ? ['python', 'pandas', 'tensorflow', 'pytorch']
      : role.match(/devops|sre/i)
      ? ['docker', 'kubernetes', 'ci/cd', 'aws']
      : role.match(/design/i)
      ? ['figma', 'ux', 'ui']
      : ['javascript', 'react', 'node', 'sql'];
    skills.forEach((s) => {
      if (map.some((m) => s.toLowerCase().includes(m.replace(/\//g, '').toLowerCase()))) {
        edges.push({ source: `role:${role}`, target: `skill:${s}` });
      }
    });
  });
  return edges;
};

export const buildGraphFromInputs = async ({ resume, github, linkedin, leetcode, targetRole }) => {
  const ghUser = normalizeGithubInput(github || '');
  const [skills, repos, lc] = await Promise.all([
    extractSkillsWithGemini(resume || ''),
    fetchGithubRepos(ghUser),
    fetchLeetCodeStats(leetcode || ''),
  ]);
  // derive languages-based skills from repos
  const languageSkills = repos.length ? await enrichLanguagesFromRepos(repos) : [];
  const combinedSkills = Array.from(new Set([...(skills || []), ...languageSkills]));
  let roles = extractRolesFromResume(resume || '');
  if ((!roles || roles.length === 0) && targetRole) {
    roles = [targetRole];
  }

  const nodes = [
    ...combinedSkills.map((s) => ({ id: `skill:${s}`, label: s, type: 'skill' })),
    ...repos.map((p) => ({ id: `project:${p.name}`, label: p.name, type: 'project', url: p.url })),
    ...roles.map((r) => ({ id: `role:${r}`, label: r, type: 'role' })),
  ];
  const links = buildEdges(combinedSkills, repos, roles);

  // add profile nodes for GitHub/LinkedIn if provided
  if (ghUser) {
    nodes.push({ id: `account:github:${ghUser}`, label: `@${ghUser}`, type: 'account', url: `https://github.com/${ghUser}` });
    repos.forEach((p) => links.push({ source: `account:github:${ghUser}`, target: `project:${p.name}` }));
  }
  if (linkedin) {
    // link the LinkedIn profile as an account node
    let linkedUrl = linkedin;
    try {
      if (!/^https?:\/\//i.test(linkedin)) linkedUrl = `https://www.linkedin.com/in/${linkedin.replace(/^@/, '')}`;
    } catch (_) {}
    nodes.push({ id: `account:linkedin`, label: 'LinkedIn', type: 'account', url: linkedUrl });
    roles.forEach((r) => links.push({ source: `account:linkedin`, target: `role:${r}` }));
  }

  // Enrich with LeetCode: add a DSA node only for engineering/data roles
  const isEngLike = (roles || []).some((r) => /engineer|developer|devops|data|ai|ml/i.test(r));
  if (isEngLike && lc && lc.totalSolved >= 50) {
    if (!nodes.find((n) => n.id === 'skill:dsa')) {
      nodes.push({ id: 'skill:dsa', label: 'DSA', type: 'skill' });
    }
    roles.forEach((r) => links.push({ source: `role:${r}`, target: 'skill:dsa' }));
  }

  // simple next-best suggestions: skills mentioned in repos but not in resume skills
  const repoKeywords = new Set();
  const STOP = new Set(['the','and','for','with','from','into','your','project','repo','test','code','this','that','using','use','sample','demo','app']);
  repos.forEach((p) => {
    [p.name, p.description, ...(p.topics || [])]
      .join(' ')
      .toLowerCase()
      .split(/[^a-z0-9+.#-]+/)
      .forEach((w) => { if (w && w.length > 2 && !STOP.has(w)) repoKeywords.add(w); });
  });
  let missingSkills = [...repoKeywords].filter((k) => !combinedSkills.includes(k)).slice(0, 8);
  // role-based nudges for suggestions when sparse
  if (missingSkills.length < 4 && roles && roles.length) {
    const role = roles[0].toLowerCase();
    const roleHints = role.includes('marketing')
      ? ['seo', 'content marketing', 'google analytics', 'meta ads']
      : role.includes('product')
      ? ['roadmapping', 'user research', 'metrics', 'a/b testing']
      : role.includes('design')
      ? ['figma', 'wireframing', 'usability testing']
      : role.match(/data|ai|ml/)
      ? ['python', 'pandas', 'sql', 'tensorflow']
      : role.match(/devops|sre/)
      ? ['docker', 'kubernetes', 'ci/cd', 'aws']
      : ['javascript', 'react', 'node', 'sql'];
    missingSkills = Array.from(new Set([...missingSkills, ...roleHints])).slice(0, 8);
  }
  const suggestions = {
    skills: missingSkills,
    projects: repos.slice(0, 5).map((r) => r.name),
    roles,
  };

  return { nodes, links, suggestions, leetcode: lc, currentSkills: combinedSkills };
};

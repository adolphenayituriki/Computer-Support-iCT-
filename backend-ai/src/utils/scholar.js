import axios from 'axios';
import * as cheerio from 'cheerio';

const SCHOLAR_BASE = 'https://scholar.google.com/scholar';
const CACHE = new Map();
const CACHE_TTL = 30 * 60 * 1000;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

function getCached(key) {
  const entry = CACHE.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  CACHE.delete(key);
  return null;
}

function setCache(key, data) {
  if (CACHE.size > 200) {
    const oldest = CACHE.keys().next().value;
    CACHE.delete(oldest);
  }
  CACHE.set(key, { data, ts: Date.now() });
}

export async function searchScholar(query, limit = 5) {
  const cacheKey = `scholar:${query}:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const { data: html } = await axios.get(SCHOLAR_BASE, {
      params: { q: query, hl: 'en', as_sdt: 0, as_vis: 1 },
      headers: HEADERS,
      timeout: 15000,
    });

    const $ = cheerio.load(html);
    const results = [];

    $('.gs_r.gs_or.gs_scl').each((i, el) => {
      if (results.length >= limit) return false;

      const titleEl = $(el).find('.gs_rt a').first();
      const title = titleEl.text().trim() || $(el).find('.gs_rt').text().trim();
      const url = titleEl.attr('href') || '';

      const authorsVenue = $(el).find('.gs_a').text().trim();
      const snippet = $(el).find('.gs_rs').text().trim();

      const citedText = $(el).find('.gs_fl a').first().text().trim();
      const citedMatch = citedText.match(/Cited by (\d+)/);
      const citations = citedMatch ? parseInt(citedMatch[1], 10) : 0;

      const pdfLink = $(el).find('.gs_or_ggsm a, .gs_or_ggsmgsor').attr('href')
        || $(el).find('a[href*=".pdf"]').attr('href')
        || '';

      if (title && title.length > 5) {
        results.push({
          title: title.substring(0, 300),
          authorsVenue: authorsVenue.substring(0, 300),
          snippet: snippet.substring(0, 800),
          citations,
          url,
          pdfUrl: pdfLink,
        });
      }
    });

    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.error(`[Scholar] Search failed for "${query}":`, err.message);
    return [];
  }
}

export async function getScholarSummary(query, limit = 3) {
  const results = await searchScholar(query, limit);
  if (results.length === 0) return null;

  const totalCitations = results.reduce((sum, r) => sum + r.citations, 0);
  const snippets = results.map((r) => r.snippet).filter((s) => s.length > 20);

  let combinedInsight = '';
  if (snippets.length > 0) {
    combinedInsight = snippets.join(' ').substring(0, 2000);
  }

  return {
    query,
    paperCount: results.length,
    totalCitations,
    papers: results,
    combinedInsight,
  };
}

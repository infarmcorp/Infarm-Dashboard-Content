// api/data.js
// Vercel Serverless Function — dipanggil dari browser via /api/data?platform=tiktok|instagram
// API key Windsor.ai disimpan di Vercel Environment Variables, TIDAK PERNAH dikirim ke browser.

export default async function handler(req, res) {
  const API_KEY = process.env.WINDSOR_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'WINDSOR_API_KEY belum di-set di Vercel Environment Variables' });
  }

  const platform = req.query.platform; // "tiktok" atau "instagram"
  if (!platform || (platform !== 'tiktok' && platform !== 'instagram')) {
    return res.status(400).json({ error: 'Query param ?platform= harus "tiktok" atau "instagram"' });
  }

  const CONFIG = {
    tiktok: {
      datasource: 'tiktok_organic',
      dailyFields: ['likes', 'comments', 'shares', 'profile_views', 'unique_video_views', 'followers_count', 'engaged_audience'],
      contentFields: ['video_caption', 'video_views_count', 'video_likes', 'video_comments', 'video_shares', 'video_favorites', 'video_new_followers', 'video_full_watched_rate', 'video_average_time_watched', 'video_profile_views', 'video_create_datetime', 'video_thumbnail_url'],
    },
    instagram: {
      datasource: 'instagram',
      // Field id sudah diverifikasi dari Windsor.ai get_fields('instagram')
      dailyFields: ['likes', 'comments', 'shares', 'saves', 'reach', 'follower_count', 'reposts', 'views'],
      contentFields: ['media_caption', 'media_views', 'media_like_count', 'media_comments_count', 'media_shares', 'media_saved', 'media_reach', 'media_type', 'media_thumbnail_url'],
    },
  };

  const cfg = CONFIG[platform];
  const dateFrom = req.query.date_from || getDateDaysAgo(28);
  const dateTo = req.query.date_to || getToday();

  try {
    const dailyJson = await fetchWindsor(cfg.dailyFields, dateFrom, dateTo, API_KEY);
    const contentJson = await fetchWindsor(cfg.contentFields, dateFrom, dateTo, API_KEY);

    // Filter hasil supaya hanya baris dari datasource yang dimaksud
    // (karena endpoint /all mengembalikan semua connector yang terhubung di akun Windsor)
    const dailyRows = (dailyJson.data || []).filter(r => r.datasource === cfg.datasource);
    const contentRows = (contentJson.data || []).filter(r => r.datasource === cfg.datasource);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({
      platform,
      date_from: dateFrom,
      date_to: dateTo,
      daily: dailyRows,
      content: contentRows,
      fetched_at: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Gagal fetch dari Windsor.ai', detail: String(err) });
  }
}

async function fetchWindsor(fields, dateFrom, dateTo, apiKey) {
  const allFields = ['date', 'datasource', 'account_name'].concat(fields);
  const url = 'https://connectors.windsor.ai/all?' + new URLSearchParams({
    api_key: apiKey,
    fields: allFields.join(','),
    date_from: dateFrom,
    date_to: dateTo,
    _format: 'json',
  }).toString();

  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error('Windsor API error ' + resp.status + ': ' + text);
  }
  return resp.json();
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}
function getDateDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

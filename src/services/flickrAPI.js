// Minimal Flickr API wrapper — simple and robust for the small gallery
const FLICKR_API_KEY = '6f102c62f41998d151e5a1b48713cf13';
const FLICKR_BASE_URL = 'https://api.flickr.com/services/rest/';

const buildPhotoUrl = (p, size = 'm') => {
  if (!p) return null;
  if (p[`url_${size}`]) return p[`url_${size}`];
  if (p.server && p.id && p.secret) return `https://live.staticflickr.com/${p.server}/${p.id}_${p.secret}_${size}.jpg`;
  return null;
};

export const flickrAPI = {
  // simple search (recent if no query)
  searchPhotos: async (query = '', page = 1) => {
    const method = query ? 'flickr.photos.search' : 'flickr.photos.getRecent';
    const params = new URLSearchParams({
      method,
      api_key: FLICKR_API_KEY,
      per_page: 30,
      page,
      format: 'json',
      nojsoncallback: 1,
      extras: 'url_m,url_s,url_q,owner_name,description,date_taken',
    });
    if (query) params.append('text', query);

    const url = `${FLICKR_BASE_URL}?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.stat === 'fail') throw new Error(data.message || 'Flickr error');

    const photos = (data.photos?.photo || []).map((p) => ({
      id: p.id,
      title: p.title || '',
      owner: p.ownername || '',
      url: buildPhotoUrl(p, 'm') || buildPhotoUrl(p, 's') || buildPhotoUrl(p, 'q'),
      raw: p,
    }));

    return { photos, total: Number(data.photos?.total || photos.length), pages: Number(data.photos?.pages || 1) };
  },

  getPhotoInfo: async (photoId) => {
    if (!photoId) throw new Error('photoId required');
    const params = new URLSearchParams({
      method: 'flickr.photos.getInfo',
      api_key: FLICKR_API_KEY,
      photo_id: photoId,
      format: 'json',
      nojsoncallback: 1,
    });
    const res = await fetch(`${FLICKR_BASE_URL}?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.stat === 'fail') throw new Error(data.message || 'Flickr error');
    const p = data.photo;
    return {
      id: p.id,
      title: p.title?._content || '',
      description: p.description?._content || '',
      owner: p.owner?.username || '',
      urls: {
        medium: buildPhotoUrl(p, 'm'),
        large: buildPhotoUrl(p, 'l'),
        original: buildPhotoUrl(p, 'o'),
      },
      raw: p,
    };
  },
};

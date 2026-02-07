const Sutra = require('../models/Sutra');
const DharmaTalk = require('../models/DharmaTalk');

const normalizeQueryNumber = (val, fallback) => {
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const search = async (req, res) => {
  const { q, type, tag, monk, category, page = 1, limit = 20 } = req.query;

  if (!q || typeof q !== 'string' || !q.trim()) {
    return res.status(400).json({ message: 'q is required' });
  }

  const pageNum = normalizeQueryNumber(page, 1);
  const limitNum = normalizeQueryNumber(limit, 20);
  const fetchSize = pageNum * limitNum; // simple over-fetch to allow merge/slice
  const regex = { $regex: q, $options: 'i' };

  const wantSutras = !type || type === 'sutra';
  const wantDharma = !type || type === 'dharma';

  const sutraPromise = wantSutras
    ? (async () => {
        const query = {
          $or: [
            { title: regex },
            { content: regex },
            { summary: regex },
          ],
        };
        if (category) query.category = category;
        if (tag) query.tags = tag.toLowerCase();

        const [items, total] = await Promise.all([
          Sutra.find(query)
            .sort({ createdAt: -1 })
            .limit(fetchSize),
          Sutra.countDocuments(query),
        ]);

        const mapped = items.map((s) => ({
          type: 'sutra',
          id: s._id,
          title: s.title,
          thumbnailUrl: s.thumbnailUrl,
          createdAt: s.createdAt,
        }));

        return { items: mapped, total };
      })()
    : Promise.resolve({ items: [], total: 0 });

  const dharmaPromise = wantDharma
    ? (async () => {
        const query = {
          $or: [
            { title: regex },
            { description: regex },
          ],
        };
        if (tag) query.tags = tag.toLowerCase();
        if (monk) query.monk = monk;

        const [items, total] = await Promise.all([
          DharmaTalk.find(query)
            .sort({ createdAt: -1 })
            .limit(fetchSize)
            .populate({ path: 'monk', match: { isDeleted: false }, select: 'name' }),
          DharmaTalk.countDocuments(query),
        ]);

        const mapped = items.map((t) => ({
          type: 'dharma',
          id: t._id,
          title: t.title,
          thumbnailUrl: t.thumbnailUrl,
          monkName: t.monk?.name,
          duration: t.duration,
          createdAt: t.createdAt,
        }));

        return { items: mapped, total };
      })()
    : Promise.resolve({ items: [], total: 0 });

  try {
    const [sutraRes, dharmaRes] = await Promise.all([sutraPromise, dharmaPromise]);
    const merged = [...sutraRes.items, ...dharmaRes.items].sort((a, b) => {
      const ad = new Date(a.createdAt || 0).getTime();
      const bd = new Date(b.createdAt || 0).getTime();
      return bd - ad;
    });

    const start = (pageNum - 1) * limitNum;
    const items = merged.slice(start, start + limitNum).map(({ createdAt, ...rest }) => rest);
    const total = sutraRes.total + dharmaRes.total;

    res.json({ items, total, page: pageNum, limit: limitNum });
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};

module.exports = { search };

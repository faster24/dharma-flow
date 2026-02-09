const ChantingLog = require('../models/ChantingLog');
const User = require('../models/User');

const ensureUser = async (uid) => {
  const user = await User.findOne({ uid });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

const addChant = async (req, res) => {
  try {
    const { date } = req.body || {};
    if (!isValidDate(date)) return res.status(400).json({ message: 'date must be YYYY-MM-DD' });

    const user = await ensureUser(req.user.uid);
    await ChantingLog.updateOne(
      { user: user._id, date },
      { $setOnInsert: { user: user._id, date } },
      { upsert: true }
    );

    res.json({ date, recorded: true });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const monthDays = (monthStr) => {
  if (!/^\d{4}-\d{2}$/.test(monthStr)) return null;
  const [y, m] = monthStr.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const dates = [];
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dd = String(d).padStart(2, '0');
    dates.push(`${monthStr}-${dd}`);
  }
  return { dates };
};

const getMonth = async (req, res) => {
  try {
    const { month } = req.query;
    const md = monthDays(month);
    if (!md) return res.status(400).json({ message: 'month must be YYYY-MM' });

    const user = await ensureUser(req.user.uid);
    const logs = await ChantingLog.find({ user: user._id, date: { $regex: `^${month}-` } }).select('date');
    const marked = new Set(logs.map((l) => l.date));
    const days = md.dates.map((d) => ({ date: d, marked: marked.has(d) }));
    res.json({ month, days });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const computeStreaks = (dates, todayStr) => {
  const sorted = [...dates].sort();
  let current = 0;
  let longest = 0;
  let prev = null;
  for (const d of sorted) {
    if (!prev) {
      current = 1;
      longest = 1;
    } else {
      const prevDate = new Date(prev);
      prevDate.setUTCDate(prevDate.getUTCDate() + 1);
      const nextStr = prevDate.toISOString().slice(0, 10);
      if (d === nextStr) {
        current += 1;
      } else {
        current = 1;
      }
      if (current > longest) longest = current;
    }
    prev = d;
  }

  // current streak must end on today
  if (sorted.length === 0 || sorted[sorted.length - 1] !== todayStr) current = 0;

  return { currentStreak: current, longestStreak: longest || 0, lastChantedDate: sorted[sorted.length - 1] || null };
};

const getStreak = async (req, res) => {
  try {
    const user = await ensureUser(req.user.uid);
    const logs = await ChantingLog.find({ user: user._id }).select('date');
    const dates = logs.map((l) => l.date).sort();
    const todayStr = new Date().toISOString().slice(0, 10);
    const streaks = computeStreaks(dates, todayStr);
    res.json(streaks);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { addChant, getMonth, getStreak };

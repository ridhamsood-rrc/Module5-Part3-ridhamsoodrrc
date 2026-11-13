// Groups a user's transactions into a monthly report.
// Output (newest month first, transactions in date order within a month):
// [ { month: "November 2026", transactions: [ { type, amount, date }, ... ] }, ... ]
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function groupByMonth(transactions = []) {
  const groups = new Map();

  const sorted = transactions
    .map((t) => ({ ...t, date: new Date(t.date) }))
    .filter((t) => !Number.isNaN(t.date.getTime()))
    .sort((a, b) => a.date - b.date);

  for (const t of sorted) {
    const year = t.date.getUTCFullYear();
    const month = t.date.getUTCMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    if (!groups.has(key)) {
      groups.set(key, { month: `${MONTHS[month]} ${year}`, transactions: [] });
    }
    groups.get(key).transactions.push({
      type: t.type,
      amount: Number(t.amount),
      date: t.date.toISOString(),
    });
  }

  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([, group]) => group);
}

module.exports = { groupByMonth };

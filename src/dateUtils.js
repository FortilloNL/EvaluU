function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff, 0, 0, 0, 0);
}

export function getPeriods(type, now) {
  const periods = [];
  const count = type === "week" ? 10 : type === "month" ? 8 : 6;
  const monthNames = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  for (let i = count - 1; i >= 0; i--) {
    let start, end, label;
    if (type === "week") {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      start = getWeekStart(d);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
      const dd = start.getDate();
      const mm = monthNames[start.getMonth()];
      label = i === 0 ? "nu" : `${dd} ${mm}`;
    } else if (type === "month") {
      start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      label = i === 0 ? "nu" : `${monthNames[start.getMonth()]}`;
    } else {
      const currentQ = Math.floor(now.getMonth() / 3);
      const qMonth = (currentQ - i) * 3;
      const d = new Date(now.getFullYear(), qMonth, 1);
      start = new Date(d.getFullYear(), d.getMonth(), 1);
      end = new Date(d.getFullYear(), d.getMonth() + 3, 1);
      const q = Math.floor(start.getMonth() / 3) + 1;
      label = i === 0 ? "nu" : `Q${q} '${String(start.getFullYear()).slice(2)}`;
    }
    periods.push({ start, end, label });
  }
  return periods;
}

export function countValuesInPeriod(entries, start, end, field) {
  const counts = {};
  entries.forEach((entry) => {
    const ts = entry.id;
    if (ts >= start.getTime() && ts < end.getTime()) {
      const items = entry[field] || [];
      items.forEach((v) => {
        counts[v] = (counts[v] || 0) + 1;
      });
    }
  });
  return counts;
}

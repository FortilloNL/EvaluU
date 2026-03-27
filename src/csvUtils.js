export function csvEscape(val) {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function parseCSV(text) {
  const cleaned = text.replace(/^\uFEFF/, "");
  const rows = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < cleaned.length && cleaned[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        rows.push(current);
        current = "";
      } else if (ch === "\n" || (ch === "\r" && cleaned[i + 1] === "\n")) {
        rows.push(current);
        current = "";
        if (ch === "\r") i++;
        rows.push(null);
      } else {
        current += ch;
      }
    }
  }
  if (current || rows.length > 0) rows.push(current);

  const result = [];
  let row = [];
  for (const cell of rows) {
    if (cell === null) {
      if (row.length > 0) result.push(row);
      row = [];
    } else {
      row.push(cell);
    }
  }
  if (row.length > 0) result.push(row);

  if (result.length < 2) return [];
  const headers = result[0];
  return result.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = r[i] || ""; });
    return obj;
  });
}

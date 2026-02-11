export function getResourceStats(resources) {
  const list = Array.isArray(resources) ? resources : [];
  const total = list.length;

  const categories = new Set(
    list.map(item => item?.resource_type).filter(Boolean),
  ).size;

  const contributors = (() => {
    const set = new Set();
    for (const item of list) {
      const authors = typeof item?.authors === 'string' ? item.authors : '';
      authors
        .split(/🖊?/)
        .map(a => a.trim())
        .filter(Boolean)
        .forEach(a => set.add(a));
    }
    return set.size;
  })();

  const lastUpdated = (() => {
    let latest = null;
    for (const item of list) {
      const d = item?.date_last_updated ? new Date(item.date_last_updated) : null;
      if (!d || Number.isNaN(d.getTime())) continue;
      if (!latest || d > latest) latest = d;
    }
    if (!latest) return '-';
    try {
      return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(latest);
    } catch {
      return latest.toISOString().slice(0, 10);
    }
  })();

  return { total, categories, contributors, lastUpdated };
}

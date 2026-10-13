export function handSettings(value = {}) {
  const number = (v, fallback) => Number.isFinite(Number(v)) ? Number(v) : fallback;
  return {
    count: Math.max(0, Math.min(10, Math.round(number(value.count, 3)))),
    scale: Math.max(.55, Math.min(1.65, number(value.scale, 1))),
    fan: Math.max(0, Math.min(60, number(value.fan, 26))),
  };
}
export function fanGeometry(settings, baseWidth = 100, baseHeight = 140) {
  const { count, scale, fan } = handSettings(settings);
  const cardW = baseWidth * scale, cardH = baseHeight * scale, padding = 7;
  if (!count) return { width: Math.max(128, cardW), height: 48 * scale, cardW, cardH, cards: [] };
  const cards = Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : i / (count - 1) * 2 - 1;
    const angle = t * fan / 2, radians = angle * Math.PI / 180;
    const cx = (i - (count - 1) / 2) * cardW * .54, cy = t * t * 12 * scale;
    const halfW = (cardW * Math.cos(radians) + cardH * Math.abs(Math.sin(radians))) / 2;
    const halfH = (cardH * Math.cos(radians) + cardW * Math.abs(Math.sin(radians))) / 2;
    return { angle, cx, cy, halfW, halfH };
  });
  const minX = Math.min(...cards.map(p => p.cx - p.halfW)), maxX = Math.max(...cards.map(p => p.cx + p.halfW));
  const minY = Math.min(...cards.map(p => p.cy - p.halfH)), maxY = Math.max(...cards.map(p => p.cy + p.halfH));
  return {
    width: maxX - minX + padding * 2, height: maxY - minY + padding * 2, cardW, cardH,
    cards: cards.map(p => ({ ...p, left: p.cx - minX + padding - cardW / 2, top: p.cy - minY + padding - cardH / 2 })),
  };
}

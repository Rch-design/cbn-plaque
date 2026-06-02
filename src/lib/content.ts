/** Markdown metinden kisa ozet (anasayfa kartlari icin) */
export function pageExcerpt(content: string, max = 140): string {
  const plain = content
    .replace(/^#+\s.*$/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trim()}…`;
}

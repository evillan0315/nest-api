export function extractMarkdownTitle(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.*)/m);
  return match ? match[1].trim() : null;
}

/** Keep report text within model context limits (Gemini / LLM APIs). */
export function truncateReportForAnalysis(
  content: string,
  maxChars = 24_000
): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return (
    trimmed.slice(0, maxChars) +
    "\n\n[Report truncated for analysis due to length. Focus on the content above.]"
  );
}

export function removeExcessWhitespace(string) {
  return string.trim().replace(/\s+/g, " ")
}
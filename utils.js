export function removeExcessWhitespace(string) {
  return string.trim().replace(/\s+/g, " ")
}

export function titleCase(string) {
  return string.toLowerCase().replaceAll("_", " ").replace(/\b([a-z])/g, letter => letter.toUpperCase())
}

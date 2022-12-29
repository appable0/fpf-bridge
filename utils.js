export function removeExcessWhitespace(string) {
  return string.trim().replace(/\s+/g, " ")
}

export function titleCase(string) {
  return string.toLowerCase().replaceAll("_", " ").replace(/\b([a-z])/g, letter => letter.toUpperCase())
}

// taken from https://github.com/mat9369/skyblock-rain-timer/blob/main/index.html
export function secsToTime(num) {
  var hours = Math.floor(num / 3600);
  var minutes = Math.floor((num - (hours * 3600)) / 60);
  var seconds = num - (hours * 3600) - (minutes * 60);
  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }
  return hours + ':' + minutes + ':' + seconds;
}

export function hypixelRankColor(rank) {
  switch (rank) {
    case undefined:
      return [170, 170, 170]
    case "VIP":
    case "VIP+":
      return [85, 255, 85]
    case "MVP":
    case "MVP+":
      return [85, 255, 255]
    case "MVP++":
      return [255, 170, 0]
    default:
      return [85, 85, 255]
  }
}

export function randRange(min, max) {
  min = Math.ceil(min);
  max = Math.max(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
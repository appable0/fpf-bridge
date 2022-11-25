import { secsToTime } from "../utils.js";

// taken from https://github.com/mat9369/skyblock-rain-timer/blob/main/index.html
export function getRainData() {
    const UTCPrevThunderstorm = 1668474356000;
    const base = Math.floor((Date.now() - UTCPrevThunderstorm) / 1000);
    const thunderstorm = base % 19400;
    const rain = thunderstorm % 4850;
  
    let message = ""
  
    if (rain <= 3850) {
      message = `Raining: No, time until rain: ${secsToTime(3850 - rain)}`
    } else {
      message = `Raining: Yes, rain time left: ${secsToTime(4850 - rain)}, time until rain: ${secsToTime(8700 - rain)}`
    }
    if (thunderstorm < 18400) {
      message += ` || Thundering: No, time until thunder: ${secsToTime(18400 - thunderstorm)}`
    } else {
      message += ` || Thundering: Yes, thunder time left: ${secsToTime(19400 - thunderstorm)}, time until thunder: ${secsToTime(37800 - thunderstorm)}`
    }
    return message
  }
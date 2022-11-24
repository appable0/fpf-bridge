import { readFileSync } from "fs"
import jaroDistance from "jaro-winkler"
import fetch from "node-fetch"

let cachedBazaarData = {}
let lastBazaarUpdate = 0

let bazaarNames = JSON.parse(readFileSync("./data/bazaar.json", "utf-8"))
let expandedNames = []
bazaarNames.forEach(product => {
  expandedNames.push(...([product.name, ...product.aliases].map(alias => { return {id: product.id, name: product.name, alias: alias.toUpperCase()} })))
})

function jaroScore(a, b) {
  return jaroDistance(a, b)
}

function closestBazaarProduct(phrase) {
  let uppercase = phrase.toUpperCase()
  let perfectMatches = expandedNames.filter(product => product.alias.includes(uppercase))
  let bestMatch = (perfectMatches.length == 1) 
    ? perfectMatches[0] 
    : expandedNames.sort((a, b) => jaroScore(uppercase, b.alias) - jaroScore(uppercase, a.alias))[0] 
  return { id: bestMatch.id, name: bestMatch.name }
}

export function getBazaarItemPrices(args) {
  let formatter = Intl.NumberFormat("en", { notation: "compact" })
  let name = args.join(" ")
  let { id: bestId, name: bestName } = closestBazaarProduct(name)
  let bazaarData = cachedBazaarData[bestId]
  let buyPrice = bazaarData.quick_status.buyPrice
  let sellPrice = bazaarData.quick_status.sellPrice
  return `Bazaar data for ${bestName}: insta-buy: ${formatter.format(buyPrice)}, insta-sell: ${formatter.format(sellPrice)}`
}

(async function updateBazaarCache() {
  try {
    const bazaarResponse = await fetch(`https://api.hypixel.net/skyblock/bazaar`)
    if (bazaarResponse.status !== 200) return

    const bazaarJson = await bazaarResponse.json()
    lastBazaarUpdate = bazaarJson["lastUpdated"]
    cachedBazaarData = bazaarJson["products"]
  } catch (e) {
    console.error("Error fetching bazaar data.")
    console.error(e)
  }

  const e = Date.now() - lastBazaarUpdate
  setTimeout(updateBazaarCache, 60000)
})();



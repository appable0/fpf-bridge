import fetch from "node-fetch"
import jaroDistance from "jaro-winkler"
import { titleCase } from "../utils.js"
import { readFileSync } from "fs"
import exp from "constants"

let cachedLowestBins = {}

// get full names from api data + additional data
const auctionAliases = JSON.parse(readFileSync("./data/auctionAliases.json", "utf-8"))
const itemResponse = await fetch(`https://api.hypixel.net/resources/skyblock/items`)
const itemResults = await itemResponse.json()

let itemApiNames = Object.fromEntries(itemResults.items.map(itemData => {
  return [itemData.id, { id: itemData.id, name: itemData.name, aliases: [] }]
}))

let itemRemappings = Object.entries(auctionAliases).map(([id, aliases]) => {
  let aliasArray = aliases.split(",")
  return {
    id: id,
    name: titleCase(aliasArray[0]),
    aliases: aliasArray.slice(1)?.map(alias => titleCase(alias))
  }
})

const remapped = Object.values({ ...itemApiNames, ...itemRemappings })
const fullExpandedNames = []
remapped.forEach(product => {
  fullExpandedNames.push(...([product.name, ...product.aliases].map(alias => { return { id: product.id, name: product.name, alias: alias.toUpperCase() } })))
})

// names that are actually in lbin, rather than items that can't actually be sold
let expandedNames = fullExpandedNames

function closestAuctionProduct(phrase) {
  let uppercase = phrase.toUpperCase()
  let perfectMatches = expandedNames.filter(product => product.alias.includes(uppercase))
  let bestMatch = (perfectMatches.length == 1)
    ? perfectMatches[0]
    : expandedNames.sort((a, b) => jaroDistance(uppercase, b.alias) - jaroDistance(uppercase, a.alias))[0]
  return { id: bestMatch.id, name: bestMatch.name }
}

export function getLowestBin(args) {
  let formatter = Intl.NumberFormat("en", { notation: "compact" })
  let name = args.join(" ")
  let { id: bestId, name: bestName } = closestAuctionProduct(name)
  let lowestBin = cachedLowestBins[bestId]
  return `Lowest BIN for ${bestName} is ${formatter.format(lowestBin)}`
}

(async function updateBinCache() {
  let lastBinUpdate = 0
  try {
    const binResponse = await fetch(`https://api.hypixel.net/skyblock/auctions`)
    if (binResponse.status === 200) {
      const binJson = await binResponse.json()
      lastBinUpdate = binJson["lastUpdated"]
    }

    const auctionResponse = await fetch(`https://moulberry.codes/lowestbin.json`)
    if (auctionResponse.status === 200) {
      cachedLowestBins = await auctionResponse.json()
      let binNames = Object.keys(cachedLowestBins)
      expandedNames = fullExpandedNames.filter(nameData => binNames.includes(nameData.id))
    }
  } catch (e) {
    console.error("Error fetching auction data.")
    console.error(e)
  }

  // hypixel updates the api site a bit later than the actual auction data, ~8s is what I've seen
  setTimeout(updateBinCache, Math.max(0, lastBinUpdate + 68500 - Date.now()))
})();


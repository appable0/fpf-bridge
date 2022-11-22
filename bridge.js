import * as dotenv from "dotenv"
import auctionMappings from "./auction-data.json" assert {type: 'json'}
import { numberFormatRegex } from "./reggies.js"
import { DiscordBot } from "./DiscordBot.js"
import { MinecraftController } from "./MinecraftController.js"
import fetch from "node-fetch"

dotenv.config()

const discordBot = new DiscordBot(process.env.DISCORD_TOKEN, process.env.GUILD_CHANNEL_ID)
const minecraftBot = new MinecraftController()

let cachedLowestBins = {}
let lastBinUpdate = 0

discordBot.on("message", async (message) => {
  const nick = message.member.displayName
  let content = message.cleanContent
  const attachment = message.attachments.at(0)
  if (attachment != null) {
    content += ` ${attachment.url}`
  }

  if (content.startsWith("d.")) {
    content = content.replace(/^.{2}/g, 'd_')
  }

  if (message.reference != null) {
    const repliedTo = await message.fetchReference()
    const repliedToMember = repliedTo.member?.displayName
    content = `(to ${repliedToMember}) ${content}`
  }

  minecraftBot.chatFromDiscord(nick, content)
  const commandResponse = await prepareCommandResponse(content, "Comm" /*this is just for testing cuz we only have access, need to use discord role*/)

  if (commandResponse != null) {
    minecraftBot.chatBot(commandResponse)
    discordBot.sendEmbedWithAuthor(process.env.MC_USERNAME, process.env.MC_USERNAME, commandResponse)
  }
})

minecraftBot.on("guildChatReceived", async (guildChatMessage) => {
  await discordBot.onGuildChat(guildChatMessage)
  const commandResponse = await prepareCommandResponse(guildChatMessage.content, guildChatMessage.guildRank)
  if (commandResponse != null) {
    minecraftBot.chatBot(commandResponse)
    discordBot.sendEmbedWithAuthor(process.env.MC_USERNAME, process.env.MC_USERNAME, commandResponse)
  }
})

minecraftBot.on("mcJoined", async (member) => {
  await discordBot.onMcJoined(member)
})

minecraftBot.on("mcLeft", async (member) => {
  await discordBot.onMcLeft(member)
})

minecraftBot.on("botLeft", (reason) => {
  discordBot.onBotLeft(reason)
})

minecraftBot.on("botJoined", () => {
  discordBot.onBotJoined()
})

async function prepareCommandResponse(content, rank) {
  const [command, ...args] = content.split(" ")

  if (!command.startsWith("d_")) return

  const commandName = command.substring(2)
  switch (commandName) {
    case "help": {
      return "Available commands: d_help, d_ping, d_lbin, d_rain, d_rlb(admin only)"
    }

    case "ping": {
      return "Pong!"
    }

    case "lbin": {
      // ~need to improve this a lot~ i don't think we need to improve this anymore :)
      let name = args.join("_").toUpperCase()
      let lbin = "unknown"
      if (Date.now() - lastBinUpdate > 60000) {
        try {
          const auctionResponse = await fetch(`https://moulberry.codes/lowestbin.json`)
          if (auctionResponse.status === 200) {
            cachedLowestBins = remapLowestBins(await auctionResponse.json())
          }
        } catch (e) {
          console.error(e)
          return "Error fetching data."
        }
      }

      for (const [key, value] of Object.entries(cachedLowestBins)) {
        for (const alias of key.split(",")) {
          if (alias.includes(name)) {
            name = key
            lbin = value
            break
          }
        }
      }

      if (lbin === "unknown") return "Item not found."
      return `Lowest BIN for ${name} is ${lbin}`
    }

    case "rain": {
      return getRainData()
    }

    case "rlb": {
      if (rank === "Comm" || rank === "GM") {
        minecraftBot.bot.disconnect()
      } else {
        return "No permission"
      }
      return null
    }

    default: {
      return "Unknown command, try d_help"
    }
  }
}

function remapLowestBins(lbins) {
  const remapped = {}
  for (let [key, value] of Object.entries(lbins)) {
    key = auctionMappings[key] ?? key
    remapped[key] = value.toString().replace(numberFormatRegex, ",")
  }
  return remapped
}

// taken from https://github.com/mat9369/skyblock-rain-timer/blob/main/index.html
function secsToTime(num) {
  var hours = Math.floor(num / 3600);
  var minutes = Math.floor((num - (hours * 3600)) / 60);
  var seconds = num - (hours * 3600) - (minutes * 60);
  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }
  return hours + ':' + minutes + ':' + seconds;
}

// taken from https://github.com/mat9369/skyblock-rain-timer/blob/main/index.html
function getRainData() {
  const UTCPrevThunderstorm = 1668474356000;
  const UTCNow = new Date().getTime();
  const base = Math.floor((UTCNow - UTCPrevThunderstorm) / 1000);
  const thunderstorm = base % ((3850 + 1000) * 4);
  const rain = thunderstorm % (3850 + 1000);

  let message = ""

  if (rain <= 3850) {
    message = `Raining: No, time until rain: ${secsToTime(3850 - rain)}`
  } else {
    message = `Raining: Yes, rain time left: ${secsToTime(3850 + 1000 - rain)}, time until rain: ${secsToTime(3850 + 1000 - rain + 3850)}`
  }
  if (thunderstorm < (3850 * 4 + 1000 * 3)) {
    message += ` || Thundering: No, time until thunder: ${secsToTime(3850 * 4 + 1000 * 3 - thunderstorm)}`
  } else {
    message += ` || Thundering: Yes, thunder time left: ${secsToTime(3850 * 4 + 1000 * 4 - thunderstorm)}, time until thunder: ${secsToTime(3850 * 4 + 1000 * 4 - thunderstorm + 3850 * 4 + 1000 * 3)}`
  }
  return message
}
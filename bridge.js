import * as dotenv from "dotenv"
import { DiscordBot } from "./DiscordBot.js"
import { MinecraftController } from "./MinecraftController.js"
dotenv.config()

const discordBot = new DiscordBot(process.env.DISCORD_TOKEN, process.env.GUILD_CHANNEL_ID)
const minecraftBot = new MinecraftController()

let cachedLowestBins = {}
let lastBinUpdate = 0

discordBot.client.on("messageCreate", async (message) => {
  if (message.author.bot) return
  if (message.channel.id !== discordBot.channelId) return

  const nick = message.member.displayName
  let content = message.content
  const attachment = message.attachments.at(0)
  if (attachment != null) {
    content += ` ${attachment.url}`
  }

  if (content.startsWith("d.")) {
    content = content.replace(/^.{2}/g, 'd_')
  }
  minecraftBot.chatFromDiscord(nick, content)
  const commandResponse = await prepareCommandResponse(content, "Comm" /*this is just for testing cuz we only have access, need to use discord role*/)
  if (commandResponse != null) {
    minecraftBot.chatBot(commandResponse)
    discordBot.sendEmbed(process.env.MC_USERNAME, process.env.MC_USERNAME, commandResponse)
  }
})

minecraftBot.on("guildChatReceived", async (guildChatMessage) => {
  await discordBot.onGuildChat(guildChatMessage)
  const commandResponse = await prepareCommandResponse(guildChatMessage.content, guildChatMessage.guildRank)
  if (commandResponse != null) {
    minecraftBot.chatBot(commandResponse)
    discordBot.sendEmbed(process.env.MC_USERNAME, process.env.MC_USERNAME, commandResponse)
  }
})

minecraftBot.on("mcJoined", async (member) => {
  await discordBot.onMcJoined(member)
})

minecraftBot.on("mcLeft", async (member) => {
  await discordBot.onMcLeft(member)
})

async function prepareCommandResponse(content, rank) {
  const [command, ...args] = content.split(" ")

  if (!command.startsWith("d_") && !command.startsWith("d.")) return

  const commandName = command.substring(2)
  switch (commandName) {
    case "help": {
      return "Available commands: d_help, d_ping, d_lbin, d_rlb(admin only)"
    }

    case "ping": {
      return "Pong!"
    }

    case "lbin": {
      // need to improve this a lot
      let name = args.join("_").toUpperCase()
      if (Date.now() - lastBinUpdate > 60000) {
        try {
          const auctionResponse = await fetch(`https://moulberry.codes/lowestbin.json`)
          if (auctionResponse.status === 200) {
            cachedLowestBins = await auctionResponse.json()
          }
        } catch (e) {
          console.error("Error fetching lowest bins")
        }
      }
      let lbin = cachedLowestBins[name] ?? "unknown"
      if (lbin === "unknown") {
        for (const [key, value] of Object.entries(cachedLowestBins)) {
          if (key.includes(name)) {
            name = key
            lbin = value
            break
          }
        }
      }
      return `Lowest BIN for ${name} is ${lbin.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}`
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
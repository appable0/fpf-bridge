import * as dotenv from "dotenv"
import { DiscordBot } from "./DiscordBot.js"
import { MinecraftController } from "./MinecraftController.js"
import { removeExcessWhitespace, randRange } from "./utils.js"
import { getBazaarItemPrices } from "./commands/bazaar.js"
import { getLowestBin } from "./commands/auction.js"
import { getElectionData } from "./commands/election.js"
import { getRainData } from "./commands/rain.js"
import { cleanContent } from "./utils.js"

dotenv.config()

const discordBot = new DiscordBot(process.env.DISCORD_TOKEN, process.env.GUILD_CHANNEL_ID)
const minecraftBot = new MinecraftController()

discordBot.on("message", async (message) => {
  const nick = message.member.displayName
  let content = cleanContent(message.cleanContent)
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
  const hasRole = message.member.roles.cache.some(role => role.id === '1022372012041195521' /*Admin role*/)
  const commandResponse = await prepareCommandResponse(content, hasRole ? "Comm" : "")

  if (commandResponse != null) {
    minecraftBot.chatBot(commandResponse)
    discordBot.sendEmbedWithAuthor(process.env.MC_USERNAME, process.env.MC_USERNAME, commandResponse, {text: null}, [85, 85, 255])
  }
})

minecraftBot.on("guildChatReceived", async (guildChatMessage) => {
  await discordBot.onGuildChat(guildChatMessage)
  const commandResponse = await prepareCommandResponse(guildChatMessage.content, guildChatMessage.guildRank)
  if (commandResponse != null) {
    minecraftBot.chatBot(commandResponse)
    discordBot.sendEmbedWithAuthor(process.env.MC_USERNAME, process.env.MC_USERNAME, commandResponse, {text: null}, [85, 85, 255])
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
  let normalizedContent = removeExcessWhitespace(content)
  const p = process.env.PREFIX
  if (!normalizedContent.startsWith(p)) return
  const [command, ...args] = normalizedContent.split(" ")
  console.log(`${(new Date()).toISOString()} - BRIDGE: Preparing command response for ${normalizedContent}`)

  const commandName = command.substring(p.length)
  switch (commandName) {
    case "help": {
      return `Available commands: ${p}help, ${p}ping, ${p}lbin <item>, ${p}bz <item>, ${p}rain, ${p}election/mayor, ${p}rlb(admin only), ${p}8ball, ${p}pick <args>`
    }

    case "ping": {
      return "Pong!"
    }

    case "lbin": {
      if (args.length === 0) return "No item specified"
      return getLowestBin(args)
    }

    case "bz": {
      if (args.length === 0) return "No item specified"
      return getBazaarItemPrices(args)
    }

    case "rain": {
      return getRainData()
    }

    case "mayor":
    case "election": {
      return getElectionData(args)
    }

    case "rlb": {
      if (rank === "Comm" || rank === "GM") {
        minecraftBot.bot.disconnect()
        return null
      } else {
        return "No permission"
      }
    }

    case "8ball": {
      if (args.length === 0) {
        return "You didn't ask anything"
      }
      const value = randRange(1, 5)
      switch (value) {
        case 1: {
          return "Yes"
        }
        case 2: {
          return "No"
        }
        case 3: {
          return "Maybe"
        }
        case 4: {
          return "Ask again later"
        }
        case 5: {
          return "Why are you asking me this"
        }
      }
    }

    case "pick": {
      return "I choose " + args[randRange(0, args.length - 1)]
    }

    default: {
      return `Unknown command, try ${p}help`
    }
  }
}


import * as dotenv from "dotenv"
import { DiscordBot } from "./discord/DiscordBot.js"
import { MinecraftController } from "./minecraft/MinecraftController.js"
import { removeExcessWhitespace } from "./utils.js"
import { getBazaarItemPrices } from "./commands/bazaar.js"
import { getLowestBin } from "./commands/auction.js"
import { getElectionData } from "./commands/election.js"
import { getRainData } from "./commands/rain.js"

import EventEmitter from "events"
import TypedEmitter from "typed-emitter"
import { assertNotNull, BridgeEvents } from "./types"

dotenv.config()
export const bridgeEmitter = new EventEmitter() as TypedEmitter<BridgeEvents>


const mcUsername = assertNotNull(process.env.MC_USERNAME)
const discordToken = assertNotNull(process.env.DISCORD_TOKEN)
const guildChannelId = assertNotNull(process.env.GUILD_CHANNEL_ID)

const discordBot = new DiscordBot(discordToken, guildChannelId)
const minecraftBot = new MinecraftController(mcUsername)

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
    discordBot.sendEmbedWithAuthor(mcUsername, mcUsername, commandResponse, {text: null}, [85, 85, 255])
  }
})

bridgeEmitter.on("guildChat", async (username, content, hypixelRank, guildRank) => {
  await discordBot.onGuildChat(username, content, hypixelRank, guildRank)
  const commandResponse = await prepareCommandResponse(content, guildRank)
  if (commandResponse != null) {
    minecraftBot.chatBot(commandResponse)
    discordBot.sendEmbedWithAuthor(mcUsername, mcUsername, commandResponse, {text: null}, [85, 85, 255])
  }
})

bridgeEmitter.on("mcJoined", async (member) => {
  await discordBot.onMcJoined(member)
})

bridgeEmitter.on("mcLeft", async (member) => {
  await discordBot.onMcLeft(member)
})

bridgeEmitter.on("botLeft", (reason) => {
  discordBot.onBotLeft(reason)

})

bridgeEmitter.on("botJoined", () => {
  discordBot.onBotJoined()

})

async function prepareCommandResponse(content: string, rank?: string) {
  let normalizedContent = removeExcessWhitespace(content)
  const p = process.env.PREFIX ?? "_"
  if (!normalizedContent.startsWith(p)) return
  const [command, ...args] = normalizedContent.split(" ")
  console.log(`${(new Date()).toISOString()} - BRIDGE: Preparing command response for ${normalizedContent}`)

  const commandName = command.substring(p.length)
  switch (commandName) {
    case "help": {
      return `Available commands: ${p}help, ${p}ping, ${p}lbin, ${p}bz, ${p}rain, ${p}election/mayor, ${p}rlb(admin only)`
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
      } else {
        return "No permission"
      }
      return null
    }

    default: {
      return `Unknown command, try ${p}help`
    }
  }
}


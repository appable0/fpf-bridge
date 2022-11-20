import * as dotenv from "dotenv"
import { DiscordBot } from "./discordBot.js"
import { MinecraftBot } from "./mcBot.js"
import { guildMessageRegex, joinedLobbyRegex } from "./reggies.js"
dotenv.config()

const discordBot = new DiscordBot(process.env.DISCORD_TOKEN, process.env.GUILD_CHANNEL_ID)
const minecraftBot = new MinecraftBot(process.env.MC_EMAIL, process.env.MC_PASSWORD)

discordBot.client.on("messageCreate", (message) => {
  if (message.author.bot) return
  if (message.channel.id !== discordBot.channelId) return

  const nick = message.member.displayName
  let content = message.content
  const attachment = message.attachments.at(0)
  if (attachment != null) {
    content += ` ${attachment.url}`
  }

  minecraftBot.chat(nick, content)
})

minecraftBot.client.on("messagestr", async (message) => {
  if (joinedLobbyRegex.test(message)) {
    minecraftBot.client.retries = 0
    minecraftBot.limbo()
  }

  const messageGroups = message.match(guildMessageRegex)?.groups
  if (messageGroups == null || messageGroups.name == process.env.MC_USERNAME) return

  await discordBot.chat(messageGroups.hypixelRank, messageGroups.name, messageGroups.guildRank, messageGroups.content)
})

minecraftBot.client.on("end", () => {
  // Having a delay of 1 second by default (pow(2,0) == 1) is a good idea.
  reconnectionDelay = Math.pow(2, minecraftBot.client.retries)
  minecraftBot.client.retries++
  setTimeout(() => {
    minecraftBot.client.connect()
  }, reconnectionDelay * 1000)
})

import * as dotenv from "dotenv"
import { DiscordBot } from "./discordBot.js"
import { MinecraftBot } from "./mcBot.js"
import { guildMessageRegex, joinedLobbyRegex } from "./reggies.js"
dotenv.config()

const discordBot = new DiscordBot(process.env.DISCORD_TOKEN, process.env.GUILD_CHANNEL_ID)
const mcBot = new MinecraftBot(process.env.MC_EMAIL, process.env.MC_PASSWORD)

discordBot.client.on("messageCreate", (message) => {
  if (message.author.bot) return
  if (message.channel.id === discordBot.channelId) {
    const nick = message.member.displayName
    const content = message.content
    mcBot.chat(nick, content)
  }
})

mcBot.client.on("messagestr", async (message) => {
  const messageGroups = message.match(guildMessageRegex)?.groups
  if (messageGroups != null && messageGroups.name != process.env.MC_USERNAME) {
    await discordBot.chat(messageGroups.name, messageGroups.hypixelRank, messageGroups.guildRank, messageGroups.content)
  }
  if (joinedLobbyRegex.test(message)) {
    mcBot.limbo()
  }
})






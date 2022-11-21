import * as dotenv from "dotenv"
import { DiscordBot } from "./DiscordBot.js"
import { MinecraftController } from "./MinecraftController.js"
dotenv.config()

const discordBot = new DiscordBot(process.env.DISCORD_TOKEN, process.env.GUILD_CHANNEL_ID)
const minecraftBot = new MinecraftController()

discordBot.client.on("messageCreate", (message) => {
  if (message.author.bot) return
  if (message.channel.id !== discordBot.channelId) return

  const nick = message.member.displayName
  let content = message.content
  const attachment = message.attachments.at(0)
  if (attachment != null) {
    content += ` ${attachment.url}`
  }

  if (content == "d.rlb") {
    minecraftBot.bot.disconnect()
  } else {
    minecraftBot.chat(nick, content)
  }
})

minecraftBot.on("guildChatReceived", async (guildChatMessage) => {
  await discordBot.onGuildChat(guildChatMessage)
})

minecraftBot.on("mcJoined", async (member) => {
  await discordBot.onMcJoined(member)
})

minecraftBot.on("mcLeft", async (member) => {
  await discordBot.onMcLeft(member)
})




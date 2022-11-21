import Discord from "discord.js"
import sharp from "sharp"
import { skin } from "./skins.js"
const { Client: Client, GatewayIntentBits: GatewayIntentBits, EmbedBuilder: EmbedBuilder, AttachmentBuilder: AttachmentBuilder } = Discord


export class DiscordBot {
  constructor(token, channelId) {
    this.channelId = channelId
    this.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })
    this.client.login(token)
  }

  async onMcJoined(member) {
    this.sendEmbed(member, member, "**joined.**")
  }

  async onMcLeft(member) {
    this.sendEmbed(member, member, "**left.**")
  }

  async onGuildChat(message) {
    let author = `[${message.hypixelRank}] ${message.name}`
    if (message.guildRank != null) {
      author += ` [${message.guildRank}]`
    }
    this.sendEmbed(message.name, author, message.content)
  }

  async sendEmbed(username, author, content) {
    if (!this.client.isReady) return
    let channel = this.client.channels.cache.get(this.channelId)
    let skinUpscaled = await sharp(await skin(username)).resize(128, 128, {kernel: sharp.kernel.nearest}).toBuffer()
    let file = new AttachmentBuilder(skinUpscaled, {name: "attachment.png"})
    let embed = new EmbedBuilder()
      .setAuthor({
        name: author,
        iconURL: "attachment://attachment.png"
      })
      .setDescription(content)
    channel.send({embeds: [embed], files: [file]})
  }
}





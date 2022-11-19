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

  async chat(name, hypixelRank, guildRank, content) {
    if (!this.client.isReady) return
    const channel = this.client.channels.cache.get(this.channelId)
    const skinUpscaled = await sharp(await skin(name)).resize(128, 128, {kernel: sharp.kernel.nearest}).toBuffer()
    const file = new AttachmentBuilder(skinUpscaled, {name: "attachment.png"})
    const embed = new EmbedBuilder()
      .setAuthor({
        name: (guildRank != null) ? `${name} (${guildRank})` : `${name}`,
        iconURL: "attachment://attachment.png"
      })
      .setDescription(content)
    channel.send({embeds: [embed], files: [file]})
  }
}





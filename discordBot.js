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

  async chat(hypixelRank, name, guildRank, content) {
    let author = `[${hypixelRank}] ${name}`
    if (guildRank != null) {
      author += ` [${guildRank}]`
    }
    if (!this.client.isReady) return
    var channel = this.client.channels.cache.get(this.channelId)
    var skinUpscaled = await sharp(await skin(name)).resize(128, 128, {kernel: sharp.kernel.nearest}).toBuffer()
    var file = new AttachmentBuilder(skinUpscaled, {name: "attachment.png"})
    var embed = new EmbedBuilder()
      .setAuthor({
        name: author,
        iconURL: "attachment://attachment.png"
      })
      .setDescription(content)
    channel.send({embeds: [embed], files: [file]})
  }
}





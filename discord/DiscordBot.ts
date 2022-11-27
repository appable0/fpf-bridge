import Discord from "discord.js"
import * as sharp from "sharp" 
import { skin } from "../skins.js"
import { imageLinkRegex } from "../reggies.js"
const { TextChannel, Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = Discord
import { EventEmitter } from "events"
import { hypixelRankColor } from "../utils.js"

export class DiscordBot extends EventEmitter {
  channelId: string
  client: Discord.Client

  constructor(token: string, channelId: string) {
    super()
    this.channelId = channelId
    this.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })
    this.client.login(token)

    this.client.on("messageCreate", async (message) => {
      if (message.author.bot) return
      if (message.channel.id !== this.channelId) return
      this.emit("message", message)
    })
  }


  async onMcJoined(member: string) {
    this.sendEmbedWithAuthor(member, member, "**joined.**", null, "Green")
  }

  async onMcLeft(member: string) {
    this.sendEmbedWithAuthor(member, member, "**left.**", null, "Red")
  }

  onBotJoined() {
    this.sendEmbed("Status", ":white_check_mark: Bridge online.", null, "Green")
  }

  onBotLeft(reason: string) {
    this.sendEmbed("Status", ":x: Bridge offline.", reason, "Red")
  }

  async onGuildChat(username: string, content: string, hypixelRank?: string, guildRank?: string) {
    this.sendEmbedWithAuthor(
      username, 
      username, 
      content, 
      {text: guildRank ?? null}, 
      hypixelRankColor(hypixelRank)
    )
  }

  sendEmbed(title: string, content: string, footer: string | null, color: Discord.ColorResolvable) {
    if (!this.client.isReady) return
    let channel = this.client.channels.cache.get(this.channelId)
    if (channel?.type != Discord.ChannelType.GuildText) return
    let embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(color)
      .setDescription(content)
      .setFooter({ text: footer ?? "" })
      .setTimestamp()
    channel.send({ embeds: [embed] })
  }

  async sendEmbedWithAuthor(username: string, author: string, content, footer, color) {
    if (!this.client.isReady) return
    const channel = this.client.channels.cache.get(this.channelId)
    if (channel?.type != Discord.ChannelType.GuildText) return

    try {
      const skinUpscaled = await sharp(await skin(username)).resize(128, 128, { kernel: sharp.kernel.nearest }).toBuffer()
      const file = new AttachmentBuilder(skinUpscaled, { name: "attachment.png" })
      const image = content.match(imageLinkRegex)
      const foundImage = image != null && image.length == 1
      
      if (foundImage) {
        content = content.replace(imageLinkRegex, "")
      }
  
      const embed = new EmbedBuilder()
        .setAuthor({
          name: author,
          iconURL: "attachment://attachment.png"
        })
        .setTimestamp()
        .setColor(color)
        .setFooter(footer)
      if (foundImage) {
        embed.setImage(image[0])
      }
  
      if (content.length > 0) {
        embed.setDescription(content)
      }
  
      channel.send({ embeds: [embed], files: [file] })
    } catch (e) {
      console.error(`Error while sending message from ${username} ${author} with content ${content}!`)
      console.error(e)
    }
  }
}



import Discord from "discord.js"
import sharp from "sharp"
import { skin } from "./skins.js"
import { imageLinkRegex } from "./reggies.js"
const { Client: Client, GatewayIntentBits: GatewayIntentBits, EmbedBuilder: EmbedBuilder, AttachmentBuilder: AttachmentBuilder } = Discord
import { EventEmitter } from "events"


export class DiscordBot extends EventEmitter {
  constructor(token, channelId) {
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


  async onMcJoined(member) {
    this.sendEmbedWithAuthor(member, member, "**joined.**")
  }

  async onMcLeft(member) {
    this.sendEmbedWithAuthor(member, member, "**left.**")
  }

  async onBotJoined() {
    this.sendEmbed("Status", ":white_check_mark: Bridge online.", null)
  }

  async onBotLeft(reason) {
    this.sendEmbed("Status", ":x: Bridge offline.", reason)
  }

  async onGuildChat(message) {
    let author = `${message.name}`
    if (message.hypixelRank != null) {
      author = `[${message.hypixelRank}] ${author}`
    }
    if (message.guildRank != null) {
      author += ` [${message.guildRank}]`
    }

    this.sendEmbedWithAuthor(message.name, author, message.content)
  }

  sendEmbed(title, content, footer) {
    if (!this.client.isReady) return
    let channel = this.client.channels.cache.get(this.channelId)
    let embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(content)
      .setFooter({ text: footer })
      .setTimestamp()
    channel.send({ embeds: [embed] })
  }

  async sendEmbedWithAuthor(username, author, content) {
    if (!this.client.isReady) return
    const channel = this.client.channels.cache.get(this.channelId)
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



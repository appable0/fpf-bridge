import Discord from "discord.js"
const { Client: Client, GatewayIntentBits: GatewayIntentBits } = Discord


export class DiscordBot {
  constructor(token, channelId) {
    this.channelId = channelId
    this.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })
    this.client.login(token)
  }

  sendMinecraftMessage(name, hypixelRank, guildRank, content) {
    if (!this.client.isReady) return
    const channel = this.client.channels.cache.get(this.channelId)
    channel.send(`[${hypixelRank ?? "NON"}] ${name} [${guildRank ?? "None"}]: ${content}`)
  }
}





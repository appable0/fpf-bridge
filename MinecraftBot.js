import mineflayer from "mineflayer"

/**
 * Very lightweight wrapper around Mineflayer bot that allows for disconnect and reconnect without dropping listeners.
 */
export class MinecraftBot {
  constructor(manager) {
    this.manager = manager
  }

  connect() {
    console.log(`${(new Date()).toISOString()} - BOT: connecting to server.`)

    this.client = mineflayer.createBot({
      host: "mc.hypixel.net",
      port: 25565,
      username: process.env.MC_USERNAME,
      auth: "microsoft",
      version: "1.17.1",
      checkTimeoutInterval: 10000
    })

    this.client.on("messagestr", (message) => {
      this.manager.onChat(message)
    })

    this.client.on("end", (reason) => {
      this.manager.onEnd(reason)
    })
  }

  disconnect() {
    console.log(`${(new Date()).toISOString()} - BOT: disconnecting from server.`)
    this.client.quit()
  }

  chat(message) {
    this.client.chat(message)
  }
}


import mineflayer from "mineflayer"

export class MinecraftBot {
  constructor() {
    this.client = mineflayer.createBot({
      host: "mc.hypixel.net",
      port: 25565,
      auth: "microsoft",
      version: "1.17.1"
    })
    
  }

  limbo() {
    this.client.chat("/ac §")
  }
  
  sendDiscordMessage(name, message) {
    this.client.chat(`/gc ${name}: ${message}`)
  }
}





/*
setTimeout(() => {
  bot.quit()
}, 20000)
*/

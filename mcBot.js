import mineflayer from "mineflayer"

const timeout = 1000

export class MinecraftBot {
  constructor() {
    this.messageQueue = []
    this.lastSentTime = Date.now()
    this.queueLimiter = setInterval(() => {
      this.processQueue()
    }, 50)
    this.connect()
    this.retries = 0
  }

  connect() {
    this.messageQueue = []
    this.client = mineflayer.createBot({
      host: "mc.hypixel.net",
      port: 25565,
      username: "Fishre",
      auth: "microsoft",
      version: "1.17.1"
    })
  }

  close() {
    this.client.quit()
    clearInterval(this.queueLimiter)
  }

  processQueue() {
    if (this.messageQueue.length == 0) return
    if ((Date.now() - this.lastSentTime) > timeout) {
      this.lastSentTime = Date.now()
      const message = this.messageQueue.shift()
      this.client.chat(message)
    }
  }

  limbo() {
    this.messageQueue.push("§")
  }
  
  chat(name, message) {
    this.messageQueue.push(`/gc ${name}: ${message}`)
  }


}





/*
setTimeout(() => {
  bot.quit()
}, 20000)
*/

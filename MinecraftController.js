import { MinecraftBot } from "./MinecraftBot.js"
import { joinedLobbyRegex, guildMessageRegex, mcJoinedRegex, mcLeftRegex } from "./reggies.js"
import { EventEmitter } from "events"

const timeout = 1000

export class MinecraftController extends EventEmitter {
  constructor() {
    super()
    this.bot = new MinecraftBot(this)
    this.bot.connect()

    this.messageQueue = []
    this.queueLimiter = setInterval(() => {
      this.processQueue()
    }, 50)

    this.retries = 0
    this.ready = false // some state for later possibly
  }

  async onChat(message) {
    console.log(`${(new Date()).toISOString()} - CONTROLLER: Chat message received: ${message}`)
    if (joinedLobbyRegex.test(message)) {
      this.ready = true
      this.retries = 0
      this.limbo()
    }
  
    if (guildMessageRegex.test(message)) {
      const messageGroups = message.match(guildMessageRegex)?.groups
      if (messageGroups.name != process.env.MC_USERNAME) {
        this.emit("guildChatReceived", messageGroups)
      }
    } else if (mcJoinedRegex.test(message)) {
      this.emit("mcJoined", message.match(mcJoinedRegex).groups.name)
    } else if (mcLeftRegex.test(message)) {
      this.emit("mcLeft", message.match(mcLeftRegex).groups.name)
    }
  }

  onEnd(reason) {
    console.log(`${(new Date()).toISOString()} - CONTROLLER: Bot disconnected from server. Reason: ${reason}`)
    this.ready = false
    this.messageQueue = []
    this.retries++
    if (this.retries > 5) {
      this.close()
    } else {
      setTimeout(() => {
        console.log(`${(new Date()).toISOString()} - CONTROLLER: Reconnecting (attempt #${this.retries})`)
        this.bot.connect()
      }, this.retries * 1000)
    }
  }

  // queue management
  processQueue() {
    if (this.messageQueue.length == 0) return
    if (this.messageQueue.length > 10) this.messageQueue.slice(0, 10)
    if (Date.now() - this.lastSentTime < timeout) return
    this.lastSentTime = Date.now()
    const message = this.messageQueue.shift()
    this.bot.chat(message)
  }

  close() {
    clearInterval(this.queueLimiter)
  }

  // chat abstractions
  chatRaw(message) {
    this.messageQueue.push(message)
  }

  chatFromDiscord(name, message) {
    this.chatRaw(`/gc ${name}: ${message}`)
  }

  chatBot(message) {
    this.chatRaw(`/gc ${message}`)
  }

  limbo() {
    this.chatRaw("§")
  }
}
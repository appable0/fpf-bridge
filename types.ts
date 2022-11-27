import { Message as DiscordMessage } from "discord.js"

export type BridgeEvents = {
  guildChat: (username: string, content: string, hypixelRank?: string, guildRank?: string) => void
  mcJoined: (username: string) => void
  mcLeft: (username: string) => void
  enteredLimbo: () => void
  spamProtection: () => void
  partyInvite: (username: string) => void
  discordChat: (message: DiscordMessage) => void
  botLeft: (reason: string) => void
  botJoined: () => void
  spawn: () => void
}

interface MinecraftMember {
  username: string
  hypixelRank: string
  guildRank: string
  skin: Buffer
}

export function assertNotNull<T>(x?: T): T {
  if (x == null) throw "Null value when not null was expected!"
  return x
}

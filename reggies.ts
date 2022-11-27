import { Events, GuildScheduledEvent } from "discord.js"
import EventEmitter from "events"
import TypedEmitter from "typed-emitter"

import { BridgeEvents } from "./types.js"

const bridgeEmitter = new EventEmitter() as TypedEmitter<BridgeEvents>

export const guildMessageRegex = /^Guild > (?:\[(?<hypixelRank>[\w+]+)\] )?(?<username>\w{2,16})(?: \[(?<guildRank>[\w+]+)\])?: (?<content>.+$)/
export const mcJoinedRegex = /^Guild > (?<username>\w{2,16}) joined.$/
export const mcLeftRegex = /^Guild > (?<username>\w{2,16}) left.$/
export const limboRegex = /^You were spawned in Limbo.$/
export const numberFormatRegex = /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g
export const imageLinkRegex = /https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp|tiff|svg)/
export const partyInviteRegex = /(?:You have been invited to join )?(?<username>\w{2,16})(?:'s party!| has invited you to join their party!)/
export const spamRegex = /^You cannot say the same message twice!$/


export function testMessage(chat: string) {
  [
    guildChatTest,
    testMcJoined,
    testMcLeft,
    testPartyInvite,
    testLimbo,
    testSpam
  ].forEach((f) => { if (f(chat)) return })
}

const guildChatTest = (chat: string): boolean => {
  const { username, content, hypixelRank, guildRank } = chat.match(guildMessageRegex)?.groups ?? {}
  if (username == null || content == null) return false
  bridgeEmitter.emit("guildChat", username, content, hypixelRank, guildRank)
  return true
}

function testMcJoined(chat: string): boolean {
  const { username } = chat.match(mcJoinedRegex)?.groups ?? {}
  if (username == null) return false
  bridgeEmitter.emit("mcJoined", username)
  return true
}

function testMcLeft(chat: string): boolean {
  const { username } = chat.match(mcLeftRegex)?.groups ?? {}
  if (username == null) return false
  bridgeEmitter.emit("mcLeft", username)
  return true
}

function testPartyInvite(chat: string): boolean {
  const { username } = chat.match(partyInviteRegex)?.groups ?? {}
  if (username == null) return false
  bridgeEmitter.emit("partyInvite", username)
  return true
}

function testLimbo(chat: string): boolean {
  const result = limboRegex.test(chat)
  if (result) bridgeEmitter.emit("botJoined")
  return true
}

function testSpam(chat: string): boolean {
  const result = spamRegex.test(chat)
  if (result) bridgeEmitter.emit("spamProtection")
  return true
}


export const guildMessageRegex = /^Guild > (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16})(?: \[(?<guildRank>[\w+]+)\])?: (?<content>.+$)/
export const mcJoinedRegex = /^Guild > (?<name>\w{2,16}) joined.$/
export const mcLeftRegex = /^Guild > (?<name>\w{2,16}) left.$/
export const limboRegex = /^You were spawned in Limbo.$/
export const numberFormatRegex = /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g
export const imageLinkRegex = /https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp|tiff|svg)/
export const partyInviteRegex = /You have been invited to join (?<name>\w{2,16})'s party!/
export const partyInviteRegex2 = /(?<name>\w{2,16}) has invited you to join their party!/
export const spamRegex = /^You cannot say the same message twice!$/
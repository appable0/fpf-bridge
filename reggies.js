export const guildMessageRegex = /^Guild > (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16})(?: \[(?<guildRank>[\w+]+)\])?: (?<content>.+$)/
export const mcJoinedRegex = /^Guild > (?<name>\w{2,16}) joined.$/
export const mcLeftRegex = /^Guild > (?<name>\w{2,16}) left.$/
export const limboRegex = /^You were spawned in Limbo.$/
export const numberFormatRegex = /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g
export const imageLinkRegex = /https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp|tiff|svg)/
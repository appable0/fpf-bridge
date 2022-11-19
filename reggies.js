export const guildMessageRegex = /^Guild > (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16})(?: \[(?<guildRank>[\w+]+)\])?: (?<content>.+$)/
export const mcJoinedRegex = /^Guild > (?<name>\w{2,16}) joined.$/
export const mcLeftRegex = /^Guild > (?<name>\w{2,16}) left.$/
export const joinedLobbyRegex = /^(?: >>>+ )?\[[\w+]+\] \w{2,16} joined the lobby!(?: <<<)?$/
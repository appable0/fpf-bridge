import { partyInviteRegex, partyInviteRegex2 } from '../reggies.js'
import { nameIsInDb } from '../skins.js'

export function acceptFraggerInvite(content) {
    let match = content.match(partyInviteRegex)
    if (match == null) match = content.match(partyInviteRegex2)
    if (match == null) return null
    let fragger = match.groups.name
    if (nameIsInDb(fragger)) return `/p join ${fragger}`
}

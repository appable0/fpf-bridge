import fetch from "node-fetch"
import Database from "better-sqlite3"
import sharp from "sharp"
const db = new Database("bridge.db")

const SUCCESS = 200

db.prepare(`
CREATE TABLE IF NOT EXISTS Skins (
  username TEXT PRIMARY KEY,
  skin BLOB,
  lastUpdated INTEGER NOT NULL
)
`).run()

const cachedSkinSelect = db.prepare(`
SELECT skin, lastUpdated
FROM Skins
WHERE username = ?
`)

const insertSkin = db.prepare(`
INSERT OR REPLACE INTO Skins 
VALUES (:username, :skin, :lastUpdated)
`)

const nameInDB = db.prepare(`
SELECT username
FROM Skins
WHERE username = ?
`)

export async function skin(username) {
  const result = cachedSkinSelect.get(username)
  if (result != null && Date.now() - result.lastUpdated < 600000) return result.skin

  try {
    // Getting the UUID of a player.
    const uuidResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
    if (uuidResponse.status !== SUCCESS) return result?.skin

    // Getting the skin from the UUID.
    const profile = await uuidResponse.json()
    const profileResponse = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${profile.id}`)
    if (profileResponse.status !== SUCCESS) return result?.skin

    const content = await profileResponse.json()
    const textureUrl = JSON.parse(Buffer.from(content.properties[0].value, "base64").toString("ascii")).textures.SKIN.url
    const textureResponse = await fetch(textureUrl)
    const buffer = await textureResponse.buffer()
    const helmet = await sharp(buffer).extract({ left: 40, top: 8, width: 8, height: 8 }).toBuffer()
    const skin = await sharp(buffer).extract({ left: 8, top: 8, width: 8, height: 8 }).composite([{ input: helmet }]).png().toBuffer()

    insertSkin.run({
      username: username,
      skin: skin,
      lastUpdated: Date.now()
    })

    return skin

  } catch (e) {
    return result?.skin
  }

}

export function nameIsInDb(username) {
  return nameInDB.get(username) != null
}
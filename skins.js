import Database from "better-sqlite3"
import fetch from "node-fetch"
import sharp from "sharp"

const db = new Database("./data/members.db")
const steve = "LyANKx4NLx8PKBwLJBgIJhoKKx4NKh0NKx4NKx4NKx4NMyQRQioSPyoVLB4OKBwLKx4NtolsvY5yxpaAvYtyvY50rHZaNCUSqn1mtIRtqn1mrYBtnHJcu4lynGlMnGlMtIRt////Uj2JtXtnu4lyUj2J////qn1mnGNGs3tit4JyakAwakAwvohsompHgFM0kF5Dll9Ad0I1d0I1d0I1d0I1j14+gVM5b0UsbUMqgVM5gVM5ek4zg1U7g1U7ek4z"
const timeout = 60

db.exec(`
CREATE TABLE IF NOT EXISTS Members (
  username TEXT PRIMARY KEY,
  skin TEXT NOT NULL,
  lastUpdated INTEGER NOT NULL
)
`)

const skinSelect = db.prepare(`
SELECT skin, lastUpdated
FROM Members
WHERE username = ?
`)

const insertSkin = db.prepare(`
INSERT OR REPLACE INTO Members 
VALUES (:username, :skin, :lastUpdated)
`)

const nameInDB = db.prepare(`
SELECT username
FROM Members
WHERE username = ?
`)

export function nameIsInDb(username) {
  return nameInDB.get(username) != null
}

async function updateSkin(username) {
  const skin = await getMinecraftAvatar(username)
  if (!skin) return
  insertSkin.run({ username: username, skin: skin, lastUpdated: Date.now() })
  return skin
}

async function getMinecraftAvatar(username) {
  try {
    const uuidResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
    if (uuidResponse.status != 200) {
      throw new Error(`Mojang API returned code ${uuidResponse.status} while getting the UUID of ${username}.`)
    }
    const uuid = (await uuidResponse.json()).id
    const profileResponse = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)
    if (profileResponse.status !== 200) {
      throw new Error(`Mojang API returned code ${profileResponse.status} while getting profile data for ${uuid}.`)
    }
    const content = await profileResponse.json()
    const textureUrl = JSON.parse(Buffer.from(content.properties[0].value, "base64").toString("ascii")).textures.SKIN.url
    const textureResponse = await fetch(textureUrl)
    const buffer = new Uint8ClampedArray(await textureResponse.arrayBuffer())
    const helmet = await sharp(buffer).extract({ left: 40, top: 8, width: 8, height: 8 }).toBuffer()
    const data = await sharp(buffer)
      .extract({ left: 8, top: 8, width: 8, height: 8 })
      .composite([{ input: helmet }])
      .removeAlpha()
      .raw()
      .toBuffer()
    return data.toString("base64")
  } catch (e) {
    console.warn(e)
  }
} 

async function getSkinPng(data) {
  const array = new Uint8ClampedArray(Buffer.from(data, "base64"))
  return await sharp(array, {raw: {width: 8, height: 8, channels: 3}})
    .resize(128, 128, { kernel: sharp.kernel.nearest })
    .png()
    .toBuffer()
}

export async function getSkin(username) {
  let { skin, lastUpdated } = skinSelect.get(username) ?? {}
  if (!skin) {
    skin = await updateSkin(username)
  } else if ((Date.now() - lastUpdated) > timeout) {
    setImmediate(() => updateSkin(username))
  }
  return getSkinPng(skin ?? steve)
}
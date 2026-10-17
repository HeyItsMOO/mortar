// Each Steam game's header art, as the address on Steam's CDN its store names. Newer games keep their art under
// hashed paths only the store API reveals, so the addresses are looked up once by `bun scripts/site.ts --refresh-art`
// and committed, which keeps building the site offline.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const ART = 'scripts/site/steam-art.json'
const STORE_BROWSE = 'https://api.steampowered.com/IStoreBrowseService/GetItems/v1'
const STORE_ASSETS = 'https://shared.steamstatic.com/store_item_assets/'
const BATCH = 50

export function steamArt(): Record<string, string> {
  return existsSync(ART) ? (JSON.parse(readFileSync(ART, 'utf8')) as Record<string, string>) : {}
}

interface StoreItem {
  appid: number
  assets?: { asset_url_format?: string; header?: string }
}

export async function refreshSteamArt(appIds: string[]): Promise<void> {
  const art: Record<string, string> = {}
  for (let i = 0; i < appIds.length; i += BATCH) {
    const ids = appIds.slice(i, i + BATCH).map((appid) => ({ appid: Number(appid) }))
    const input = JSON.stringify({
      ids,
      context: { country_code: 'US' },
      data_request: { include_assets: true },
    })
    const res = await fetch(`${STORE_BROWSE}?input_json=${encodeURIComponent(input)}`)
    if (!res.ok) {
      throw new Error(`Steam store answered ${res.status}`)
    }
    const body = (await res.json()) as { response?: { store_items?: StoreItem[] } }
    for (const item of body.response?.store_items ?? []) {
      const { asset_url_format: format, header } = item.assets ?? {}
      if (format && header) {
        art[String(item.appid)] = STORE_ASSETS + format.replace(/\$\{FILENAME\}/, header)
      }
    }
  }
  const sorted = Object.fromEntries(Object.entries(art).sort(([a], [b]) => Number(a) - Number(b)))
  writeFileSync(ART, `${JSON.stringify(sorted, null, 2)}\n`)
}

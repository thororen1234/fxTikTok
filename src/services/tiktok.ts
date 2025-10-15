import { WebJSONResponse, ItemStruct, WebappUserDetail, WebappVideoDetail, UserInfo } from '../types/Web'
import { LiveWebJSONResponse, LiveRoom } from '../types/Live'
import Cookie from '../util/cookieHelper'
import cookieParser from 'set-cookie-parser'

const cookie = new Cookie([])

function getCommonHeaders(): HeadersInit {
  return {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
    Cookie: cookie.getCookiesAsString()
  }
}

function processCookies(response: Response): void {
  const cookieHeader = response.headers.get('set-cookie')
  if (cookieHeader) {
    const cookies = cookieParser(cookieHeader)
    cookie.setCookies(cookies)
  }
}

function extractJsonFromScript(html: string, scriptId: string): string {
  const startTag = `<script id="${scriptId}" type="application/json">`
  const endTag = '</script>'

  const startIndex = html.indexOf(startTag)
  if (startIndex === -1) throw new Error(`Script tag with id "${scriptId}" not found`)

  const jsonStart = startIndex + startTag.length
  const jsonEnd = html.indexOf(endTag, jsonStart)
  if (jsonEnd === -1) throw new Error(`End tag not found for script "${scriptId}"`)

  return html.substring(jsonStart, jsonEnd)
}

async function fetchTikTokPage(url: string, cacheOptions?: any): Promise<string> {
  const response = await fetch(url, {
    method: 'GET',
    headers: getCommonHeaders(),
    ...(cacheOptions && { cf: cacheOptions })
  })

  processCookies(response)
  return await response.text()
}

export async function grabAwemeId(videoId: string): Promise<URL> {
  const res = await fetch('https://vm.tiktok.com/' + videoId, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
    },
    cf: {
      cacheEverything: false,
      cacheTtlByStatus: { '301-302': 86400, 404: 1, '500-599': 0 }
    },
    redirect: 'manual'
  })
  const location = res.headers.get('Location') || res.headers.get('location')
  if (!location) throw new Error('No Location header found in response')
  return new URL(location)
}

export async function scrapeAvatarUri(username: string): Promise<string | Error> {
  try {
    const html = await fetchTikTokPage(`https://www.tiktok.com/@${username}`)
    const resJson = extractJsonFromScript(html, '__UNIVERSAL_DATA_FOR_REHYDRATION__')
    const json: WebJSONResponse = JSON.parse(resJson)

    const userDetail = json['__DEFAULT_SCOPE__']['webapp.user-detail']

    if (!userDetail.userInfo.user) {
      return new Error('Could not find user data')
    }

    return userDetail.userInfo.user.avatarLarger || userDetail.userInfo.user.avatarMedium || userDetail.userInfo.user.avatarThumb
  } catch (err) {
    return new Error('Could not parse user info')
  }
}

export async function scrapePageData(url: string, scopeType: 'webapp.video-detail', cacheOptions?: any): Promise<WebappVideoDetail | Error>

export async function scrapePageData(url: string, scopeType: 'webapp.user-detail', cacheOptions?: any): Promise<WebappUserDetail | Error>

export async function scrapePageData(
  url: string,
  scopeType: 'webapp.video-detail' | 'webapp.user-detail',
  cacheOptions?: any
): Promise<WebappUserDetail | WebappVideoDetail | Error> {
  try {
    const html = await fetchTikTokPage(url, cacheOptions)
    const resJson = extractJsonFromScript(html, '__UNIVERSAL_DATA_FOR_REHYDRATION__')
    const json: WebJSONResponse = JSON.parse(resJson)

    const scopeData = json['__DEFAULT_SCOPE__'][scopeType]

    if (!scopeData || scopeData.statusCode === 10204) {
      return new Error(`Could not find ${scopeType} data`)
    }

    return scopeData
  } catch (err) {
    return new Error(`Could not parse ${scopeType} data`)
  }
}

export async function scrapeVideoData(awemeId: string, author?: string): Promise<ItemStruct | Error> {
  const result = await scrapePageData(`https://www.tiktok.com/@${author || 'i'}/video/${awemeId}`, 'webapp.video-detail', {
    cacheEverything: false,
    cacheTtlByStatus: { '200-299': 86400, 404: 1, '500-599': 0 }
  })

  if (result instanceof Error) return result
  return result.itemInfo.itemStruct
}

export async function scrapeProfileData(username: string): Promise<UserInfo | Error> {
  const result = await scrapePageData(`https://www.tiktok.com/@${username}`, 'webapp.user-detail')

  if (result instanceof Error) return result
  if (!result.userInfo) return new Error('Could not find user data')

  return result.userInfo
}

export async function scrapeLiveData(author: string): Promise<LiveRoom | Error> {
  try {
    const html = await fetchTikTokPage(`https://www.tiktok.com/@${author}/live`)
    const resJson = extractJsonFromScript(html, 'SIGI_STATE')
    const json: LiveWebJSONResponse = JSON.parse(resJson)

    if (!json['LiveRoom']) {
      throw new Error('Could not find live data')
    }

    return json['LiveRoom']
  } catch (err) {
    throw new Error('Could not parse live data')
  }
}

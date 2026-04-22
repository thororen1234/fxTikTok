type ActivityIdOptions = {
  hq?: boolean
  addDesc?: boolean
  page?: number | string | null
}

export function normalizePage(page?: number | string | null): number {
  const parsedPage = typeof page === 'number' ? page : parseInt(page || '1', 10)

  return Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage
}

export function buildActivityId(videoId: string, options: ActivityIdOptions = {}): string {
  const normalizedPage = normalizePage(options.page)

  let activityId = videoId

  if (options.hq) activityId += 'hq'
  if (options.addDesc) activityId += 'desc'
  if (normalizedPage > 1) activityId += 'page' + normalizedPage

  return activityId
}

export function parseActivityId(param: string, pageParam?: number | string | null) {
  const match = param.match(/^(\d{1,19})(.*)$/)
  const videoId = match?.[1] || param.replace(/[^0-9]/g, '')
  const suffix = match?.[2] || ''
  const pathPage = suffix.match(/page(\d+)/)?.[1]

  return {
    videoId,
    hq: suffix.includes('hq'),
    addDesc: suffix.includes('desc'),
    page: normalizePage(pathPage || pageParam)
  }
}

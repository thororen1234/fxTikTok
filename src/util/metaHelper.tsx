import { Context } from 'hono'
import { env } from 'hono/adapter'
import { buildActivityId, normalizePage } from './activityId'

export default function MetaHelper(
  c: Context,
  tags: {
    name: string
    content: string | null
  }[],
  alternate?: {
    [key: string]: string | number
  },
  awemeId?: string,
  hq?: boolean,
  addDesc?: boolean,
  activityPage?: number
): JSX.Element {
  const { OFF_LOAD } = env(c) as { OFF_LOAD: string }
  const page = normalizePage(activityPage || c.req.query('page'))
  const activityId = awemeId ? buildActivityId(awemeId, { hq, addDesc, page }) : null
  const activityUrl = activityId
    ? new URL((OFF_LOAD || 'https://offload.tnktok.com') + '/users/' + 'username' + '/statuses/' + activityId)
    : null

  let alternateUrl = new URL((OFF_LOAD || 'https://offload.tnktok.com') + '/generate/alternate')

  if (alternate) {
    for (const key in alternate) {
      alternateUrl.searchParams.set(key, encodeURIComponent(alternate[key].toString()))
    }
  }

  return (
    <html lang='en'>
      <head>
        {tags.map((tag) => (tag.content ? <meta property={tag.name} content={tag.content} /> : null))}
        {alternate ? <link rel='alternate' href={alternateUrl.toString()} type='application/json+oembed' /> : null}
        {awemeId ? <link rel='alternate' type='application/activity+json' href={activityUrl?.toString()} /> : null}
      </head>
    </html>
  )
}

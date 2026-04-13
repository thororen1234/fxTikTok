import MetaHelper from '../../util/metaHelper'
import { ItemStruct } from '../../types/Web'
import { Context } from 'hono'
import { env } from 'hono/adapter'

export function VideoResponse(data: ItemStruct, addDesc: boolean, hq: boolean, c: Context): JSX.Element {
  const { OFF_LOAD } = env(c) as { OFF_LOAD: string }
  const offloadUrl = OFF_LOAD || 'https://offload.tnktok.com'

  let videoUrl = offloadUrl + '/generate/video/' + data.id + ".mp4" + (hq ? '?hq=true' : '')
  let videoMeta: { name: string; content: string }[] = []

  // getting media
  if (data.video.duration !== 0) {
    videoMeta = [
      {
        name: 'og:video',
        content: videoUrl
      },
      // {
      //   name: 'og:video:secure_url',
      //   content: videoUrl
      // },
      {
        name: 'og:video:type',
        content: 'video/mp4'
      },
      {
        name: 'og:video:width',
        content: data.video.width.toString()
      },
      {
        name: 'og:video:height',
        content: data.video.height.toString()
      },
      {
        name: 'og:type',
        content: 'video.other'
      },
      {
        name: 'og:video:type',
        content: 'video/mp4'
      },

      // {
      //   name: 'twitter:card',
      //   content: 'player'
      // },
      {
        name: 'twitter:player:height',
        content: data.video.height.toString()
      },
      {
        name: 'twitter:player:width',
        content: data.video.width.toString()
      },
      {
        name: 'twitter:player',
        content: videoUrl
      },
      {
        name: 'twitter:player:stream',
        content: videoUrl
      },
      {
        name: 'twitter:player:stream:content_type',
        content: 'video/mp4'
      }
    ]
  } else {
    const numberOfImages = data.imagePost.images.length > 4 ? 4 : data.imagePost.images.length

    for (let i = 0; i < numberOfImages; i++) {
      videoMeta = [
        ...videoMeta,
        {
          name: 'og:image',
          content: offloadUrl + '/generate/image/' + data.id + '?index=' + i
        },
        {
          name: 'og:image:type',
          content: 'image/jpeg'
        },
        {
          name: 'og:image:width',
          content: 'auto'
        },
        {
          name: 'og:image:height',
          content: 'auto'
        },
        {
          name: 'og:type',
          content: 'image.other'
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image'
        }
      ]
    }
  }

  return (
    <>
      {MetaHelper(
        c,
        [
          {
            name: 'og:site_name',
            content: 'fxTikTok'
          },
          {
            name: 'og:title',
            content: `${data.author.nickname} (@${data.author.uniqueId})`
          },
          {
            name: 'theme-color',
            content: '#ff0050' // TikTok's theme color
          },
          {
            name: 'twitter:site',
            content: `@${data.author.uniqueId}` // @username
          },
          {
            name: 'twitter:creator',
            content: `@${data.author.uniqueId}` // @username
          },
          {
            name: 'twitter:title',
            content: `${data.author.nickname} (@${data.author.uniqueId})` // Nickname (@username)
          },
          {
            name: 'og:url',
            content: `https://www.tiktok.com/@${data.author.uniqueId}/video/${data.id}`
          },
          ...(!addDesc
            ? [
                {
                  name: 'og:description',
                  content: data.desc
                }
              ]
            : []),
          ...videoMeta
        ],
        {
          unique_id: data.author.uniqueId,
          nickname: data.author.nickname,
          ...(addDesc ? { description: Buffer.from(data.desc, 'utf-8').toString('base64') } : {})
        },
        data.id,
        hq,
        addDesc
      )}
    </>
  )
}

import { buildActivityId, parseActivityId } from '@/util/activityId'

describe('activity ids', () => {
  it('builds the legacy page 1 format', () => {
    expect(buildActivityId('7301481361028697386')).toBe('7301481361028697386')
    expect(buildActivityId('7301481361028697386', { hq: true, addDesc: true })).toBe('7301481361028697386hqdesc')
  })

  it('builds a page-aware format for paginated embeds', () => {
    expect(buildActivityId('7301481361028697386', { page: 2 })).toBe('7301481361028697386page2')
    expect(buildActivityId('7301481361028697386', { hq: true, addDesc: true, page: 3 })).toBe('7301481361028697386hqdescpage3')
  })

  it('parses the legacy query-string page format', () => {
    expect(parseActivityId('7301481361028697386', '2')).toEqual({
      videoId: '7301481361028697386',
      hq: false,
      addDesc: false,
      page: 2
    })
  })

  it('parses the page-aware activity format', () => {
    expect(parseActivityId('7301481361028697386hqdescpage4')).toEqual({
      videoId: '7301481361028697386',
      hq: true,
      addDesc: true,
      page: 4
    })
  })
})

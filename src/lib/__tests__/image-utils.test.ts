import { describe, expect, it, vi } from 'vitest'
import { isImageFile, isValidDataUrl, getMaxImages, fileToDataUrl, resizeDataUrl } from '../image-utils'

describe('isImageFile', () => {
  it('accepts JPEG files', () => {
    expect(isImageFile(new File([], 'test.jpg', { type: 'image/jpeg' }))).toBe(true)
  })

  it('accepts PNG files', () => {
    expect(isImageFile(new File([], 'test.png', { type: 'image/png' }))).toBe(true)
  })

  it('accepts WebP files', () => {
    expect(isImageFile(new File([], 'test.webp', { type: 'image/webp' }))).toBe(true)
  })

  it('rejects GIF files', () => {
    expect(isImageFile(new File([], 'test.gif', { type: 'image/gif' }))).toBe(false)
  })

  it('rejects non-image files', () => {
    expect(isImageFile(new File([], 'test.pdf', { type: 'application/pdf' }))).toBe(false)
  })
})

describe('isValidDataUrl', () => {
  it('accepts valid JPEG data URL', () => {
    expect(isValidDataUrl('data:image/jpeg;base64,AAAA')).toBe(true)
  })

  it('accepts valid PNG data URL', () => {
    expect(isValidDataUrl('data:image/png;base64,AAAA')).toBe(true)
  })

  it('rejects invalid prefix', () => {
    expect(isValidDataUrl('https://example.com/image.png')).toBe(false)
  })

  it('rejects GIF data URL', () => {
    expect(isValidDataUrl('data:image/gif;base64,AAAA')).toBe(false)
  })
})

describe('getMaxImages', () => {
  it('returns 3', () => {
    expect(getMaxImages()).toBe(3)
  })
})

describe('fileToDataUrl', () => {
  it('converts a File to a data URL', async () => {
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' })
    const result = await fileToDataUrl(file)
    expect(result).toMatch(/^data:text\/plain;base64,/)
  })
})

describe('resizeDataUrl', () => {
  it('returns original data URL when image width is within limits', async () => {
    const smallDataUrl = 'data:image/jpeg;base64,AAAA'

    const originalImage = globalThis.Image
    let onloadCb: (() => void) | null = null
    vi.stubGlobal('Image', vi.fn(function () {
      const self = {
        width: 300,
        height: 200,
        set onload(fn: (() => void) | null) {
          onloadCb = fn
        },
        get onload() {
          return onloadCb
        },
        set src(_url: string) {
          queueMicrotask(() => { onloadCb?.() })
        },
      }
      return self
    }))

    const result = await resizeDataUrl(smallDataUrl)
    expect(result).toBe(smallDataUrl)
    vi.stubGlobal('Image', originalImage)
  })
})

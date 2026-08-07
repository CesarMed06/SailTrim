const MAX_WIDTH = 800
const JPEG_QUALITY = 0.7
const MAX_IMAGES_PER_MESSAGE = 3
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function isImageFile(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type)
}

export function isValidDataUrl(url: string): boolean {
  return /^data:image\/(jpeg|png|webp);base64,/.test(url)
}

export function getMaxImages(): number {
  return MAX_IMAGES_PER_MESSAGE
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsDataURL(file)
  })
}

export async function resizeImage(file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file)
  if (file.type === 'image/webp' || file.type === 'image/png') {
    return await compressViaCanvas(dataUrl, file.type)
  }
  return await compressViaCanvas(dataUrl, 'image/jpeg')
}

export async function resizeDataUrl(dataUrl: string): Promise<string> {
  const mime = dataUrl.match(/^data:(image\/\w+);/)?.at(1) ?? 'image/jpeg'
  return await compressViaCanvas(dataUrl, mime)
}

function compressViaCanvas(dataUrl: string, mimeType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { width, height } = img
      if (width <= MAX_WIDTH) {
        resolve(dataUrl)
        return
      }
      const ratio = MAX_WIDTH / width
      const newWidth = MAX_WIDTH
      const newHeight = Math.round(height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = newWidth
      canvas.height = newHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      resolve(canvas.toDataURL(mimeType, JPEG_QUALITY))
    }
    img.onerror = () => reject(new Error('Error loading image'))
    img.src = dataUrl
  })
}



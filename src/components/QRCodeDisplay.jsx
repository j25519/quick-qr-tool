import { useRef } from 'react'
import QRCode from 'react-qr-code'
import { FiDownload, FiCopy } from 'react-icons/fi'

function QRCodeDisplay({ value, input, category, blackQrCode }) {
  const qrRef = useRef(null)

  const sanitizeFilename = (str, isUrl) => {
    let cleaned = str
    if (isUrl) {
      try {
        const url = new URL(str.startsWith('http') ? str : `https://${str}`)
        cleaned = url.hostname.replace(/^www\./, '') + url.pathname.replace(/\/+$/, '')
        if (url.search) cleaned += url.search.replace(/\?/g, '-query-')
      } catch {
        cleaned = str
      }
    }
    return cleaned
      .toLowerCase()
      .replace(/\./g, '-dot-')
      .replace(/@/g, '-at-')
      .replace(/:/g, '-colon-')
      .replace(/\//g, '-slash-')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .slice(0, 100)
  }

  const getFilename = () => {
    const inputValue = category.id === 'linkedin' || category.id === 'paypal' ? input.username : input
    const sanitizedInput = sanitizeFilename(inputValue, category.id === 'url')
    const suffix = {
      url: 'qr-code',
      email: 'email-qr-code',
      phone: 'phone-qr-code',
      whatsapp: 'whatsapp-qr-code',
      x_profile: 'x-account-qr-code',
      instagram: 'instagram-account-qr-code',
      tiktok: 'tiktok-account-qr-code',
      telegram: 'telegram-account-qr-code',
      linkedin: 'linkedin-account-qr-code',
      paypal: 'paypal-qr-code',
      bitcoin: 'bitcoin-address-qr-code',
      event: 'event-qr-code',
      wifi: 'wifi-qr-code',
      geo: 'geo-qr-code',
    }[category.id]
    return `${sanitizedInput}-${suffix}.png`
  }

  const getCanvasBlob = () => {
    return new Promise((resolve) => {
      const svg = qrRef.current.querySelector('svg');
      if (!svg) return resolve(null);

      const serializer = new XMLSerializer();
      const svgData = serializer.serializeToString(svg);
      const img = new Image();
      const scale = window.devicePixelRatio || 1;
      const size = 1024 * scale;

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      img.onload = () => {
        ctx.setTransform(scale, 0, 0, scale, 0, 0); // scale for crisp pixels
        ctx.drawImage(img, 0, 0, 1024, 1024);
        canvas.toBlob(blob => resolve(blob), 'image/png');
      };
      img.onerror = () => resolve(null);
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
    });
  };

  const downloadQR = async () => {
    const blob = await getCanvasBlob()
    if (!blob) return
    const pngUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = pngUrl
    link.download = getFilename()
    link.click()
    URL.revokeObjectURL(pngUrl)
  }

  const copyQR = async () => {
    try {
      const blob = await getCanvasBlob()
      if (!blob) return
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      document.dispatchEvent(new CustomEvent('addToast', { detail: 'QR code image copied!' }))
    } catch (error) {
      console.error('Failed to copy QR code:', error)
    }
  }

  return (
    <div className="text-center">
      <div ref={qrRef} className="inline-block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:scale-105 transition-transform duration-200">
        <QRCode
          value={value}
          size={256}
          level="H"
          fgColor={blackQrCode ? '#FFFFFF' : '#000000'}
          bgColor={blackQrCode ? '#000000' : '#FFFFFF'}
        />
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        QR Code points to: <a href={value} target="_blank" className="underline hover:text-blue-500 transition-colors duration-200">{value}</a>
      </p>
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={downloadQR}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:scale-105 transition-all duration-200"
          aria-label="Download QR code"
        >
          <FiDownload className="w-5 h-5 mr-2" />
          Download QR Code
        </button>
        <button
          onClick={copyQR}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200"
          aria-label="Copy QR code image"
        >
          <FiCopy className="w-5 h-5 mr-2" />
          Copy Image
        </button>
      </div>
    </div>
  )
}

export default QRCodeDisplay
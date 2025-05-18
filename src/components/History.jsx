import React, { useRef } from 'react'
import QRCode from 'react-qr-code'
import { FiDownload, FiTrash2 } from 'react-icons/fi'

function History({ history, onClose, onDelete, addToast }) {
  const qrRefs = useRef(history.map(() => React.createRef()))

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

  const getFilename = (input, categoryId) => {
    // For categories with object inputs, use the primary field (e.g., username)
    const inputValue = ['linkedin', 'paypal', 'event', 'wifi', 'geo'].includes(categoryId) ? input.username || input.title || input.ssid || `${input.lat}-${input.lon}` : input
    const sanitizedInput = sanitizeFilename(inputValue, categoryId === 'url')
    const suffix = {
      url: 'qr-code',
      email: 'email-qr-code',
      phone: 'phone-qr-code',
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
    }[categoryId]
    return `${sanitizedInput}-${suffix}.png`
  }

  const downloadQR = async (index) => {
    const svg = qrRefs.current[index].current.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1024, 1024)
      canvas.toBlob((blob) => {
        if (!blob) return
        const pngUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = pngUrl
        link.download = getFilename(history[index].input, history[index].category.id)
        link.click()
        URL.revokeObjectURL(pngUrl)
      }, 'image/png')
    }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-auto animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">QR Code History</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label="Close history"
          >
            Close
          </button>
        </div>
        {history.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No QR codes generated yet.</p>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div ref={qrRefs.current[index]} className="flex-shrink-0">
                  <QRCode value={item.qrValue} size={64} />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <strong>Input:</strong>{' '}
                    {(() => {
                      switch (item.category.id) {
                        case 'phone':
                          return typeof item.input === 'object'
                            ? `${item.input.phone}${item.input.name ? ` (${item.input.name})` : ''}`
                            : item.input;
                        case 'paypal':
                          return `${item.input.username}, ${item.input.amount} ${item.input.currency}`;
                        case 'event':
                          return `${item.input.title}, ${new Date(item.input.start).toLocaleString()} - ${new Date(item.input.end).toLocaleString()}${item.input.location ? `, ${item.input.location}` : ''}`;
                        case 'wifi':
                          return `${item.input.ssid}${item.input.type ? `, ${item.input.type}` : ''}${item.input.password ? `, [password]` : ''}`;
                        case 'geo':
                          return `${item.input.lat}, ${item.input.lon}`;
                        case 'linkedin':
                          return `${item.input.username} (${item.input.type === 'company' ? 'Company Page' : 'Personal Profile'})`;
                        default:
                          return item.input;
                      }
                    })()}
                  </p>
                  <p className="text-sm"><strong>Category:</strong> {item.category.name}</p>
                  <p className="text-sm"><strong>Link:</strong> <a href={item.qrValue} target="_blank" className="underline">{item.qrValue}</a></p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadQR(index)}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:scale-105 transition-all duration-200"
                    aria-label="Download QR code"
                  >
                    <FiDownload className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(index)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:scale-105 transition-all duration-200"
                    aria-label="Delete history item"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default History
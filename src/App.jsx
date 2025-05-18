import { useState, useEffect } from 'react'
import CategorySelector from './components/CategorySelector'
import InputForm from './components/InputForm'
import QRCodeDisplay from './components/QRCodeDisplay'
import ThemeToggle from './components/ThemeToggle'
import History from './components/History'
import Settings from './components/Settings'
import Toast from './components/Toast'
import validate from 'bitcoin-address-validation'
import { FiSettings, FiClock } from 'react-icons/fi'
import './App.css'

const categories = [
  { id: 'url', name: 'URL', format: (input) => {
    if (input.trim() && !/^[a-zA-Z]+:\/\//.test(input)) {
      return `https://${input}`;
    }
    return input;
  }},
  { id: 'email', name: 'Email Address', format: (email) => `mailto:${email}` },
  { id: 'phone', name: 'Phone Number', format: (phone) => `tel:${phone}` },
  { id: 'x_profile', name: 'X Profile', format: (username) => `https://x.com/${username.replace('@', '')}` },
  { id: 'instagram', name: 'Instagram Profile', format: (username) => `https://instagram.com/${username.replace('@', '')}` },
  { id: 'tiktok', name: 'TikTok Profile', format: (username) => `https://tiktok.com/@${username.replace('@', '')}` },
  { id: 'telegram', name: 'Telegram Profile', format: (username) => `https://t.me/${username.replace('@', '')}` },
  { id: 'linkedin', name: 'LinkedIn Profile', format: ({ username, type }) => 
    type === 'company' ? `https://linkedin.com/company/${username.replace('@', '')}` : `https://linkedin.com/in/${username.replace('@', '')}` },
  { id: 'paypal', name: 'PayPal Wallet', format: ({ username, amount, currency }) => `https://www.paypal.com/paypalme/${username.replace('@', '')}/${amount}?currency=${currency}` },
  { id: 'bitcoin', name: 'Bitcoin Wallet', format: (address) => `bitcoin:${address}` },
  { id: 'event', name: 'Calendar Event', format: ({ title, start, end, location }) => {
    const formatDate = (iso) => iso.replace(/[-:]/g, '').slice(0, 15) + 'Z';
    return `BEGIN:VEVENT\nSUMMARY:${title}\nDTSTART:${formatDate(start)}\nDTEND:${formatDate(end)}\nLOCATION:${location || ''}\nEND:VEVENT`;
  }},
  { id: 'wifi', name: 'WiFi Network', format: ({ ssid, type, password }) => `WIFI:S:${ssid};T:${type || ''};P:${password || ''};;` },
  { id: 'geo', name: 'Geo Location', format: ({ lat, lon }) => `geo:${lat},${lon}` },
]

function App() {
  const [category, setCategory] = useState(categories[0])
  const [inputs, setInputs] = useState({
    url: '',
    email: '',
    phone: '',
    x_profile: '',
    instagram: '',
    tiktok: '',
    telegram: '',
    linkedin: { username: '', type: 'profile' },
    paypal: { username: '', amount: '', currency: 'GBP' },
    bitcoin: '',
    event: { title: '', start: '', end: '', location: '' },
    wifi: { ssid: '', type: '', password: '' },
    geo: { lat: '', lon: '' },
  })
  const [qrValue, setQrValue] = useState('')
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('qrHistory')) || [])
  const [showHistory, setShowHistory] = useState(false)
  const [settings, setSettings] = useState(() => ({
    blackQrCode: JSON.parse(localStorage.getItem('blackQrCode')) || false,
    enableValidation: JSON.parse(localStorage.getItem('enableValidation')) !== false,
    enableHistory: JSON.parse(localStorage.getItem('enableHistory')) !== false,
  }))
  const [showSettings, setShowSettings] = useState(false)
  const [toasts, setToasts] = useState([])
  const [toastId, setToastId] = useState(0)

  const addToast = (message) => {
    const id = toastId
    setToastId((prev) => prev + 1)
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  useEffect(() => {
    const handleAddToast = (e) => addToast(e.detail)
    document.addEventListener('addToast', handleAddToast)
    return () => document.removeEventListener('addToast', handleAddToast)
  }, [])

  useEffect(() => {
    localStorage.setItem('blackQrCode', JSON.stringify(settings.blackQrCode))
    localStorage.setItem('enableValidation', JSON.stringify(settings.enableValidation))
    localStorage.setItem('enableHistory', JSON.stringify(settings.enableHistory))
  }, [settings])

  useEffect(() => {
    if (settings.enableHistory) {
      localStorage.setItem('qrHistory', JSON.stringify(history.slice(0, 10)))
    }
  }, [history, settings.enableHistory])

  useEffect(() => {
    setQrValue('')
  }, [category])

  const handleInputChange = (value, subfield) => {
    if (subfield) {
      setInputs((prev) => ({
        ...prev,
        [category.id]: { ...prev[category.id], [subfield]: value },
      }))
    } else {
      setInputs((prev) => ({ ...prev, [category.id]: value }))
    }
  }

  const handleGenerate = (formattedValue) => {
    const requiredFields = {
      paypal: ['username', 'amount', 'currency'],
      event: ['title', 'start', 'end'],
      wifi: ['ssid'],
      geo: ['lat', 'lon'],
      linkedin: ['username', 'type'],
    }
    if (requiredFields[category.id]) {
      const missing = requiredFields[category.id].filter(
        (field) => !inputs[category.id][field]?.trim()
      )
      if (missing.length > 0) {
        addToast(`Missing required fields: ${missing.join(', ')}`)
        return
      }
    }
    setQrValue(formattedValue)
    if (settings.enableHistory) {
      setHistory((prev) => [
        { input: inputs[category.id], category, qrValue: formattedValue, timestamp: Date.now() },
        ...prev.filter((item) => item.qrValue !== formattedValue),
      ].slice(0, 10))
    }
  }

  const validateInput = (input, categoryId) => {
    if (!settings.enableValidation) {
      return { isValid: true, error: '', message: '' }
    }
    if (typeof input === 'object' ? !Object.values(input).some((v) => v.trim()) : !input.trim()) {
      return { isValid: false, error: 'Input cannot be empty', message: '' }
    }
    switch (categoryId) {
      case 'url':
        try {
          // Prepend https:// for protocol-less inputs, like the format function
          const testInput = input.trim() && !/^[a-zA-Z]+:\/\//.test(input) ? `https://${input}` : input;
          new URL(testInput);
          return { isValid: true, error: '', message: '' }
        } catch {
          return { isValid: false, error: 'Invalid URL (e.g., example.com or https://example.com)', message: '' }
        }
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
          ? { isValid: true, error: '', message: '' }
          : { isValid: false, error: 'Invalid email address', message: '' }
      case 'phone':
        if (!input) return { isValid: false, error: 'Phone number is required', message: '' }
        if (!/^\+?[1-9]\d{1,14}$/.test(input)) {
          return { isValid: false, error: 'Invalid phone number (e.g., +1234567890)', message: '' }
        }
        return { isValid: true, error: '', message: 'Phone dial link will be generated' }
      case 'x_profile':
      case 'instagram':
      case 'tiktok':
      case 'telegram':
      case 'linkedin':
        return /^[a-zA-Z0-9_-]{3,}$/.test(input.username.replace('@', ''))
          ? { isValid: true, error: '', message: '' }
          : { isValid: false, error: 'Invalid username (3+ characters, letters, numbers, underscores, hyphens only)', message: '' }
      case 'paypal': {
        const { username, amount, currency } = input
        if (!username || !/^[a-zA-Z0-9_]{1,50}$/.test(username.replace('@', ''))) {
          return { isValid: false, error: 'Invalid PayPal username', message: '' }
        }
        if (!amount || !/^\d+(\.\d{1,2})?$/.test(amount) || parseFloat(amount) <= 0) {
          return { isValid: false, error: 'Invalid amount (e.g., 10.99)', message: '' }
        }
        const validCurrencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY']
        if (!currency || !validCurrencies.includes(currency)) {
          return { isValid: false, error: 'Invalid currency', message: '' }
        }
        return { isValid: true, error: '', message: 'PayPal payment link will be generated' }
      }
      case 'bitcoin': {
        const cleanInput = input.trim()
        const result = validate(cleanInput)
        let isValid = result.valid
        let message = ''
        if (!isValid && /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/.test(cleanInput)) {
          isValid = true
        }
        if (!isValid) {
          return { isValid: false, error: 'Invalid Bitcoin address', message: '' }
        }
        if (result.network === 'mainnet' || isValid) {
          if (cleanInput.startsWith('1')) {
            message = 'Legacy address detected'
          } else if (cleanInput.startsWith('3') || cleanInput.startsWith('bc1q')) {
            message = 'SegWit address detected'
          } else if (cleanInput.startsWith('bc1p')) {
            message = 'Taproot address detected'
          } else {
            message = 'Bitcoin address detected'
          }
        } else {
          message = `${result.network.charAt(0).toUpperCase() + result.network.slice(1)} address detected`
        }
        return { isValid: true, error: '', message }
      }
      case 'event': {
        const { title, start, end, location } = input
        if (!title || title.length > 100) {
          return { isValid: false, error: 'Title is required, max 100 characters', message: '' }
        }
        if (!start || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(start)) {
          return { isValid: false, error: 'Invalid start date-time', message: '' }
        }
        if (!end || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(end)) {
          return { isValid: false, error: 'Invalid end date-time', message: '' }
        }
        if (location && location.length > 200) {
          return { isValid: false, error: 'Location max 200 characters', message: '' }
        }
        return { isValid: true, error: '', message: 'Calendar event will be generated' }
      }
      case 'wifi': {
        const { ssid, type, password } = input
        if (!ssid || ssid.length > 32 || ssid.includes(';')) {
          return { isValid: false, error: 'Invalid SSID (max 32 characters, no semicolons)', message: '' }
        }
        if (type && !['WPA', 'WEP'].includes(type)) {
          return { isValid: false, error: 'Invalid type (WPA, WEP, or none)', message: '' }
        }
        if (type && !password) {
          return { isValid: false, error: 'Password required for WPA/WEP', message: '' }
        }
        if (password && password.length > 64) {
          return { isValid: false, error: 'Password max 64 characters', message: '' }
        }
        return { isValid: true, error: '', message: 'WiFi connection link will be generated' }
      }
      case 'geo': {
        const { lat, lon } = input
        if (!lat || !/^-?\d{1,3}\.\d+$/.test(lat) || parseFloat(lat) < -90 || parseFloat(lat) > 90) {
          return { isValid: false, error: 'Invalid latitude (-90 to 90)', message: '' }
        }
        if (!lon || !/^-?\d{1,3}\.\d+$/.test(lon) || parseFloat(lon) < -180 || parseFloat(lon) > 180) {
          return { isValid: false, error: 'Invalid longitude (-180 to 180)', message: '' }
        }
        return { isValid: true, error: '', message: 'Geo location link will be generated' }
      }
      default:
        return { isValid: true, error: '', message: '' }
    }
  }

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    addToast(`${key === 'blackQrCode' ? 'QR code colors' : key === 'enableValidation' ? 'Validation' : 'History'} ${value ? 'enabled' : 'disabled'}`)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('qrHistory')
    addToast('History cleared')
  }

  const deleteHistoryItem = (index) => {
    setHistory((prev) => prev.filter((_, i) => i !== index))
    addToast('History item removed')
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl relative">
      <header className="flex justify-between items-center mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Quick QR Generation Tool</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label={showHistory ? 'Hide history' : 'Show history'}
          >
            <FiClock className="w-6 h-6 text-gray-900 dark:text-gray-100" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label={showSettings ? 'Hide settings' : 'Open settings'}
          >
            <FiSettings className="w-6 h-6 text-gray-900 dark:text-gray-100" />
          </button>
          <ThemeToggle />
        </div>
      </header>
      <main className="space-y-6">
        <div className="animate-fade-in">
          <CategorySelector categories={categories} selected={category} onSelect={setCategory} />
        </div>
        <div className="animate-fade-in">
          <InputForm
            category={category}
            input={inputs[category.id]}
            onInputChange={handleInputChange}
            onGenerate={handleGenerate}
            validateInput={validateInput}
            enableValidation={settings.enableValidation}
          />
        </div>
        {qrValue && (
          <div className="animate-fade-in">
            <QRCodeDisplay
              value={qrValue}
              input={inputs[category.id]}
              category={category}
              blackQrCode={settings.blackQrCode}
            />
          </div>
        )}
      </main>
      {showHistory && (
        <History
          history={history}
          onClose={() => setShowHistory(false)}
          onDelete={deleteHistoryItem}
          addToast={addToast}
        />
      )}
      {showSettings && (
        <Settings
          settings={settings}
          updateSetting={updateSetting}
          clearHistory={clearHistory}
          onClose={() => setShowSettings(false)}
        />
      )}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-2 z-1000 pointer-events-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} />
        ))}
      </div>
    </div>
  )
}

export default App
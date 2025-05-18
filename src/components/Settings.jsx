function Settings({ settings, updateSetting, clearHistory, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-auto animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-gray-900 dark:text-gray-100"
            aria-label="Close settings"
          >
            Close
          </button>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4">
              <span className="text-gray-900 dark:text-gray-100">Invert QR Code Colours</span>
              <input
                type="checkbox"
                checked={settings.blackQrCode}
                onChange={(e) => updateSetting('blackQrCode', e.target.checked)}
                className="custom-toggle"
              />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span className="text-gray-900 dark:text-gray-100">Enable Input Validation</span>
              <input
                type="checkbox"
                checked={settings.enableValidation}
                onChange={(e) => updateSetting('enableValidation', e.target.checked)}
                className="custom-toggle"
              />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span className="text-gray-900 dark:text-gray-100">Enable History</span>
              <input
                type="checkbox"
                checked={settings.enableHistory}
                onChange={(e) => updateSetting('enableHistory', e.target.checked)}
                className="custom-toggle"
              />
            </label>
          </div>
          <button
            onClick={clearHistory}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200"
            aria-label="Clear history"
          >
            Clear History
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            History is stored locally in your browser, not on a server.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings
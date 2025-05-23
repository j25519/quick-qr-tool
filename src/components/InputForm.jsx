import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { FiEye, FiEyeOff } from 'react-icons/fi'

function InputForm({ category, input, onInputChange, onGenerate, validateInput, enableValidation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const placeholders = {
    url: 'Enter URL (e.g., example.com)',
    email: 'Enter email address',
    phone: 'Enter phone number (e.g., +1234567890)',
    whatsapp: 'Enter phone number (e.g., +1234567890)',
    x_profile: 'Enter X username (e.g., @example)',
    instagram: 'Enter Instagram username (e.g., @example)',
    tiktok: 'Enter TikTok username (e.g., @example)',
    telegram: 'Enter Telegram username (e.g., @example)',
    linkedin: { username: 'Enter LinkedIn username (e.g., @john-doe)', type: 'Select profile type' },
    paypal: { username: 'Enter PayPal username', amount: 'Enter payment amount (e.g., 420.69)', currency: 'Select currency' },
    bitcoin: 'Enter Bitcoin address',
    event: {
      title: 'Enter event title',
      start: 'Select start date and time',
      end: 'Select end date and time',
      location: 'Enter location (optional)',
    },
    wifi: { ssid: 'Enter WiFi Network Name (SSID)', type: 'Select security type', password: 'Enter Password (WPA)' },
    geo: { lat: 'Enter latitude (e.g., 40.7128)', lon: 'Enter longitude (e.g., -74.0060)' },
  };

  const { isValid, error, message } = validateInput(input, category.id);

  // Reset hasInteracted when category changes
  useEffect(() => {
    setHasInteracted(false);
  }, [category.id]);

  const handleGenerate = () => {
    if (
      (enableValidation &&
        isValid &&
        (typeof input === 'object' ? Object.values(input).some((v) => v.trim()) : input.trim())) ||
      (!enableValidation &&
        (typeof input === 'object' ? Object.values(input).some((v) => v.trim()) : input.trim()))
    ) {
      const formattedValue = category.format(input);
      onGenerate(formattedValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const renderInput = (field, placeholder, type = 'text', props = {}) => (
    <input
      type={type}
      value={input[field] || ''}
      onChange={(e) => {
        onInputChange(e.target.value, field);
        handleInteraction();
      }}
      onFocus={handleInteraction}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`flex-1 p-3 bg-white dark:bg-gray-800 border ${
        hasInteracted && error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
      } rounded-lg transition-all duration-200`}
      {...props}
    />
  );

  const renderSelect = (field, options, placeholder, valueMap) => (
    <select
      value={input[field] || ''}
      onChange={(e) => {
        onInputChange(valueMap ? valueMap[e.target.value] : e.target.value, field);
        handleInteraction();
      }}
      onFocus={handleInteraction}
      className={`flex-1 p-3 bg-white dark:bg-gray-800 border ${
        hasInteracted && error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
      } rounded-lg transition-all duration-200`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
      ))}
    </select>
  );

  const renderDatePicker = (field, placeholder) => (
    <DatePicker
      selected={input[field] ? new Date(input[field]) : null}
      onChange={(date) => {
        onInputChange(date ? date.toISOString() : '', field);
        handleInteraction();
      }}
      onFocus={handleInteraction}
      showTimeSelect
      dateFormat="yyyy-MM-dd HH:mm"
      placeholderText={placeholder}
      className={`flex-1 p-3 bg-white dark:bg-gray-800 border ${
        hasInteracted && error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
      } rounded-lg transition-all duration-200`}
      wrapperClassName="w-full"
      popperClassName="z-40"
    />
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-4">
        {category.id === 'paypal' ? (
          <>
            {renderInput('username', placeholders.paypal.username, 'text')}
            {renderInput('amount', placeholders.paypal.amount, 'number', { step: '0.01', min: '0' })}
            {renderSelect('currency', ['GBP', 'USD', 'EUR', 'AUD', 'CAD', 'JPY'], placeholders.paypal.currency)}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generates a PayPal payment request for the amount entered.
            </p>
          </>
        ) : category.id === 'event' ? (
          <>
            {renderInput('title', placeholders.event.title, 'text')}
            {renderDatePicker('start', placeholders.event.start)}
            {renderDatePicker('end', placeholders.event.end)}
            {renderInput('location', placeholders.event.location, 'text')}
          </>
        ) : category.id === 'wifi' ? (
          <>
            {renderInput('ssid', placeholders.wifi.ssid, 'text')}
            {renderSelect('type', [
              { value: '', label: 'Open' },
              { value: 'WPA', label: 'Secure' },
            ], placeholders.wifi.type)}
            {input.type === 'WPA' && (
              <div className="relative">
                {renderInput('password', placeholders.wifi.password, showPassword ? 'text' : 'password')}
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                  ) : (
                    <FiEye className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                  )}
                </button>
              </div>
            )}
          </>
        ) : category.id === 'geo' ? (
          <>
            {renderInput('lat', placeholders.geo.lat, 'number', { step: 'any' })}
            {renderInput('lon', placeholders.geo.lon, 'number', { step: 'any' })}
          </>
        ) : category.id === 'linkedin' ? (
          <>
            {renderInput('username', placeholders.linkedin.username, 'text')}
            {renderSelect('type', [
              { value: 'profile', label: 'Personal Profile' },
              { value: 'company', label: 'Company Page' },
            ], placeholders.linkedin.type)}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Be sure to select the correct type of profile as LinkedIn uses different formats for personal and company profile links.
            </p>
          </>
        ) : (
          <>
            <input
              type={
                category.id === 'url'
                  ? 'url'
                  : category.id === 'email'
                  ? 'email'
                  : category.id === 'phone' || category.id === 'whatsapp'
                  ? 'tel'
                  : 'text'
              }
              value={input}
              onChange={(e) => {
                onInputChange(e.target.value);
                handleInteraction();
              }}
              onFocus={handleInteraction}
              onKeyDown={handleKeyDown}
              placeholder={placeholders[category.id]}
              className={`flex-1 p-3 bg-white dark:bg-gray-800 border ${
                hasInteracted && error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              } rounded-lg transition-all duration-200`}
            />
            {category.id === 'telegram' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can enter the username for a Telegram user, channel, bot, or public group.
              </p>
            )}
            {category.id === 'whatsapp' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                WhatsApp requires the international phone number format, e.g. +44 for the UK.
              </p>
            )}
            {category.id === 'phone' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our phone number validation expects the international phone number format, e.g. +44 for the UK.
              </p>
            )}
            {category.id === 'bitcoin' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Supports legacy, SegWit, and Taproot mainnet addresses.
              </p>
            )}
            {category.id === 'url' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Link to any URL including specific YouTube videos, Spotify albums, or just your website.
              </p>
            )}
          </>
        )}
        <button
          onClick={handleGenerate}
          disabled={enableValidation && !isValid}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition-transform duration-200 disabled:bg-gray-400 disabled:hover:scale-100"
        >
          Generate
        </button>
      </div>
      {hasInteracted && error && <p className="text-sm text-red-500 animate-fade-in">{error}</p>}
      {message && <p className="text-sm text-green-500 animate-fade-in">{message}</p>}
    </div>
  );
}

export default InputForm;
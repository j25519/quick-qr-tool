import { useTheme } from '../hooks/useTheme'
import { FiSun, FiMoon } from 'react-icons/fi'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-110 transition-all duration-200"
    >
      {theme === 'dark' ? (
        <FiSun className="w-6 h-6 text-yellow-400" />
      ) : (
        <FiMoon className="w-6 h-6 text-gray-800" />
      )}
    </button>
  )
}

export default ThemeToggle
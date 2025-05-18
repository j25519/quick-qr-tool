import { Component } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg w-full animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <FiAlertTriangle className="w-8 h-8 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Something Went Wrong
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              An unexpected error occurred. Please try resetting the app or reloading the page.
            </p>
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-red-500">
                Error: {this.state.error ? String(this.state.error) : 'Unknown error'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Component Stack: {this.state.errorInfo?.componentStack || 'No stack available'}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={this.resetError}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200"
                aria-label="Reset application"
              >
                Reset App
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                aria-label="Reload page"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
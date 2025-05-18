function Toast({ message }) {
  return (
    <div className="toast p-3 bg-green-600 text-white rounded-lg shadow animate-toast">
      {message}
    </div>
  )
}

export default Toast
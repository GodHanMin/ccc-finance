export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-blue-600 font-medium">잠시만 기다려주세요...</p>
      </div>
    </div>
  )
}

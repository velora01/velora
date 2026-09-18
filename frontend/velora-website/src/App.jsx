import React, { useState, useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import SplashScreen from './components/SplashScreen'

const App = () => {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Warm up backend on Render free-tier
    const backendUrl = import.meta.env.VITE_API_URL || "https://velora-backend-usq1.onrender.com/api"
    const healthUrl = `${backendUrl.replace(/\/$/, "")}/health`

    const ping = () => {
      fetch(healthUrl, { mode: "cors" }).catch(() => {})
    }

    ping()
    const timer = setInterval(ping, 4 * 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <AppRoutes />
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
    </>
  )
}

export default App
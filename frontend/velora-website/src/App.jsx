import React, { useState } from 'react'
import AppRoutes from './routes/AppRoutes'
import SplashScreen from './components/SplashScreen'

const App = () => {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      <AppRoutes />
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
    </>
  )
}

export default App
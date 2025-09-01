import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { db } from '../services/firebasecongif.jsx'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

function App() {
  const [count, setCount] = useState(0)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [firestoreStatus, setFirestoreStatus] = useState('')

  // Function to save location to Firestore
  const saveLocationToFirestore = async (locationData) => {
    try {
      setFirestoreStatus('Saving to Firestore...')
      
      const locationDoc = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp,
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

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.')
      return
    }

    // Request location access
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }
        
        // Store in localStorage
        localStorage.setItem('userLocation', JSON.stringify(locationData))
        setLocation(locationData)
        console.log('Location stored in localStorage:', locationData)
        
        // Save to Firestore
        try {
          await saveLocationToFirestore(locationData)
        } catch (error) {
          console.error('Failed to save to Firestore:', error)
        }
      },
      (error) => {
        let errorMessage = 'Unknown error occurred'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        setLocationError(errorMessage)
        console.error('Location error:', errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

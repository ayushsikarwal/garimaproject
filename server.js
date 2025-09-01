import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the dist directory (after building)
app.use(express.static(path.join(__dirname, 'dist')));

// IP address endpoint
app.get('/api/get-ip', (req, res) => {
  try {
    // Get IP from various sources
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               req.ip;
    
    // Clean up the IP address (remove IPv6 prefix if present)
    const cleanIp = ip.replace(/^::ffff:/, '');
    
    console.log('IP Request from:', cleanIp);
    
    res.json({ 
      ip: cleanIp,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Error getting IP:', error);
    res.status(500).json({ error: 'Failed to get IP address' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`IP API available at: http://localhost:${PORT}/api/get-ip`);
});

# Garima's Portfolio Website

A modern, responsive portfolio website for Garima, a 1st-year B.Tech student from KIIT University, Orissa, India.

## Features

- **Modern Portfolio Design**: Clean, professional layout with smooth animations
- **IP Address Tracking**: Captures visitor IP addresses for analytics
- **Location Tracking**: Gets user location with permission
- **Firebase Integration**: Stores visitor data securely
- **Responsive Design**: Works perfectly on all devices
- **Contact Form**: Easy way for visitors to get in touch

## Tech Stack

- **Frontend**: React.js, Vite
- **Styling**: CSS3 with modern design patterns
- **Backend**: Express.js server
- **Database**: Firebase Firestore
- **Deployment**: Ready for Vercel, Netlify, or any Node.js hosting

## IP Address Tracking Solution

The app now includes a robust IP address tracking system that works for all visitors:

### How it works:
1. **Server-side IP detection**: Uses Express.js to capture real IP addresses from request headers
2. **Multiple fallback APIs**: If server detection fails, tries multiple external IP APIs
3. **CORS handling**: Properly configured to work across different domains
4. **Error handling**: Graceful fallbacks if any method fails

### Why this works better:
- **No CORS issues**: Server-side detection avoids browser restrictions
- **Real IP addresses**: Gets actual visitor IPs, not proxy/load balancer IPs
- **Reliable**: Multiple fallback methods ensure high success rate
- **Privacy compliant**: Only collects necessary data with user consent

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd location
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. **Run in development mode**
   ```bash
   npm run dev
   ```

5. **Build and run production server**
   ```bash
   npm run build:start
   ```

## Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**

### Option 2: Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder to Netlify**

3. **Set environment variables in Netlify dashboard**

### Option 3: Traditional Hosting

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```

3. **The app will be available at `http://localhost:3000`**

## Environment Variables

Make sure to set these environment variables in your hosting platform:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Data Collection

The app collects the following data when users visit:

- **IP Address**: Captured server-side for analytics
- **Location**: Only with user permission (latitude, longitude, accuracy)
- **Browser Info**: User agent, screen resolution, timezone, language
- **Page Info**: Current URL, referrer
- **Timestamp**: When the data was collected

All data is stored securely in Firebase Firestore and is used only for analytics purposes.

## API Endpoints

- `GET /api/get-ip` - Returns visitor's IP address
- `GET /api/health` - Health check endpoint
- `GET /*` - Serves the React app

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

For any questions or support, please contact Garima at garima@example.com

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import './db.js';

import authRoutes from './routes/auth.js';
import complaintRoutes from './routes/complaints.js';
import staffRoutes from './routes/staff.js';
import notificationRoutes from './routes/notifications.js';
import statsRoutes from './routes/stats.js';
import aiRoutes from './routes/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory for persistent complaint photos
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Smart Campus Fix API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve static frontend in production if built
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  // If it's an API route that didn't match, return 404 JSON
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ error: 'Endpoint not found.' });
  }
  // Otherwise serve index.html for client-side routing
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // In development, if dist hasn't been built yet, provide friendly message
      res.status(200).send(`
        <html>
          <body style="font-family:sans-serif; text-align:center; padding: 40px; background: #0b132b; color: white;">
            <h1>Smart Campus Fix API Server Running</h1>
            <p>API is active on port ${PORT}. Run <code>npm run client</code> or <code>npm run dev</code> for the React frontend.</p>
          </body>
        </html>
      `);
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  res.status(500).json({ error: err.message || 'Internal server error occurred.' });
});

// Start server only when run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 Smart Campus Fix Server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads available at http://localhost:${PORT}/uploads`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

export default app;

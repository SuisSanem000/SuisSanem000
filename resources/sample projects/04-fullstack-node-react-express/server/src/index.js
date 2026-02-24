const express = require('express');
const cors = require('cors');
const itemsRouter = require('./routes/items');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── MIDDLEWARE ────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── ROUTES ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/items', itemsRouter);

// ─── ERROR HANDLING ───────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── START ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3003;

// Serve static files from dist/
app.use(express.static(join(__dirname, 'dist')));

// Catch-all for SPA routing (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🔬 AI X-Ray running on http://0.0.0.0:${PORT}`);
  console.log(`  🧠 Visualize AI reasoning at http://localhost:${PORT}`);
  console.log();
});
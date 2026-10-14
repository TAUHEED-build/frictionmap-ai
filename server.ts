import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { executeAudit } from './server/audit/orchestrator.js';
import { generateAuditExplanations } from './server/audit/aiExplainer.js';
import { SafetyValidationError } from './server/audit/safety.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '2mb' }));

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Website Audit Endpoint
  app.post('/api/audit', async (req: Request, res: Response) => {
    try {
      const { url, mode } = req.body;
      if (!url || typeof url !== 'string') {
        res.status(400).json({ error: 'Please enter a valid website URL.' });
        return;
      }

      const selectedMode = mode === 'freelancer' ? 'freelancer' : 'business';
      console.log(`[Audit] Starting audit for: ${url} (Mode: ${selectedMode})`);

      const report = await executeAudit(url, selectedMode);
      res.json({ success: true, report });
    } catch (err: unknown) {
      console.error('[Audit Error]', err);
      if (err instanceof SafetyValidationError) {
        res.status(400).json({ error: err.message, type: 'safety' });
        return;
      }
      const message = err instanceof Error ? err.message : 'An unexpected error occurred while analyzing the website.';
      res.status(500).json({ error: message, type: 'crawl_failure' });
    }
  });

  // Regenerate Explanations Endpoint
  app.post('/api/explain', async (req: Request, res: Response) => {
    try {
      const { url, findings, mode } = req.body;
      if (!url || !Array.isArray(findings)) {
        res.status(400).json({ error: 'Missing required findings or URL data.' });
        return;
      }
      const summary = await generateAuditExplanations(url, findings, mode || 'business');
      res.json({ success: true, summary });
    } catch (err: unknown) {
      console.error('[Explain Error]', err);
      const message = err instanceof Error ? err.message : 'Failed to generate explanation.';
      res.status(500).json({ error: message });
    }
  });

  // Vite middleware in dev or static files in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FrictionMap AI] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

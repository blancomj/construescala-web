import type { APIRoute } from 'astro';
import { readFileSync } from 'fs';
import { join } from 'path';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const svgPath = join(process.cwd(), 'public', 'favicon.svg');
    const svgContent = readFileSync(svgPath, 'utf-8');
    
    return new Response(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};

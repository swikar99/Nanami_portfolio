import createMiddleware from 'next-intl/middleware';
import { defineRouting } from 'next-intl/routing';

const routing = defineRouting({
  locales: ['en', 'ja', 'ne'] as const,
  defaultLocale: 'en',
});

export default createMiddleware(routing);

export const config = {
  // Exclude /api routes, Next.js internals, and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

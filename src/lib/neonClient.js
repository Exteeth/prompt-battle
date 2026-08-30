import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_NEON_DATABASE_URL;

export const isNeonConfigured = Boolean(databaseUrl);

// Direct connection to Neon Serverless Postgres without HTTP caching or cookies
export const sql = isNeonConfigured
  ? neon(databaseUrl, {
      disableWarningInBrowsers: true,
      fetchOptions: {
        cache: 'no-store'
      }
    })
  : null;
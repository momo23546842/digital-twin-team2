import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),

  // Datasource configuration for migrations
  datasource: {
    name: 'db',
    provider: 'postgresql',
    url: 'postgresql://digital_twin_user:digital_twin_pass@localhost:5432/digital_twin',
  },
});

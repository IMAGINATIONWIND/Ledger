const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_8hYOwIvgV0En@ep-empty-rain-b8ywwzgc.c-14.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function run() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to Neon PostgreSQL!');

  const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
  const viewsPath = path.join(__dirname, '..', 'sql', 'views.sql');

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  console.log('Applying schema.sql...');
  await client.query(schemaSql);
  console.log('✓ schema.sql executed successfully.');

  const viewsSql = fs.readFileSync(viewsPath, 'utf8');
  console.log('Applying views.sql...');
  await client.query(viewsSql);
  console.log('✓ views.sql executed successfully.');

  const res = await client.query('SELECT COUNT(*) FROM exercises');
  console.log(`✓ Verification: ${res.rows[0].count} starter exercises found in database.`);

  await client.end();
  console.log('Migration complete!');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

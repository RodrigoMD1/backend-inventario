const { Client } = require('pg');
const client = new Client({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.smpozuhusjrexmycpljc',
  password: 'Comandante989796',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});
client.connect()
  .then(() => console.log('Conexión exitosa'))
  .catch(err => console.error('Error de conexión', err));

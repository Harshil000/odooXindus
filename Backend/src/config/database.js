const { Pool } = require('pg');

const pool = new Pool({
		  host: process.env.PGHOST || 'localhost',
		  port: Number(process.env.PGPORT) || 5432,
		  user: process.env.PGUSER || 'postgres',
		  password: process.env.PGPASSWORD || 'pgAdmin(060107)',
		  database: process.env.PGDATABASE || 'odoo',
	  });

const connectDB = async () => {
	await pool.query('SELECT 1');
	console.log('PostgreSQL connected');
};

module.exports = { pool, connectDB };

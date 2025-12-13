const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.DATABASE_URL ? true : false;

const connectionConfig = isProduction
  ? {

      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false 
      }
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
    };

const pool = new Pool(connectionConfig);

pool.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối PostgreSQL:', err.message);
  } else {
    if (isProduction) {
        console.log('Đã kết nối thành công đến SUPABASE (Cloud)!');
    } else {
        console.log('Đã kết nối thành công đến LOCALHOST (Máy tính)!');
    }
  }
});

module.exports = pool;
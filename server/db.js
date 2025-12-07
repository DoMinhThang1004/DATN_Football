const { Pool } = require('pg');
require('dotenv').config();

// sử dụng biến DATABASE_URL khi triển khai,k thì về cấu hình cục bộ
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      // cấu hìh ssl
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
    // debug kiểmt ra
    console.log('Đã kết nối thành công đến Database Cloud!');
  }
});

module.exports = pool;
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); //up ảnh
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));// quyền truy cập

//check lỗi
app.use((req, res, next) => {
  console.log(`📩 [REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

//ipmport routes
const controllers = require('./routes/dashboardRoutes');// tổng quan
const stadiumRoutes = require('./routes/stadiumRoutes'); // sân
const matchRoutes = require('./routes/matchRoutes'); // trận
const ticketTypeRoutes = require('./routes/ticketTypeRoutes'); // loại vé
const matchTConfigRoutes = require('./routes/matchTConfigRoutes'); // cấu hình vé trận đấu
const userRoutes = require('./routes/userRoutes'); // người dùng
const addressRoutes = require('./routes/addressRoutes'); // địa chỉ người dùng
const ticketRoutes = require('./routes/ticketRoutes'); // vé người dùng
const orderRoutes = require('./routes/oderRoutes'); // đơn hàng



//up ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('Chưa chọn file nào!');
  const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// sử dụng routes
app.use('/api/dashboard', controllers);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/ticket-types', ticketTypeRoutes);
app.use('/api/match-t-configs', matchTConfigRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/orders', orderRoutes);







app.get('/', (req, res) => {
  res.send('Backend Football Ticket is running!');
});




//chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');
const initSocketHandler = require('./socket'); // handler 

// khởi tạo serverhttp và socket.io
const app = express();
const server = http.createServer(app); //tạo server HTTP
const io = new Server(server, { //tạo server socket.io
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

initSocketHandler(io); 

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//úp
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// kt lỗi
app.use((req, res, next) => {
    console.log(`📩 [REQUEST] ${req.method} ${req.originalUrl}`);
    next();
});

// Import routes
const controllers = require('./routes/dashboardRoutes');//trang tổng quan
const stadiumRoutes = require('./routes/stadiumRoutes');//sân vận động
const matchRoutes = require('./routes/matchRoutes');//trận đấu
const ticketTypeRoutes = require('./routes/ticketTypeRoutes');//loại vé
const matchTConfigRoutes = require('./routes/matchTConfigRoutes');//cấu hình trận đấu
const userRoutes = require('./routes/userRoutes');//người dùng
const addressRoutes = require('./routes/addressRoutes');//địa chỉ
const ticketRoutes = require('./routes/ticketRoutes');//vé
const orderRoutes = require('./routes/oderRoutes');//đơn hàng
const commentRoutes = require('./routes/conmentRoutes');//bình luận
const paymentRoutes = require('./routes/paymentRoutes');//thanh toán onl
const faqRoutes = require('./routes/faqRoutes');//faq
const newsRoutes = require('./routes/newsRoutes');//tin tức


// úp ảnh
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

// Sử dụng routes
app.use('/api/dashboard', controllers);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/ticket-types', ticketTypeRoutes);
app.use('/api/match-t-configs', matchTConfigRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/news', newsRoutes);


app.get('/', (req, res) => {
    res.send('Backend Football Ticket is running! (Socket.io enabled)');
});


// chạy server.listen thay vì app.listen
server.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});
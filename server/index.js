require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');
const initSocketHandler = require('./socket');

// cấu hình 
const allowedOrigins = [
    "http://localhost:5173", // link lap
    "https://datn-football-8hfodqrrd-do-minh-thangs-projects.vercel.app", //vercel
    "https://football-ticket.vercel.app" // dự phòng
];

const app = express();
const server = http.createServer(app); // tạo server HTTP

// khởi tạo socket.io với cors 
const io = new Server(server, { 
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// khởi tạo logic socket
initSocketHandler(io); 

const PORT = process.env.PORT || 5000;

// cấu hình xxpress cors chuẩn
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

//up ảnh công khai
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// log để debug
app.use((req, res, next) => {
    console.log(`📩 [REQUEST] ${req.method} ${req.originalUrl}`);
    next();
});

//import routes
const controllers = require('./routes/dashboardRoutes');
const stadiumRoutes = require('./routes/stadiumRoutes');
const matchRoutes = require('./routes/matchRoutes');
const ticketTypeRoutes = require('./routes/ticketTypeRoutes');
const matchTConfigRoutes = require('./routes/matchTConfigRoutes');
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const orderRoutes = require('./routes/oderRoutes');
const commentRoutes = require('./routes/conmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const faqRoutes = require('./routes/faqRoutes');
const newsRoutes = require('./routes/newsRoutes');

//cấu hình úp ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// api upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('Chưa chọn file nào!');
    //dùng host động từ request
    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

//sử dụng routes
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

// chạy server
server.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});
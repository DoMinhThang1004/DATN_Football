const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  //lấy token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập (Thiếu Token)!" });
  }

  try {
    //giải mã
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    //lưu tt user vào request
    req.user = decoded; 
    
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};

//phân quyền ad
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ message: "Bạn không có quyền Admin để thực hiện thao tác này!" });
    }
  });
};

module.exports = { verifyToken, verifyAdmin };
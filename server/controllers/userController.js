const pool = require('../db');
const bcrypt = require('bcrypt'); //thư viện mã hóa
const nodemailer = require('nodemailer');

//số vòng lặp xl mật khẩu
const SALT_ROUNDS = 10;

// cấu hình nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS
  }
});

// lấy ds user
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

// tạo user mới
const createUser = async (req, res) => {
  try {
    // thêm gender, birth_date
    const { full_name, email, phone, password, role, status, avatar_url, gender, birth_date } = req.body;
    
    const checkEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }
    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // insert user
    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, phone, password, role, status, avatar_url, gender, birth_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
          full_name, 
          email, 
          phone, 
          hashedPassword, 
          role || 'USER', 
          status || 'ACTIVE', 
          avatar_url,
          gender || 'Khác',  
          birth_date || null 
      ]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server: ' + err.message);
  }
};

// user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Email không tồn tại!" });
    }

    const storedUser = user.rows[0];
    const isMatch = await bcrypt.compare(password, storedUser.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu!" });
    }

    // logic khôi phục user đã xóa
    if (storedUser.status === 'DELETED') {
         await pool.query("UPDATE users SET status = 'ACTIVE' WHERE id = $1", [storedUser.id]);
         console.log(`User ${storedUser.id} đã được khôi phục từ trạng thái DELETED.`);
         storedUser.status = 'ACTIVE';
    } else if (storedUser.status === 'BANNED') {
         return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa bởi Admin!" });
    }

    const userInfo = user.rows[0];
    delete userInfo.password;
    
    res.json({ message: "Đăng nhập thành công", user: userInfo });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

// cập nhật user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, role, status, avatar_url, password, gender, birth_date } = req.body;

    if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await pool.query(
            `UPDATE users 
             SET full_name = $1, email = $2, phone = $3, role = $4, status = $5, avatar_url = $6, password = $7, gender = $8, birth_date = $9 
             WHERE id = $10`,
            [full_name, email, phone, role, status, avatar_url, hashedPassword, gender, birth_date, id]
        );
    } else {
        await pool.query(
            `UPDATE users 
             SET full_name = $1, email = $2, phone = $3, role = $4, status = $5, avatar_url = $6, gender = $7, birth_date = $8 
             WHERE id = $9`,
            [full_name, email, phone, role, status, avatar_url, gender, birth_date, id]
        );
    }
    res.json("Cập nhật thành công!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

// xóa tạm thời nếu ad và kh muốn
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // cập nhật trạng thái thành xóa tạm thời
    await pool.query("UPDATE users SET status = 'DELETED' WHERE id = $1", [id]);
    
    res.json({ message: "Tài khoản đã được xóa tạm thời." });
  } catch (err) {
    console.error("Lỗi xóa User:", err.message);
    if (err.message.includes("invalid input value for enum")) {
        res.status(500).send("Lỗi Database: Chưa cấu hình trạng thái 'DELETED' trong ENUM.");
    } else {
        res.status(500).send('Lỗi Server');
    }
  }
};

//xóa tk vĩnh viễn
const deleteUserPermanently = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        // xóa vé đơn hàng
        const orders = await client.query('SELECT id FROM orders WHERE user_id = $1', [id]);
        const orderIds = orders.rows.map(o => o.id);
        
        if (orderIds.length > 0) {
            await client.query('DELETE FROM tickets WHERE order_id = ANY($1)', [orderIds]);
            await client.query('DELETE FROM order_items WHERE order_id = ANY($1)', [orderIds]);
            await client.query('DELETE FROM orders WHERE user_id = $1', [id]);
        }

        // xóa địa chỉ user
        await client.query('DELETE FROM user_addresses WHERE user_id = $1', [id]);

        // xóa cmt, báo cáo cmt
        await client.query('DELETE FROM comment_reports WHERE user_id = $1', [id]);
        await client.query('DELETE FROM comments WHERE user_id = $1', [id]);

        // xóa user
        await client.query('DELETE FROM users WHERE id = $1', [id]);

        await client.query('COMMIT');
        res.json({ message: "Đã xóa VĨNH VIỄN người dùng và toàn bộ dữ liệu liên quan!" });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Lỗi Xóa Vĩnh Viễn:", err.message);
        res.status(500).json({ message: "Lỗi Server: " + err.message });
    } finally {
        client.release();
    }
};

// đổi mk trực tiếp gửi otp/ admin k cần
const resetPasswordDirect = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    // check xem có tồn tại tk k
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
        return res.status(404).json({ message: "Email không tồn tại!" });
    }

    // mã hóa mk
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // cập nhật vô db
    await pool.query(
        'UPDATE users SET password = $1 WHERE email = $2',
        [hashedPassword, email]
    );

    res.json({ message: "Đổi mật khẩu thành công!" });

  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err);
    res.status(500).send('Lỗi Server');
  }
};

//đổi mk với otp
const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(404).json({ message: "Email không đúng!" });

    const dbOTP = user.rows[0].reset_otp;
    const dbExpiry = new Date(user.rows[0].reset_otp_expiry);

    if (!dbOTP || dbOTP !== otp) return res.status(400).json({ message: "Mã OTP không chính xác!" });
    if (new Date() > dbExpiry) return res.status(400).json({ message: "Mã OTP đã hết hạn!" });

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query('UPDATE users SET password = $1, reset_otp = NULL, reset_otp_expiry = NULL WHERE email = $2', [hashedPassword, email]);

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi Server');
  }
};

module.exports = {
  getAllUsers, createUser, loginUser, updateUser, deleteUser,
  deleteUserPermanently, 
  resetPasswordDirect, resetPasswordWithOTP
};
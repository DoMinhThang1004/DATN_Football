const pool = require('../db');

//lấy ds tk người dùng
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

//tạo tk cho cả ng dùng và admin
const createUser = async (req, res) => {
  try {
    //là avatar_url
    const { full_name, email, phone, password, role, status, avatar_url } = req.body;

    //check email có chưa
    const checkEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    //lưu vô data
    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, phone, password, role, status, avatar_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [full_name, email, phone, password, role || 'USER', status || 'ACTIVE', avatar_url]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server: ' + err.message);
  }
};

//đăng nhập
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    //kiểm tra email
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Email không tồn tại!" });
    }

    //kiểm tra mật khẩu (chưa làm mã hoá)
    if (user.rows[0].password !== password) {
      return res.status(401).json({ message: "Sai mật khẩu!" });
    }

    //ẩn mật khẩu khi trả ra
    const userInfo = user.rows[0];
    delete userInfo.password;
    
    res.json({ 
      message: "Đăng nhập thành công",
      user: userInfo 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

// cập nhật tt ng dùng
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, role, status, avatar_url } = req.body;

    await pool.query(
      `UPDATE users SET 
        full_name = $1, email = $2, phone = $3, role = $4, status = $5, avatar_url = $6 
       WHERE id = $7`,
      [full_name, email, phone, role, status, avatar_url, id]
    );

    res.json("Cập nhật thành công!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

//xoá tk
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json("Xóa thành công!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
};

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  updateUser,
  deleteUser
};
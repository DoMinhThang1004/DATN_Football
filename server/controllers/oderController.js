const pool = require('../db');

//tạo đơn hàng
const createOrder = async (req, res) => {
  const client = await pool.connect(); 
  try {
    await client.query('BEGIN'); 

    const { user_id, total_amount, payment_method, items } = req.body;
    
    const orderId = `ORD-${Date.now()}`;
    const initialStatus = 'PAID'; 

    //nhập
    await client.query(
      `INSERT INTO orders (id, user_id, total_amount, status, payment_method) 
       VALUES ($1, $2, $3, $4, $5)`, 
      [orderId, user_id, total_amount, initialStatus, payment_method]
    );

    //thêm vé
    for (const item of items) {
        const checkConfig = await client.query('SELECT id FROM match_ticket_configs WHERE id = $1', [item.configId]);
        if (checkConfig.rows.length === 0) {
            throw new Error(`Loại vé ID ${item.configId} không tồn tại!`);
        }
        const qrCode = `${orderId}-${item.configId}-${item.seatNumber}`;
        await client.query(
            `INSERT INTO tickets (order_id, match_config_id, seat_number, qr_code_string, status)
             VALUES ($1, $2, $3, $4, 'VALID')`,
            [orderId, item.configId, item.seatNumber, qrCode]
        );

        await client.query(
            `UPDATE match_ticket_configs SET quantity_sold = quantity_sold + 1 WHERE id = $1`,
            [item.configId]
        );
    }

    await client.query('COMMIT'); 
    console.log("Tạo đơn hàng thành công:", orderId);
    
    res.json({ message: "Đặt vé thành công!", orderId: orderId });

  } catch (err) {
    await client.query('ROLLBACK'); 
    console.error("Lỗi Checkout:", err.message);
    res.status(500).json({ message: "Lỗi Server: " + err.message });
  } finally {
    client.release();
  }
};

//lấy ds đơn hàng
const getAllOrders = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, u.full_name, u.phone, u.email 
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
};

//lấy chi tiết đh
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        //lấy thông tin
        const orderRes = await pool.query(`
            SELECT o.*, u.full_name, u.email, u.phone 
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = $1
        `, [id]);

        if (orderRes.rows.length === 0) return res.status(404).json({message: "Không tìm thấy đơn"});

        const ticketsRes = await pool.query(`
            SELECT 
                t.id, t.seat_number, t.qr_code_string, t.status,
                mtc.price, 
                sz.zone_name,  -- Lấy từ bảng sz
                tt.name as ticket_type_name,
                m.home_team, m.away_team, s.name as stadium_name
            FROM tickets t
            JOIN match_ticket_configs mtc ON t.match_config_id = mtc.id
            LEFT JOIN stadium_zones sz ON mtc.stadium_zone_id = sz.id -- JOIN THÊM BẢNG NÀY
            JOIN ticket_types tt ON mtc.ticket_type_id = tt.id
            JOIN matches m ON mtc.match_id = m.id
            JOIN stadiums s ON m.stadium_id = s.id
            WHERE t.order_id = $1
        `, [id]);

        const orderData = {
            ...orderRes.rows[0],
            tickets: ticketsRes.rows 
        };

        res.json(orderData);
    } catch (err) {
        console.error("❌ Lỗi lấy chi tiết đơn:", err.message);
        res.status(500).send('Lỗi Server: ' + err.message);
    }
};

//cập nhật
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
        res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus };
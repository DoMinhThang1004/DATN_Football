const pool = require('../db');

const createOrder = async (req, res) => {
  const client = await pool.connect(); 
  try {
    await client.query('BEGIN'); 

    const { user_id, total_amount, payment_method, items } = req.body;
    const orderId = `ORD-${Date.now()}`;
    
    let initialStatus = 'PENDING';
    if (payment_method === 'BANK_QR' || payment_method === 'MOMO') {
        initialStatus = 'PAID';
    }

    await client.query(
      `INSERT INTO orders (id, user_id, total_amount, status, payment_method) 
       VALUES ($1, $2, $3, $4, $5)`, 
      [orderId, user_id, total_amount, initialStatus, payment_method]
    );

    for (const item of items) {
        const checkConfig = await client.query('SELECT id FROM match_ticket_configs WHERE id = $1', [item.configId]);
        if (checkConfig.rows.length === 0) throw new Error(`Loại vé ID ${item.configId} không tồn tại!`);

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
    res.json({ message: "Đặt vé thành công!", orderId: orderId });

  } catch (err) {
    await client.query('ROLLBACK'); 
    console.error("Lỗi Checkout:", err.message);
    res.status(500).json({ message: "Lỗi Server: " + err.message });
  } finally {
    client.release();
  }
};

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

// lấy thôgn tin đơn
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const orderRes = await pool.query(`
            SELECT o.*, u.full_name, u.email, u.phone 
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = $1
        `, [id]);

        if (orderRes.rows.length === 0) return res.status(404).json({message: "Không tìm thấy đơn"});

        // lấy vé trong đơn
        const ticketsRes = await pool.query(`
            SELECT 
                t.id, t.seat_number, t.qr_code_string, t.status,
                mtc.price, mtc.id as match_config_id, mtc.match_id,
                sz.zone_name, 
                tt.name as ticket_type_name,
                m.home_team, m.away_team, s.name as stadium_name,
                m.start_time, m.home_logo, m.banner_url
            FROM tickets t
            JOIN match_ticket_configs mtc ON t.match_config_id = mtc.id
            LEFT JOIN stadium_zones sz ON mtc.stadium_zone_id = sz.id
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
// cập nhật trạng thái đơn
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
// lấy đơn của ng dùng
const getOrdersByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const query = `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`;
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    }
};
// hủy đơn
const cancelOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        const orderRes = await client.query('SELECT status FROM orders WHERE id = $1', [id]);
        if (orderRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        
        const currentStatus = orderRes.rows[0].status;
        if (currentStatus !== 'PENDING') {
             await client.query('ROLLBACK');
            return res.status(400).json({ message: "Đơn hàng không thể hủy (Đã thanh toán hoặc đang giao)." });
        }

        const ticketsRes = await client.query(`
            SELECT match_config_id, COUNT(*) as count 
            FROM tickets WHERE order_id = $1 GROUP BY match_config_id
        `, [id]);

        for (const row of ticketsRes.rows) {
            await client.query(`
                UPDATE match_ticket_configs SET quantity_sold = quantity_sold - $1 WHERE id = $2
            `, [row.count, row.match_config_id]);
        }

        await client.query("UPDATE orders SET status = 'CANCELLED' WHERE id = $1", [id]);
        await client.query("UPDATE tickets SET status = 'INVALID' WHERE order_id = $1", [id]);

        await client.query('COMMIT');
        res.json({ message: "Đã hủy đơn hàng và hoàn vé thành công!" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Lỗi Server');
    } finally {
        client.release();
    }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus, getOrdersByUser, cancelOrder };
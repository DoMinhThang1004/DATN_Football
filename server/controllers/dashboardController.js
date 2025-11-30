const pool = require('../db');

const getStats = async (req, res) => {
  try {
    //tổng
    const revenueRes = await pool.query(`
      SELECT SUM(total_amount) as total 
      FROM orders 
      WHERE status = 'PAID'
    `);
    const totalRevenue = revenueRes.rows[0].total || 0;

    //tổnh vé đã bán
    const ticketRes = await pool.query(`
      SELECT COUNT(*) as total 
      FROM tickets 
      WHERE status IN ('VALID', 'USED')
    `);
    const totalTickets = ticketRes.rows[0].total || 0;

    //tổng tk user
    const userRes = await pool.query(`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE role = 'USER'
    `);
    const totalUsers = userRes.rows[0].total || 0;

    //đơn hàng mới nhất hiện ra
    const recentOrdersRes = await pool.query(`
      SELECT 
        o.id, 
        o.total_amount, 
        o.status, 
        o.created_at,
        u.full_name
      FROM orders o LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 50
    `);
// biểu đồ
    const chartData = []; 

    res.json({
      revenue: totalRevenue,
      tickets: totalTickets,
      users: totalUsers,
      recentOrders: recentOrdersRes.rows,
      revenueChart: chartData
    });

  } catch (err) {
    console.error("Lỗi Dashboard:", err.message);
    res.status(500).send('Lỗi Server');
  }
};

module.exports = { getStats };
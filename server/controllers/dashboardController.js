const pool = require('../db');

const getStats = async (req, res) => {
  try {
    // đh đã tt
    const revenueRes = await pool.query(
      ` SELECT SUM(total_amount) as total 
      FROM orders 
      WHERE status = 'PAID' `);
    const totalRevenue = revenueRes.rows[0].total || 0;

    const ticketRes = await pool.query(` SELECT COUNT(*) as total 
      FROM tickets 
      WHERE status IN ('VALID', 'USED')`);
    const totalTickets = ticketRes.rows[0].total || 0;

    const userRes = await pool.query(` SELECT COUNT(*) as total 
      FROM users 
      WHERE role = 'USER'`);
    const totalUsers = userRes.rows[0].total || 0;

    //theo ngày, tổng tiền và số đơn
    const chartRes = await pool.query(`SELECT 
            TO_CHAR(created_at, 'DD/MM') as name, 
            SUM(total_amount) as revenue,
            COUNT(id) as tickets
        FROM orders 
        WHERE status = 'PAID' 
        AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY TO_CHAR(created_at, 'DD/MM'), DATE(created_at)
        ORDER BY DATE(created_at) ASC `);

    const chartData = chartRes.rows.map(item => ({
        name: item.name,
        revenue: Number(item.revenue),
        tickets: Number(item.tickets)
    }));

    //đh ms nhất
    const recentOrdersRes = await pool.query(`  SELECT 
        o.id, 
        o.total_amount, 
        o.status, 
        o.created_at,
        u.full_name,
        u.phone
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 50 `);

    res.json({
      revenue: totalRevenue,
      tickets: totalTickets,
      users: totalUsers,
      recentOrders: recentOrdersRes.rows,
      revenueChart: chartData // trả về 
    });

  } catch (err) {
    console.error("Lỗi Dashboard:", err.message);
    res.status(500).send('Lỗi Server');
  }
};

module.exports = { getStats };
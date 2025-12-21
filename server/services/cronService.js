const cron = require('node-cron');
const pool = require('../db'); 

const startOrderCleanup = () => {
    //cấu hình chạy mỗi p
    cron.schedule('*/1 * * * *', async () => {
        try {
            console.log("Đang kiểm tra các đơn hàng quá hạn thanh toán...");
            //kt đơn PENDING và tạo cách đây hơn 15 phút = data created_at < NOW() - INTERVAL '15 minutes' 
            const result = await pool.query(`UPDATE orders 
                SET status = 'CANCELLED' 
                WHERE status = 'PENDING' 
                AND created_at < NOW() - INTERVAL '15 minutes'
                RETURNING id;`);

            if (result.rowCount > 0) {
                console.log(`Đã tự động hủy ${result.rowCount} đơn hàng quá hạn 15 phút.`);
                //UPDATE tickets SET status = 'AVAILABLE' WHERE order_id IN (...)
            }
        } catch (error) {
            console.error("Lỗi Cron Job hủy đơn:", error);
        }
    });
};
module.exports = { startOrderCleanup };
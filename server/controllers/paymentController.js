const paymentService = require('../services/paymentService');

//vnpay
const createPaymentUrl = async (req, res) => {
    try {
        const { amount, orderId, orderInfo } = req.body;
        
        //lấy ip kh
        let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
        if (ipAddr && ipAddr.includes(',')) ipAddr = ipAddr.split(',')[0].trim();
        if (ipAddr === '::1') ipAddr = '127.0.0.1';

        //gọi servce tạo url
        const paymentUrl = await paymentService.createVnpayUrl({ amount, orderId, orderInfo, ipAddr });
        
        res.json({ paymentUrl });
    } catch (error) {
        console.error("Lỗi Create Payment:", error);
        res.status(500).send("Lỗi Server: " + error.message);
    }
};

const vnpayReturn = async (req, res) => {
    try {
        // gọi service xác thực
        const result = await paymentService.verifyVnpayReturn(req.query);
        res.json(result);
    } catch (error) {
        console.error("Lỗi VNPAY Return:", error);
        res.status(500).json({ code: "99", message: "Lỗi Server" });
    }
};

const vnpayIPN = async (req, res) => {
    res.status(200).json({RspCode: '00', Message: 'Confirm Success'});
};

// momo
const createMomoPaymentUrl = async (req, res) => {
    try {
        const result = await paymentService.createMomoUrl(req.body);
        
        if (result && result.payUrl) {
             res.json({ paymentUrl: result.payUrl });
        } else {
             res.status(400).json({ message: "Lỗi MoMo", detail: result });
        }
    } catch (error) {
        res.status(500).send("Lỗi Server MoMo: " + error.message);
    }
};

const momoReturn = async (req, res) => {
    try {
        const result = await paymentService.verifyMomoReturn(req.query);
        if (result.code === "00") {
            return res.json(result); 
        } else {
            // thất bại hay hủy thì trẻ về  tttp stasus 400
            return res.status(400).json(result); 
        }
    } catch (error) {
        console.error("Lỗi SERVER MOMO RETURN:", error);
        return res.status(500).json({ code: "500", message: "Lỗi Server Nội Bộ" });
    }
};

const momoIPN = async (req, res) => {
    // xử lý ipn momo nếu khó thì xl bằng service
    try {
        const { resultCode, orderId } = req.body;
        // táii sử dụng hàm verify nếu muốn logic riêng
        if (resultCode == 0) {
             // chạy demo
             const paymentService = require('../services/paymentService');
             // await paymentService.updateStatus(orderId, 'PAID');
        }
        res.status(204).send(); 
    } catch (e) {
        res.status(500).send();
    }
};

module.exports = { 
    createPaymentUrl, vnpayReturn, vnpayIPN, 
    createMomoPaymentUrl, momoReturn, momoIPN 
};
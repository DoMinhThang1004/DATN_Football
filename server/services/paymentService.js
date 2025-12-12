require('dotenv').config();
const moment = require('moment');
const crypto = require('crypto');
const axios = require('axios');
const pool = require('../db'); 

//sắp xếp theo key
function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
		    str.push(encodeURIComponent(key));
		}
	}
	str.sort();
	for (key = 0; key < str.length; key++) {
		sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
	}
	return sorted;
}

const paymentService = {
    //tạo url vnpay
    createVnpayUrl: async ({ amount, orderId, orderInfo, ipAddr }) => {
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        
        const tmnCode = process.env.VNP_TMN_CODE;
        const secretKey = (process.env.VNP_HASH_SECRET || "").trim();
        const vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        
        const cleanOrderInfo = `Thanh_toan_don_${orderId}`.replace(/[^a-zA-Z0-9_]/g, "");
        vnp_Params['vnp_OrderInfo'] = cleanOrderInfo;

        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = Math.floor(amount * 100);
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        vnp_Params = sortObject(vnp_Params);

        let signData = '';
        let i = 0;
        for (let key in vnp_Params) {
            if (i === 1) signData += '&';
            signData += key + "=" + vnp_Params[key];
            i = 1;
        }

        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        
        return vnpUrl + '?' + signData + '&vnp_SecureHash=' + signed;
    },

    //xủ lý trả về vnpay
    verifyVnpayReturn: async (vnp_Params) => {
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        const secretKey = (process.env.VNP_HASH_SECRET || "").trim();
        
        let signData = '';
        let i = 0;
        for (let key in vnp_Params) {
            if (i === 1) signData += '&';
            signData += key + "=" + vnp_Params[key];
            i = 1;
        }

        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");     

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            
            //lấy tt thêm 
            const amount = vnp_Params['vnp_Amount'] / 100;
            const transactionNo = vnp_Params['vnp_TransactionNo'];
            const bankCode = vnp_Params['vnp_BankCode'];
            
            const orderCheck = await pool.query("SELECT * FROM orders WHERE id = $1", [orderId]);
            if (orderCheck.rows.length === 0) {
                return { code: "97", message: "Không tìm thấy đơn hàng" };
            }
            const currentOrder = orderCheck.rows[0];

            //tt ok r thì trả về
            if (currentOrder.status === 'PAID') {
                return { code: "00", message: "Giao dịch đã thành công trước đó", orderId };
            }

            if (vnp_Params['vnp_ResponseCode'] === '00' && vnp_Params['vnp_TransactionStatus'] === '00') {
                // cập nhật paid khi vnpay và momo ==00
                await pool.query("UPDATE orders SET status = 'PAID', payment_method = 'VNPAY' WHERE id = $1", [orderId]);
                
                // thêm vào bảng thanh toán
                const paymentCheck = await pool.query("SELECT id FROM payments WHERE transaction_code = $1", [transactionNo]);
                if (paymentCheck.rows.length === 0) {
                    await pool.query(
                        `INSERT INTO payments (
                            order_id, payment_method, transaction_code, amount, status, paid_at
                        ) VALUES ($1, $2, $3, $4, $5, NOW())`,
                        [orderId, 'vnpay', transactionNo, amount, 'success']
                    );
                }

                return { code: "00", message: "Giao dịch thành công", orderId };
            } else {
                // nếu có trạng thái nào khác
                await pool.query("UPDATE orders SET status = 'PENDING' WHERE id = $1", [orderId]);
                return { code: "97", message: "Giao dịch thất bại" };
            }
        } else {
            return { code: "99", message: "Chữ ký không hợp lệ" };
        }
    },

    //tạo url momo
    createMomoUrl: async ({ amount, orderId, orderInfo }) => {
        const { MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY, MOMO_ENDPOINT, MOMO_RETURN_URL, MOMO_IPN_URL } = process.env;
        const requestId = orderId;
        const requestType = "captureWallet";
        const extraData = ""; 
        const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO_IPN_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${MOMO_RETURN_URL}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', MOMO_SECRET_KEY).update(rawSignature).digest('hex');

        const requestBody = {
            partnerCode: MOMO_PARTNER_CODE, partnerName: "FootballTic", storeId: "MomoTestStore", requestId, amount, orderId, orderInfo, redirectUrl: MOMO_RETURN_URL, ipnUrl: MOMO_IPN_URL, lang: "vi", requestType, autoCapture: true, extraData, signature
        };

        const response = await axios.post(MOMO_ENDPOINT, requestBody);
        return response.data; 
    },

    verifyMomoReturn: async ({ resultCode, orderId, transId, amount }) => { 
    const orderCheck = await pool.query("SELECT * FROM orders WHERE id = $1", [orderId]);
    if (orderCheck.rows.length === 0) return { code: "99", message: "Không tìm thấy đơn hàng" };
    
    const currentOrder = orderCheck.rows[0];
    
    //kiểm tra tb từ momo
    if (resultCode != '0') {
        //cập nhật trạng thái
        await pool.query("UPDATE orders SET status = 'PENDING' WHERE id = $1", [orderId]);
        
        // trả về lỗi để controller biết thất bại và trả về
        return { code: "99", message: "Giao dịch thất bại hoặc bị hủy" }; 
    }
    
    //xử lý trạng thái
    if (currentOrder.status === 'PAID') { 
         return { code: "00", message: "Giao dịch đã thành công trước đó", orderId };
    }
    //xử lý gd thành công
    if (resultCode == '0') {
        await pool.query("UPDATE orders SET status = 'PAID', payment_method = 'MOMO' WHERE id = $1", [orderId]);
        return { code: "00", message: "Giao dịch thành công", orderId };
    }
    return { code: "99", message: "Lỗi xử lý trạng thái." };
}
};
module.exports = paymentService;
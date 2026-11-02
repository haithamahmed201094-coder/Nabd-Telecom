/**
 * خادم الواجهة الخلفية لنظام سداد الاتصالات (Yemen Telecom Core Backend)
 * يعمل بدون حزم خارجية عبر محرك Node.js القياسي (Zero-Dependency)
 */

const http = require('http');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT || 3000;

// قاعدة بيانات في الذاكرة (In-Memory Database) تحاكي قاعدة البيانات الحقيقية
const db = {
  user: {
    id: 1,
    name: 'أحمد القحطاني',
    phone: '771234567',
    role: 'super_agent',
    pinHash: crypto.createHash('sha256').update('1234').digest('hex'), // PIN: 1234
    deviceUuid: 'dev-mock-uuid-8899',
  },
  wallets: {
    YER_OLD: { currency: 'YER_OLD', name: 'ريال يمني (صنعاء)', balance: 45200.00, locked: 0.00 },
    YER_NEW: { currency: 'YER_NEW', name: 'ريال يمني (عدن)', balance: 128500.00, locked: 0.00 },
    SAR: { currency: 'SAR', name: 'ريال سعودي', balance: 520.00, locked: 0.00 },
  },
  services: [
    {
      id: 'ym',
      name: 'يمن موبايل',
      category: 'telecom',
      color: '#C00000',
      packages: [
        { id: 101, name: 'رصيد فوري (مباشر)', price: 1000, cost: 980, type: 'credit' },
        { id: 102, name: 'باقة مزايا نت 3GB (شهرية)', price: 1400, cost: 1350, type: 'data' },
        { id: 103, name: 'باقة فورجي 12GB سوبر', price: 3800, cost: 3680, type: 'data' },
        { id: 104, name: 'باقة هدايا نت 6GB', price: 2400, cost: 2320, type: 'data' },
      ]
    },
    {
      id: 'you',
      name: 'يو (YOU)',
      category: 'telecom',
      color: '#FFCC00',
      packages: [
        { id: 201, name: 'رصيد فوري يو', price: 1000, cost: 985, type: 'credit' },
        { id: 202, name: 'باقة سمارت نت أسبوعية 1.5GB', price: 850, cost: 820, type: 'data' },
        { id: 203, name: 'باقة يو ماكس شهرية 10GB', price: 4200, cost: 4050, type: 'data' },
      ]
    },
    {
      id: 'sabafon',
      name: 'سبأفون',
      category: 'telecom',
      color: '#007A3D',
      packages: [
        { id: 301, name: 'رصيد سبأفون فوري', price: 1000, cost: 980, type: 'credit' },
        { id: 302, name: 'باقة سوبر نت الشهرية', price: 2100, cost: 2020, type: 'data' },
      ]
    },
    {
      id: 'yemen4g',
      name: 'يمن فورجي (Yemen 4G)',
      category: 'internet',
      color: '#2C3E50',
      packages: [
        { id: 401, name: 'تجديد باقة 25GB', price: 2400, cost: 2300, type: 'internet' },
        { id: 402, name: 'تجديد باقة 60GB', price: 4800, cost: 4650, type: 'internet' },
        { id: 403, name: 'تجديد باقة 130GB', price: 9600, cost: 9350, type: 'internet' },
      ]
    },
    {
      id: 'adsl',
      name: 'الإنترنت المنزلي ADSL / فايبر',
      category: 'internet',
      color: '#16A085',
      packages: [
        { id: 501, name: 'سداد فاتورة إنترنت منزلي', price: 3000, cost: 2950, type: 'bill' },
      ]
    },
    {
      id: 'gaming',
      name: 'شحن ألعاب وبطاقات رقمية',
      category: 'games',
      color: '#8E44AD',
      packages: [
        { id: 601, name: 'ببجي موبايل 60 شدة', price: 750, cost: 710, type: 'game' },
        { id: 602, name: 'ببجي موبايل 325 شدة', price: 3400, cost: 3250, type: 'game' },
        { id: 603, name: 'فري فاير 100+10 جوهرة', price: 800, cost: 760, type: 'game' },
      ]
    }
  ],
  bankAccounts: [
    { id: 1, name: 'بنك الكريمي الإسلامي', account: '300124890', holder: 'شركة القحطاني لخدمات الاتصالات' },
    { id: 2, name: 'بنك القطيبي الإسلامي', account: '1288401', holder: 'مؤسسة القحطاني سداد' },
    { id: 3, name: 'شبكة النجم للحوالات', account: '771234567', holder: 'أحمد علي القحطاني' },
  ],
  orders: [],
  transactions: [
    {
      id: 1,
      type: 'credit',
      action: 'deposit',
      amount: 50000,
      balanceAfter: 45200,
      currency: 'YER_OLD',
      reference: 'DEP-884102',
      note: 'تغذية رصيد عبر بنك الكريمي',
      date: new Date(Date.now() - 3600000 * 2).toISOString(),
    }
  ],
  idempotencyCache: new Set(),
};

// مساعدة لمعالجة JSON
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Idempotency-Key, X-Device-UUID',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

// معالج الطلبات الرئيسي
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Idempotency-Key, X-Device-UUID',
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    // 1. فحص الصحة (Health Check)
    if (path === '/health' || path === '/') {
      return sendJson(res, 200, {
        status: 'UP',
        service: 'Yemen Telecom Payment Core API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. تسجيل الدخول والتحقق
    if (path === '/api/v1/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const { phone, password } = body;
      if (phone === '771234567' || phone === 'admin') {
        return sendJson(res, 200, {
          success: true,
          token: 'token_mock_jwt_super_agent_771234567',
          user: {
            id: db.user.id,
            name: db.user.name,
            phone: db.user.phone,
            role: db.user.role,
          }
        });
      }
      return sendJson(res, 401, { success: false, message: 'بيانات الدخول غير صحيحة' });
    }

    // 3. بيانات المحفظة والأرصدة
    if (path === '/api/v1/wallet/balance' && method === 'GET') {
      const currency = parsedUrl.query.currency || 'YER_OLD';
      const wallet = db.wallets[currency] || db.wallets['YER_OLD'];
      return sendJson(res, 200, {
        success: true,
        data: {
          currency: wallet.currency,
          currencyName: wallet.name,
          balance: wallet.balance,
          lockedBalance: wallet.locked,
          allWallets: Object.values(db.wallets),
        }
      });
    }

    // 4. قائمة الخدمات والباقات
    if (path === '/api/v1/services' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        data: db.services,
      });
    }

    // 5. الحسابات البنكية للتغذية
    if (path === '/api/v1/banks' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        data: db.bankAccounts,
      });
    }

    // 6. تنفيذ عملية شحن / سداد باقة (Top-up Order)
    if (path === '/api/v1/orders/topup' && method === 'POST') {
      const idempotencyKey = req.headers['x-idempotency-key'] || ('TX-' + Date.now());
      const body = await parseBody(req);
      const { package_id, target_number, pin, currency = 'YER_OLD' } = body;

      // أ) التحقق من عدم تكرار العملية
      if (db.idempotencyCache.has(idempotencyKey)) {
        return sendJson(res, 409, {
          success: false,
          code: 'DUPLICATE_TRANSACTION',
          message: 'هذه العملية قيد المعالجة أو تم تنفيذها مسبقاً لمنع التكرار',
        });
      }

      // ب) التحقق من رمز PIN الأمني
      const inputPinHash = crypto.createHash('sha256').update(pin || '').digest('hex');
      if (inputPinHash !== db.user.pinHash) {
        return sendJson(res, 403, {
          success: false,
          code: 'INVALID_PIN',
          message: 'رمز الأمان السري (PIN) غير صحيح',
        });
      }

      // ج) جلب الباقة المطلوبة
      let selectedPackage = null;
      let selectedService = null;
      for (const s of db.services) {
        const p = s.packages.find(pkg => pkg.id === Number(package_id));
        if (p) {
          selectedPackage = p;
          selectedService = s;
          break;
        }
      }

      if (!selectedPackage) {
        return sendJson(res, 404, { success: false, message: 'الباقة المحددة غير موجودة' });
      }

      // د) التحقق من رصيد المحفظة
      const wallet = db.wallets[currency] || db.wallets['YER_OLD'];
      if (wallet.balance < selectedPackage.price) {
        return sendJson(res, 400, {
          success: false,
          code: 'INSUFFICIENT_FUNDS',
          message: `رصيدك الحالي (${wallet.balance.toFixed(2)} ${wallet.name}) غير كافٍ لسداد هذه الباقة (${selectedPackage.price})`,
        });
      }

      // هـ) حجز المفتاح لمنع التكرار
      db.idempotencyCache.add(idempotencyKey);

      // و) خصم الرصيد وتحديث الحساب
      const balanceBefore = wallet.balance;
      wallet.balance -= selectedPackage.price;

      const orderUuid = 'ORD-' + crypto.randomUUID().substring(0, 8).toUpperCase();
      const externalRef = 'TELCO-REF-' + Math.floor(100000 + Math.random() * 900000);

      const order = {
        order_uuid: orderUuid,
        idempotency_key: idempotencyKey,
        service: selectedService.name,
        package: selectedPackage.name,
        target_number,
        price: selectedPackage.price,
        profit: selectedPackage.price - selectedPackage.cost,
        currency,
        status: 'completed',
        external_reference: externalRef,
        created_at: new Date().toISOString(),
      };

      db.orders.unshift(order);

      // ز) إضافة قيد مالي في دفتر الحركات
      db.transactions.unshift({
        id: db.transactions.length + 1,
        type: 'debit',
        action: 'topup_purchase',
        amount: selectedPackage.price,
        balanceAfter: wallet.balance,
        currency,
        reference: orderUuid,
        note: `تسديد ${selectedPackage.name} للرقم ${target_number}`,
        date: order.created_at,
      });

      return sendJson(res, 200, {
        success: true,
        message: 'تم تسديد وشحن الباقة بنجاح فوري',
        data: {
          order,
          new_balance: wallet.balance,
          receipt: {
            invoice_no: 'INV-' + Date.now().toString().slice(-6),
            service: selectedService.name,
            package: selectedPackage.name,
            target_number,
            amount: selectedPackage.price,
            currency: wallet.name,
            ref_no: externalRef,
            date: order.created_at,
          }
        }
      });
    }

    // 7. إرسال طلب إيداع وتغذية
    if (path === '/api/v1/deposits' && method === 'POST') {
      const body = await parseBody(req);
      const { bank_id, amount, transfer_ref, currency = 'YER_OLD' } = body;

      const depositAmount = parseFloat(amount);
      if (!depositAmount || depositAmount <= 0) {
        return sendJson(res, 400, { success: false, message: 'المبلغ غير صحيح' });
      }

      // إضافة رصيد تجريبي فوري
      const wallet = db.wallets[currency] || db.wallets['YER_OLD'];
      wallet.balance += depositAmount;

      const depRef = transfer_ref || ('DEP-' + Math.floor(100000 + Math.random() * 900000));
      db.transactions.unshift({
        id: db.transactions.length + 1,
        type: 'credit',
        action: 'deposit',
        amount: depositAmount,
        balanceAfter: wallet.balance,
        currency,
        reference: depRef,
        note: `تغذية رصيد معتمدة (حوالة: ${depRef})`,
        date: new Date().toISOString(),
      });

      return sendJson(res, 201, {
        success: true,
        message: 'تم تسجيل وتفعيل إيداع التغذية بنجاح في محفظتك',
        data: {
          new_balance: wallet.balance,
          reference: depRef,
        }
      });
    }

    // 8. كشف حساب العمليات
    if (path === '/api/v1/transactions' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        data: db.transactions,
      });
    }

    // 404 Not Found
    return sendJson(res, 404, { success: false, message: 'المسار المطلوب غير موجود في واجهة الـ API' });

  } catch (error) {
    console.error('Server Error:', error);
    return sendJson(res, 500, { success: false, message: 'خطأ داخلي في الخادم: ' + error.message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Yemen Telecom Backend Server is running at http://127.0.0.1:${PORT}`);
  console.log(`Available APIs: /health, /api/v1/wallet/balance, /api/v1/services, /api/v1/orders/topup, /api/v1/transactions`);
});

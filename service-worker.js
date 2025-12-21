// service-worker.js - لجعل التطبيق يعمل دون اتصال
const CACHE_NAME = 'currencypro-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/config.js',
  '/api.js',
  '/utils.js',
  '/storage.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 تثبيت الكاش');
        return cache.addAll(urlsToCache);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إرجاع من الكاش إن وجد
        if (response) {
          return response;
        }
        
        // جلب من الشبكة
        return fetch(event.request)
          .then(response => {
            // التحقق من أن الاستجابة صالحة للتخزين
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // نسخ الاستجابة للتخزين
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // صفحة دون اتصال
            if (event.request.url.includes('index.html')) {
              return caches.match('/index.html');
            }
            
            // رسالة للطلبات الأخرى
            return new Response(JSON.stringify({
              error: 'No internet connection',
              message: 'Please check your connection and try again'
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
      })
  );
});

// تحديث الخلفية
self.addEventListener('message', event => {
  if (event.data.action === 'UPDATE_RATES') {
    self.updateRatesInBackground();
  }
});

// تحديث الأسعار في الخلفية
self.updateRatesInBackground = async () => {
  try {
    const response = await fetch('https://api.twelvedata.com/time_series?symbol=USD/EUR&interval=5min&outputsize=1&apikey=' + CONFIG.API_KEY);
    const data = await response.json();
    
    // تخزين البيانات في IndexedDB
    const db = await this.openDatabase();
    await this.storeRatesInDB(db, data);
    
    // إرسال إشعار للصفحة
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'RATES_UPDATED',
          data: data,
          timestamp: new Date().toISOString()
        });
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
};

// فتح قاعدة بيانات IndexedDB
self.openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CurrencyProDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // إنشاء مستودع للأسعار
      if (!db.objectStoreNames.contains('exchangeRates')) {
        const store = db.createObjectStore('exchangeRates', { keyPath: 'currencyPair' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // إنشاء مستودع للإعدادات
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
};

// تخزين الأسعار في قاعدة البيانات
self.storeRatesInDB = (db, ratesData) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['exchangeRates'], 'readwrite');
    const store = transaction.objectStore('exchangeRates');
    
    // تخزين كل زوج عملات
    Object.entries(ratesData.rates).forEach(([currency, rate]) => {
      store.put({
        currencyPair: `USD/${currency}`,
        rate: rate,
        timestamp: new Date().toISOString()
      });
    });
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

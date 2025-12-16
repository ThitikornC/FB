# 🚂 Railway Deployment Guide

## ⚙️ ตั้งค่า Environment Variables ใน Railway

1. **ไปที่ Railway Dashboard**
2. **คลิก Project** → **Variables**
3. **เพิ่ม Variables** (Raw mode):

```
FIREBASE_PROJECT_ID=projectdemo-24a30
FIREBASE_PRIVATE_KEY_ID=9c36c60a97a11fa890719eb90b7a3783e164b63e
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD31sYrHzY6kNSP\n9jllH1/9AgkT2Z0bJP4ZONSQsH0rXwC3vV8PWOGRTYg4NZ1DRs7VSdZSGKAPbsZ1\neXFU3+t0ejVq3oENPBUTws+hO0hK/JSSGtdvoGa7DbSuWwBVTF0DCz36bSWHW6wJ\nobUYVpQ/ARF7CJW5gUUtMPkDUGIsqAiWTqyapQK1ynbZlmINZDlKjqNLhcRNQ0SX\nt8dTqF3sdocGwCRyw6sXILxVS0EmlNKbqmf2VUeX+W8q5wRxX7gpR0GZ4I467qxa\npA/4JoIX2RvNoBR64muuvUD7zjfqmijqwiAgbPpjsMVplLRZGxtvoHysxo6o6eFi\n9/LF2zXPAgMBAAECggEAAYRfNoCx6HOI1uVsc4SDe2fUSLqnyLSWGO8X9KzH5LM9\nAg2W3oquPXaf3gGMrWPqZzQqVi/6vC1y6eGCQpaTo+UNnP0GBYqNHHpa+AMwuEN0\ni10TsttkquzKDYPWwYQ+pi1Jm1X+CVE+gS6WuQfqpLoWcnjaexth94VZuN34mTUJ\nBvnJuY2EaIUjIC9Fo8fkEAxSZJwkVON9+gpoqsiJoB/c5peS/ZH2k4FmiGHRyNf3\nCjsF4a4hkUSaoc8DL738LgLtQ1nLOjM+g5yZMPnR6TLtpnNQkM4SMiZ704zqR7Ev\neTETTtj6f5+85KmdBjFgTRyVHyjzVRq13dlbOz18ZQKBgQD8v4Sl0Z/OMfdNtDVl\nIAkz9qGEyAhzjQOtJ4mKsev883J9zlY5gaMAYi3qpv8eUx9/q4mIOasweIPcvlgb\noX+t/MegdpNaUOVNF3Fau9KAJtQNLSR3080zqcpX1SvqcYZgdYcsx+QNPn3ZwUNE\nnJFTcv/+SPsvG8VMbYnKO0wJkwKBgQD7BxYn9rScnTcK8rZKo9f7sDYCzFJHRAe7\n5ccLepKIU9oCVf8wg2W0gvnQb9qnWTOrg7YFQevEVekjjMxi9aDp8zX2QjcH4u3L\noBTyjlJgzKReeLpaGn+uW/CxL4UpqzF1C+f+IxFEZggnfk2YRovORQYFhUAoUTyj\nEPDRsVjYVQKBgCElsOzaUB4HuYpMTxBjIjHZb5dtcIZPASNtYwF4kh2LhAFx1ScX\nlFwRhDoZCq5ccm4Y/iGKhqQFui1yHTYKeSdFVpz50BtxLpFsuKYQqeu6q+bKe9Tn\nRys2Yl4gi/DkUJ5H66F42bTO9Exhp0PRUNHj7CTaR28HMlnyp7aJDlDXAoGBAIeS\nAjM/F7flaE6vWifhaMnzFphYRK9cXFjr9Z2LawvZTUopq5JFxG3CtqwNXKc4k6Ez\nluAsA+qbAzhB2Dgxs9/li+UdSZ8mvYpVQDrnBjJlEvg6d1omKYK/ALSQl3gzjphJ\n/9bOlYq9F/ZMThfJMcQKnv/oQQgFJ5xhj82P3A2pAoGAVkcz9gQZxNX5egRx4ibm\niiUlaL0D4RbPfQ1RLnynHDUx0sB0G6/lUq/GxNT/hJKm6E+ZYOQoRCJtqYqa18Cq\nIDRI3+HAN625BJDY6pWOsSyr4+zZFnrXTMlVbYzQDPeKwRxerIIMyFFQDD8wDHHy\nCGDiiFmb3Zjfdn7osU6eaU8=\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-2tt82@projectdemo-24a30.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=113864286089965683203
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-2tt82%40projectdemo-24a30.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=projectdemo-24a30.firebasestorage.app
NODE_ENV=production
```

## ⚡ วิธีตั้งค่า

### Option 1: ผ่าน Railway Dashboard
1. ไปที่ **Variables** tab
2. คลิก **Raw editor**
3. วาง config ทั้งหมด
4. **Save**

### Option 2: ผ่าน Railway CLI
```bash
railway variables:set FIREBASE_PROJECT_ID=projectdemo-24a30
railway variables:set FIREBASE_PRIVATE_KEY_ID=9c36c60a97a11fa890719eb90b7a3783e164b63e
# ... etc
```

## 🔍 Debug

ดู logs ใน Railway Dashboard เพื่อตรวจสอบ:
```
✅ FIREBASE_PROJECT_ID: Set
✅ FIREBASE_PRIVATE_KEY: Set
...
```

## 🔗 URL

ดู **Deployments** tab ใน Railway เพื่อรับ URL ของแอป

## ⚠️ สำคัญ

- ✅ `.env` ไฟล์ **ไม่ได้ถูกส่งไป Railway** (อยู่ใน .gitignore)
- ✅ ต้องตั้ง variables ใน Railway Dashboard
- ✅ Railway อ่าน variables จากคอนฟิกของมัน ไม่ใช่ไฟล์

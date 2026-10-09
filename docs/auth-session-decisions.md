# PWA-POS — เรื่องที่พักไว้: logout, Session, Cookie, Deploy

อัปเดต: 2026-10-05

## เอกสารนี้มีไว้ทำอะไร

บันทึกการตัดสินใจเรื่อง session และ token ที่คุยจบแล้วแต่ **ตั้งใจเลื่อนไปทำทีหลัง** ไม่ใช่ลืม

เขียนไว้เพราะเรื่องนี้ใช้เวลาคุยหลายรอบ และคำตอบขึ้นกับเรื่อง deploy ที่ยังไม่ตัดสินใจ ถ้าไม่บันทึกไว้ ตอนกลับมาทำจะต้องไล่คิดใหม่ทั้งหมด

**ทำเมื่อไหร่:** ตอนเริ่มโมดูลที่ 10 (Auth เพิ่มเติม) หรือตอนเริ่มทำ frontend auth อันไหนถึงก่อน

| เรื่องอื่น | อ่านที่ |
|---|---|
| แผนงานทั้งหมด 10 โมดูล | `claude/backend-todo.md` |
| เหตุผลที่ใส่ helmet, throttler, CORS | `claude/security-hardening-rationale.md` |
| กฎการเขียนโค้ด 3 ชั้น, mapper, try/catch | `claude/backend-coding-standard.md` |
| กฎธุรกิจเรื่อง user และ session | `business-rules-pos-updated.md` ข้อ USR-02, USR-06 |

---

## สารบัญ

| ข้อ | เรื่อง | สถานะ |
|---|---|---|
| 1 | สถานะปัจจุบันของ auth | อ่านก่อน |
| 2 | JWT ทำลายไม่ได้ — ทำไม | ตัดสินใจแล้ว |
| 3 | `POST /auth/logout` | ยังไม่ทำ · ทำได้เลย |
| 4 | `token_version` — เพิกถอน token ทันที | ยังไม่ทำ |
| 5 | refresh token | ยังไม่ทำ |
| 6 | เก็บ access token ที่ไหน | **ยังไม่ตัดสินใจ** |
| 7 | deploy — origin เดียวหรือแยกโดเมน | **ยังไม่ตัดสินใจ** |
| 8 | Vite proxy | ยังไม่ทำ · ทำตอนเริ่ม frontend |
| 9 | ลำดับการทำ | แผน |
| 10 | checklist | ใช้ตอนทำ |

---

## 1. สถานะปัจจุบันของ auth

ของที่มีอยู่จริงวันที่เขียนเอกสารนี้

| ของ | สถานะ |
|---|---|
| `POST /auth/login` | ทำแล้ว ใช้งานได้ ทดสอบ 2 ร้านผ่าน |
| access token (JWT) | มี · `expiresIn` มาจาก `JWT_EXPIRES_IN` ค่าเริ่มต้น `1d` |
| refresh token | **ไม่มี** · ตาราง `refresh_tokens` สร้างไว้แล้วแต่ว่างเปล่า ไม่มีโค้ดเขียนลง |
| `POST /auth/logout` | **ไม่มี** |
| `token_version` | คอลัมน์มีใน `users` แต่ **ไม่มีใครอ่าน** |
| frontend เก็บ token ที่ไหน | **ยังไม่ได้ทำ frontend auth** จึงยังไม่ได้เลือก |
| `JwtAuthGuard` | ทำแล้ว อ่าน token จาก header `Authorization: Bearer` |
| `PermissionsGuard` | ทำแล้ว ทดสอบแล้ว |

---

## 2. JWT ทำลายไม่ได้ — ทำไม

**ข้อสรุป: "ลบ token ฝั่ง server" เป็นไปไม่ได้โดยธรรมชาติของ JWT**

JWT เป็น stateless — server ไม่เคยเก็บ token ไว้ที่ไหนเลย ไม่มีตาราง ไม่มี Redis ไม่มีไฟล์

ตอน request เข้ามา guard ทำแค่ 2 อย่าง

1. ตรวจลายเซ็นด้วย `JWT_SECRET`
2. เทียบ `exp` กับเวลาปัจจุบัน

ผ่านทั้งคู่ก็เข้าได้ ไม่มีขั้นตอนที่ไปถาม DB ว่า token ใบนี้ยังใช้ได้ไหม

ต่างจาก session cookie แบบเดิมที่ server เก็บ session id ไว้ใน DB — อันนั้นลบแถวเดียวจบ

**ผลที่ตามมา:** ถ้าอยากตัด token ที่ยังไม่หมดอายุ ต้องเพิ่ม state ฝั่ง server เข้ามา ซึ่งคือข้อ 4 และ 5

---

## 3. `POST /auth/logout`

### ทำไมต้องมี endpoint ถ้า token ทำลายไม่ได้

เพราะ **audit log**

`audit_logs` มี 17 `action_type` โดย 13 ตัวเขียนด้วย trigger ใน DB และอีก **4 ตัวต้องเขียนจาก NestJS** คือ `login_success`, `login_failed`, `logout`, `tenant_updated`

trigger เขียน `logout` ให้ไม่ได้ เพราะตอน logout ไม่มีการ INSERT หรือ UPDATE ตารางไหนเกิดขึ้น ไม่มี trigger ตัวใดถูกยิง

ถ้าไม่มี endpoint นี้ `audit_logs` จะมีแต่ `login_success` ไม่มีคู่ `logout` ตอนสืบว่า "ใครอยู่ในระบบช่วงที่บิลหาย" จะตอบได้แค่ว่าใครเข้ามา ไม่รู้ว่าใครออกไปแล้ว

### โค้ด

```ts
// auth.controller.ts — ไม่ใส่ @Public() เพราะต้องรู้ว่าใครออก
@Post('logout')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'ออกจากระบบ' })
@ApiOkResponse({ description: 'ออกจากระบบแล้ว' })
@ApiUnauthorizedResponse({ description: 'token ไม่ถูกต้องหรือหมดอายุ' })
logout() {
    return this.authService.logout();
}
```

```ts
// auth.service.ts
async logout() {
    await this.authRepository.writeLogoutAudit();
    return { status: 'success', message: 'ออกจากระบบแล้ว' };
}
```

```ts
// auth.repository.ts
async writeLogoutAudit() {
    await this.db.query(
        `SELECT audit_write(app_tenant_id(), 'logout', '{}'::jsonb)`,
    );
}
```

ใช้ `app_tenant_id()` ได้เพราะ route นี้ผ่าน guard แล้ว interceptor ตั้ง tenant context ไว้ครบ — ต่างจาก `login` ที่ยังไม่มี context จึงต้องส่ง `$1` เข้าไปตรง ๆ (ดู `claude/backend-coding-standard.md` §9.5)

### ฝั่ง frontend ต้องทำอะไร

```ts
try {
    await api.post('/auth/logout');
} finally {
    // ลบ token ทิ้งเสมอ แม้ response เป็น 401
    authStore.clear();
    navigate('/login');
}
```

**Edge case ที่ต้องรองรับ:** พนักงานเปิดแอปค้างไว้ข้ามคืน token หมดอายุ แล้วกดปุ่ม "ออกจากระบบ" จะได้ 401 ก่อนเข้าถึง controller

ถ้า frontend เขียนว่า "ลบ token เมื่อได้ 200" ปุ่มจะกดไม่ได้เลย ผู้ใช้ค้างอยู่หน้าเดิมและออกจากระบบไม่ได้ จึงต้องใช้ `finally` ไม่ใช่ `then`

### ประมาณเวลา

20 นาที · ไม่ขึ้นกับการตัดสินใจเรื่องอื่นเลย ทำได้ทันทีที่กลับมา

---

## 4. `token_version` — เพิกถอน token ทันที

### ปัญหาที่ต้องแก้

กฎ USR-02 เขียนว่า "User ที่ `is_active = false` login ไม่ได้อีก"

**ตอนนี้เป็นจริงแค่ครึ่งเดียว** — login ใหม่ไม่ได้จริง แต่ token ใบเก่าที่เขาถืออยู่ยังใช้ได้ต่ออีกถึง 24 ชั่วโมง

สถานการณ์จริง: ไล่พนักงานออกบ่าย 3 กด `is_active = false` เขาเดินออกไปพร้อมโทรศัพท์ที่มี token อายุเหลือถึงบ่าย 3 วันพรุ่งนี้ ยังยกเลิกบิล ดูรายงานยอดขาย แก้ราคาเมนูได้ตามสิทธิ์เดิมทั้งหมด

นี่เป็นช่องที่ขัดกับกฎที่โปรเจกต์เขียนไว้เอง และเป็นข้อที่กรรมการสอบถามได้ตรง ๆ ว่า "ปิดบัญชีแล้วเขาเข้าได้อีกไหม"

### 2 ทางเลือก และเหตุผลที่เลือกทางที่ 2

| | Blacklist (เก็บ token ที่ยกเลิก) | `token_version` |
|---|---|---|
| วิธี | เก็บ `jti` ของ token ที่ถูกยกเลิกไว้ใน Redis หรือตาราง ทุก request เช็คว่าอยู่ในนั้นไหม | ใส่ `tv` ลงใน payload ตอนออก token ทุก request เทียบกับ `users.token_version` |
| ตัดได้ทันที | ได้ | ได้ |
| ขนาดที่เก็บ | โตตามจำนวน token ที่ยกเลิก ต้องมี TTL ไล่ลบ | ไม่โต เป็น integer 1 คอลัมน์ |
| ของที่ต้องเพิ่มเข้า stack | Redis หรือตารางใหม่ + cron ล้าง | **ไม่มี — คอลัมน์มีอยู่แล้ว** |
| ตัดได้ละเอียดแค่ไหน | ทีละใบ (logout เครื่องเดียว) | ทีละคน (เด้งทุกเครื่องของคนนั้น) |
| ต้นทุนต่อ request | 1 ครั้งที่ Redis ประมาณ 1 ms | 1 query DB หรือ cache |

**เลือก `token_version`** เพราะ

1. คอลัมน์มีอยู่แล้วตาม USR-06 ไม่ต้อง migrate
2. ไม่ต้องเพิ่ม Redis เข้า stack — ทีม 2 คน 3 เดือน ของที่ต้อง deploy เพิ่มคือต้นทุนจริง
3. "เด้งทุกเครื่องของคนนั้น" ตรงกับ use case ที่ต้องการอยู่แล้ว — ไล่คนออกก็ควรเด้งทุกเครื่อง

### ต้องแก้ 3 จุด

```ts
// 1. auth.service.ts — ใส่ tv ตอนออก token
const payload = {
    sub: user.user_id,
    tenantID: user.tenant_id,
    role: user.role_name,
    tv: user.token_version,
};
```

```ts
// 2. jwtAuth.guard.ts — เทียบกับค่าใน DB
const current = await this.usersRepository.findTokenVersion(payload.sub);
if (current !== payload.tv) {
    throw new UnauthorizedException('กรุณาเข้าสู่ระบบใหม่');
}
```

```sql
-- 3. ตอนปิดใช้งาน user หรือเปลี่ยนรหัสผ่าน ต้องขยับค่า
UPDATE users
SET is_active = false,
    token_version = token_version + 1
WHERE user_id = $1
```

### กับดักที่ต้องระวัง

ข้อ 2 เพิ่ม query 1 ครั้งต่อ **ทุก request ของทุกคน** ถ้าไม่ cache คือการสร้าง bottleneck ขึ้นมาเองเพื่อแก้ปัญหาความปลอดภัย

**ต้อง cache** ด้วยรูปแบบเดียวกับ `PermissionCacheService` ที่มีอยู่แล้วในโปรเจกต์ — เก็บไว้ในหน่วยความจำแล้ว invalidate ตอน `token_version` ขยับ

### ที่ลดความเสี่ยงได้ถูกกว่า

ลด `expiresIn` จาก `1d` เหลือ `15m` ช่องโหว่หุบจาก 24 ชั่วโมงเหลือ 15 นาที โดยไม่ต้องแตะ guard เลย

⚠ **ห้ามลด `expiresIn` ก่อนทำ refresh token** ไม่งั้นพนักงานจะถูกเด้งออกกลางกะทุก 15 นาที — คงไว้ `1d` จนกว่าข้อ 5 จะเสร็จ

---

## 5. refresh token

ตาราง `refresh_tokens` เตรียมไว้แล้วตาม USR-06 แต่ยังไม่มีโค้ดเขียนลง

### สองใบต่างกันอย่างไร

| | access token | refresh token |
|---|---|---|
| อายุ | 15 นาที | 7 ถึง 30 วัน |
| เก็บที่ | ฝั่ง client เท่านั้น | ตาราง `refresh_tokens` + ฝั่ง client |
| server เก็บไหม | ไม่ — stateless | **เก็บ** จึงเพิกถอนได้ |
| ใช้ตอน | ทุก request | ขอ access token ใบใหม่เท่านั้น |
| login | ออกทั้ง 2 ใบ | |
| logout | ลบที่ client | **ลบแถวใน DB = เพิกถอนจริง** |

**จุดสำคัญ:** refresh token คือตัวที่ทำให้ logout "ทำลาย" ได้จริง เพราะมันมี state ใน DB ส่วน access token ยังทำลายไม่ได้ตลอดไป แค่อายุสั้นลงจาก 1 วันเป็น 15 นาที

### ที่ต้องทำ

- `POST /auth/refresh` — รับ refresh token คืน access token ใบใหม่
- ตอน login เขียนแถวลง `refresh_tokens`
- ตอน logout ลบแถวนั้น
- พิจารณา refresh token rotation (ออกใบใหม่ทุกครั้งที่ใช้ แล้วยกเลิกใบเก่า) — กันกรณี refresh token ถูกขโมย

---

## 6. เก็บ access token ที่ไหน — **ยังไม่ตัดสินใจ**

### 4 ทางเลือก

| ที่เก็บ | JavaScript อ่านได้ไหม | รอด refresh หน้า | ความเสี่ยงหลัก |
|---|---|---|---|
| `localStorage` | **ได้** | รอด | XSS ขโมยไปใช้ได้ 24 ชม. · **ค้างข้ามกะ** |
| `sessionStorage` | **ได้** | รอด (ตายเมื่อปิดแท็บ) | XSS เหมือนกัน แต่หน้าต่างแคบลง |
| ตัวแปรใน memory | ไม่ได้ | **ไม่รอด** | refresh หน้าแล้วหลุด login |
| **cookie `httpOnly`** | **ไม่ได้** | รอด | CSRF — ต้องกันด้วย `SameSite` |

`httpOnly` คือ flag ที่สั่ง browser ว่า "ห้าม JavaScript แตะ cookie นี้" สคริปต์ที่ถูกแทรกเข้ามาอ่านไม่ได้เลย ส่วน `localStorage` เป็น API ธรรมดา โค้ดบรรทัดเดียวดูดได้หมด

OWASP HTML5 Security Cheat Sheet ระบุไว้ว่าห้ามเก็บ session identifier ใน local storage

### เรื่องที่สำคัญกว่า XSS สำหรับร้านอาหาร

`localStorage` **ค้างข้ามกะ**

แท็บเล็ตหน้าเคาน์เตอร์ พนักงานกะเช้าปิดเบราว์เซอร์กลับบ้าน กะบ่ายเปิดมา token อายุ 24 ชั่วโมงยังอยู่ เข้าเป็นคนเดิมทันที

ทุกบิลที่กะบ่ายคิดเงินจะขึ้นชื่อพนักงานกะเช้าใน `audit_logs` — audit log ที่ลงทุนทำไว้ทั้งระบบกลายเป็นข้อมูลผิด และตอนบิลหายจะชี้ผิดคน

นี่ไม่ใช่ช่องโหว่ทฤษฎี มันจะเกิดวันแรกที่เอาไปใช้จริง

### ถ้าเลือก cookie `httpOnly` — โค้ดที่ต้องเขียน

```bash
npm i cookie-parser
npm i -D @types/cookie-parser
```

```ts
// main.ts
import cookieParser from 'cookie-parser';

app.use(cookieParser());
app.enableCors({
    origin: (config.get<string>('CORS_ORIGIN') ?? 'http://localhost:5173').split(','),
    credentials: true,          // บรรทัดนี้ขาดไม่ได้ ไม่งั้น browser ไม่ส่ง cookie
});
```

```ts
// auth.controller.ts — login ตั้ง cookie แทนคืน token ใน body
@Public()
@Post('login')
@HttpCode(HttpStatus.OK)
async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
) {
    const { access_token, user } = await this.authService.login(dto);

    res.cookie('access_token', access_token, {
        httpOnly: true,                                    // JavaScript อ่านไม่ได้
        secure: process.env.NODE_ENV === 'production',     // dev ใช้ http ได้
        sameSite: 'lax',                                   // กัน CSRF
        maxAge: 15 * 60 * 1000,                            // 15 นาที
        path: '/',
    });

    return { status: 'success', data: user };   // ไม่ส่ง token ออกไปใน body
}
```

> ⚠ `@Res({ passthrough: true })` — ถ้าลืม `passthrough` NestJS จะยกการตอบกลับให้จัดการเอง แล้ว `return` จะไม่ส่งอะไรออกไป request ค้าง

```ts
// jwt.strategy.ts — อ่าน token จาก cookie แทน header
super({
    jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token ?? null,
    ]),
    ignoreExpiration: false,
    secretOrKey: config.get<string>('JWT_SECRET'),
});
```

```ts
// auth.controller.ts — logout ล้าง cookie
@Post('logout')
@HttpCode(HttpStatus.OK)
async logout(@Res({ passthrough: true }) res: Response) {
    await this.authService.logout();
    res.clearCookie('access_token', { path: '/' });
    return { status: 'success' };
}
```

```ts
// frontend — ไม่ต้องเก็บอะไรเลย
export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,     // บรรทัดเดียวที่ต้องเพิ่ม browser แนบ cookie ให้เอง
});

// เช็คว่ายัง login อยู่ไหมตอนเปิดแอป — ถามเซิร์ฟเวอร์ ไม่ใช่อ่าน storage
const { data } = await api.get('/users/me');   // 200 = ยังอยู่ · 401 = ไป login
```

### ถ้าเลือก `sessionStorage` — โค้ดที่ต้องเขียน

```ts
// src/features/auth/store.ts
const KEY = 'pos_access_token';

export const authStore = {
    save:  (token: string) => sessionStorage.setItem(KEY, token),
    get:   () => sessionStorage.getItem(KEY),
    clear: () => sessionStorage.removeItem(KEY),
};
```

```ts
api.interceptors.request.use((cfg) => {
    const token = authStore.get();
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

api.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err.response?.status === 401) {
            authStore.clear();
            window.location.href = '/login';
        }
        return Promise.reject(err);
    },
);
```

ถ้าเลือกทางนี้ ใช้ `sessionStorage` **ไม่ใช่** `localStorage` — ปิดแท็บแล้วหาย ลดปัญหาค้างข้ามกะลงมาก

⚠ พฤติกรรม `sessionStorage` ตอน PWA ถูกติดตั้งเป็นแอปบนหน้าจอหลัก ต่างจากตอนเปิดในแท็บเบราว์เซอร์ **ต้องทดสอบบนเครื่องจริงก่อนสรุป** ไม่ใช่แค่ใน Chrome DevTools

---

## 7. deploy — origin เดียวหรือแยกโดเมน — **ยังไม่ตัดสินใจ**

### Origin คืออะไร

`scheme` + `host` + `port` ต้องตรงกันทั้ง 3 ตัว ผิดตัวใดตัวหนึ่งคือต่าง origin

| URL หน้าเว็บ | URL ที่ยิง API | origin เดียวกันไหม |
|---|---|---|
| `https://pos.com/` | `https://pos.com/api/menu` | **ใช่** |
| `https://pos.com/` | `https://api.pos.com/menu` | ไม่ — host ต่าง |
| `https://pos.com/` | `http://pos.com/api/menu` | ไม่ — scheme ต่าง |
| `http://localhost:5173/` | `http://localhost:3000/api` | ไม่ — port ต่าง |

แถวล่างสุดคือเครื่อง dev ตอนนี้ — เป็นคนละ origin อยู่แล้ว

### แบบ A — origin เดียว (nginx ตัวเดียว)

```
ผู้ใช้เปิด  https://pos-sabaidee.com

VPS 1 ตัว
│
├─ nginx  ฟัง 443
│   ├─ /          เสิร์ฟไฟล์ static ที่ build จาก React (dist/)
│   └─ /api/      ส่งต่อไป localhost:3000
│
└─ NestJS ฟัง 3000 (ไม่เปิดให้โลกภายนอกเห็น)
```

```nginx
server {
    listen 443 ssl;
    server_name pos-sabaidee.com;

    root /var/www/pwa-pos/dist;

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }

    location / {
        try_files $uri $uri/ /index.html;   # PWA เป็น SPA ต้องมีบรรทัดนี้
    }
}
```

เบราว์เซอร์มองว่าทุกอย่างคือ `pos-sabaidee.com` — `/api/menu` เป็นแค่ path หนึ่งของเว็บเดียวกัน

ได้: CORS ไม่มี · cookie `SameSite=Lax` ใช้ได้ · `X-Forwarded-For` ตรงกับ `trust proxy` ที่ตั้งไว้แล้ว

### แบบ B — แยกโดเมน (ฟรีทั้งคู่)

```
PWA   https://pwa-pos.vercel.app        ← Vercel
API   https://pos-api.onrender.com      ← Render
DB    Supabase / Neon
```

ต้องมี: `enableCors` ระบุ origin ตรงตัว · cookie ต้อง `SameSite=None; Secure` ซึ่ง **เปิด CSRF** ต้องเพิ่ม CSRF token อีกชั้น

### แบบ C — subdomain (กับดัก)

```
PWA   https://app.pos-sabaidee.com
API   https://api.pos-sabaidee.com
```

**ยังเป็นคนละ origin** — CORS ต้องตั้งเหมือนแบบ B

แต่ cookie ต่างจาก B: ตั้ง `domain: '.pos-sabaidee.com'` แล้ว subdomain แชร์ cookie กันได้ และใช้ `SameSite=Lax` ได้ เพราะเป็น same-site

> `same-origin` กับ `same-site` ไม่ใช่คำเดียวกัน — CORS ดู origin · cookie `SameSite` ดู site ตรงนี้คนสับสนกันมาก

### เทียบ

| | A origin เดียว | B แยกโดเมน | C subdomain |
|---|---|---|---|
| CORS | ไม่ต้องตั้ง | ต้องตั้ง | ต้องตั้ง |
| cookie `httpOnly` | `SameSite=Lax` | `SameSite=None` + CSRF token | `SameSite=Lax` + `domain` |
| HTTPS | 1 ใบ | ผู้ให้บริการจัดการให้ | 2 subdomain |
| ค่าใช้จ่าย | VPS ประมาณ 150-300 บาท/เดือน | **ฟรี** | ต้องมีโดเมน ประมาณ 300 บาท/ปี |
| deploy | `scp` หรือ `git pull` + `pm2` | `git push` อัตโนมัติ | เหมือน B |
| ความยุ่งยากตอนตั้ง | nginx ต้องเขียนเอง | แทบไม่ต้องทำอะไร | ต้องตั้ง DNS |

### เรื่องที่กระทบ PWA โดยเฉพาะ

**Service worker ผูกกับ origin** ที่มันถูกลงทะเบียน แคชไฟล์ของ origin ตัวเองได้ฟรี แคช response จาก origin อื่นต้องผ่าน CORS ให้ได้ก่อน

PWA-POS ต้องแคช `GET /menu/full` ไว้ใช้ตอนเน็ตหลุด — แบบ A แคชได้ตรง ๆ แบบ B ต้องให้ CORS ผ่านก่อน ไม่ได้ทำไม่ได้ แต่มีขั้นตอนเพิ่มและ debug ยากกว่าเพราะ error ของ service worker ไม่โชว์ใน console หลัก

**`start_url` ใน manifest** ผูกกับ origin ที่ติดตั้ง ถ้าย้ายโดเมนทีหลัง เครื่องที่ติดตั้งไว้แล้วจะชี้ไปที่เก่า ต้องถอนแล้วติดตั้งใหม่ทุกเครื่อง — ถ้าสาธิตวันสอบด้วยเครื่องที่ติดตั้งไว้ล่วงหน้าแล้วย้ายโดเมน จะพังหน้างาน

**โหมดติดตั้งบนหน้าจอไม่เกี่ยวกับเรื่อง cookie เลย** PWA ที่ติดตั้งแล้วยังยิงไปที่ URL เดิมที่มันถูกติดตั้งมา ใช้ cookie กองเดียวกับตอนเปิดในเบราว์เซอร์

---

## 8. Vite proxy — ทำให้ dev เป็น origin เดียวได้

```ts
// vite.config.ts
export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
});
```

frontend เรียก `/api/menu` เบราว์เซอร์เห็นเป็น `localhost:5173/api/menu` คือ origin เดียวกับหน้าเว็บ Vite ส่งต่อให้เอง

ได้ 3 อย่าง

1. cookie `httpOnly` + `SameSite=Lax` ทำงานตอน dev
2. ไม่ต้องตั้ง CORS ตอน dev เลย
3. **โค้ด frontend เหมือนกันทั้ง dev และ production** — `baseURL: '/api'` ที่เดียวจบ ไม่ต้องมี `import.meta.env.VITE_API_URL`

ข้อ 3 สำคัญกว่าที่คิด — ปัญหา "ทำงานบนเครื่องแต่พังตอน deploy" ส่วนใหญ่มาจาก config ที่ต่างกันระหว่าง 2 สภาพแวดล้อม

---

## 9. ลำดับการทำ

ทำตามลำดับนี้ อย่าทำทีเดียวหมด

| ลำดับ | งาน | ขึ้นกับการตัดสินใจไหม | เวลา |
|---|---|---|---|
| 1 | `POST /auth/logout` เขียน audit | ไม่ | 20 นาที |
| 2 | ตอบคำถาม 2 ข้อในข้อ 10 | — | 5 นาที |
| 3 | Vite proxy (ถ้าเลือก origin เดียว) | ใช่ | 2 นาที |
| 4 | frontend auth ตามที่เลือก | ใช่ | ครึ่งวัน |
| 5 | `POST /auth/refresh` + ลด `expiresIn` เป็น `15m` | ไม่ | 1 วัน |
| 6 | `token_version` ใน guard + cache | ไม่ | ครึ่งวัน |

ข้อ 1 ทำได้ทันทีไม่ต้องรออะไร · ข้อ 5 ลดความเสี่ยงได้ 99% ด้วยงานน้อยกว่าข้อ 6 · ข้อ 6 ทำถ้าเวลาเหลือ

---

## 10. คำถาม 2 ข้อที่ต้องตอบก่อนเริ่มข้อ 3

### คำถามที่ 1: deploy จริงจะเป็นแบบไหน

| ถ้าตอบ | ให้ใช้ |
|---|---|
| VPS ตัวเดียว มี nginx (แบบ A) | cookie `httpOnly` + `SameSite=Lax` + Vite proxy |
| ฟรีเท่านั้น แยกโดเมน (แบบ B) | `sessionStorage` + `Authorization` header |
| มีโดเมนแล้ว ใช้ subdomain (แบบ C) | cookie `httpOnly` + `domain` + CORS |

**คำแนะนำ: แบบ A** เหตุผลที่ชี้ขาดไม่ใช่ความปลอดภัย แต่คือ **ของที่ไม่ต้องทำ** — ไม่ต้องทำ CSRF token, ไม่ต้อง debug CORS, ไม่ต้องมี `VITE_API_URL` คนละค่าใน 2 ที่, service worker แคชได้ตรง ๆ ทีม 2 คน 3 เดือนควรประหยัดงานตรงนี้มากกว่าประหยัดค่า VPS 200 บาทต่อเดือน

### คำถามที่ 2: PWA จะใช้แบบติดตั้งบนหน้าจอหลัก หรือเปิดในเบราว์เซอร์

กระทบเฉพาะกรณีเลือก `sessionStorage` — ต้องทดสอบบนเครื่องจริงว่าปิดแอปแล้ว token หายตามที่คาดไหม

ถ้าเลือก cookie ไม่ต้องตอบคำถามนี้

### ⚠ สิ่งที่ต้องไม่ทำ

**เลือกแบบ B แล้วใช้ cookie `SameSite=None` โดยไม่ทำ CSRF token**

จะได้ระบบที่ดูปลอดภัยกว่า `localStorage` แต่จริง ๆ แย่กว่า เพราะเปิดช่องให้เว็บไหนก็ยิง `POST /api/orders/:id/void` แทนพนักงานที่ล็อกอินอยู่ได้

เป็นรูปแบบเดิมที่เจอมาแล้ว 2 ครั้งในโปรเจกต์นี้ — กลไกที่มีโค้ดแต่ไม่ได้ป้องกันอะไร (RLS ที่ถูกข้ามเพราะต่อ DB ด้วย `postgres` และ `@Throttle` ที่ไม่มี guard ลงทะเบียน)

---

## 11. Checklist ตอนกลับมาทำ

### logout — ทำได้เลย

- [ ] `POST /auth/logout` ใน `auth.controller.ts` ไม่ใส่ `@Public()`
- [ ] `writeLogoutAudit()` ใน `auth.repository.ts` ใช้ `app_tenant_id()`
- [ ] ทดสอบ: login แล้ว logout แล้วเช็คว่า `audit_logs` มีแถว `logout` พร้อม `user_id` ถูกคน
- [ ] ทดสอบ: logout ด้วย token หมดอายุ ต้องได้ 401 และ frontend ต้องยังลบ token ทิ้ง

### หลังตอบคำถาม 2 ข้อ

- [ ] เลือกที่เก็บ token แล้วบันทึกเหตุผลลงเอกสารนี้
- [ ] ถ้าเลือก cookie: `npm i cookie-parser` + แก้ `main.ts`, `auth.controller.ts`, `jwt.strategy.ts`
- [ ] ถ้าเลือก cookie: Swagger เปลี่ยน `addBearerAuth()` เป็น `addCookieAuth('access_token')` และทุก controller เปลี่ยน `@ApiBearerAuth()` เป็น `@ApiCookieAuth()` — ประมาณ 20 นาที find-replace
- [ ] Vite proxy ใน `vite.config.ts`
- [ ] frontend `baseURL: '/api'` ไม่ใช้ `VITE_API_URL`

### refresh token

- [ ] `POST /auth/refresh`
- [ ] login เขียนแถวลง `refresh_tokens`
- [ ] logout ลบแถวใน `refresh_tokens`
- [ ] ลด `JWT_EXPIRES_IN` เป็น `15m` **หลังจาก** refresh ใช้งานได้แล้วเท่านั้น
- [ ] ทดสอบ: access token หมดอายุแล้ว refresh ได้ access token ใบใหม่โดยผู้ใช้ไม่รู้ตัว

### token_version

- [ ] `tv` ใน JWT payload
- [ ] guard เทียบ `tv` กับ DB
- [ ] cache ด้วยรูปแบบเดียวกับ `PermissionCacheService`
- [ ] ทุกที่ที่ปิดใช้งาน user หรือเปลี่ยนรหัสผ่าน ต้อง `token_version = token_version + 1`
- [ ] **ทดสอบที่ทำให้มันปฏิเสธให้เห็น**: login ได้ token แล้วสั่ง `UPDATE users SET token_version = token_version + 1` ใน pgAdmin แล้วยิง request ด้วย token เดิม **ต้องได้ 401**

ข้อสุดท้ายสำคัญที่สุด ตามบทเรียนในโปรเจกต์นี้ — **ทุกกลไกความปลอดภัยต้องมีการทดสอบที่ทำให้มันปฏิเสธให้เห็น** การทดสอบว่า "ใช้งานได้ปกติ" ไม่พิสูจน์อะไรเลยเกี่ยวกับความปลอดภัย

---

## 12. ของจริงในอุตสาหกรรม

### เรื่อง JWT revoke

| | ทำอย่างไร |
|---|---|
| **Auth0** | เอกสารเขียนตรง ๆ ว่า JWT revoke ไม่ได้ วิธีที่แนะนำคือ access token อายุสั้น + refresh token rotation |
| **AWS Cognito** | `GlobalSignOut` API ยกเลิก refresh token ทั้งหมด แต่ access token ที่ออกไปแล้วยังใช้ได้จนหมดอายุ อยู่ในเอกสารเขาเอง |
| **Firebase Auth** | `revokeRefreshTokens()` ข้างในคือ timestamp เทียบกับ `iat` ของ token — หลักการเดียวกับ `token_version` |
| **GitHub** | personal access token เก็บเป็น state ใน DB ถึงยกเลิกได้ทันที คนละแบบกับ JWT |

ไม่มีเจ้าไหน "ลบ JWT" ได้ ทุกเจ้าใช้วิธีเดียวกัน คือเก็บค่าตัวเลขหรือเวลาฝั่ง server ไว้เทียบ

### เรื่องเก็บ token ที่ไหน

| | เก็บที่ไหน |
|---|---|
| **Auth0 SPA SDK** | ค่าเริ่มต้น in-memory · มีตัวเลือก `localStorage` พร้อมคำเตือนในเอกสารว่าเสี่ยง XSS |
| **Auth.js (NextAuth)** | cookie `httpOnly` เป็นค่าเริ่มต้น ไม่มีตัวเลือกอื่น |
| **Django, Rails, Laravel** | cookie `httpOnly` มา 15 ปีแล้ว |
| **Supabase JS** | `localStorage` เป็นค่าเริ่มต้น เปลี่ยนได้ — ถูกวิจารณ์เรื่องนี้ประจำ |
| **GitHub, Google เว็บ** | cookie `httpOnly` |

เจ้าที่ใช้ `localStorage` คือเจ้าที่เลือก developer experience เหนือความปลอดภัย และบอกไว้ในเอกสารว่าเลือกแบบนั้น

---

## 13. สรุปสถานะ

| เรื่อง | ตัดสินใจแล้วหรือยัง | ทำแล้วหรือยัง |
|---|---|---|
| JWT ทำลายไม่ได้ ต้องใช้ state เสริม | ตัดสินใจแล้ว | — |
| `POST /auth/logout` เขียน audit | ตัดสินใจแล้ว | **ยังไม่ทำ** |
| ใช้ `token_version` ไม่ใช่ blacklist | ตัดสินใจแล้ว | **ยังไม่ทำ** |
| ทำ refresh token | ตัดสินใจแล้ว | **ยังไม่ทำ** |
| เก็บ access token ที่ไหน | **ยังไม่ตัดสินใจ** — ขึ้นกับคำถามที่ 1 | ยังไม่ทำ |
| deploy แบบไหน | **ยังไม่ตัดสินใจ** — แนะนำแบบ A | ยังไม่ทำ |
| Vite proxy | ขึ้นกับคำถามที่ 1 | ยังไม่ทำ |

**เหตุผลที่เลื่อนทั้งหมดนี้ได้:** ไม่มีข้อไหนบล็อกการทำโมดูล 1-9 เลย ส่วนที่ต้องแก้ย้อนหลังมากที่สุดคือ Swagger decorator ซึ่งเป็น find-replace ประมาณ 20 นาที — รับได้ ไม่ใช่เหตุผลพอที่จะตัดสินใจก่อนมีข้อมูลครบ

# PWA-POS Backend — คู่มือนักพัฒนา

อัปเดต: 2026-10-07
ใช้กับ: NestJS + PostgreSQL 18 + ไลบรารี `pg` (ไม่ใช้ ORM)

> **ถ้าแก้ `DbContextService` หรือ `TenantContextInterceptor` ต้องแก้เอกสารนี้ด้วย** คู่มือที่ล้าสมัยแย่กว่าไม่มีคู่มือ เพราะคนอ่านเชื่อแล้วทำผิด

> **รอบ 2026-10-07** ปรับให้ตรงกับ `claude/backend-coding-standard.md` ข้อ 3 — route ที่ล็อกอินแล้ว **ไม่อ่าน `req.user.tenantID`** และ **ไม่เขียน `WHERE tenant_id`** ในโค้ด `INSERT` ใช้ `app_tenant_id()` ใน SQL แทน (เดิมเอกสารนี้ยังเขียนแบบส่ง `tenantId` ผ่าน parameter ซึ่งขัดกับมาตรฐาน)

---

## 1. อ่านก่อนเขียนโค้ด

### ปัญหาที่ระบบนี้แก้

PWA-POS เป็นระบบ multi-tenant คือร้านอาหารหลายร้านใช้ฐานข้อมูลเดียวกัน ตาราง `orders` มีบิลของทุกร้านปนกันอยู่ แยกกันด้วยคอลัมน์ `tenant_id`

ถ้าเขียนแบบตรงไปตรงมา ทุก query ต้องมี `WHERE tenant_id = ...` ลืมที่เดียวคือร้าน A เห็นยอดขายของร้าน B ซึ่งเป็นความเสียหายที่กู้ไม่ได้

ระบบนี้จึงไม่พึ่งความจำของคนเขียน

### ชั้นที่กันข้อมูลข้ามร้าน

| ชั้น | อยู่ที่ไหน | กันอะไร |
|---|---|---|
| 1. Row-Level Security (RLS) | PostgreSQL | กรองแถวให้อัตโนมัติทุก `SELECT` / `UPDATE` / `DELETE` และตรวจค่า `tenant_id` ตอน `INSERT` ลืมไม่ได้เพราะไม่ต้องเขียน |
| 2. Composite Foreign Key `(tenant_id, x)` | PostgreSQL | กันการเขียนข้อมูลที่อ้างถึงของร้านอื่น ซึ่ง RLS กันไม่ได้ เพราะการเช็ค FK ไม่ผ่าน RLS |
| 3. Role `pos_app` | PostgreSQL | ไม่ใช่เจ้าของตารางและไม่มี `BYPASSRLS` ทำให้ชั้น 1 ทำงานจริงเสมอ (ดูข้อ 2) |

ทั้งสามชั้นทำงานพร้อมกัน ไม่ใช่เลือกอย่างใดอย่างหนึ่ง

**ทำไมไม่มี `WHERE tenant_id = $1` ในโค้ดเป็นชั้นสำรอง** — เดิมเอกสารนี้นับเป็นชั้นที่ 3 แต่มาตรฐานของโปรเจกต์ตัดออกแล้ว เหตุผลเต็มอยู่ใน `claude/backend-coding-standard.md` ข้อ 3.5 และ 3.10 สรุปคือ

- โค้ดที่ใส่ครึ่ง ๆ อันตรายกว่าโค้ดที่พึ่งกลไกเดียวอย่างสม่ำเสมอ คนอ่านจะไม่รู้ว่าที่ไม่มีนั้นลืมหรือตั้งใจ
- การส่ง `tenantId` ผ่าน parameter เปิดโอกาสส่งค่าผิด (สลับตำแหน่ง parameter หรือเผลอเอาจาก body) และเคยทำให้เกิด bug `42P08` ในโมดูล menu จริง
- กรณีที่ชั้นสำรองนี้จะช่วยได้คือ "เผลอต่อ DB ด้วย role ที่ข้าม RLS" ซึ่งกันไว้แล้วด้วยชั้นที่ 3 (`pos_app`) และ checklist ข้อ 9

### กฎ 2 ข้อที่ต้องจำ

> ตารางมีคอลัมน์ `tenant_id` ใช้ `this.db.query()`
> ตารางไม่มี ใช้ `this.db.referenceQuery()`

รายละเอียดอยู่ในข้อ 3.6

> route ที่ล็อกอินแล้ว **ไม่แตะ `req.user.tenantID` เลย**
> `SELECT` / `UPDATE` / `DELETE` ให้ RLS กรอง · `INSERT` ใช้ `app_tenant_id()` ใน SQL

รายละเอียดอยู่ในข้อ 5 และ `claude/backend-coding-standard.md` ข้อ 3

---

## 2. RLS คืออะไร ทำงานยังไง

### ตัวอย่าง policy จริง

ทุกตารางที่มีคอลัมน์ `tenant_id` ถูกใส่ policy นี้ตอน install:

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON orders
  USING      (tenant_id = (SELECT app_tenant_id()))
  WITH CHECK (tenant_id = (SELECT app_tenant_id()));
```

- `USING` คุมการ **อ่าน** (SELECT, UPDATE, DELETE มองเห็นแถวไหน)
- `WITH CHECK` คุมการ **เขียน** (INSERT, UPDATE ใส่ค่าอะไรได้)

`app_tenant_id()` เป็นฟังก์ชันที่อ่านค่าจาก session:

```sql
CREATE FUNCTION app_tenant_id() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::uuid $$;
```

### ผลที่ได้

เขียน query นี้

```sql
SELECT order_id, total FROM orders WHERE closed_at IS NULL
```

PostgreSQL ทำให้เป็นแบบนี้โดยที่เราไม่ต้องเขียน

```sql
SELECT order_id, total FROM orders
WHERE closed_at IS NULL
  AND tenant_id = app_tenant_id()
```

### จุดที่ต้องระวังที่สุด

ถ้า `app.current_tenant_id` ไม่ได้ถูกตั้งค่า `app_tenant_id()` คืน `NULL`

เงื่อนไข `tenant_id = NULL` ใน SQL ไม่ใช่ `false` แต่เป็น `NULL` ซึ่ง policy ถือว่าไม่ผ่าน ผลคือ

**คืน 0 แถว โดยไม่มี error ไม่มีคำเตือนอะไรเลย**

นี่คือสาเหตุที่ `DbContextService.query()` ออกแบบให้ throw ถ้าไม่มี context — ยอมให้พังเสียงดังดีกว่าปล่อยให้คืน array ว่างแล้วไล่หาสาเหตุไม่เจอ

### ทำไม postgres ข้ามได้ แต่ pos_app ข้ามไม่ได้

PostgreSQL ยกเว้น RLS ให้ 2 กรณี:

1. role ที่มีสิทธิ์ `BYPASSRLS` หรือเป็น superuser
2. **เจ้าของตาราง** ถ้าตารางเปิด RLS แบบ `ENABLE` (ไม่ใช่ `FORCE`)

`postgres` เข้าทั้งสองข้อ จึงมองเห็นทุกแถวของทุกร้าน

`pos_app` ถูกสร้างแบบนี้

```sql
CREATE ROLE pos_app LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE
```

ไม่ใช่ superuser ไม่มี `BYPASSRLS` และไม่ใช่เจ้าของตาราง จึงโดน policy ทุกข้อ

**`.env` ต้องเป็น `DB_USER=pos_app` เสมอ** ถ้าใช้ `postgres` ทดสอบ ผลที่ได้จะดูเหมือนผ่านทั้งที่ RLS ไม่เคยทำงาน

เหตุที่เลือก `ENABLE` ไม่ใช่ `FORCE` โดยตั้งใจ: งาน migration และฟังก์ชัน `SECURITY DEFINER` ต้องข้าม RLS ได้ ถ้าใช้ `FORCE` จะข้ามไม่ได้แม้เป็นเจ้าของตาราง

---

## 3. DbContextService

ไฟล์: `src/database/db-context.service.ts`

### 3.1 มันทำอะไร

สองอย่าง

1. **เปิด transaction แล้วบอก PostgreSQL ว่า request นี้คือร้านไหน ใครทำ** — `runInTransaction()`
2. **ให้ repository หยิบ connection ของ request ปัจจุบันมาใช้ได้ โดยไม่ต้องส่งผ่าน parameter ทุกชั้น** — `query()`

ข้อ 2 ทำได้ด้วย `AsyncLocalStorage` ซึ่งเป็นของที่ Node.js มีมาให้ตั้งแต่เวอร์ชัน 16 คิดว่าเป็นกล่องที่ติดตามไปกับ request หนึ่ง ๆ โค้ดที่อยู่ลึกแค่ไหนก็หยิบของในกล่องได้ และกล่องของ request A ไม่ปนกับ request B

### 3.2 `runInTransaction(ctx, work)`

```ts
async runInTransaction<T>(ctx: TenantContext, work: () => Promise<T>): Promise<T>
```

สิ่งที่มันทำตามลำดับ

1. ถ้ามี transaction เปิดอยู่แล้ว เรียก `work()` ตรง ๆ ไม่เปิดใหม่ (กันซ้อน)
2. หยิบ connection จาก pool
3. `BEGIN`
4. `set_config` 5 ตัว แบบ transaction-scoped
5. เก็บ connection ไว้ใน `AsyncLocalStorage` แล้วรัน `work()`
6. `COMMIT` ถ้าสำเร็จ / `ROLLBACK` ถ้า throw
7. คืน connection เข้า pool ใน `finally` เสมอ

ค่า 5 ตัวที่ตั้ง

| ชื่อ | ใช้ทำอะไร |
|---|---|
| `app.current_tenant_id` | RLS กรองแถวด้วยค่านี้ และ `app_tenant_id()` อ่านค่านี้ตอน `INSERT` |
| `app.current_user_id` | audit log บันทึกว่าใครทำ |
| `app.current_user_role` | trigger บางตัวเช็คสิทธิ์ด้วยค่านี้ (เช่น CFG-04 config ที่ owner เท่านั้นแก้ได้) |
| `app.client_ip` | audit log |
| `app.device_info` | audit log |

**`set_config` พารามิเตอร์ที่ 3 เป็น `true` คือ transaction-scoped** ข้อนี้สำคัญมาก ถ้าเป็น `false` ค่าจะติดอยู่กับ connection ไปตลอด พอ connection ถูกคืนเข้า pool แล้วมี request ของร้านอื่นหยิบไปใช้ จะได้ context ของร้านเดิม — ข้อมูลข้ามร้านทันที

**ใครเรียก** — ปกติไม่ต้องเรียกเอง `TenantContextInterceptor` เรียกให้ทุก request ที่ล็อกอินแล้ว

เรียกเองเมื่อ: เขียน route สาธารณะที่ต้องแตะตารางที่มี RLS (ดูข้อ 6) หรือ cron job ในอนาคต

### 3.3 `query(sql, params)`

```ts
query<T extends QueryResultRow = any>(sql: string, params?: any[])
```

ใช้แทน `pool.query()` เดิม ภายในหยิบ connection จาก `AsyncLocalStorage`

**ใช้กับตารางที่มีคอลัมน์ `tenant_id`** คือเกือบทั้งหมดในระบบ: `tenants`, `users`, `orders`, `order_items`, `payments`, `shifts`, `menu_items`, `tables`, `ingredients`, `inventory_transactions`, `system_config`, `audit_logs` และอื่น ๆ

ถ้าเรียกนอก transaction จะ throw

```
InternalServerErrorException: ไม่มี tenant context — ...
```

นี่คือพฤติกรรมที่ถูก ไม่ใช่ bug

**หมายเหตุเรื่อง generic** `T extends QueryResultRow` จำเป็น เพราะ `pg` ประกาศ constraint นี้ไว้ ถ้าเขียน `query<T>` เฉย ๆ TypeScript จะฟ้อง `TS2344` ห้ามแก้ด้วยการครอบ `Promise<T>` เพราะคอมไพล์ผ่านแต่ `result.rows[0]` จะกลายเป็น Promise ไม่ใช่แถวข้อมูล

### 3.4 `referenceQuery(sql, params)`

```ts
referenceQuery<T extends QueryResultRow = any>(sql: string, params?: any[])
```

ภายใน: ถ้าอยู่ใน transaction อยู่แล้วใช้ connection เดิม ถ้าไม่อยู่ก็หยิบจาก pool ตรง ๆ แบบไม่เปิด transaction และไม่ตั้ง context

**ใช้ได้เฉพาะ 2 กรณี**

**กรณี 1 — ตารางไม่มี RLS** ปัจจุบันมี 4 ตาราง

| ตาราง | เนื้อหา |
|---|---|
| `roles` | owner, manager, employee |
| `permissions` | 25 permission key |
| `role_permissions` | role ไหนมี permission อะไร |
| `config_definitions` | นิยาม config 9 ตัว ค่า default ช่วงที่ยอมรับ |

ทั้งสี่เป็นข้อมูลกลาง ใช้ร่วมกันทุกร้าน ไม่มีคอลัมน์ `tenant_id` จึงไม่มี policy

**กรณี 2 — เรียกฟังก์ชัน `SECURITY DEFINER`** ซึ่งข้าม RLS ด้วยตัวเองอยู่แล้ว

```sql
SELECT tenant_id, is_active FROM resolve_tenant($1)
SELECT users_id, tenant_id FROM resolve_user_by_email($1)
```

ปลอดภัยเพราะฟังก์ชันคุมเองว่าคืนอะไร ไม่ได้เปิดตารางให้อ่านอิสระ

**ห้ามใช้** `referenceQuery` กับ `SELECT ... FROM users` หรือ `FROM orders` หรือตารางที่มี `tenant_id` ตรง ๆ จะได้ 0 แถวแบบเงียบ

เช็คว่าตารางไหนมี RLS

```sql
SELECT tablename, rowsecurity AS "เปิด RLS"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY rowsecurity DESC, tablename;
```

### 3.5 `client` และ `inTransaction`

```ts
get client(): PoolClient        // connection ของ request ปัจจุบัน
get inTransaction(): boolean    // ตอนนี้อยู่ใน transaction หรือไม่
```

`client` ปกติไม่ต้องเรียกเอง ใช้เมื่อต้องทำอะไรที่ `query()` ทำไม่ได้ เช่น `SAVEPOINT` หรือ `COPY`

`inTransaction` ใช้เช็คก่อนตัดสินใจว่าจะเปิด transaction ใหม่หรือไม่ ซึ่ง `runInTransaction` ใช้ภายในแล้ว

### 3.6 เลือก method ไหน

ถามตัวเอง 2 คำถามตามลำดับ

**คำถามที่ 1: ตารางที่กำลัง query มีคอลัมน์ `tenant_id` ไหม**

ไม่มี (4 ตารางในข้อ 3.4) ใช้ `referenceQuery()` ได้ จบ

มี ไปคำถามที่ 2

**คำถามที่ 2: โค้ดนี้รันตอนมี request ของ user ที่ล็อกอินแล้วหรือไม่**

| สถานการณ์ | ใช้ |
|---|---|
| controller ของ route ที่ต้องล็อกอิน | `query()` |
| service ที่ถูกเรียกจาก controller นั้น | `query()` |
| repository ที่ถูกเรียกจาก service นั้น | `query()` |
| ข้างใน `runInTransaction` ที่เปิดเอง | `query()` |
| `onModuleInit` หรืองานตอน boot | `referenceQuery()` และตารางไม่มี RLS เท่านั้น |
| route สาธารณะ ก่อนรู้ว่าเป็นร้านไหน | `referenceQuery()` และฟังก์ชัน `SECURITY DEFINER` เท่านั้น |
| cron job | เปิด `runInTransaction` เองต่อร้าน แล้วใช้ `query()` |

**สรุปประโยคเดียว** — `query()` คือค่าเริ่มต้น ใช้ประมาณ 95% ของเวลา `referenceQuery()` คือข้อยกเว้นสำหรับตอนที่ยังไม่รู้ว่าเป็นร้านไหน

### 3.7 ถ้าเลือกผิดจะเกิดอะไร

| เลือกผิดแบบ | อาการ | ความร้ายแรง |
|---|---|---|
| ใช้ `query()` นอก request | throw `ไม่มี tenant context` ทันที | ต่ำ — เห็นทันที แก้ง่าย |
| ใช้ `referenceQuery()` กับตารางที่มี RLS | คืน `[]` เงียบ ๆ ไม่มี error | **สูง — bug ซ่อนตัว** |

ความไม่สมมาตรนี้ตั้งใจ ทางที่ผิดแบบเห็นชัดถูกปล่อยให้พังเสียงดัง ส่วนทางที่ผิดแบบเงียบถูกจำกัดไว้แค่ 4 ตารางที่นับได้

---

## 4. TenantContextInterceptor

ไฟล์: `src/common/interceptors/tenant-context.interceptor.ts`
ลงทะเบียน: `app.module.ts` ด้วย `APP_INTERCEPTOR`

### 4.1 Interceptor คืออะไร

โค้ดที่ NestJS รันให้ **ก่อนและหลัง** controller โดยอัตโนมัติ ทุก request ไม่ต้องเรียกเอง

เทียบกับร้านอาหาร: controller คือเชฟที่ทำอาหาร Interceptor คือพนักงานที่รับออเดอร์เข้าครัวก่อน และเก็บจานหลังลูกค้ากินเสร็จ เชฟไม่ต้องรู้ว่ามีใครทำสองงานนั้น

### 4.2 ทำไมต้องมี

ทางเลือกที่คนคิดถึงก่อนคือส่ง `tenantId` เป็น parameter ทุกฟังก์ชัน

```ts
// ทางที่ไม่เลือก
getOrders(tenantId: string) {
    return this.repo.findOpen(tenantId);
}
```

ปัญหา: มีประมาณ 30 ตาราง ร้อยกว่าฟังก์ชัน ลืมที่เดียวคือรูรั่ว และ code review จับไม่ได้ทุกครั้ง

ทางที่เลือก: บอก PostgreSQL ครั้งเดียวตอนเริ่ม request แล้ว RLS กรองให้เองทุก query และ `INSERT` หยิบค่าเองด้วย `app_tenant_id()`

### 4.3 ลำดับการทำงานของ NestJS

```
Middleware  →  Guard  →  Interceptor (ก่อน)  →  Pipe  →  Controller
                              ↓
                      Interceptor (หลัง)  →  Filter  →  response
```

`JwtAuthGuard` เป็น Guard มันถอด JWT แล้วใส่ `request.user = { sub, username, tenantID, role }`

`PermissionsGuard` ตามมาเป็น Guard ตัวถัดไป ตรวจ `@RequirePermissions()` — ไม่มีสิทธิ์ได้ 403 ก่อนถึง interceptor

ฉะนั้นงานตั้ง context **ต้องเป็น Interceptor ไม่ใช่ Middleware** เพราะ Middleware รันก่อน Guard จะยังไม่เห็น `request.user`

Interceptor ไม่ปฏิเสธ request ใด ๆ มันมีหน้าที่บอก PostgreSQL ว่าเป็นร้านไหนเท่านั้น

### 4.4 โค้ดทีละส่วน

```ts
intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;              // Guard ใส่ไว้ให้แล้ว

    if (!user?.tenantID) {
        return next.handle();               // route สาธารณะ ปล่อยผ่าน
    }

    return from(
        this.db.runInTransaction(
            {
                tenantId: user.tenantID,
                userId: user.sub ?? null,
                role: user.role ?? null,
                clientIp: request.ip ?? 'unknown',
                deviceInfo: request.headers['user-agent'] ?? 'unknown',
            },
            () => firstValueFrom(next.handle()),
        ),
    );
}
```

| บรรทัด | ทำอะไร |
|---|---|
| `switchToHttp().getRequest()` | ดึง request ของ Express ออกมา |
| `if (!user?.tenantID)` | ไม่มี user แปลว่าเป็น `@Public()` route ปล่อยผ่าน |
| `next.handle()` | สั่งให้ controller ทำงาน คืนค่าเป็น Observable |
| `firstValueFrom(...)` | แปลง Observable เป็น Promise เพื่อให้ `runInTransaction` รอได้ |
| `from(...)` | แปลง Promise กลับเป็น Observable เพราะ NestJS ต้องการแบบนั้น |

จุดสำคัญคือ `firstValueFrom` ทำให้ transaction ครอบตลอดจนกว่า controller ทำงานเสร็จ ไม่ใช่ COMMIT ก่อนแล้วค่อยทำงาน

**นี่คือที่เดียวในระบบที่อ่าน `request.user.tenantID`** — controller, service และ repository ไม่ต้องอ่านอีก

### 4.5 route ไหนผ่าน route ไหนไม่ผ่าน

| route | มี `request.user` | transaction จาก interceptor |
|---|---|---|
| `POST /register` (`@Public()`) | ไม่มี | ไม่มี — service เปิดเอง |
| `POST /auth/login` (`@Public()`) | ไม่มี | ไม่มี — service เปิดเอง |
| `POST /users` | มี | มี |
| `GET /menu/category` | มี | มี |
| ทุก route ที่ไม่มี `@Public()` | มี | มี |

### 4.6 ข้อจำกัดที่ต้องรู้

**connection pool ตึงขึ้น** — ทุก request ที่ล็อกอินแล้วจับ connection ไว้ตลอด request ไม่ใช่แค่ตอน query `max: 10` ใน `database.module.ts` อาจไม่พอตอนมี 5-6 เครื่องในร้านใช้พร้อมกัน ถ้าเจอ `timeout exceeded when trying to connect` ให้ขยาย `max` เป็น 20-25 ไม่ใช่แก้ interceptor

**stream กับ `@Res()` จะพัง** — `firstValueFrom` รอค่าตัวแรกแล้วปิด ถ้าวันหลังทำ SSE สำหรับ KDS หรือ endpoint ดาวน์โหลดไฟล์ ต้องยกเว้น route นั้นด้วย decorator ของตัวเองคล้าย `@Public()` เช่น `@SkipTenantTransaction()` ตอนนี้ยังไม่มี route แบบนั้น ไม่ต้องทำล่วงหน้า

**GET ก็อยู่ใน transaction** — ไม่ผิด แต่ถ้าในอนาคตมี endpoint ที่อ่านนาน (รายงานย้อนหลัง 1 ปี) จะจับ connection นาน พิจารณาแยกไปใช้ `pos_readonly` กับ replica ทีหลัง

### 4.7 นี่ไม่ใช่ของที่คิดขึ้นเอง

Supabase และ PostgREST ใช้รูปแบบเดียวกัน — transaction ต่อ request แล้ว `set_config` ตอนเปิด Hasura ก็เช่นกัน Citus (ส่วนขยาย multi-tenant ของ PostgreSQL) แนะนำ composite key `(tenant_id, …)` ซึ่งเป็นสิ่งที่ schema นี้ใช้อยู่

---

## 5. เขียน repository ใหม่

### 5.1 Template

```ts
import { Injectable } from '@nestjs/common';
import { DbContextService } from '../../database/db-context.service';

@Injectable()
export class XxxRepository {
    constructor(private readonly db: DbContextService) {}

    // อ่าน — ไม่ต้องใส่ WHERE tenant_id เอง RLS กรองให้
    async findAll() {
        const sql = `
            SELECT col_a, col_b
            FROM some_table
            WHERE deleted_at IS NULL
            ORDER BY col_a
        `;
        const result = await this.db.query(sql);
        return result.rows;
    }

    // อ่านรายการเดียว
    async findById(id: string) {
        const sql = `
            SELECT col_a, col_b
            FROM some_table
            WHERE some_id = $1
        `;
        const result = await this.db.query(sql, [id]);
        return result.rows[0] ?? null;
    }

    // เขียน — tenant_id เป็น NOT NULL ต้องใส่ แต่ไม่รับเป็น parameter
    // app_tenant_id() อ่านค่าจาก context ที่ interceptor ตั้งไว้ ตรงกับ WITH CHECK ของ RLS เสมอ
    async create(colA: string) {
        const sql = `
            INSERT INTO some_table (tenant_id, col_a)
            VALUES (app_tenant_id(), $1)
            RETURNING some_id, col_a
        `;
        const result = await this.db.query(sql, [colA]);
        return result.rows[0];
    }

    // แก้ไข — ไม่มี WHERE tenant_id ถ้า id เป็นของร้านอื่น RLS ซ่อนแถว ได้ null
    async update(id: string, colA: string) {
        const sql = `
            UPDATE some_table
            SET col_a = $2
            WHERE some_id = $1
            RETURNING some_id, col_a
        `;
        const result = await this.db.query(sql, [id, colA]);
        return result.rows[0] ?? null;
    }
}
```

ทำไม `INSERT` ต้องใส่ `tenant_id` ทั้งที่ RLS รู้อยู่แล้ว — เพราะ RLS ไม่เติมค่าให้ มันแค่ตรวจสอบว่าค่าที่ใส่ตรงกับ context หรือไม่ `tenant_id` เป็น `NOT NULL` จึงต้องใส่เอง **ด้วย `app_tenant_id()` ใน SQL ไม่ใช่ `$n` ที่ส่งมาจาก TypeScript**

⚠ **`()` ห้ามลืม** — `app_tenant_id` เฉย ๆ PostgreSQL อ่านเป็นชื่อคอลัมน์ ได้ `42703 column "app_tenant_id" does not exist`

### 5.2 Controller ไม่อ่าน tenantID

```ts
@RequirePermissions('xxx.create')
@Post()
create(@Body() dto: CreateXxxDto) {
    return this.xxxService.create(dto);
}
```

ไม่มี `@Req()` และไม่ส่ง `tenantId` ต่อ เพราะ interceptor บอก PostgreSQL ไปแล้ว (ข้อ 4.4)

**ห้ามรับ `tenant_id` จาก body** และ DTO ห้ามมี field นี้ RLS (`WITH CHECK`) จะกันอีกชั้น แต่ต้องไม่ให้มีช่องให้ส่งตั้งแต่แรก

ข้อยกเว้นมีแค่ `@Public()` route (register, login) ซึ่งยังไม่มี JWT ดูข้อ 6

### 5.3 สิ่งที่ห้ามทำ

1. **ห้าม inject `PG_POOL` เข้า repository** ใช้ `DbContextService` เท่านั้น ถ้าใช้ pool ตรงจะไม่มี context และไม่อยู่ใน transaction ของ request
2. **ห้ามรับ `tenant_id` จาก request body** และห้ามอ่าน `req.user.tenantID` ใน route ที่ล็อกอินแล้ว `INSERT` ใช้ `app_tenant_id()`
3. **ห้ามใช้ `referenceQuery` กับตารางที่มี `tenant_id`** จะได้ 0 แถวแบบเงียบ
4. **ห้ามใส่ `;` กลาง query** `pg` ใช้ extended protocol ส่งได้คำสั่งเดียว `;` คั่นกลางจะได้ `cannot insert multiple commands into a prepared statement` (`;` ท้ายสุดไม่เป็นปัญหา)
5. **ห้ามต่อ string เข้า SQL** ใช้ `$1 $2` เสมอ แม้จะเป็นค่าที่ "ปลอดภัยแล้ว" — SQL injection ไม่ได้มาจากช่องที่คุณระวัง มันมาจากช่องที่คุณไม่ระวัง ข้อยกเว้นเดียวคือชื่อคอลัมน์ใน `PATCH` ที่สร้าง `SET` แบบ dynamic ซึ่งต้องผ่าน whitelist ที่เขียนไว้ในโค้ดก่อนเสมอ (ตัวอย่าง `UPDATABLE` ใน `menu.repository.ts`)

---

## 6. Route สาธารณะ (register, login) ต่างกันยังไง

### ทำไมต้องจัดการ transaction เอง

`@Public()` route ยังไม่มี JWT จึงไม่มี `request.user` interceptor เห็นว่าไม่มี `tenantID` ก็ปล่อยผ่าน ไม่เปิด transaction ให้

ฉะนั้น service ของ route เหล่านี้ต้องเปิด `runInTransaction` เอง

นี่คือ **ข้อยกเว้นเพียง 2 จุดในระบบ** ที่ต้องหา `tenant_id` เองใน TypeScript

### ปัญหาไก่กับไข่

ตอน register ยังไม่มีร้าน แต่ต้อง INSERT เข้า `tenants` ซึ่งมี RLS `WITH CHECK (tenant_id = app_tenant_id())`

ทางแก้: สร้าง `tenant_id` ใน Node ด้วย `randomUUID()` แล้วตั้ง context เป็นค่านั้นก่อน INSERT

ตอน login รู้แค่ `tenant_slug` แต่จะอ่าน `tenants` เพื่อหา `tenant_id` ก็ติด RLS

ทางแก้: ใช้ `resolve_tenant()` ซึ่งเป็น `SECURITY DEFINER` ข้าม RLS ได้ แล้วค่อยเปิด transaction ด้วย `tenant_id` ที่ได้

### Template สำหรับ public route

```ts
// แบบ register — สร้างร้านใหม่
async registrationOwner(dto: XxxDto, clientIp = 'unknown', deviceInfo = 'unknown') {
    const tenantID = randomUUID();           // สร้างก่อน ไม่ปล่อยให้ DB default

    try {
        return await this.db.runInTransaction(
            { tenantId: tenantID, userId: null, role: 'owner', clientIp, deviceInfo },
            async () => {
                // เช็คซ้ำข้ามร้านต้องใช้ SECURITY DEFINER
                // SELECT ตรง ๆ จะได้ 0 แถวตลอดเพราะ context เป็นร้านใหม่
                if (await this.tenantsService.findTenantSlug(dto.tenant_slug)) {
                    throw new ConflictException('...');
                }
                // ตาราง tenants เป็นตารางเดียวที่ INSERT ส่ง tenant_id ตรง
                // ตารางอื่นในนี้ใช้ app_tenant_id() ได้ตามปกติ เพราะ context ถูกตั้งแล้ว
            },
        );
    } catch (err: any) {
        if (err.code === '23505') {
            // แยกตาม constraint เพื่อให้ผู้ใช้รู้ว่าต้องแก้ field ไหน
            if (err.constraint === 'tenants_tenant_slug_key') throw new ConflictException('...');
            // ...
        }
        throw err;
    }
}
```

```ts
// แบบ login — หาร้านก่อน แล้วเปิด transaction
async signIn(dto: LoginDto, clientIp = 'unknown', deviceInfo = 'unknown') {
    // ขั้น 1 นอก transaction ใช้ SECURITY DEFINER
    const tenant = await this.tenantService.findTenantSlug(dto.tenantSlug);
    if (!tenant || !tenant.is_active) {
        throw new UnauthorizedException('...');
    }

    // ขั้น 2 เปิด transaction แล้วอ่าน users ตามปกติ
    return this.db.runInTransaction(
        { tenantId: tenant.tenant_id, userId: null, role: null, clientIp, deviceInfo },
        async () => {
            // this.db.query() ใช้ได้ RLS กรองให้ด้วยว่าเป็นร้านนี้จริง
        },
    );
}
```

`userId: null` ถูกต้องสำหรับทั้งสองกรณี เพราะยังไม่รู้ว่าใคร `audit_logs.user_id` เป็น nullable และ composite FK เป็น MATCH SIMPLE จึงไม่เช็คเมื่อ `user_id` เป็น NULL

---

## 7. ฟังก์ชันใน DB ที่เรียกได้จาก NestJS

`pos_app` ได้ `GRANT EXECUTE` บนฟังก์ชันเหล่านี้

| ฟังก์ชัน | ใช้ตอน | method |
|---|---|---|
| `resolve_tenant(slug)` | login, register — หา `tenant_id` จาก slug | `referenceQuery` |
| `resolve_user_by_email(email)` | register — เช็คอีเมลซ้ำข้ามร้าน | `referenceQuery` |
| `reopen_shift(shift, user, reason)` | เปิดกะที่ปิดแล้วใหม่ | `query` |
| `record_stock_count(tenant, ingredient, qty, user, note)` | นับสต็อกจริง — ส่ง `app_tenant_id()` เป็นอาร์กิวเมนต์ `tenant` | `query` |
| `escalate_overdue_shifts()` | cron — ปิดกะที่เลยเวลา | `query` ใน transaction ที่เปิดเอง |
| `purge_old_audit_logs()` | cron — ลบ audit เกิน 1 ปี | `query` ใน transaction ที่เปิดเอง |

### admin_purge_tenant

```sql
SELECT admin_purge_tenant('<tenant_id>');
SELECT set_config('app.allow_purge', 'off', false);
```

> **คำเตือน:** ลบร้านและข้อมูลทั้งหมดของร้านนั้นแบบย้อนกลับไม่ได้ — users, orders, payments, audit_logs ทุกอย่าง
>
> ใช้กับข้อมูลทดสอบเท่านั้น ร้านจริงใช้ soft delete `UPDATE tenants SET is_active = false`
>
> บรรทัดที่ 2 ห้ามลืม ถ้าไม่ปิดธงคืน session นั้นจะลบตาราง append-only ได้ทั้งหมดจนปิด Query Tool

`DELETE FROM tenants` ตรง ๆ ใช้ไม่ได้ เพราะ CASCADE ไปโดน trigger ที่กัน `audit_logs` ไว้ และ `pos_app` ถูก `REVOKE DELETE ON tenants` อยู่แล้ว

---

## 8. Audit Log — DB เขียนให้อะไร NestJS ต้องเขียนอะไร

`audit_logs` มี 17 `action_type` แบ่งเป็น 2 กลุ่ม

### 13 ตัวที่ trigger ใน DB เขียนเอง — ไม่ต้องทำอะไร

`menu_price_updated`, `role_changed`, `table_status_changed`, `config_updated`, `user_created`, `user_deactivated`, `user_reactivated`, `pin_changed`, `password_changed`, `pin_locked`, `order_closed_unpaid`, `shift_reopened`, `inventory_adjusted`

เขียนลง `users` ก็ได้ audit ฟรี ไม่ต้องเรียกอะไรเพิ่ม trigger อ่าน `app.current_user_id`, `app.client_ip`, `app.device_info` จาก context ที่ interceptor ตั้งไว้ ถ้าไม่มี context จะได้ `unknown` — นี่เป็นอีกเหตุผลที่ต้องตั้ง context ให้ครบ

### 4 ตัวที่ต้องเขียนจาก NestJS

`login_success`, `login_failed`, `logout`, `tenant_updated`

trigger เขียนให้ไม่ได้เพราะไม่มีการ INSERT หรือ UPDATE ตารางใดเกิดขึ้นตอนล็อกอิน

```ts
// route ที่ล็อกอินแล้ว (logout, tenant_updated) — ใช้ app_tenant_id()
await this.db.query(
    `SELECT audit_write(app_tenant_id(), $1, $2)`,
    ['tenant_updated', JSON.stringify({ field: 'restaurant_name' })],
);

// ตอน login (@Public()) — ส่ง tenant_id ที่หาได้จาก resolve_tenant()
await this.db.query(
    `SELECT audit_write($1, $2, $3)`,
    [tenant.tenant_id, 'login_success', JSON.stringify({ username })],
);
```

**ข้อควรรู้เรื่อง `login_failed`** — ถ้า slug ไม่มีในระบบ จะยังไม่รู้ `tenant_id` และคอลัมน์เป็น `NOT NULL` จึงเขียน audit ไม่ได้เลย เขียนได้เฉพาะกรณีที่หาร้านเจอแล้วแต่รหัสผิด

---

## 9. Checklist ก่อน commit

- [ ] repository ทุกตัว inject `DbContextService` ไม่มีใคร inject `PG_POOL`
- [ ] ไม่มี `tenant_id` ที่มาจาก request body และ DTO ไม่มี field นี้
- [ ] ไม่มี `req.user.tenantID` ใน route ที่ล็อกอินแล้ว
- [ ] `INSERT` ใช้ `app_tenant_id()` **มีวงเล็บ**
- [ ] ไม่มี `WHERE tenant_id` ใน `SELECT` / `UPDATE` / `DELETE`
- [ ] `referenceQuery` ใช้แค่กับ 4 ตารางที่ไม่มี RLS หรือฟังก์ชัน `SECURITY DEFINER`
- [ ] ไม่มี `;` คั่นกลาง SQL
- [ ] ทุก parameter ใช้ `$1 $2` ไม่มีการต่อ string — ชื่อคอลัมน์ที่ต่อเข้า SQL ต้องผ่าน whitelist
- [ ] การเทียบ `username` ใช้ `lower()` ทั้งสองข้าง ให้ตรงกับ unique index
- [ ] `.env` เป็น `DB_USER=pos_app` ไม่ใช่ `postgres`
- [ ] route ใหม่ที่ไม่ใช่สาธารณะ **ไม่ได้** แปะ `@Public()`
- [ ] route ใหม่ที่ต้องเช็คสิทธิ์ แปะ `@RequirePermissions('...')` ด้วย key ที่มีใน `permissions` จริง
- [ ] ทดสอบด้วย 2 ร้าน ไม่ใช่ร้านเดียว — ร้านเดียวพิสูจน์การแยกข้อมูลไม่ได้

---

## 10. Troubleshooting

| อาการ | สาเหตุ | แก้ |
|---|---|---|
| `ไม่มี tenant context` | เรียก `query()` นอก request หรือใน `@Public()` route | ใช้ `referenceQuery()` ถ้าตารางไม่มี RLS หรือเปิด `runInTransaction` เอง |
| query คืน `[]` ทั้งที่มีข้อมูลใน pgAdmin | `referenceQuery` กับตารางที่มี RLS หรือ context เป็นร้านอื่น | เปลี่ยนเป็น `query()` และเช็คว่า `tenantID` ใน token ถูกต้อง |
| `cannot insert multiple commands into a prepared statement` | มี `;` คั่นกลาง SQL | ลบ `;` ที่อยู่กลาง เหลือท้ายสุดได้ |
| `syntax error at or near ";"` (42601) | วงเล็บไม่ครบ หรือ SQL ไม่สมบูรณ์ | ดู `position` ใน error หรือเอา SQL ไปรันใน pgAdmin |
| `syntax error at or near ","` (42601) ใน `UPDATE ... SET , updated_at` | `PATCH` ได้ body ว่าง แล้ว `SET` ไม่มีคอลัมน์ | service ต้องเช็ค `fields.length === 0` แล้วตอบ 400 ก่อนเรียก repository |
| `column "app_tenant_id" does not exist` (42703) | เขียน `app_tenant_id` ลืม `()` | เติม `()` |
| `null value in column "tenant_id" violates not-null constraint` (23502) | เรียก `app_tenant_id()` ในโค้ดที่ไม่มี context | เช็คว่าอยู่ใน request ที่ล็อกอินแล้ว หรือเปิด `runInTransaction` เอง |
| `inconsistent types deduced for parameter $1` (42P08) | ใช้ `$n` ตัวเดียวกันกับชนิดคนละแบบ มักเกิดจากเผลอเขียน `WHERE tenant_id = $1` | ลบ `WHERE tenant_id` ออก RLS กรองให้แล้ว |
| `Type 'T' does not satisfy the constraint 'QueryResultRow'` (TS2344) | generic ไม่มี constraint | เขียน `<T extends QueryResultRow = any>` ห้ามครอบ `Promise<T>` |
| `UndefinedDependencyException` ตอนบูต | circular import | ย้าย token ไปไฟล์ `*.constants.ts` ที่ไม่ import ใครเลย |
| `audit_logs is append-only` ตอนลบร้าน | `DELETE FROM tenants` ตรง ๆ | ใช้ `admin_purge_tenant()` ดูข้อ 7 |
| `timeout exceeded when trying to connect` | connection pool หมด | ขยาย `max` ใน `database.module.ts` จาก 10 เป็น 20-25 |
| `new row violates row-level security policy` | `tenant_id` ที่ INSERT ไม่ตรงกับ context | ใช้ `app_tenant_id()` ใน SQL ห้ามรับค่าจาก body หรือส่งผ่าน parameter |
| สมัครด้วย `UserA` แล้วล็อกอิน `usera` ไม่ได้ | query ไม่ใช้ `lower()` | `lower(username) = lower($2)` |

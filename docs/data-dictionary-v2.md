# พจนานุกรมข้อมูล (Data Dictionary) ฉบับรวม

## PWA-POS — 28 ตาราง 3 View

> **ปรับปรุง:** 2 ตุลาคม 2569 · สกัดจากฐานข้อมูลจริงที่ติดตั้งด้วย `FULL_INSTALL.sql` บน PostgreSQL 16.13
>
> **แก้ไขรอบล่าสุด:** ลบการตั้งค่า `rounding_mode` ออก เหลือ 9 รายการ และคอลัมน์ `payments.rounding_adjustment` ถูกบังคับให้เป็น 0 ด้วย CHECK Constraint (ดูเหตุผลที่หัวข้อ 6.3)
>
> **เอกสารนี้แทนที่** `data-dictionary-user-tenant-config.md`, `data-dictionary-menu-modifier.md`, `data-dictionary-table-management.md`, `data-dictionary-order.md`, `data-dictionary-inventory.md`, `data-dictionary-payment.md` และ `data-dictionary-shift-receipt-audit.md` ทั้งหมด ซึ่งเขียนไว้ตอนระบบมี 23 ตารางและมีรายละเอียดที่ไม่ตรงกับโครงสร้างปัจจุบันแล้ว
>
> **ข้อตกลงร่วมของทั้งระบบ**
> - ทุกตารางที่มี `tenant_id` เปิด Row-Level Security และ Foreign Key ที่ข้ามตารางใช้ Composite Key ที่รวม `tenant_id` เพื่อกันการเขียนข้ามร้าน
> - คอลัมน์ที่ลงท้ายด้วย `_at` เป็น `timestamptz` เสมอ และ `created_at`/`updated_at` มีค่าเริ่มต้นเป็น `now()` โดย `updated_at` อัปเดตอัตโนมัติด้วย Trigger
> - คอลัมน์ที่ลงท้ายด้วย `_by` และ `_id` ที่ชี้ไปผู้ใช้ อ้างถึง `users.users_id` เสมอ
> - คอลัมน์ที่ลงท้ายด้วย `_snapshot` ห้ามแก้ไขหลังบันทึก บังคับด้วย Trigger

---

## 1. กลุ่ม Tenant, User และ Configuration

### 1.1 `tenants` — ร้านอาหารแต่ละร้าน

จุดตั้งต้นของการแยกข้อมูลทั้งระบบ ทุกตารางที่มีข้อมูลของร้านจะชี้กลับมาที่นี่

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `tenant_id` | uuid PK | รหัสร้าน แอปพลิเคชันสร้างเองตอนสมัคร เพราะ RLS ต้องทราบค่านี้ก่อนบันทึก |
| `restaurant_name` | varchar(150) NOT NULL | ชื่อร้านที่แสดงบนใบเสร็จและหน้าจอ |
| `tenant_slug` | varchar(100) NOT NULL UNIQUE | ชื่อย่อสำหรับใช้ใน URL บังคับเป็นตัวพิมพ์เล็ก ตัวเลข และขีดกลาง ยาว 3-50 ตัว และห้ามใช้คำสงวน เช่น `api`, `admin`, `login` ที่จะชนกับเส้นทางของระบบ |
| `tax_id` | varchar(13) | เลขประจำตัวผู้เสียภาษี 13 หลัก ต้องกรอกก่อนเปิดใช้ภาษีมูลค่าเพิ่ม (CFG-08) |
| `phone` | varchar(20) | เบอร์โทรร้าน |
| `house_number` | varchar(10) NOT NULL | บ้านเลขที่ |
| `moo` `soi` `road` | varchar(255) | หมู่ ซอย ถนน |
| `subdistrict` `district` `province` | varchar(100) NOT NULL | ตำบล อำเภอ จังหวัด |
| `postal_code` | varchar(10) NOT NULL | รหัสไปรษณีย์ |
| `timezone` | varchar(100) NOT NULL | เขตเวลา ค่าเริ่มต้น `Asia/Bangkok` ใช้คำนวณวันทำการ |
| `is_active` | boolean NOT NULL | สถานะใช้งาน ค่าเริ่มต้น `true` |
| `created_at` `updated_at` | timestamptz NOT NULL | เวลาสร้างและแก้ไขล่าสุด |

**หมายเหตุ** Trigger `seed_config` เติม `system_config` ให้ครบทุกรายการโดยอัตโนมัติเมื่อสร้างร้านใหม่

### 1.2 `users` — บัญชีผู้ใช้

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `users_id` | uuid PK | รหัสผู้ใช้ |
| `tenant_id` | uuid NOT NULL | ร้านที่สังกัด ลบร้านแล้วลบตาม |
| `role_id` | uuid NOT NULL | บทบาท 1 คนมี 1 บทบาท (USR-04) |
| `username` | varchar(100) NOT NULL | ชื่อผู้ใช้ Unique ภายในร้านแบบไม่สนตัวพิมพ์ |
| `email` | varchar(255) | อีเมล Unique ทั้งระบบแบบไม่สนตัวพิมพ์ |
| `password_hash` | varchar(255) NOT NULL | รหัสผ่านที่ Hash แล้ว ใช้ตอนเข้าระบบเริ่มกะ |
| `pin_hash` | varchar(255) | รหัส PIN ที่ Hash แล้ว ใช้ยืนยันตัวตนซ้ำตอนอนุมัติรายการเสี่ยง แยกจากรหัสผ่านโดยสิ้นเชิง (USR-03) |
| `display_name` | varchar(100) NOT NULL | ชื่อที่แสดงบนหน้าจอและในรายงาน |
| `password_failed_attempts` | smallint NOT NULL | จำนวนครั้งที่ใส่รหัสผ่านผิดติดกัน ค่าเริ่มต้น 0 |
| `password_locked_until` | timestamptz | ล็อกการเข้าระบบถึงเวลานี้ |
| `pin_failed_attempts` | smallint NOT NULL | จำนวนครั้งที่ใส่ PIN ผิดติดกัน |
| `pin_locked_until` | timestamptz | ล็อกการใช้ PIN ถึงเวลานี้ ป้องกันการเดา PIN เพื่ออนุมัติรายการเอง |
| `token_version` | integer NOT NULL | ขยับค่านี้เมื่อต้องการให้ JWT เก่าของผู้ใช้คนนี้ใช้ไม่ได้ทันที |
| `last_login_at` | timestamptz | เวลาเข้าระบบล่าสุด |
| `is_active` | boolean NOT NULL | สถานะใช้งาน การปิดใช้งานเป็น Soft Delete เท่านั้น (USR-01) |
| `deactivated_at` | timestamptz | เวลาที่ถูกปิดใช้งาน ต้องมีค่าเมื่อ `is_active = false` |
| `deactivated_by` | uuid | ผู้ปิดใช้งาน |
| `created_at` `updated_at` | timestamptz NOT NULL | เวลาสร้างและแก้ไขล่าสุด |

### 1.3 `roles` — บทบาท

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `role_id` | uuid PK | รหัสบทบาท |
| `role_name` | varchar(100) NOT NULL UNIQUE | `owner` · `manager` · `employee` |
| `description` | text | คำอธิบายบทบาท |

เป็นข้อมูลระดับระบบ ไม่ผูกกับร้าน แอปพลิเคชันมีสิทธิ์อ่านอย่างเดียว

### 1.4 `permissions` — รายการสิทธิ์

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `permission_id` | uuid PK | รหัสสิทธิ์ |
| `permission_key` | varchar(100) NOT NULL UNIQUE | รหัสที่ใช้ในโค้ด เช่น `menu:edit` |
| `module_name` | varchar(50) NOT NULL | หมวดที่ใช้จัดกลุ่มในหน้าจอผู้ดูแล |
| `description` | text | คำอธิบายสิทธิ์ |

ปัจจุบันมี 25 รายการ ดูตารางเต็มที่ `user-roles-permissions.md`

### 1.5 `role_permissions` — จับคู่บทบาทกับสิทธิ์

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `role_id` | uuid PK | บทบาท |
| `permission_id` | uuid PK | สิทธิ์ |

ใช้ `ON DELETE RESTRICT` ทั้งสองฝั่ง เพื่อกันการลบบทบาทหรือสิทธิ์ที่ยังถูกอ้างถึง

### 1.6 `refresh_tokens` — Token ต่ออายุ Session

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `token_id` | uuid PK | รหัส Token |
| `tenant_id` `user_id` | uuid NOT NULL | เจ้าของ Token |
| `token_hash` | varchar(128) NOT NULL UNIQUE | ค่า Token ที่ Hash แล้ว |
| `device_info` | text | ข้อมูลอุปกรณ์ที่ออก Token ให้ |
| `created_at` | timestamptz NOT NULL | เวลาที่ออก |
| `expires_at` | timestamptz NOT NULL | เวลาหมดอายุ |
| `revoked_at` | timestamptz | เวลาที่ถูกเพิกถอน ใช้ตัด Session รายอุปกรณ์ |

### 1.7 `config_definitions` — นิยามของการตั้งค่า

ตารางนี้ทำให้โครงสร้าง Key-Value ของ `system_config` ยังตรวจสอบค่าได้ที่ฐานข้อมูล ปัจจุบันมี **9 รายการ** ดูตารางเต็มที่ `business-rules-pos-updated.md` หัวข้อ 12.1

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `config_key` | varchar(100) PK | ชื่อการตั้งค่า |
| `value_type` | varchar(10) NOT NULL | `int` · `decimal` · `bool` · `text` |
| `default_value` | text NOT NULL | ค่าเริ่มต้นที่ร้านใหม่จะได้ และเป็นค่าสำรองหากไม่พบใน `system_config` |
| `min_value` `max_value` | decimal | ขอบเขตค่าที่ยอมรับสำหรับชนิดตัวเลข |
| `allowed_values` | text[] | รายการค่าที่เลือกได้สำหรับชนิดข้อความ |
| `owner_only` | boolean NOT NULL | จริงหมายถึงเฉพาะเจ้าของร้านแก้ได้ (CFG-04) |
| `description` | text | คำอธิบายการตั้งค่า |

### 1.8 `system_config` — ค่าการตั้งค่าของแต่ละร้าน

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `tenant_id` | uuid PK | ร้าน |
| `config_key` | varchar(100) PK | ชื่อการตั้งค่า ชี้ไป `config_definitions` |
| `config_value` | text NOT NULL | ค่าที่ตั้งไว้ ตรวจสอบชนิดและขอบเขตด้วย Trigger |
| `updated_by` | uuid | ผู้แก้ไขล่าสุด ระบบเติมจาก Session Context ให้เอง |
| `updated_at` | timestamptz NOT NULL | เวลาแก้ไขล่าสุด |

---

## 2. กลุ่ม Menu และ Modifier

### 2.1 `categories` — หมวดหมู่เมนู

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `category_id` | uuid PK | รหัสหมวดหมู่ |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `name` | varchar(100) NOT NULL | ชื่อหมวดหมู่ Unique ภายในร้านแบบไม่สนตัวพิมพ์ เฉพาะที่ยังใช้งาน |
| `sort_order` | smallint NOT NULL | ลำดับการแสดงผล ค่าเริ่มต้น 0 |
| `is_active` | boolean NOT NULL | Soft Delete (MENU-04) |
| `created_at` `updated_at` | timestamptz NOT NULL | เวลาสร้างและแก้ไขล่าสุด |

### 2.2 `menu_items` — รายการอาหาร

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `menu_item_id` | uuid PK | รหัสเมนู |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `category_id` | uuid NOT NULL | หมวดหมู่ ใช้ `NO ACTION` ไม่ลบเมนูตามเมื่อลบหมวดหมู่ |
| `name` | varchar(150) NOT NULL | ชื่อเมนู Unique ภายในร้านเฉพาะที่ยังใช้งาน |
| `description` | text | คำอธิบายเมนู |
| `price` | decimal(10,2) NOT NULL | **ราคาที่ลูกค้าจ่ายเสมอ** ไม่ว่าโหมดภาษีจะเป็นแบบใด (PAY-10) |
| `is_available` | boolean NOT NULL | หมดวันนี้หรือไม่ ฐานข้อมูลปฏิเสธการสั่งเมื่อเป็น `false` (MENU-05) |
| `is_active` | boolean NOT NULL | เลิกขายถาวร Soft Delete |
| `created_at` `updated_at` | timestamptz NOT NULL | เวลาสร้างและแก้ไขล่าสุด |

**หมายเหตุ** Trigger เขียน Audit Log ประเภท `menu_price_updated` อัตโนมัติเมื่อราคาเปลี่ยน

### 2.3 `modifier_groups` — กลุ่มตัวเลือก

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `modifier_group_id` | uuid PK | รหัสกลุ่ม |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `name` | varchar(100) NOT NULL | ชื่อกลุ่ม เช่น ระดับความเผ็ด ของเพิ่มเติม |
| `selection_type` | varchar(10) NOT NULL | `single` เลือกได้ตัวเดียว · `multi` เลือกได้หลายตัว |
| `is_required` | boolean NOT NULL | บังคับเลือกหรือไม่ บังคับที่ Frontend เท่านั้น (MOD-08) |
| `is_active` | boolean NOT NULL | Soft Delete |
| `created_at` `updated_at` | timestamptz NOT NULL | เวลาสร้างและแก้ไขล่าสุด |

### 2.4 `modifiers` — ตัวเลือกย่อย

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `modifier_id` | uuid PK | รหัสตัวเลือก |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `modifier_group_id` | uuid NOT NULL | กลุ่มที่สังกัด ลบกลุ่มแล้วลบตาม |
| `name` | varchar(100) NOT NULL | ชื่อตัวเลือก เช่น ไข่ดาว เผ็ดน้อย |
| `price_delta` | decimal(10,2) NOT NULL | ส่วนต่างราคา 0 ได้สำหรับตัวเลือกที่ไม่คิดเงิน |
| `is_active` | boolean NOT NULL | Soft Delete |
| `created_at` `updated_at` | timestamptz NOT NULL | เวลาสร้างและแก้ไขล่าสุด |

### 2.5 `menu_item_modifier_groups` — จับคู่เมนูกับกลุ่มตัวเลือก

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `tenant_id` | uuid NOT NULL | ร้าน |
| `menu_item_id` | uuid PK | เมนู |
| `modifier_group_id` | uuid PK | กลุ่มตัวเลือกที่เมนูนี้ใช้ได้ |
| `sort_order` | smallint NOT NULL | ลำดับการแสดงผลของกลุ่มในเมนูนั้น |

ทำให้ใช้กลุ่มตัวเลือกเดียวกันร่วมกันหลายเมนูได้โดยไม่ต้องทำข้อมูลซ้ำ (MOD-02)

---

## 3. กลุ่ม Table Management

### 3.1 `dining_tables` — โต๊ะในร้าน

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `table_id` | uuid PK | รหัสโต๊ะ |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `table_number` | varchar(20) NOT NULL | เลขโต๊ะที่พนักงานเรียกกัน Unique ภายในร้าน ไม่แยกตามชั้น (TBL-10) |
| `floor` | smallint NOT NULL | ชั้น ใช้กรองการแสดงผลเท่านั้น ไม่มีกฎธุรกิจผูก (TBL-09) |
| `capacity` | smallint NOT NULL | จำนวนที่นั่ง แสดงให้พนักงานเห็นแต่ไม่บังคับ (TBL-08) |
| `status` | varchar(20) NOT NULL | `available` · `occupied` · `out_of_service` |
| `created_at` `updated_at` | timestamptz NOT NULL | เวลาสร้างและแก้ไขล่าสุด |

**หมายเหตุ** `status` คำนวณจากบิลที่ยังไม่ปิดเสมอผ่านฟังก์ชัน `sync_table_status()` และ Trigger ห้ามตั้งค่าด้วยมือให้ขัดกับความจริง

---

## 4. กลุ่ม Order

### 4.1 `orders` — บิลของแต่ละโต๊ะ

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `order_id` | uuid PK | รหัสบิล อุปกรณ์สร้างเองได้เพื่อรองรับการทำงานออฟไลน์ (ORD-10) |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `order_number` | integer NOT NULL | เลขบิลที่พนักงานเรียกกันปากเปล่า รันใหม่ทุกวันทำการ ระบบออกให้เอง |
| `business_date` | date NOT NULL | วันทำการ ระบบคำนวณเอง ไม่ให้กรอก |
| `table_id` | uuid NOT NULL | โต๊ะ ต้องเป็นโต๊ะของร้านเดียวกัน |
| `payment_id` | uuid | การชำระเงินที่ปิดบิลนี้ มีค่าเฉพาะเมื่อ `close_reason = 'paid'` |
| `created_by` | uuid NOT NULL | ผู้เปิดบิล |
| `closed_at` | timestamptz | เวลาที่ปิดบิล |
| `closed_by` | uuid | ผู้ปิดบิล บังคับมีค่าเมื่อปิดโดยไม่เก็บเงิน |
| `close_reason` | varchar(20) | `paid` ชำระแล้ว · `voided_all` ยกเลิกทุกรายการ · `empty` ไม่ได้สั่งอะไร · `walkout` ลูกค้าเดินออกโดยไม่จ่าย |
| `created_at` `updated_at` | timestamptz NOT NULL | เวลาสร้างและแก้ไขล่าสุด |

**ข้อบังคับ** 1 โต๊ะมีบิลที่ยังไม่ปิดได้ใบเดียว · เปิดบิลไม่ได้ถ้าไม่มีกะเปิดอยู่ · บิลที่ปิดแล้วแก้ไม่ได้ · ปิดโดยไม่เก็บเงินต้องมีสิทธิ์ `order:close_unpaid` และระบบเขียน Audit Log ให้เอง

### 4.2 `order_items` — รายการอาหารในบิล

1 จาน 1 แถว ไม่มีคอลัมน์จำนวน (ORD-08)

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `order_item_id` | uuid PK | รหัสรายการ |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `order_id` | uuid NOT NULL | บิลที่สังกัด |
| `menu_item_id` | uuid NOT NULL | เมนูที่สั่ง |
| `unit_price_snapshot` | decimal(10,2) NOT NULL | ราคา ณ เวลาที่สั่ง ห้ามแก้ |
| `item_name_snapshot` | varchar(150) NOT NULL | ชื่อเมนู ณ เวลาที่สั่ง ห้ามแก้ ทำให้พิมพ์ใบเสร็จย้อนหลังได้ตรงเดิมแม้เปลี่ยนชื่อเมนูไปแล้ว |
| `status` | varchar(20) NOT NULL | `draft` · `queued` · `preparing` · `ready` · `served` · `voided` |
| `kitchen_ticket_id` | uuid | รหัสรอบที่ส่งเข้าครัว 1 ค่าต่อการกดส่งครัว 1 ครั้ง บังคับมีค่าหลังพ้นสถานะ `draft` (KDS-04) |
| `special_request` | text | คำขอพิเศษแบบข้อความอิสระ |
| `queued_at` `preparing_at` `ready_at` `served_at` | timestamptz | เวลาที่เข้าสู่แต่ละสถานะ ระบบเติมให้เอง |
| `is_comped` | boolean NOT NULL | ถูกยกเว้นค่าอาหารหรือไม่ |
| `comp_reason` | text | เหตุผลการยกเว้น บังคับมีเมื่อ `is_comped = true` |
| `comped_by` `comped_at` | uuid / timestamptz | ผู้อนุมัติและเวลา ต้องมีสิทธิ์ `discount:approve` |
| `voided_by` `voided_at` | uuid / timestamptz | ผู้ยกเลิกและเวลา |
| `void_reason` | text | เหตุผลการยกเลิก บังคับมีเมื่อสถานะเป็น `voided` |
| `created_at` `updated_at` | timestamptz NOT NULL | เวลาสร้างและแก้ไขล่าสุด |

**ข้อบังคับ** เปลี่ยนสถานะข้ามขั้นไม่ได้ · Void ได้ที่ `queued` และ `preparing` โดย `preparing` ต้องมีสิทธิ์ `void:approve` · Comp ได้เฉพาะ `served` และย้อนกลับไม่ได้ · สั่งเมนูที่ปิดอยู่ไม่ได้ · เพิ่มรายการในบิลที่ปิดแล้วไม่ได้

**Index ที่รองรับจอครัว** `idx_order_items_kds` เป็น Partial Index ที่ครอบคลุมเฉพาะรายการสถานะ `queued`, `preparing`, `ready` จึงไม่โตตามประวัติการขาย ทำให้การ Poll จอครัวไม่ช้าลงแม้ข้อมูลสะสมหลายหมื่นแถว

### 4.3 `order_item_modifiers` — ตัวเลือกที่เลือกในแต่ละจาน

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `tenant_id` | uuid NOT NULL | ร้าน |
| `order_item_id` | uuid PK | รายการอาหาร |
| `modifier_id` | uuid PK | ตัวเลือกที่เลือก |
| `price_delta_snapshot` | decimal(10,2) NOT NULL | ส่วนต่างราคา ณ เวลาที่สั่ง |
| `modifier_name_snapshot` | varchar(100) NOT NULL | ชื่อตัวเลือก ณ เวลาที่สั่ง |

แถวในตารางนี้แก้ไขไม่ได้เลย หากต้องการเปลี่ยนตัวเลือกให้ยกเลิกรายการแล้วสั่งใหม่

### 4.4 `order_sequences` — ตัวนับเลขบิล

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `tenant_id` | uuid PK | ร้าน |
| `business_date` | date PK | วันทำการ |
| `last_no` | integer NOT NULL | เลขล่าสุดที่ออกไป |

---

## 5. กลุ่ม Inventory

ระบบใช้การนับสต็อกจริงเมื่อสิ้นวัน ไม่มีการตัดสต็อกอัตโนมัติจากการขาย (INV-11)

### 5.1 `ingredients` — วัตถุดิบ

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `ingredient_id` | uuid PK | รหัสวัตถุดิบ |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `name` | varchar(150) NOT NULL | ชื่อวัตถุดิบ Unique ภายในร้านเฉพาะที่ยังใช้งาน |
| `stock_unit` | varchar(20) NOT NULL | หน่วยที่ใช้เก็บสต็อก เช่น กรัม ฟอง |
| `purchase_unit` | varchar(20) | หน่วยที่ซื้อ เช่น กิโลกรัม แผง |
| `purchase_to_stock_ratio` | decimal(10,4) | อัตราแปลงหน่วยซื้อเป็นหน่วยเก็บ รองรับเฉพาะอัตราส่วนตายตัวในประเภทหน่วยเดียวกัน (INV-08) |
| `low_stock_threshold` | decimal(10,4) | เกณฑ์แจ้งเตือนสต็อกต่ำ เจ้าของร้านกรอกเอง |
| `is_active` | boolean NOT NULL | Soft Delete |
| `created_at` `updated_at` | timestamptz NOT NULL | เวลาสร้างและแก้ไขล่าสุด |

### 5.2 `inventory_transactions` — การเคลื่อนไหวสต็อก

ยอดคงเหลือคำนวณจากผลรวมของตารางนี้ ไม่มีคอลัมน์เก็บยอดคงเหลือ แถวที่บันทึกแล้วแก้ไขและลบไม่ได้

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `transaction_id` | uuid PK | รหัสรายการ |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `ingredient_id` | uuid NOT NULL | วัตถุดิบ |
| `type` | varchar(20) NOT NULL | `restock` ซื้อมาเติม · `adjustment` ปรับจากการนับ · `waste` ของเสีย |
| `quantity_change` | decimal(10,4) NOT NULL | ปริมาณที่เปลี่ยนแปลง บวกคือเพิ่ม ลบคือลด ห้ามเป็น 0 |
| `counted_quantity` | decimal(10,4) | ยอดที่พนักงานนับได้จริง มีค่าเฉพาะรายการ `adjustment` เก็บแยกจากส่วนต่างเพื่อให้ตรวจย้อนหลังได้ว่ากรอกตัวเลขอะไรไป |
| `waste_reason` | varchar(20) | `expired` · `spoiled` · `dropped` · `other` บังคับมีค่าเมื่อ `type = 'waste'` |
| `note` | text | บันทึกเพิ่มเติม ฟังก์ชันนับสต็อกเติมยอดระบบกับยอดที่นับได้ลงไปให้เอง |
| `created_by` | uuid NOT NULL | ผู้บันทึก |
| `created_at` | timestamptz NOT NULL | เวลาบันทึก |

**หมายเหตุ** ใช้ฟังก์ชัน `record_stock_count()` สำหรับการนับสิ้นวัน ซึ่งล็อกแถววัตถุดิบระหว่างคำนวณ ตรวจสิทธิ์ `inventory:adjust` และเขียน Audit Log เมื่อส่วนต่างผิดปกติ (INV-12)

---

## 6. กลุ่ม Payment และ Receipt

### 6.1 `payment_attempts` — ความพยายามชำระเงิน

บันทึกทุกครั้งรวมที่ล้มเหลว รองรับการชำระด้วย QR ที่ต้องรอผลแบบ Asynchronous

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `payment_attempt_id` | uuid PK | รหัสความพยายาม |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `payment_method` | varchar(20) NOT NULL | `cash` · `qr_code` |
| `amount` | decimal(10,2) NOT NULL | ยอดที่พยายามเก็บ 0 ได้สำหรับบิลที่ยกเว้นค่าอาหารครบทุกรายการ |
| `status` | varchar(20) NOT NULL | `pending` · `success` · `failed` · `timeout` |
| `qr_reference` | varchar(100) | รหัสอ้างอิงของผู้ให้บริการ QR Unique ทั้งระบบ มีค่าเฉพาะวิธี `qr_code` |
| `failure_reason` | text | สาเหตุที่ล้มเหลว บังคับมีค่าเมื่อสถานะเป็น `failed` หรือ `timeout` |
| `initiated_by` | uuid NOT NULL | ผู้เริ่มรายการ |
| `created_at` `updated_at` | timestamptz NOT NULL | เวลาสร้างและแก้ไขล่าสุด |

**ข้อบังคับ** ยอดและวิธีชำระแก้ไม่ได้ · เปลี่ยนสถานะได้ครั้งเดียวจาก `pending` · เมื่อล้มเหลวระบบปล่อยบิลที่จองไว้กลับคืนอัตโนมัติ

### 6.2 `payment_attempt_orders` — จับคู่ความพยายามกับบิล

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `tenant_id` | uuid NOT NULL | ร้าน |
| `payment_attempt_id` | uuid PK | ความพยายามชำระเงิน |
| `order_id` | uuid PK | บิลที่รวมอยู่ในการชำระครั้งนี้ |
| `is_open` | boolean NOT NULL | ยังจองบิลนี้อยู่หรือไม่ ปิดเมื่อชำระสำเร็จหรือล้มเหลว |

**ข้อบังคับ** 1 บิลมีความพยายามที่ยังค้างได้ครั้งละอันเดียว ป้องกันการจ่ายซ้ำจากสองเครื่องพร้อมกัน · ตรวจเงื่อนไขเสิร์ฟครบก่อนจ่ายตาม `require_all_served_before_payment`

### 6.3 `payments` — การชำระเงินที่สำเร็จ

แก้ไขและลบไม่ได้ทุกกรณี (INV-01)

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `payment_id` | uuid PK | รหัสการชำระเงิน |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `payment_attempt_id` | uuid NOT NULL UNIQUE | ความพยายามที่สำเร็จ 1 ความพยายามมีการชำระได้ครั้งเดียว |
| `subtotal` | decimal(10,2) NOT NULL | มูลค่าสินค้าก่อนภาษี |
| `vat_amount` | decimal(10,2) NOT NULL | ภาษีมูลค่าเพิ่ม ระบบคำนวณให้เองตามโหมด |
| `service_charge_amount` | decimal(10,2) NOT NULL | ค่าบริการ |
| `rounding_adjustment` | decimal(10,2) NOT NULL | **บังคับเป็น 0 ด้วย CHECK Constraint** คอลัมน์นี้สำรองไว้สำหรับการปัดเศษในอนาคต ปัจจุบันยังไม่มีกลไกปัดเศษ จึงบังคับค่าไว้เพื่อไม่ให้มีการใส่ตัวเลขที่ไม่มีที่มา (ดูหมายเหตุท้ายหัวข้อ) |
| `total_amount` | decimal(10,2) NOT NULL | ยอดที่ลูกค้าจ่ายจริง |
| `vat_mode` | varchar(10) NOT NULL | โหมดภาษี ณ เวลาที่ชำระ |
| `vat_rate_snapshot` | decimal(5,2) NOT NULL | อัตราภาษี ณ เวลาที่ชำระ |
| `service_charge_rate_snapshot` | decimal(5,2) NOT NULL | อัตราค่าบริการ ณ เวลาที่ชำระ |
| `payment_method` | varchar(20) NOT NULL | วิธีชำระ ต้องตรงกับความพยายาม |
| `cash_received` | decimal(10,2) | เงินสดที่รับมา บังคับมีค่าและไม่น้อยกว่ายอดรวมเมื่อชำระด้วยเงินสด |
| `receipt_number` | varchar(20) NOT NULL | เลขที่ใบเสร็จ รูปแบบ `DDMMYY-XXXX` Unique ภายในร้าน ระบบออกให้เอง |
| `business_date` | date NOT NULL | วันทำการ ระบบคำนวณให้เอง |
| `processed_by` | uuid NOT NULL | ผู้รับชำระ |
| `paid_at` | timestamptz NOT NULL | เวลาที่ชำระ |
| `change_amount` | decimal(10,2) | เงินทอน คำนวณอัตโนมัติจาก `cash_received − total_amount` |

**ข้อบังคับ** ความพยายามต้องมีสถานะ `success` ก่อน · ยอดต้องตรงกับรายการจริงในบิล · ต้องมีกะเปิดอยู่ของวันทำการนั้น · เมื่อบันทึกสำเร็จระบบปิดทุกบิลใน Transaction เดียวกัน

**สูตรภาษีตามโหมด** (`rounding` ในสูตรปัจจุบันเป็น 0 เสมอ)

| โหมด | วิธีคำนวณ |
|---|---|
| `none` | `vat_amount = 0` และ `subtotal = ยอดรวมรายการ` |
| `inclusive` | `vat_amount = ROUND(total − total/(1+rate/100), 2)` แล้ว `subtotal = total − vat − service − rounding` |
| `exclusive` | `vat_amount = ROUND((subtotal + service) × rate/100, 2)` |

**หมายเหตุเรื่องการปัดเศษ**

การออกแบบรอบแรกมีการตั้งค่า `rounding_mode` ที่ให้เลือกได้ 3 แบบ แต่การตรวจสอบพบว่าไม่มี Trigger หรือฟังก์ชันใดอ่านค่านี้ไปใช้เลย จึงเป็นการตั้งค่าที่แสดงบนหน้าจอว่าตั้งได้แต่ไม่มีผลจริง ซึ่งทำให้ผู้ใช้เข้าใจผิด การตั้งค่านี้จึงถูกลบออกตามหลัก YAGNI เนื่องจากยังไม่มีความต้องการใดระบุว่าต้องปัดเศษ และโหมด `inclusive` ที่เป็นแนวทางหลักก็ไม่ค่อยเกิดเศษอยู่แล้ว

คอลัมน์ `rounding_adjustment` ยังคงอยู่ในตารางเพราะเป็นส่วนหนึ่งของ CHECK Constraint `chk_total_matches_sum` การลบคอลัมน์ต้องแก้ Constraint ด้วย และการเพิ่มคอลัมน์กลับมาภายหลังเมื่อมีข้อมูลจริงแล้วมีต้นทุนสูงกว่าการปลด CHECK เพียงตัวเดียว หากในอนาคตต้องการใช้งานจริง ให้เพิ่มการตั้งค่า `rounding_mode` กลับเข้าไปใน `config_definitions` คำนวณค่าใน `trg_payments_before()` และปลด `CHECK (rounding_adjustment = 0)` ออก

### 6.4 `receipt_sequences` — ตัวนับเลขที่ใบเสร็จ

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `tenant_id` | uuid PK | ร้าน |
| `business_date` | date PK | วันทำการ |
| `last_no` | integer NOT NULL | เลขล่าสุดที่ออกไป |

ออกเลขด้วย `INSERT ... ON CONFLICT DO UPDATE ... RETURNING` ซึ่งเป็นการดำเนินการแบบ Atomic ในคำสั่งเดียว ทดสอบด้วยการชำระเงินพร้อมกัน 20 รายการแล้วได้เลขเรียงต่อเนื่องไม่ซ้ำและไม่ข้าม

### 6.5 `receipt_print_logs` — ประวัติการพิมพ์ใบเสร็จ

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `print_log_id` | uuid PK | รหัสรายการพิมพ์ |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `payment_id` | uuid NOT NULL | ใบเสร็จที่พิมพ์ |
| `printed_by` | uuid NOT NULL | ผู้สั่งพิมพ์ |
| `printed_at` | timestamptz NOT NULL | เวลาที่พิมพ์ |

บันทึกทุกครั้งรวมครั้งแรก แก้ไขและลบไม่ได้ จำนวนครั้งจำกัดตาม `max_reprints`

---

## 7. กลุ่ม Shift และ Audit

### 7.1 `shifts` — กะการทำงาน

1 วันทำการมี 1 กะ การปิดกะหมายถึงปิดร้านสำหรับวันนั้น

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `shift_id` | uuid PK | รหัสกะ |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `business_date` | date NOT NULL | วันทำการ Unique ภายในร้าน ระบบคำนวณเอง ไม่ให้กรอก |
| `opening_cash` | decimal(10,2) NOT NULL | เงินสดตั้งต้นในลิ้นชัก แก้ไม่ได้หลังปิดกะ และคงค่าเดิมเมื่อเปิดกะใหม่ |
| `expected_closing_cash` | decimal(10,2) | ยอดที่ควรมีตอนปิด ระบบคำนวณจาก `opening_cash + ยอดขายเงินสด + เงินเข้า − เงินออก` |
| `actual_closing_cash` | decimal(10,2) | ยอดที่พนักงานนับได้จริง |
| `variance` | decimal(10,2) | ส่วนต่าง คำนวณอัตโนมัติจาก `actual − expected` |
| `status` | varchar(20) NOT NULL | `open` · `closed_auto` · `pending_verification` · `escalated` · `verified` |
| `opened_by` | uuid NOT NULL | ผู้เปิดกะและกรอกยอดตั้งต้น ต้องมีสิทธิ์ `shift:open` |
| `opened_at` | timestamptz NOT NULL | เวลาเปิดกะ |
| `closed_by` `closed_at` | uuid / timestamptz | ผู้ปิดกะและเวลา ต้องมีสิทธิ์ `shift:close_and_count` |
| `verified_by` `verified_at` | uuid / timestamptz | ผู้รับรองและเวลา ต้องมีสิทธิ์ `shift:verify` |
| `escalated_to` `escalated_at` | uuid / timestamptz | เจ้าของร้านที่ถูกส่งต่อให้รับรองและเวลา |
| `reopen_count` | smallint NOT NULL | จำนวนครั้งที่กะนี้ถูกเปิดใหม่ |
| `created_at` `updated_at` | timestamptz NOT NULL | เวลาสร้างและแก้ไขล่าสุด |

**ข้อบังคับ** ส่วนต่างเป็นศูนย์จึงปิดอัตโนมัติได้ · ส่วนต่างไม่เป็นศูนย์ต้องรอรับรอง · กะที่ถูก Escalate ต้องให้เจ้าของร้านรับรองเท่านั้น · เปิดใหม่ได้เฉพาะสถานะ `closed_auto` และ `pending_verification` ผ่านฟังก์ชัน `reopen_shift()` ที่ต้องระบุเหตุผล

### 7.2 `cash_movements` — เงินเข้าออกลิ้นชัก

เงินที่เคลื่อนไหวโดยไม่ใช่การขาย เช่น หยิบไปซื้อน้ำแข็ง หรือเติมธนบัตรย่อย

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `movement_id` | uuid PK | รหัสรายการ |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `shift_id` | uuid NOT NULL | กะที่เกิดรายการ ต้องเป็นกะที่เปิดอยู่ |
| `direction` | varchar(3) NOT NULL | `in` เงินเข้า · `out` เงินออก |
| `amount` | decimal(10,2) NOT NULL | จำนวนเงิน ต้องมากกว่า 0 |
| `reason` | text NOT NULL | เหตุผล บังคับระบุ |
| `created_by` | uuid NOT NULL | ผู้บันทึก ต้องมีสิทธิ์ `cash:movement` ซึ่งไม่มอบให้พนักงาน |
| `created_at` | timestamptz NOT NULL | เวลาบันทึก |

แก้ไขและลบไม่ได้ เพราะมีผลต่อยอดเงินที่ระบบคาดหวังโดยตรง

### 7.3 `audit_logs` — บันทึกการตรวจสอบ

เขียนโดย Trigger ในฐานข้อมูลเป็นหลัก ยกเว้น 3 Action ที่เกี่ยวกับการเข้าใช้ระบบ

| คอลัมน์ | ชนิด | คำอธิบาย |
|---|---|---|
| `log_id` | uuid PK | รหัสบันทึก |
| `tenant_id` | uuid NOT NULL | ร้าน |
| `user_id` | uuid | ผู้กระทำ ว่างได้กรณีเข้าระบบล้มเหลวด้วยชื่อผู้ใช้ที่ไม่มีอยู่จริง |
| `action_type` | varchar(30) NOT NULL | ประเภทเหตุการณ์ 17 แบบ |
| `ip_address` | varchar(45) NOT NULL | หมายเลข IP ของผู้กระทำ |
| `device_info` | text NOT NULL | ข้อมูลอุปกรณ์ |
| `metadata` | jsonb NOT NULL | รายละเอียดเฉพาะของแต่ละเหตุการณ์ เช่น ราคาเดิมกับราคาใหม่ |
| `created_at` | timestamptz NOT NULL | เวลาที่เกิดเหตุการณ์ |

**ประเภทเหตุการณ์** `login_success` `login_failed` `logout` `user_created` `user_deactivated` `user_reactivated` `role_changed` `pin_changed` `password_changed` `pin_locked` `menu_price_updated` `config_updated` `table_status_changed` `tenant_updated` `order_closed_unpaid` `shift_reopened` `inventory_adjusted`

เพิ่มได้อย่างเดียว ลบได้เฉพาะแถวที่มีอายุเกิน 1 ปีผ่านฟังก์ชัน `purge_old_audit_logs()`

---

## 8. View

### 8.1 `v_order_item_totals` — ยอดต่อจาน

| คอลัมน์ | คำอธิบาย |
|---|---|
| `tenant_id` `order_id` `order_item_id` `status` `is_comped` `item_name_snapshot` | ข้อมูลอ้างอิงจาก `order_items` |
| `gross_price` | ราคาเต็มต่อจาน = ราคาเมนู + ผลรวมส่วนต่างตัวเลือก |
| `line_total` | ยอดที่คิดเงินจริง เป็น 0 ทั้งจานเมื่อถูก Comp |

ใช้แทน Generated Column เดิมที่คำนวณจากราคาเมนูอย่างเดียว ซึ่งทำให้จานที่ถูก Comp ยังคิดเงินค่าตัวเลือกอยู่ (COMP-03)

### 8.2 `v_receipt_lines` — บรรทัดบนใบเสร็จ

| คอลัมน์ | คำอธิบาย |
|---|---|
| `tenant_id` `order_id` | บิล |
| `item_name_snapshot` | ชื่อเมนู |
| `gross_price` | ราคาต่อหน่วยรวมตัวเลือกแล้ว |
| `modifiers` | รายชื่อตัวเลือกคั่นด้วยจุลภาค |
| `is_comped` | ถูกยกเว้นค่าอาหารหรือไม่ |
| `qty` | จำนวนจานที่เหมือนกัน |
| `line_total` | ยอดรวมของบรรทัดนี้ |

จัดกลุ่มตามราคาและชุดตัวเลือก ไม่ใช่ตามเมนูอย่างเดียว เพื่อไม่ให้จานที่เพิ่มตัวเลือกถูกรวมกับจานธรรมดา รายการที่ถูกยกเลิกไม่ถูกนับ

### 8.3 `v_ingredient_stock` — สต็อกคงเหลือ

| คอลัมน์ | คำอธิบาย |
|---|---|
| `tenant_id` `ingredient_id` `name` `stock_unit` `low_stock_threshold` | ข้อมูลอ้างอิงจาก `ingredients` |
| `current_stock` | ยอดคงเหลือ = ผลรวม `quantity_change` ทั้งหมด |
| `is_low` | ต่ำกว่าเกณฑ์แจ้งเตือนหรือไม่ |

---

## 9. ฟังก์ชันที่แอปพลิเคชันเรียกใช้

| ฟังก์ชัน | เอาไปทำอะไร |
|---|---|
| `resolve_tenant(slug)` | ค้นหาร้านจากชื่อย่อตอนเข้าระบบ ใช้ได้โดยยังไม่มี Session Context |
| `resolve_user_by_email(email)` | ค้นหาผู้ใช้จากอีเมลแบบไม่สนตัวพิมพ์ ใช้ได้โดยยังไม่มี Session Context |
| `record_stock_count(tenant, ingredient, counted, user, note)` | บันทึกยอดวัตถุดิบที่นับได้ ระบบคำนวณส่วนต่างและเขียน Audit ให้เอง |
| `reopen_shift(shift, user, reason)` | เปิดกะที่ปิดไปแล้วใหม่ ต้องมีสิทธิ์และระบุเหตุผล |
| `escalate_overdue_shifts()` | ส่งต่อกะที่ค้างตรวจสอบเกินเวลาไปหาเจ้าของร้าน ตั้งเวลาเรียกทุก 15 นาที |
| `purge_old_audit_logs()` | ลบบันทึกที่มีอายุเกิน 1 ปี ตั้งเวลาเรียกวันละครั้ง |
| `compute_business_date(tenant, timestamp)` | คำนวณวันทำการจากเวลาจริงตามเขตเวลาและชั่วโมงเริ่มวันของร้าน |
| `cfg(tenant, key)` | อ่านค่าการตั้งค่าของร้าน พร้อมค่าสำรองจากนิยาม |
| `has_permission(user, key)` | ตรวจว่าผู้ใช้มีสิทธิ์นั้นหรือไม่ ใช้ภายใน Trigger |

---

*เอกสารนี้เป็นส่วนหนึ่งของชุดเอกสารออกแบบระบบ PWA-POS จัดทำขึ้นเพื่อการทบทวนโดยคณะกรรมการโครงงานพิเศษ*

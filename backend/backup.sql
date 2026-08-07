--
-- PostgreSQL database dump
--

\restrict fa8hfn8CE8Rac91glLjtgIoYf5fzh9rU43jc4g6fdagjcv8m8bShSvUVlBGowKl

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    permission_id uuid DEFAULT gen_random_uuid() NOT NULL,
    permission_key character varying(100) NOT NULL,
    module_name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: system_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_config (
    tenant_id uuid NOT NULL,
    config_key character varying(100) NOT NULL,
    config_value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_config OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    tenant_id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_name character varying(150) NOT NULL,
    phone character varying(20),
    address text,
    timezone character varying(100) DEFAULT 'Asia/Bangkok'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    users_id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    role_id uuid NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255),
    password_hash character varying(255) NOT NULL,
    pin_hash character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    deactivated_at timestamp with time zone,
    deactivated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (permission_id, permission_key, module_name, description) FROM stdin;
346c5b6e-65ce-44d8-a4a9-ec2cd1dc3524	user:manage	User Management	จัดการบัญชีผู้ใช้งานในร้าน
14284b2e-6802-43d3-add5-7e90940ef973	role:assign	User Management	มอบหมายบทบาทให้ผู้ใช้งาน (จากบทบาทที่มีอยู่)
d5dfab72-3fad-4a92-b056-5002f99df7a3	store:configure	System Configuration	ตั้งค่าร้าน (ชื่อ, ที่อยู่, เวลาทำการ) และ Config เชิงปฏิบัติงานอื่น (kds_enabled, max_reprints, shift_escalation_hours)
c0919773-9944-4524-b311-6926846507be	tax:configure	System Configuration	ตั้งค่า VAT และ Service Charge (Owner เท่านั้น ตาม CFG-04)
51095e2f-04ca-4b90-aad6-3385ff19a598	menu:edit	Menu Management	เพิ่ม/แก้ไข/ลบเมนู หมวดหมู่ Modifier Group/Modifier และผูก Recipe
b7dce9d8-b52c-43ad-b13f-64e093726f39	report:view_all	Reports	ดูรายงานยอดขายทั้งหมดของร้าน รวมย้อนหลัง
0511d3f8-db59-4a23-a356-3eda8a676c7a	report:view_own_shift	Reports	ดูยอดขายเฉพาะกะของตนเอง
fa71d54c-83b0-4d9b-886c-313bbf1351cf	order:create	Order Management	เปิดโต๊ะ / รับออเดอร์ / ส่งครัว / ย้ายโต๊ะระหว่างให้บริการ
b39c109b-6fe4-49e3-a077-451953eb36d9	payment:receive	Payment	รับชำระเงินและพิมพ์ใบเสร็จ รวมถึง Bill Merge
f0044703-0347-49f7-a215-c22c197af05d	payment:edit_closed	Payment	แก้ไขรายการชำระเงินที่ปิดรายการแล้ว (ไม่มอบให้บทบาทใดเลย ตาม INV-01)
68a63fed-cab7-460c-9135-7714af399636	void:approve	Order Management	อนุมัติการยกเลิกรายการ (Void)
88749ed7-1328-4fae-9b1c-eed5206f64f6	discount:approve	Order Management	อนุมัติส่วนลดนอกเหนือโปรโมชั่น / ใช้ร่วมกับ Comp (COMP-01)
89351824-afb3-4940-ba66-9fd516f5399c	inventory:check	Inventory Management	ตรวจสอบระดับสต็อกสินค้า (View-only)
460302c2-d904-46b7-8973-eebcaaf7e9d4	shift:open	Shift & Cash Reconciliation	เปิดกะการทำงาน
1b66067e-01a8-4d92-991e-4c88c07f0b5f	shift:close_and_count	Shift & Cash Reconciliation	ปิดกะและกรอกยอดเงินสดที่นับได้
de43fde3-c5c4-43ed-80d7-1bf6cc8d86fa	shift:verify	Shift & Cash Reconciliation	ตรวจสอบและรับรองยอดปิดกะของพนักงาน
8218b72d-adae-4fa9-8def-0be956a3ec23	shift:auto_escalated_verify	Shift & Cash Reconciliation	รับรองยอดปิดกะกรณีเกินกำหนดเวลาที่ Manager ต้องตรวจสอบ (SHIFT-06)
930c051e-16e4-4cbf-bf14-0beab255f7c7	kds:mark_ready	Kitchen Display System	กดยืนยันสถานะอาหารเสร็จสิ้นบนจอครัว (KDS)
3cf94ba9-bc12-4d9c-b49c-edafb2872b87	audit_log:view	Audit Log	เข้าถึงหน้า Audit Log (AUD-05)
32520829-d06c-423e-9169-b50246f158a6	table:manage	Table Management	เพิ่ม/ลบโต๊ะ และแก้ไขผังร้าน (Structural Change)
1cbc1a7e-32c4-4ee7-b317-86d2f07b42b8	table:set_status	Table Management	เปิด/ปิดใช้งานโต๊ะ (out_of_service/available) และย้ายโต๊ะ
db014d9c-a23f-4ead-b2ee-414bc40473e7	inventory:manage	Inventory Management	เพิ่ม/แก้ไข/ลบวัตถุดิบ และบันทึกการเบิก-รับสต็อก (Purchase/Restock/Adjustment)
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
7eb85574-2e31-4162-8209-d308eb7b23ad	346c5b6e-65ce-44d8-a4a9-ec2cd1dc3524
7eb85574-2e31-4162-8209-d308eb7b23ad	14284b2e-6802-43d3-add5-7e90940ef973
7eb85574-2e31-4162-8209-d308eb7b23ad	d5dfab72-3fad-4a92-b056-5002f99df7a3
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	d5dfab72-3fad-4a92-b056-5002f99df7a3
7eb85574-2e31-4162-8209-d308eb7b23ad	c0919773-9944-4524-b311-6926846507be
7eb85574-2e31-4162-8209-d308eb7b23ad	51095e2f-04ca-4b90-aad6-3385ff19a598
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	51095e2f-04ca-4b90-aad6-3385ff19a598
7eb85574-2e31-4162-8209-d308eb7b23ad	b7dce9d8-b52c-43ad-b13f-64e093726f39
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	b7dce9d8-b52c-43ad-b13f-64e093726f39
7eb85574-2e31-4162-8209-d308eb7b23ad	0511d3f8-db59-4a23-a356-3eda8a676c7a
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	0511d3f8-db59-4a23-a356-3eda8a676c7a
b17169ea-312a-44bc-a6cc-8e9d31972c63	0511d3f8-db59-4a23-a356-3eda8a676c7a
7eb85574-2e31-4162-8209-d308eb7b23ad	fa71d54c-83b0-4d9b-886c-313bbf1351cf
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	fa71d54c-83b0-4d9b-886c-313bbf1351cf
b17169ea-312a-44bc-a6cc-8e9d31972c63	fa71d54c-83b0-4d9b-886c-313bbf1351cf
7eb85574-2e31-4162-8209-d308eb7b23ad	b39c109b-6fe4-49e3-a077-451953eb36d9
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	b39c109b-6fe4-49e3-a077-451953eb36d9
b17169ea-312a-44bc-a6cc-8e9d31972c63	b39c109b-6fe4-49e3-a077-451953eb36d9
7eb85574-2e31-4162-8209-d308eb7b23ad	68a63fed-cab7-460c-9135-7714af399636
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	68a63fed-cab7-460c-9135-7714af399636
7eb85574-2e31-4162-8209-d308eb7b23ad	88749ed7-1328-4fae-9b1c-eed5206f64f6
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	88749ed7-1328-4fae-9b1c-eed5206f64f6
7eb85574-2e31-4162-8209-d308eb7b23ad	89351824-afb3-4940-ba66-9fd516f5399c
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	89351824-afb3-4940-ba66-9fd516f5399c
7eb85574-2e31-4162-8209-d308eb7b23ad	460302c2-d904-46b7-8973-eebcaaf7e9d4
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	460302c2-d904-46b7-8973-eebcaaf7e9d4
b17169ea-312a-44bc-a6cc-8e9d31972c63	460302c2-d904-46b7-8973-eebcaaf7e9d4
7eb85574-2e31-4162-8209-d308eb7b23ad	1b66067e-01a8-4d92-991e-4c88c07f0b5f
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	1b66067e-01a8-4d92-991e-4c88c07f0b5f
b17169ea-312a-44bc-a6cc-8e9d31972c63	1b66067e-01a8-4d92-991e-4c88c07f0b5f
7eb85574-2e31-4162-8209-d308eb7b23ad	de43fde3-c5c4-43ed-80d7-1bf6cc8d86fa
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	de43fde3-c5c4-43ed-80d7-1bf6cc8d86fa
7eb85574-2e31-4162-8209-d308eb7b23ad	8218b72d-adae-4fa9-8def-0be956a3ec23
7eb85574-2e31-4162-8209-d308eb7b23ad	930c051e-16e4-4cbf-bf14-0beab255f7c7
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	930c051e-16e4-4cbf-bf14-0beab255f7c7
b17169ea-312a-44bc-a6cc-8e9d31972c63	930c051e-16e4-4cbf-bf14-0beab255f7c7
7eb85574-2e31-4162-8209-d308eb7b23ad	3cf94ba9-bc12-4d9c-b49c-edafb2872b87
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	3cf94ba9-bc12-4d9c-b49c-edafb2872b87
7eb85574-2e31-4162-8209-d308eb7b23ad	32520829-d06c-423e-9169-b50246f158a6
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	32520829-d06c-423e-9169-b50246f158a6
7eb85574-2e31-4162-8209-d308eb7b23ad	1cbc1a7e-32c4-4ee7-b317-86d2f07b42b8
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	1cbc1a7e-32c4-4ee7-b317-86d2f07b42b8
b17169ea-312a-44bc-a6cc-8e9d31972c63	1cbc1a7e-32c4-4ee7-b317-86d2f07b42b8
7eb85574-2e31-4162-8209-d308eb7b23ad	db014d9c-a23f-4ead-b2ee-414bc40473e7
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	db014d9c-a23f-4ead-b2ee-414bc40473e7
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (role_id, role_name, description) FROM stdin;
7eb85574-2e31-4162-8209-d308eb7b23ad	owner	เจ้าของร้าน มีสิทธิ์สูงสุดในระบบสำหรับร้านของตนเอง ยกเว้นการกระทำที่ขัดต่อ Data Integrity Invariant
cc69408a-fe1d-4887-9a99-7dd493eaf0f8	manager	ผู้จัดการร้าน รับผิดชอบการดำเนินงานประจำวัน มีสิทธิ์อนุมัติรายการที่มีความเสี่ยงทางการเงิน
b17169ea-312a-44bc-a6cc-8e9d31972c63	employee	พนักงานปฏิบัติการ ครอบคลุมพนักงานเสิร์ฟ แคชเชียร์ และพนักงานครัว
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_config (tenant_id, config_key, config_value, updated_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (tenant_id, restaurant_name, phone, address, timezone, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (users_id, tenant_id, role_id, username, email, password_hash, pin_hash, is_active, deactivated_at, deactivated_by, created_at, updated_at) FROM stdin;
\.


--
-- Name: permissions permissions_permission_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_permission_key_key UNIQUE (permission_key);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission_id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (tenant_id, config_key);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (tenant_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (users_id);


--
-- Name: users users_tenant_id_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_username_key UNIQUE (tenant_id, username);


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(permission_id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE;


--
-- Name: system_config system_config_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE CASCADE;


--
-- Name: users users_deactivated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_deactivated_by_fkey FOREIGN KEY (deactivated_by) REFERENCES public.users(users_id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id);


--
-- PostgreSQL database dump complete
--

\unrestrict fa8hfn8CE8Rac91glLjtgIoYf5fzh9rU43jc4g6fdagjcv8m8bShSvUVlBGowKl


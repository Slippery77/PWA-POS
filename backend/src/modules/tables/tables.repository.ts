import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../database/database.constants';

@Injectable()
export class TablesRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  /**
   * TODO: ดึงรายการโต๊ะทั้งหมดของร้าน (ตาราง dining_tables)
   * คำแนะนำตาม backend-dev-guide.md:
   * - ตาราง dining_tables ใช้ SELECT table_id, table_number, capacity, floor, status, is_active FROM dining_tables
   */
  async findAll() {
    // TODO: เขียน SQL SELECT สำหรับดึงรายการโต๊ะ
    return [];
  }

  /**
   * TODO: ค้นหาโต๊ะตาม ID
   */
  async findById(id: string) {
    // TODO: เขียน SQL SELECT ค้นหาตาม table_id
    return null;
  }

  /**
   * TODO: เพิ่มโต๊ะใหม่ลงตาราง dining_tables
   * คำแนะนำ:
   * - INSERT INTO dining_tables (tenant_id, table_number, capacity, floor) VALUES (app_tenant_id(), $1, $2, $3)
   */
  async createTable(data: any) {
    // TODO: เขียน SQL INSERT
    return null;
  }

  /**
   * TODO: อัปเดตข้อมูลโต๊ะ (เลขโต๊ะ, ความจุ, ชั้น)
   */
  async updateTable(id: string, data: any) {
    // TODO: เขียน SQL UPDATE
    return null;
  }

  /**
   * TODO: ปรับสถานะเปิด/ปิดการใช้งาน (is_active)
   */
  async setActiveStatus(id: string, isActive: boolean) {
    // TODO: เขียน SQL UPDATE is_active = $2 WHERE table_id = $1
    return null;
  }
}

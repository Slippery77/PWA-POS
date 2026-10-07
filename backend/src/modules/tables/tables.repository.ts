import { Injectable } from '@nestjs/common';
import { DbContextService } from '../../database/db-context.service';
import { UpdateTableDto } from './dto/update-table.dto';


const TABLE_COLS = `table_id , table_number, capacity, floor , status ,created_at , updated_at`

@Injectable()
export class TablesRepository {
  constructor(private readonly db: DbContextService) { }


  /**
   * TODO: ดึงรายการโต๊ะทั้งหมดของร้าน (ตาราง dining_tables)
   * คำแนะนำตาม backend-dev-guide.md:
   * - ตาราง dining_tables ใช้ SELECT table_id, table_number, capacity, floor, status, is_active FROM dining_tables
   */
  async findAll() {
    const sql = ` 
      SELECT 
        table_id, 
        table_number, 
        capacity, 
        floor, 
        status, 
        is_active,
        created_at,
        updated_at
      FROM dining_tables
      ORDER BY floor ASC,
    table_number ASC;`
    // TODO: เขียน SQL SELECT สำหรับดึงรายการโต๊ะ
    const result = await this.db.query(sql)
    return result.rows;
  }

  /**
   * TODO: ค้นหาโต๊ะตาม ID
   */
  async findById(id: string) {
    const sql = ` 
      SELECT 
        table_id, 
        table_number, 
        capacity, 
        floor, 
        status, 
        is_active,
        created_at,
        updated_at
      FROM dining_tables
      WHERE table_id = $1;`
    // TODO: เขียน SQL SELECT ค้นหาตาม table_id
    const result = await this.db.query(sql, [id])
    return result.rows[0] ?? null;
  }

  /**
   * TODO: เพิ่มโต๊ะใหม่ลงตาราง dining_tables
   * คำแนะนำ:
   * - INSERT INTO dining_tables (tenant_id, table_number, capacity, floor) VALUES (app_tenant_id(), $1, $2, $3)
   */
  async createTable(table_number: string, capacity: number, floor?: number) {
    const sql = `
      INSERT INTO dining_tables (tenant_id, table_number, capacity, floor) VALUES (app_tenant_id(), $1, $2, $3)
      RETURNING ${TABLE_COLS};`
    // TODO: เขียน SQL INSERT
    const result = await this.db.query(sql, [table_number, capacity, floor])
    return result.rows[0];
  }

  /**
   * TODO: อัปเดตข้อมูลโต๊ะ (เลขโต๊ะ, ความจุ, ชั้น)
   */
  async updateTable(id: string, data: UpdateTableDto) {
    // TODO: เขียน SQL UPDATE
    const sql = `
      UPDATE dining_tables
      SET table_number = COALESCE($2 , table_number),
          capacity = COALESCE($3 , capacity),
          floor = COALESCE($4 , floor),
      updated_at = now()
      WHERE table_id  = $1
      RETURNING ${TABLE_COLS}
    `
    const result = await this.db.query(sql, [id, data.tableNumber ?? null, data.capacity ?? null, data.floor ?? null])
    return result.rows[0] ?? null;
  }

  /**
   * TODO: ปรับสถานะเปิด/ปิดการใช้งาน (is_active)
   */
  async setActiveStatus(id: string, isActive: boolean) {

    const newStatus = isActive ? 'available' : 'out_of_service';
    const sql = `
      UPDATE dining_tables
      SET status = $2,
      updated_at = now()
      WHERE table_id = $1
      RETURNING ${TABLE_COLS};
    `
    const result = await this.db.query(sql, [id, newStatus])
    // TODO: เขียน SQL UPDATE is_active = $2 WHERE table_id = $1
    return result.rows[0] ?? null;
  }
}

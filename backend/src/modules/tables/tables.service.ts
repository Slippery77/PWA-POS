import { Injectable } from '@nestjs/common';
import { TablesRepository } from './tables.repository';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(private readonly tablesRepository: TablesRepository) {}

  /**
   * TODO: Logic สร้างโต๊ะ
   * คำแนะนำตาม backend-coding-standard.md:
   * - ตรวจสอบ error code 23505 (unique_violation) หากชื่อ/เลขโต๊ะซ้ำ แล้ว throw ConflictException
   */
  async create(createTableDto: CreateTableDto) {
    // TODO: เรียก tablesRepository.createTable และจัดการ Error handling
    return this.tablesRepository.createTable(createTableDto);
  }

  /**
   * TODO: ดึงรายการผังโต๊ะทั้งหมด
   */
  async findAll() {
    // TODO: เรียก tablesRepository.findAll
    return this.tablesRepository.findAll();
  }

  /**
   * TODO: ดึงข้อมูลโต๊ะตาม ID
   * คำแนะนำ:
   * - หากไม่พบข้อมูล ให้ throw NotFoundException('ไม่พบข้อมูลโต๊ะ')
   */
  async findOne(id: string) {
    // TODO: เรียก tablesRepository.findById
    return this.tablesRepository.findById(id);
  }

  /**
   * TODO: แก้ไขข้อมูลโต๊ะ (เลขโต๊ะ, ความจุ, ชั้น)
   */
  async update(id: string, updateTableDto: UpdateTableDto) {
    // TODO: เรียก tablesRepository.updateTable
    return this.tablesRepository.updateTable(id, updateTableDto);
  }

  /**
   * TODO: ปรับสถานะเปิด/ปิดการใช้งานโต๊ะ (is_active)
   */
  async setStatus(id: string, isActive: boolean) {
    // TODO: เรียก tablesRepository.setActiveStatus
    return this.tablesRepository.setActiveStatus(id, isActive);
  }
}

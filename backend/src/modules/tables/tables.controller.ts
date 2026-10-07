import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  /**
   * POST /tables
   * Permission ที่ต้องใช้: table:manage
   */
  @Post()
  async create(@Body() createTableDto: CreateTableDto) {
    // TODO: เรียกใช้ tablesService.create
    return this.tablesService.create(createTableDto);
  }

  /**
   * GET /tables
   * ผังโต๊ะ + สถานะ (ทุก role สามารถเข้าถึงได้)
   */
  @Get()
  async findAll() {
    // TODO: เรียกใช้ tablesService.findAll
    return this.tablesService.findAll();
  }

  /**
   * PATCH /tables/:id
   * แก้ไขเลขโต๊ะ ความจุ ชั้น
   * Permission ที่ต้องใช้: table:manage
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    // TODO: เรียกใช้ tablesService.update
    return this.tablesService.update(id, updateTableDto);
  }

  /**
   * PATCH /tables/:id/disable
   * ปิดการใช้งานโต๊ะ
   * Permission ที่ต้องใช้: table:manage
   */
  @Patch(':id/disable')
  async disable(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: เรียกใช้ tablesService.setStatus ปิดใช้งานโต๊ะ (isActive = false)
    return this.tablesService.setStatus(id, false);
  }

  /**
   * PATCH /tables/:id/enable
   * เปิดการใช้งานโต๊ะ
   * Permission ที่ต้องใช้: table:manage
   */
  @Patch(':id/enable')
  async enable(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: เรียกใช้ tablesService.setStatus เปิดใช้งานโต๊ะ (isActive = true)
    return this.tablesService.setStatus(id, true);
  }
}

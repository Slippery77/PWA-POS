# PWA-POS — คู่มือ Swagger (API Documentation)

อัปเดต: 2026-10-04

**หน้า docs: `http://localhost:3000/api/docs`**

---

## 1. Swagger คืออะไร ทำไมต้องมี

### ปัญหาที่แก้

คนที่ทำ frontend **ไม่ได้อ่านโค้ด backend** เขาอยากรู้แค่ 3 อย่าง

1. มี endpoint อะไรบ้าง
2. ส่งอะไรไป
3. ได้อะไรกลับ รวมถึง error แบบไหน

ถ้าไม่มีเอกสาร เขาต้องเปิดโค้ด controller อ่านเอง หรือถามคนเขียน backend ทุกครั้ง

### ทำไมเลือก Swagger ไม่ใช่เขียนเอกสารเอง

`@nestjs/swagger` อ่าน metadata ที่ NestJS เก็บไว้อยู่แล้ว (จาก `@Controller`, `@Post`, `@Body`, DTO) แล้วสร้างเอกสารตามมาตรฐาน **OpenAPI 3**

ข้อได้เปรียบสำคัญ: **เอกสารอัปเดตตัวเองเมื่อโค้ดเปลี่ยน** เอกสารที่เขียนมือจะล้าสมัยเสมอ และเอกสารที่ล้าสมัยแย่กว่าไม่มีเอกสาร เพราะคนเชื่อแล้วทำผิด

### Swagger ให้ 2 อย่าง

| URL | ได้อะไร |
|---|---|
| `/api/docs` | หน้าเว็บที่ดูได้และ **ยิงทดสอบได้** |
| `/api/docs-json` | JSON ดิบตามมาตรฐาน OpenAPI — **import เข้า Postman ได้** |

---

## 2. ติดตั้ง

```bash
npm i @nestjs/swagger@^11
```

### ต้องระบุ `@^11` เพราะอะไร

`@nestjs/swagger` เลข major เดินตาม NestJS เสมอ โปรเจกต์นี้ใช้ NestJS 11 จึงต้องใช้ swagger 11

ถ้าลงโดยไม่ระบุเวอร์ชันจะได้ตัวล่าสุดและเจอ

```
npm error Could not resolve dependency:
npm error peer @nestjs/common@"^12.0.0" from @nestjs/swagger@12.0.2
npm error Found: @nestjs/common@11.2.7
```

**ห้ามแก้ด้วย `--force` หรือ `--legacy-peer-deps`** swagger 12 เรียก API ภายในของ NestJS 12 ที่ NestJS 11 ไม่มี ลงไปก็พังตอนบูตด้วย error ที่ไม่บอกสาเหตุ

กฎนี้ใช้กับทุก package ในตระกูล `@nestjs/*` — `jwt`, `config`, `throttler`, `testing`

เช็ค peer requirement ก่อนลงครั้งหน้า

```bash
npm view @nestjs/swagger@11 peerDependencies
```

---

## 3. ตั้งค่าใน `main.ts`

```ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// ...ของเดิมทั้งหมด (helmet, cors, ValidationPipe, setGlobalPrefix)...

const swaggerConfig = new DocumentBuilder()
    .setTitle('PWA-POS API')
    .setDescription('ระบบ POS ร้านอาหาร multi-tenant')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

await app.listen(config.get<number>('PORT') ?? 3000);
```

**วางก่อน `app.listen()` เสมอ** เพราะ `createDocument` ต้องสแกน route ทั้งหมดก่อนเซิร์ฟเวอร์เริ่มรับ request

### แต่ละตัวทำอะไร

**`new DocumentBuilder()`** — ตัวสร้าง config ใช้แบบ method chaining คือเรียกต่อกันเป็นสายแล้วปิดด้วย `.build()`

| method | ใส่ค่าอะไร | ไปโผล่ที่ไหน |
|---|---|---|
| `.setTitle()` | ชื่อ API | หัวใหญ่สุดบนหน้า docs |
| `.setDescription()` | คำอธิบาย 1-2 บรรทัด | ใต้ชื่อ |
| `.setVersion()` | เวอร์ชัน **API** ไม่ใช่เวอร์ชันโค้ด | ป้ายข้างชื่อ |
| `.addBearerAuth()` | เปิดปุ่ม **Authorize** | มุมขวาบน |
| `.build()` | ปิดสาย คืน object | ส่งเข้า `createDocument` |

**`.addBearerAuth()` สำคัญที่สุดสำหรับระบบนี้** เพราะทุก endpoint ยกเว้น login และ register ต้องมี JWT ถ้าไม่ใส่ ยิงทดสอบจากหน้า docs จะได้ 401 ทั้งหมด

ชื่อ "Bearer" มาจากรูปแบบ header ที่มาตรฐาน OAuth 2.0 กำหนด

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

ตรงกับที่ `JwtAuthGuard` ของโปรเจกต์นี้อ่านอยู่แล้ว

**`SwaggerModule.createDocument(app, swaggerConfig)`** — ตัวทำงานจริง เดินสแกนทุก controller ที่ลงทะเบียนใน `AppModule` อ่าน decorator ทั้งหมด ประกอบเป็น JSON ก้อนเดียวตาม OpenAPI

**`SwaggerModule.setup('api/docs', app, document)`** — เอา JSON นั้นมาเสิร์ฟเป็นหน้าเว็บ

### ⚠ กับดัก: `setGlobalPrefix('api')` ไม่มีผลกับ Swagger

ต้องเขียน `'api/'` เองใน `setup()`

```ts
SwaggerModule.setup('api/docs', ...)   // ✓ ได้ /api/docs
SwaggerModule.setup('docs', ...)       // ✗ ได้ /docs
```

ถ้าเขียน `'docs'` จะทำงานบน localhost แต่**พังบน production** เพราะ nginx route เฉพาะ `/api` ไป backend หน้า `/docs` จะกลายเป็น 404

ไม่ต้องใส่ `/` นำหน้า

---

## 4. ใส่ CLI plugin — ลดงานไป 70%

`nest-cli.json`

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "plugins": ["@nestjs/swagger"]
  }
}
```

restart แล้ว plugin จะอ่าน TypeScript type แล้วเติม `@ApiProperty` ให้เองจาก

- ชนิดของ field (`string`, `number`, `boolean`)
- `?` หรือ `@IsOptional()` ทำให้เป็น `required: false`
- comment ที่เขียนด้วย `/** */` กลายเป็น `description`

```ts
export class CategoryDTO {
    /** ชื่อหมวดหมู่ */
    @IsString() @IsNotEmpty() @MaxLength(100)
    name!: string;
}
```

ได้ `description: 'ชื่อหมวดหมู่'` และชนิด `string` โดยไม่ต้องแปะ `@ApiProperty` เลย

**ใส่ plugin ตั้งแต่ตอนนี้** ไม่งั้นต้องย้อนมาเติม `@ApiProperty` ให้ DTO ของ 10 โมดูลทีหลัง ซึ่งเป็นงานที่คนมักไม่ทำ

**เหลือที่ต้องเขียนเองคือ `example`** ซึ่ง plugin เดาให้ไม่ได้ และเป็นตัวที่มีค่าที่สุด

---

## 5. เปิดดูและทดสอบ

```bash
npm run start:dev
```

เปิด `http://localhost:3000/api/docs`

**เห็นทันทีโดยไม่ต้องใส่ decorator อะไรเลย**

- ทุก endpoint เรียงตาม controller
- method และ path ครบ
- field ของ body ทุกตัว พร้อมชนิด
- ปุ่ม **Try it out** ยิงได้จริง

### วิธีใช้ปุ่ม Authorize

1. ยิง `POST /api/auth/login` จากหน้า docs
2. ก๊อป `accessToken` จาก response
3. กดปุ่ม **Authorize** มุมขวาบน วาง token — **ไม่ต้องพิมพ์คำว่า Bearer** Swagger เติมให้เอง
4. กด Authorize แล้ว Close
5. ทุก endpoint หลังจากนี้ส่ง token ให้เอง

---

## 6. Decorator — ใส่ที่ไหน ใส่ค่าอะไร

ส่วนนี้ทำพร้อมแต่ละโมดูล ประมาณ 10 นาทีต่อโมดูล

### 6.1 `@ApiTags()` — จัดกลุ่ม

```ts
@ApiTags('menu')
@Controller('menu')
export class MenuController { }
```

ไม่ใส่ก็ได้ Swagger เดาจากชื่อ controller ให้ (`MenuController` กลายเป็น `Menu`)

ใส่เองเมื่ออยากตั้งชื่อกลุ่มเป็นภาษาไทย หรือรวมหลาย controller เป็นกลุ่มเดียว

```ts
@ApiTags('จัดการเมนู')
```

**มาตรฐานของโปรเจกต์นี้: ใช้ภาษาอังกฤษตัวเล็กตรงกับ path** (`menu`, `orders`, `payments`) เพื่อให้เรียงลำดับคาดเดาได้

### 6.2 `@ApiBearerAuth()` — บอกว่า endpoint นี้ต้อง token

```ts
@ApiBearerAuth()
@ApiTags('menu')
@Controller('menu')
export class MenuController { }
```

แปะที่ระดับ class ครอบทุก method ในนั้น

**ต่างจาก `.addBearerAuth()` ใน `main.ts` อย่างไร**

| ตัว | ทำอะไร |
|---|---|
| `.addBearerAuth()` ใน `main.ts` | **เปิดปุ่ม** Authorize ให้มีอยู่ ทำครั้งเดียว |
| `@ApiBearerAuth()` ที่ controller | บอกว่า **endpoint ไหนใช้** token นั้น |

ถ้าไม่แปะ `@ApiBearerAuth()` Swagger จะไม่ส่ง token ไปกับ request นั้นแม้กด Authorize แล้ว

route ที่เป็น `@Public()` (login, register) **ไม่ต้องแปะ**

### 6.3 `@ApiOperation()` — อธิบายว่า endpoint ทำอะไร

```ts
@ApiOperation({
    summary: 'สร้างหมวดหมู่เมนู',
    description: 'ชื่อซ้ำกับหมวดที่ยังใช้งานอยู่ไม่ได้ แต่ซ้ำกับหมวดที่ปิดแล้วได้',
})
@Post('category')
```

| key | ใส่อะไร | โผล่ที่ไหน |
|---|---|---|
| `summary` | 1 บรรทัด | ข้างชื่อ endpoint ตอนหุบอยู่ |
| `description` | รายละเอียด เงื่อนไข ข้อควรระวัง | ตอนกดขยาย |

`summary` คุ้มที่สุด **ใส่ทุก endpoint**

`description` ใส่เมื่อมีเงื่อนไขที่เดาไม่ได้จากชื่อ เช่น

- partial unique index ที่ทำให้ชื่อซ้ำได้ในบางกรณี
- `POST /orders` ที่รับ `order_id` จาก client และตอบ 200 เมื่อมีอยู่แล้ว
- `report:view_own_shift` ที่เห็นแค่กะของตัวเอง

### 6.4 `@ApiResponse()` — บอกว่าจะได้อะไรกลับ

```ts
@ApiResponse({ status: 201, description: 'สร้างสำเร็จ' })
@ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์ menu:edit' })
@ApiResponse({ status: 409, description: 'มีหมวดหมู่ชื่อนี้ที่ใช้งานอยู่แล้ว' })
@Post('category')
```

**นี่คือ decorator ที่มีค่าที่สุดสำหรับคนทำ frontend** เพราะเขาต้องรู้ว่าจะเจอ error อะไรเพื่อแสดงข้อความให้ผู้ใช้ ซึ่งเดาจากโค้ดไม่ได้

มีตัวย่อให้ อ่านง่ายกว่า

```ts
@ApiCreatedResponse({ description: 'สร้างสำเร็จ' })          // 201
@ApiOkResponse({ description: 'สำเร็จ' })                    // 200
@ApiBadRequestResponse({ description: 'ข้อมูลไม่ถูกต้อง' })   // 400
@ApiUnauthorizedResponse({ description: 'ไม่มี token' })      // 401
@ApiForbiddenResponse({ description: 'ไม่มีสิทธิ์' })         // 403
@ApiNotFoundResponse({ description: 'ไม่พบ' })                // 404
@ApiConflictResponse({ description: 'ข้อมูลซ้ำ' })            // 409
@ApiTooManyRequestsResponse({ description: 'ยิงถี่เกินไป' })  // 429
```

**วิธีหาว่าต้องระบุ status อะไร: ดูจาก `catch` ใน service** ว่า throw exception อะไรบ้าง

```ts
// service throw ConflictException   → ระบุ 409
// service throw NotFoundException   → ระบุ 404
// @RequirePermissions()             → ระบุ 403
// ไม่มี @Public()                   → ระบุ 401
// มี @Throttle()                    → ระบุ 429
// DTO มี validation                 → ระบุ 400
```

### 6.5 `@ApiProperty()` — อธิบาย field ใน DTO

ถ้าใส่ CLI plugin แล้ว ส่วนใหญ่ไม่ต้องแปะ ใส่เฉพาะเมื่อต้องการ `example` หรือข้อจำกัดที่ plugin เดาไม่ได้

```ts
export class CategoryDTO {
    @ApiProperty({
        description: 'ชื่อหมวดหมู่',
        example: 'ของทอด',
        maxLength: 100,
    })
    @IsString() @IsNotEmpty() @MaxLength(100)
    name!: string;
}
```

| key | ใช้ทำอะไร |
|---|---|
| `description` | คำอธิบาย field |
| `example` | **สำคัญที่สุด** — ค่าที่ Swagger เติมให้ในช่อง Try it out ทำให้ยิงทดสอบได้ทันทีไม่ต้องพิมพ์เอง |
| `maxLength` / `minimum` / `maximum` | แสดงข้อจำกัด |
| `enum` | ค่าที่ยอมรับ |
| `format` | `'uuid'`, `'date-time'`, `'email'` |
| `required: false` | field ที่ไม่บังคับ (หรือใช้ `@ApiPropertyOptional()`) |
| `isArray: true` | เป็น array |
| `type: () => Xxx` | nested object ต้องระบุชนิดเอง |

### ตัวอย่างครบชนิด

```ts
export class CreateMenuItemDto {
    @ApiProperty({ format: 'uuid', example: 'a3f1c8e2-4b7d-4e91-8c2a-1f5e9d3b7a60' })
    @IsUUID()
    category_id!: string;

    @ApiProperty({ example: 'ข้าวผัดกุ้ง', maxLength: 150 })
    @IsString() @IsNotEmpty() @MaxLength(150)
    name!: string;

    @ApiPropertyOptional({ example: 'ใส่กุ้งแม่น้ำ 3 ตัว', maxLength: 1000 })
    @IsOptional() @IsString() @MaxLength(1000)
    description?: string;

    @ApiProperty({ example: 120.00, minimum: 0, maximum: 99999999.99 })
    @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(99999999.99)
    price!: number;
}
```

### nested array ต้องระบุชนิด

```ts
export class CreateOrderDto {
    @ApiProperty({ format: 'uuid', example: 'b4e2d9f1-...' })
    @IsUUID()
    order_id!: string;

    @ApiProperty({ type: () => [CreateOrderItemDto] })
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items!: CreateOrderItemDto[];
}
```

`type: () => [X]` ต้องเขียนเอง เพราะ TypeScript ลบข้อมูลชนิดใน generic ตอน compile — plugin เดาไม่ได้ว่า `CreateOrderItemDto[]` มี element เป็นอะไร

### 6.6 `@ApiParam()` และ `@ApiQuery()`

ปกติไม่ต้องใส่ Swagger อ่านจาก `@Param` และ `@Query` ให้เอง ใส่เมื่ออยากเพิ่ม `example` หรือคำอธิบาย

```ts
@ApiParam({ name: 'category_id', format: 'uuid', example: 'a3f1c8e2-...' })
@Patch('category/:category_id/disable')
async disableCategory(@Param('category_id', ParseUUIDPipe) categoryId: string) { }
```

```ts
@ApiQuery({ name: 'from', example: '2026-10-01', description: 'วันเริ่ม (YYYY-MM-DD)' })
@ApiQuery({ name: 'to', example: '2026-10-31', description: 'วันสิ้นสุด' })
@Get('sales')
async salesReport(@Query('from') from: string, @Query('to') to: string) { }
```

---

## 7. ตัวอย่างสมบูรณ์

```ts
import {
    ApiTags, ApiBearerAuth, ApiOperation,
    ApiCreatedResponse, ApiForbiddenResponse, ApiConflictResponse,
    ApiOkResponse, ApiNotFoundResponse, ApiParam,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('menu')
@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) {}

    @ApiOperation({
        summary: 'สร้างหมวดหมู่เมนู',
        description: 'ชื่อซ้ำกับหมวดที่ยังใช้งานอยู่ไม่ได้ แต่ซ้ำกับหมวดที่ปิดแล้วได้',
    })
    @ApiCreatedResponse({ description: 'สร้างสำเร็จ' })
    @ApiForbiddenResponse({ description: 'ไม่มีสิทธิ์ menu:edit' })
    @ApiConflictResponse({ description: 'มีหมวดหมู่ชื่อนี้ที่ใช้งานอยู่แล้ว' })
    @RequirePermissions('menu:edit')
    @Post('category')
    async createCategory(@Req() req, @Body() dto: CategoryDTO) {
        return this.menuService.createCategory(req.user.tenantID, dto);
    }

    @ApiOperation({ summary: 'ปิดการใช้งานหมวดหมู่' })
    @ApiParam({ name: 'category_id', format: 'uuid' })
    @ApiOkResponse({ description: 'ปิดสำเร็จ' })
    @ApiNotFoundResponse({ description: 'ไม่พบหมวดหมู่นี้' })
    @ApiForbiddenResponse({ description: 'ไม่มีสิทธิ์ menu:edit' })
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('menu:edit')
    @Patch('category/:category_id/disable')
    async disableCategory(@Param('category_id', ParseUUIDPipe) categoryId: string) {
        return this.menuService.setCategoryActive(categoryId, false);
    }
}
```

**ลำดับ decorator** วาง Swagger ไว้บน แล้วตามด้วย permission และ HTTP method — อ่านจากบนลงล่างเป็น "อธิบายอะไร → ใครทำได้ → ทำที่ path ไหน"

ลำดับไม่มีผลต่อการทำงาน แต่ให้ทำเหมือนกันทุกไฟล์เพื่อให้อ่านง่าย

---

## 8. Import เข้า Postman

Swagger ไม่แทน Postman ใช้ทั้งสอง

| เรื่อง | Swagger | Postman |
|---|---|---|
| ลิสต์ endpoint ครบ | ✓ อัตโนมัติ | ต้องเขียนเอง |
| ไม่ล้าสมัย | ✓ อ่านจากโค้ด | ต้องอัปเดตมือ |
| ยิงทดสอบ | ✓ | ✓ |
| เก็บตัวแปร / chain request | ✗ | ✓ |
| test script อัตโนมัติ | ✗ | ✓ |
| แชร์ให้คนอื่น | ✓ URL เดียว | ต้อง export ไฟล์ |

**Swagger เป็นเอกสาร Postman เป็นชุดทดสอบ**

สร้าง Postman collection จาก Swagger โดยไม่ต้องพิมพ์ทีละอัน

1. เปิด `http://localhost:3000/api/docs-json` ก๊อป JSON ทั้งหมด
2. Postman กด **Import** เลือก **Raw text** วาง
3. ได้ collection ครบทุก endpoint

ทำซ้ำได้ทุกครั้งที่เพิ่ม endpoint

---

## 9. ซ่อน docs บน production

`api/docs` เปิดให้ทุกคนเห็นโครงสร้าง API ทั้งระบบ รวม endpoint ที่ต้องมีสิทธิ์

ไม่ใช่ช่องโหว่โดยตรง — ยังต้องมี token อยู่ — แต่ช่วยผู้โจมตีสำรวจระบบ

```ts
if (config.get<string>('NODE_ENV') !== 'production') {
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));
}
```

Stripe กับ GitHub เปิด API docs สาธารณะเพราะ API ของเขาเป็นสินค้า ส่วนระบบภายในองค์กรมักซ่อน

**สำหรับโครงงานนี้: เปิดไว้** กรรมการเปิดดู API ทั้งระบบได้ในหน้าเดียว มีประโยชน์มากกว่า

---

## 10. Checklist ต่อโมดูล

เมื่อเขียนโมดูลใหม่เสร็จ

- [ ] `@ApiTags('<ชื่อ path>')` ที่ controller
- [ ] `@ApiBearerAuth()` ที่ controller (ไม่ใส่ถ้าเป็น `@Public()`)
- [ ] `@ApiOperation({ summary })` ทุก endpoint
- [ ] `@ApiResponse` ทุก status ที่ endpoint นั้นตอบได้จริง — ดูจาก `catch` ใน service
- [ ] `example` ในทุก field ของ DTO
- [ ] `@ApiParam` ที่มี `format: 'uuid'` สำหรับ path parameter
- [ ] `type: () => [X]` สำหรับ nested array
- [ ] เปิด `/api/docs` ยิงทดสอบทุก endpoint ผ่านหน้าเว็บ ไม่ใช่แค่ Postman

ข้อสุดท้ายสำคัญ — ถ้ายิงจากหน้า docs ไม่ได้ แปลว่า `example` ไม่ครบหรือ `@ApiBearerAuth()` ขาด ซึ่งเพื่อนที่ทำ frontend จะเจอปัญหาเดียวกัน

---

## 11. Troubleshooting

| อาการ | สาเหตุ | แก้ |
|---|---|---|
| `/api/docs` ได้ 404 | `setup('docs', ...)` ลืมใส่ `api/` | `setup('api/docs', ...)` |
| ยิงจากหน้า docs ได้ 401 ทั้งที่กด Authorize แล้ว | ลืม `@ApiBearerAuth()` ที่ controller | เติม |
| ไม่มีปุ่ม Authorize | ลืม `.addBearerAuth()` ใน `main.ts` | เติม |
| body ว่างเปล่าไม่มี field | DTO ไม่มี decorator และไม่ได้ใส่ CLI plugin | ใส่ plugin ใน `nest-cheli.json` หรือแปะ `@ApiProperty` |
| nested array แสดงเป็น `object` | TypeScript ลบชนิดใน generic | `@ApiProperty({ type: () => [X] })` |
| `ERESOLVE unable to resolve dependency tree` ตอนลง | เวอร์ชัน swagger ไม่ตรงกับ NestJS | `npm i @nestjs/swagger@^11` ห้ามใช้ `--force` |
| endpoint ใหม่ไม่โผล่ | controller ไม่อยู่ใน `controllers` ของ module หรือ module ไม่อยู่ใน `AppModule` | เช็ค 2 จุดนั้น |
| เปลี่ยนโค้ดแล้ว docs ไม่เปลี่ยน | browser cache | hard refresh (Ctrl+Shift+R) |

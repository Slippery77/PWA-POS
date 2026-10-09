export interface ModifierOption {
    id: number
    name: string
    price: number
}
export type ModifierOpiton = ModifierOption // รองรับกรณีสะกดชื่อเดิม

export interface ModifierGroup {
    id: number
    title: string
    Choice: ModifierOption[]
    type: "radio" | "checkbox" | string
    price?: number
}

export interface Menu {
    id: number
    name: string
    price: number
    type: string
    modifiers?: ModifierGroup[]
}

export interface CartMenu {
    cartItemId: string
    id: number
    name: string
    price: number // ราคาต่อหน่วยที่รวมตัวเลือกเพิ่มเติมแล้ว
    basePrice: number
    type: string
    quantity: number
    selectedSpiciness?: string
    selectedAddons?: ModifierOption[]
    note?: string
}

// ตัวอย่าง Modifier สำหรับข้าวผัดกุ้ง
export const KHAO_PAD_MODIFIERS: ModifierGroup[] = [
    {
        id: 1,
        title: "ระดับความเผ็ด",
        type: "radio",
        Choice: [
            { id: 101, name: "ไม่เผ็ด", price: 0 },
            { id: 102, name: "เผ็ดปกติ", price: 0 },
            { id: 103, name: "เผ็ดมาก", price: 0 },
        ],
    },
    {
        id: 2,
        title: "เพิ่มเติม",
        type: "checkbox",
        Choice: [
            { id: 201, name: "เพิ่มไข่ดาว", price: 10 },
            { id: 202, name: "เพิ่มข้าว", price: 10 },
            { id: 203, name: "เพิ่มเนื้อ", price: 10 },
        ],
    },
]

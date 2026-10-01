export type KDSStatus = "รอทำ" | "กำลังทำ" | "พร้อมเสิร์ฟ"

export interface KDSOrderItemAddon {
    id: number
    name: string
    price: number
}

export interface KDSOrderItem {
    id: number | string
    name: string
    quantity: number
    price: number
    basePrice?: number
    selectedSpiciness?: string
    selectedAddons?: KDSOrderItemAddon[]
    note?: string
}

export interface KDSOrder {
    id: string
    orderNumber: number
    table: string
    status: KDSStatus
    createdAt: number // Unix timestamp ms
    items: KDSOrderItem[]
    totalPrice: number
    totalQuantity: number
}

/* eslint-disable react-refresh/only-export-components */
import Header from "../../../components/Header" 
import { useState } from "react"
import MenuCard from "../components/MenuCard"
import MenuSidebar from "../components/MenuSidebar"
import OrderSidebar from "../components/OrderSidebar"
import ModifierPopup from "../components/ModifierPopup"
import SearchBar from "../components/SearchBar"
import { ArrowLeft, Search, ChevronDown, ChefHat, CheckCircle2, X } from "lucide-react"
import { useKDS } from "../../kds/context/KDSContext"
import { useNavigate } from "react-router-dom"

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


// ตัวอย่าง Modifier สำหรับข้าวผัดกุ้ง (ตามรูป mockup)
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

export default function MainPOS() {
    const { sendOrderToKitchen } = useKDS()
    const navigate = useNavigate()

    const [menu] = useState<Menu[]>([
        // อาหารจานหลัก (ข้าวผัดกุ้งมี modifiers)
        { id: 1, name: "ข้าวผัดกุ้ง", price: 90, type: "อาหารจานหลัก", modifiers: KHAO_PAD_MODIFIERS },
        { id: 2, name: "กระเพราหมูสับ", price: 75, type: "อาหารจานหลัก" },
        { id: 3, name: "ต้มยำกุ้ง", price: 120, type: "อาหารจานหลัก" },
        { id: 4, name: "แกงเขียวหวานไก่", price: 85, type: "อาหารจานหลัก" },
        { id: 5, name: "ผัดซีอิ๊วหมู", price: 75, type: "อาหารจานหลัก" },
        { id: 6, name: "ยำวุ้นเส้น", price: 80, type: "อาหารจานหลัก" },
        { id: 7, name: "ข้าวมันไก่", price: 70, type: "อาหารจานหลัก" },
        { id: 8, name: "ข้าวหมูแดง", price: 70, type: "อาหารจานหลัก" },
        { id: 9, name: "ส้มตำปูปลาร้า", price: 100, type: "อาหารจานหลัก" },

        // ของทานเล่น
        { id: 10, name: "ปอเปี๊ยะทอด", price: 60, type: "ของทานเล่น" },
        { id: 11, name: "ทอดมันปลา", price: 75, type: "ของทานเล่น" },
        { id: 12, name: "ไก่ทอดสมุนไพร", price: 75, type: "ของทานเล่น" },
        { id: 13, name: "หมูปิ้ง", price: 20, type: "ของทานเล่น" },
        { id: 14, name: "ไส้กรอกอีสาน", price: 55, type: "ของทานเล่น" },
        { id: 15, name: "ข้าวเกรียบ", price: 35, type: "ของทานเล่น" },

        // เครื่องดื่ม
        { id: 16, name: "น้ำเปล่า", price: 15, type: "เครื่องดื่ม" },
        { id: 17, name: "โค้ก/เป๊ปซี่", price: 25, type: "เครื่องดื่ม" },
        { id: 18, name: "ชาเย็น", price: 35, type: "เครื่องดื่ม" },
        { id: 19, name: "กาแฟเย็น", price: 40, type: "เครื่องดื่ม" },
        { id: 20, name: "น้ำมะนาว", price: 35, type: "เครื่องดื่ม" },
        { id: 21, name: "น้ำส้มคั้น", price: 45, type: "เครื่องดื่ม" },
        { id: 22, name: "น้ำแตงโม", price: 40, type: "เครื่องดื่ม" },
        { id: 23, name: "ชานม", price: 45, type: "เครื่องดื่ม" },

        // ของหวาน
        { id: 24, name: "ข้าวเหนียวมะม่วง", price: 70, type: "ของหวาน" },
        { id: 25, name: "บัวลอย", price: 45, type: "ของหวาน" },
        { id: 26, name: "วุ้นมะพร้าว", price: 40, type: "ของหวาน" },
        { id: 27, name: "ไอศกรีมกะทิ", price: 50, type: "ของหวาน" },
        { id: 28, name: "ทับทิมกรอบ", price: 45, type: "ของหวาน" },
    ])

    const [isOrdered, setOrder] = useState<boolean>(false)
    const [cartMenu, setcartMenu] = useState<CartMenu[]>([])
    const [seletedCategory, setSelectCategory] = useState<string>("อาหารจานหลัก")
    const [currentTable, setCurrentTable] = useState<string>("โต๊ะ 1")
    const [showTableSelect, setShowTableSelect] = useState<boolean>(false)
    const [currentText, setcurrentText] = useState<string>("")

    // แจ้งเตือนเมื่อส่งเข้าครัวสำเร็จ
    const [sentToast, setSentToast] = useState<{
        show: boolean
        tableName: string
        itemCount: number
    }>({
        show: false,
        tableName: "",
        itemCount: 0,
    })

    // รายการโต๊ะสำหรับเลือก
    const AVAILABLE_TABLES = ["โต๊ะ 1", "โต๊ะ 2", "โต๊ะ 3", "โต๊ะ 4", "โต๊ะ 5", "โต๊ะ 6", "โต๊ะ 7", "โต๊ะ 8"]

    // State สำหรับเปิด Modifier Popup/Panel
    const [selectedMenuForModifier, setSelectedMenuForModifier] = useState<Menu | null>(null)

    const filteredMenu = menu.filter((m) => {
        const matchSearch = m.name.toLocaleLowerCase().includes(currentText.trim().toLocaleLowerCase())

        if (currentText.trim() !== "") return matchSearch

        return m.type === seletedCategory
    })

    const isMenuExist = filteredMenu.length > 0

    // เมื่อคลิก MenuCard: ถ้ามี modifier ให้เปิด ModifierPopup ถ้าไม่มีให้เพิ่มเข้าตะกร้าเลย
    function handleMenuClick(clickedMenu: Menu) {
        if (clickedMenu.modifiers && clickedMenu.modifiers.length > 0) {
            setSelectedMenuForModifier(clickedMenu)
            return
        }
        onAddToCart(clickedMenu)
    }

    function onAddToCart(menuToAdd: Menu) {
        setcartMenu((prev) => {
            const isExist = prev.find(
                (item) =>
                    item.id === menuToAdd.id &&
                    !item.selectedSpiciness &&
                    (!item.selectedAddons || item.selectedAddons.length === 0)
            )
            if (isExist) {
                return prev.map((item) =>
                    item.cartItemId === isExist.cartItemId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [
                ...prev,
                {
                    ...menuToAdd,
                    cartItemId: `${menuToAdd.id}-${Date.now()}`,
                    basePrice: menuToAdd.price,
                    quantity: 1,
                },
            ]
        })

        setOrder(true)
    }

    // เมื่อกดปุ่ม "เพิ่มในออเดอร์" จาก ModifierPopup
    function handleConfirmModifier(data: {
        menu: Menu
        selectedSpiciness: string
        selectedAddons: ModifierOption[]
        note: string
        quantity: number
        totalUnitPrice: number
    }) {
        const newItem: CartMenu = {
            cartItemId: `${data.menu.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            id: data.menu.id,
            name: data.menu.name,
            price: data.totalUnitPrice, // ราคาต่อหน่วยที่บวก addons แล้ว
            basePrice: data.menu.price,
            type: data.menu.type,
            quantity: data.quantity,
            selectedSpiciness: data.selectedSpiciness,
            selectedAddons: data.selectedAddons,
            note: data.note,
        }

        setcartMenu((prev) => [...prev, newItem])
        setOrder(true)
        setSelectedMenuForModifier(null)
    }

    function onDeleteFromCart(item: CartMenu) {
        setcartMenu((prev) => {
            const updated = prev.filter((m) =>
                item.cartItemId ? m.cartItemId !== item.cartItemId : m.id !== item.id
            )
            if (updated.length === 0) {
                setOrder(false)
            }
            return updated
        })
    }

    function onReduceValue(item: CartMenu) {
        setcartMenu((prev) => {
            const target = prev.find((m) =>
                item.cartItemId ? m.cartItemId === item.cartItemId : m.id === item.id
            )
            if (!target) return prev

            if (target.quantity <= 1) {
                const updated = prev.filter((m) =>
                    item.cartItemId ? m.cartItemId !== item.cartItemId : m.id !== item.id
                )
                if (updated.length === 0) {
                    setOrder(false)
                }
                return updated
            }

            return prev.map((m) =>
                (item.cartItemId ? m.cartItemId === item.cartItemId : m.id === item.id)
                    ? { ...m, quantity: m.quantity - 1 }
                    : m
            )
        })
    }

    function onIncreaseValue(item: CartMenu) {
        setcartMenu((prev) =>
            prev.map((m) =>
                (item.cartItemId ? m.cartItemId === item.cartItemId : m.id === item.id)
                    ? { ...m, quantity: m.quantity + 1 }
                    : m
            )
        )
    }

    function handleSelectCategory(category: string) {
        setSelectCategory(category)
        setcurrentText("")
    }

    // เมื่อกดปุ่ม "ส่งครัว" จาก OrderSidebar
    function handleSendToKitchen() {
        if (cartMenu.length === 0) return

        sendOrderToKitchen(currentTable, cartMenu)
        const count = cartMenu.reduce((sum, item) => sum + item.quantity, 0)

        // เคลียร์ตะกร้าเมื่อส่งเข้าครัวแล้ว
        setcartMenu([])
        setOrder(false)

        // แจ้งเตือนส่งเข้าครัวสำเร็จ
        setSentToast({
            show: true,
            tableName: currentTable,
            itemCount: count,
        })

        setTimeout(() => {
            setSentToast((prev) => ({ ...prev, show: false }))
        }, 4500)
    }

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <Header />
            <div className="flex flex-1 overflow-hidden relative">
                {/* Category Sidebar */}
                <aside className="w-50 h-full border-r border-stone-200 flex flex-col items-center py-4 gap-3 bg-[#FAF7F2]">
                    <MenuSidebar seletedCategory={seletedCategory} onSelectCategory={handleSelectCategory} />
                </aside>

                {/* Main Menu Grid */}
                <main className="flex-1 flex flex-col h-full">
                    <div className="h-14 border-b border-stone-200 px-6 flex items-center gap-4 bg-[#FAF7F2]/60">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowTableSelect(!showTableSelect)
                                }}
                                className="flex items-center gap-1.5 text-sm font-medium text-[#6B5A49] hover:text-[#2D241E] active:scale-95 transition-all cursor-pointer font-kanit"
                                title="เลือกโต๊ะ"
                            >
                                <ArrowLeft className="w-4 h-4 text-[#8C7A68]" />
                                <span>โต๊ะ</span>
                            </button>

                            <div className="h-4 w-[1px] bg-stone-300 mx-1" />

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowTableSelect(!showTableSelect)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-stone-200/60 active:scale-95 transition-all cursor-pointer font-kanit"
                                    title="คลิกเพื่อเปลี่ยนโต๊ะ"
                                >
                                    <span className="text-base font-semibold text-[#2D241E] whitespace-nowrap">
                                        {currentTable}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-stone-500" />
                                </button>

                                {showTableSelect && (
                                    <div className="absolute left-0 top-full mt-1.5 w-36 bg-white border border-stone-200 rounded-xl shadow-lg py-1.5 z-40 font-kanit">
                                        <div className="px-3 py-1 text-[11px] font-semibold text-stone-400 border-b border-stone-100">
                                            เลือกโต๊ะ
                                        </div>
                                        {AVAILABLE_TABLES.map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => {
                                                    setCurrentTable(t)
                                                    setShowTableSelect(false)
                                                }}
                                                className={`w-full text-left px-3 py-1.5 text-sm transition-all hover:bg-[#FAF7F2] cursor-pointer ${
                                                    currentTable === t
                                                        ? "font-semibold text-[#8C6D58] bg-[#FAF7F2]"
                                                        : "text-stone-700"
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 max-w-md">
                            <SearchBar value={currentText} onSearch={setcurrentText} />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 overflow-y-auto p-6 flex-1 content-start">
                        {isMenuExist ? (
                            filteredMenu.map((m) => (
                                <MenuCard key={m.id} menu={m} onClickMenuCard={handleMenuClick} />
                            ))
                        ) : (
                            <div className="col-span-4 flex flex-col items-center justify-center py-20 text-center select-none font-kanit">
                                <div className="w-16 h-16 rounded-full bg-[#EFE8DC]/80 flex items-center justify-center mb-3 text-[#A89887]">
                                    <Search className="w-8 h-8 stroke-[1.5]" />
                                </div>
                                <h3 className="text-base font-semibold text-[#2D241E]">
                                    ไม่พบเมนูที่ค้นหา {currentText && `"${currentText}"`}
                                </h3>
                                <p className="text-sm text-stone-400 mt-1">
                                    ลองค้นหาด้วยชื่ออื่น หรือเลือกหมวดหมู่อื่นดูนะครับ
                                </p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Right Aside: แสดง ModifierPopup เมื่อเลือกเมนูที่มี modifier หรือแสดง OrderSidebar ตามปกติ */}
                <aside className="w-96 border-l border-stone-200 flex flex-col h-full bg-[#FAF7F2]">
                    {selectedMenuForModifier ? (
                        <ModifierPopup
                            menu={selectedMenuForModifier}
                            onClose={() => setSelectedMenuForModifier(null)}
                            onConfirm={handleConfirmModifier}
                        />
                    ) : (
                        <OrderSidebar
                            isOrdered={isOrdered}
                            cartMenu={cartMenu}
                            onDeleteFromCart={onDeleteFromCart}
                            onReduceValue={onReduceValue}
                            onIncreaseValue={onIncreaseValue}
                            onSendToKitchen={handleSendToKitchen}
                        />
                    )}
                </aside>

                {/* Toast แจ้งเตือนเมื่อส่งเข้าครัวสำเร็จ พร้อมปุ่มเปิดดูจอครัว KDS */}
                {sentToast.show && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#2D241E] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3.5 font-kanit border border-stone-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">ส่งออเดอร์เข้าครัวสำเร็จ!</span>
                            <span className="text-xs text-stone-300">
                                {sentToast.tableName} ({sentToast.itemCount} รายการ) สร้างสถานะ 'รอทำ' ใน KDS แล้ว
                            </span>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                            <button
                                type="button"
                                onClick={() => navigate("/kds")}
                                className="px-3 py-1.5 rounded-xl bg-[#A68874] hover:bg-[#967763] text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                            >
                                <ChefHat className="w-3.5 h-3.5" />
                                <span>ดูหน้าจอครัว (KDS)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSentToast((prev) => ({ ...prev, show: false }))}
                                className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
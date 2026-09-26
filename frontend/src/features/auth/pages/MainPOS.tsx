import Header from "../components/Header"
import { useState } from "react"
import MenuCard from "../components/MenuCard"
import MenuSidebar from "../components/MenuSidebar"
import OrderSidebar from "../components/OrderSidebar"
import SearchBar from "../components/SearchBar"
import { ArrowLeft, Search } from "lucide-react"

export interface Menu {
    id: number,
    name: string,
    price: number,
    type: string
}

export interface CartMenu extends Menu {
    quantity: number,
}

export interface Employee {
    name: string,
    role: string
}

export default function MainPOS() {

    const [menu, setMenu] = useState<Menu[]>([
        // อาหารจานหลัก
        { id: 1, name: "ข้าวผัดกุ้ง", price: 90, type: "อาหารจานหลัก" },
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

    const [isOrdered, setOrder] = useState<boolean>(false);

    const [cartMenu, setcartMenu] = useState<CartMenu[]>([]);

    const [seletedCategory, setSelectCategory] = useState<string>('อาหารจานหลัก');

    const [currentTable, setCurrentTable] = useState<string>('โต๊ะ 1');

    const [currentText, setcurrentText] = useState<string>('');

    const [employee, setEmployee] = useState<Employee>({ name: 'สมศรี มีสุข', role: 'พนักงาน' })

    const filteredMenu = menu.filter((m) => {
        const matchSearch = m.name.toLocaleLowerCase().includes(currentText.trim().toLocaleLowerCase())

        if (currentText.trim() !== '')
            return matchSearch;

        return m.type === seletedCategory
    })

    const isMenuExist = filteredMenu.length > 0;



    function onAddToCart(menu: Menu) {
        setcartMenu((prev) => {
            const isExist = prev.find((item) => item.id === menu.id)
            if (isExist) {
                return prev.map((item) =>
                    item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item)
            }
            return [...prev,
            {
                ...menu,
                quantity: 1
            }
            ]
        })

        setOrder(true)
    }

    function onDeleteFromCart(menu: Menu) {
        setcartMenu((prev) => {
            const updated = prev.filter((m) => m.id !== menu.id)
            if (updated.length === 0) {
                setOrder(false)
            }
            return updated
        })
    }

    function onReduceValue(menu: Menu) {
        setcartMenu((prev) => {
            const target = prev.find((m) => m.id === menu.id)
            if (!target) return prev

            if (target.quantity <= 1) {
                const updated = prev.filter((m) => m.id !== menu.id)
                if (updated.length === 0) {
                    setOrder(false)
                }
                return updated
            }

            return prev.map((m) =>
                m.id === menu.id ? { ...m, quantity: m.quantity - 1 } : m
            )
        })
    }

    function onIncreaseValue(menu: Menu) {
        setcartMenu((prev) =>
            prev.map((m) => (m.id === menu.id ? { ...m, quantity: m.quantity + 1 } : m))
        )
    }

    function handleSelectCategory(category: string) {
        setSelectCategory(category)
        setcurrentText('') // ข้อ 4: เคลียร์คำค้นหาเมื่อเปลี่ยนหมวดหมู่
    }

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <Header emp={employee} />
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-50 h-full border-r border-stone-200 flex flex-col items-center py-4 gap-3 bg-[#FAF7F2]">
                    <MenuSidebar seletedCategory={seletedCategory} onSelectCategory={handleSelectCategory} />
                </aside>

                <main className="flex-1 flex flex-col h-full">
                    <div className="h-14 border-b border-stone-200 px-6 flex items-center gap-4 bg-[#FAF7F2]/60">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    console.log("กลับไปยังหน้าโต๊ะ")
                                }}
                                className="flex items-center gap-1.5 text-sm font-medium text-[#6B5A49] hover:text-[#2D241E] active:scale-95 transition-all cursor-pointer font-kanit"
                                title="กลับไปยังหน้าเลือกโต๊ะ"
                            >
                                <ArrowLeft className="w-4 h-4 text-[#8C7A68]" />
                                <span>โต๊ะ</span>
                            </button>

                            <div className="h-4 w-[1px] bg-stone-300 mx-1" />

                            <span className="text-base font-semibold text-[#2D241E] font-kanit whitespace-nowrap">
                                {currentTable}
                            </span>
                        </div>

                        <div className="flex-1 max-w-md">
                            <SearchBar value={currentText} onSearch={setcurrentText} />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 overflow-y-auto p-6 flex-1 content-start">
                        {isMenuExist ? (
                            filteredMenu.map((m) => (
                                <MenuCard key={m.id} menu={m} onClickMenuCard={onAddToCart} />
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
                <aside className="w-80 border-l border-stone-200 flex flex-col h-full bg-[#FAF7F2]">
                    <OrderSidebar
                        isOrdered={isOrdered}
                        cartMenu={cartMenu}
                        onDeleteFormCart={onDeleteFromCart}
                        onReduceValue={onReduceValue}
                        onIncreaseValue={onIncreaseValue}
                    />
                </aside>
            </div>
        </div>
    )
}
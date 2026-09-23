import Header from "../components/Header"
import { useState } from "react"
import MenuCard from "../components/MenuCard"
import MenuSidebar from "../components/MenuSidebar"
import OrderSidebar from "../components/OrderSidebar"

export interface Menu {
    id: number,
    name: string,
    price: number,
    type: string
}

export interface CartMenu {
    menu: Menu
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

    const filteredMenu = menu.filter((m) => m.type === seletedCategory)

    return (
        <>
            <Header />
            <div className='flex h-screen w-screen'>
                <aside className="w-50 h-screen border-r border-stone-200 flex flex-col items-center py-4 gap-3 bg-[#FAF7F2]">
                    <MenuSidebar seletedCategory={seletedCategory} onSelectCategory={setSelectCategory} />
                </aside>

                <main className="flex-1 flex flex-col h-full">
                    <div className="h-10 border-b border-stone-200 px-6 flex items-center justify-center gap-4">
                        <h1>Search Bar</h1>
                    </div>
                    <div className="flex overflow-y-auto p-6 grid grid-cols-4 gap-4">
                        {filteredMenu.map((m) => (
                            <MenuCard key={m.id} name={m.name} price={m.price} />
                        ))}
                    </div>
                </main>
                <aside className="w-80 border-l border-stone-200 flex flex-col h-full bg-[#FAF7F2]">
                    <OrderSidebar isOrdered={isOrdered} cartMenu={cartMenu} />
                </aside>
            </div>

        </>
    )
}
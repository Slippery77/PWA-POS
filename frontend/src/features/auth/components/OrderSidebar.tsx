import { type CartMenu } from "../pages/MainPOS"
import { UtensilsCrossed, SendHorizontal } from "lucide-react"

interface propsOrderSidebar {
    cartMenu: CartMenu[],
    isOrdered: boolean
}

export default function OrderSidebar(props: propsOrderSidebar) {
    return (
        <div className="w-full h-full flex flex-col justify-between font-kanit">
            <div className="h-10 border-b border-stone-200 px-6 flex items-center">
                <h2 className="text-stone-800 font-medium text-base">ออเดอร์ปัจจุบัน</h2>
            </div>

            {!props.isOrdered && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <UtensilsCrossed className="w-14 h-14 text-[#C4B3A2] mb-3" strokeWidth={1.25} />
                    <p className="text-stone-600 font-medium text-base">ยังไม่มีรายการ</p>
                    <p className="text-stone-400 text-sm mt-1">กดเมนูเพื่อเพิ่มออเดอร์</p>
                </div>
            )}

            {props.isOrdered && (
                <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center text-stone-500">
                    <p>Order List</p>
                </div>
            )}

            <div className="border-t border-stone-200 p-5 bg-[#FAF7F2]">
                <div className="flex justify-between items-center text-sm text-stone-500 mb-2">
                    <span>ยอดรวม</span>
                    <span className="font-medium text-stone-700">฿100</span>
                </div>
                <div className="flex justify-between items-center text-sm text-stone-500 mb-3">
                    <span>VAT 7%</span>
                    <span className="font-medium text-stone-700">฿0</span>
                </div>

                <div className="border-t border-stone-200/80 pt-3 pb-4 flex justify-between items-center">
                    <span className="text-stone-800 font-semibold text-base">รวมทั้งหมด</span>
                    <span className="text-[#A68874] font-semibold text-base">฿100</span>
                </div>

                <div className="flex flex-col gap-2.5">
                    <button
                        type="button"
                        className="w-full py-2.5 px-4 rounded-full border border-[#AA8971] text-[#8C6D58] font-medium text-sm hover:bg-[#EFE8DD]/50 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <SendHorizontal className="w-4 h-4 text-[#8C6D58]" strokeWidth={1.75} />
                        <span>ส่งครัว</span>
                    </button>
                    <button
                        type="button"
                        className="w-full py-2.5 px-4 rounded-full bg-[#A68874] text-white font-medium text-sm hover:bg-[#967763] active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                    >
                        ชำระเงิน ฿100
                    </button>
                </div>
            </div>
        </div>
    )
}
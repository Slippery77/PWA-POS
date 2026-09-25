import { type CartMenu } from "../pages/MainPOS"
import { UtensilsCrossed, SendHorizontal } from "lucide-react"

interface propsOrderSidebar {
    cartMenu: CartMenu[],
    isOrdered: boolean
}

export default function OrderSidebar(props: propsOrderSidebar) {

    const subtotal = props.cartMenu.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    const vat = (subtotal * 7) / 100;

    const grandTotal = subtotal + vat;

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
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
                    {props.cartMenu.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white/90 border border-stone-200/80 rounded-xl p-3 flex items-center justify-between shadow-2xs hover:bg-white hover:border-stone-300 transition-all"
                        >
                            <div className="flex-1 min-w-0 pr-3">
                                <h3 className="text-stone-800 font-medium text-sm truncate">
                                    {item.name}
                                </h3>
                                <p className="text-xs text-stone-400 mt-0.5">
                                    ฿{item.price} / รายการ
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-stone-200 text-stone-600 font-medium text-xs">
                                    x{item.quantity}
                                </span>
                                <span className="font-semibold text-stone-800 text-sm min-w-14 text-right">
                                    ฿{(item.price * item.quantity).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="border-t border-stone-200 p-5 bg-[#FAF7F2]">
                <div className="flex justify-between items-center text-sm text-stone-500 mb-2">
                    <span>ยอดรวม</span>
                    <span className="font-medium text-stone-700">฿ {subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-stone-500 mb-3">
                    <span>VAT 7%</span>
                    <span className="font-medium text-stone-700">฿ {vat}</span>
                </div>

                <div className="border-t border-stone-200/80 pt-3 pb-4 flex justify-between items-center">
                    <span className="text-stone-800 font-semibold text-base">รวมทั้งหมด</span>
                    <span className="text-[#A68874] font-semibold text-base">฿ {grandTotal}</span>
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
                        ชำระเงิน ฿{grandTotal}
                    </button>
                </div>
            </div>
        </div>
    )
}
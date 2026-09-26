import { type Employee } from "../pages/MainPOS"
import { Menu } from "lucide-react"

interface HeaderProps {
    emp: Employee
}

export default function Header({ emp }: HeaderProps) {
    return (
        <header className="h-14 bg-[#FAF7F2] border-b border-stone-200 px-8 flex items-center justify-between font-kanit select-none shrink-0">
            <div className="flex items-center gap-2">
            </div>
            <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                    <span className="text-sm font-medium text-[#2D241E] leading-tight">
                        {emp.name}
                    </span>
                    <span className="text-xs text-stone-500 font-normal">
                        {emp.role}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        console.log("คลิกเมนูหลัก")
                    }}
                    className="p-1.5 text-[#2D241E] hover:bg-[#EFE8DC] active:scale-95 rounded-lg transition-all cursor-pointer"
                    title="เมนูหลัก"
                >
                    <Menu className="w-6 h-6 stroke-[1.75]" />
                </button>
            </div>
        </header>
    )
}
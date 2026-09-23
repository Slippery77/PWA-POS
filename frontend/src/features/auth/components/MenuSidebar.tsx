import { useState } from "react";
import CategoryCard from "./CategoryCard"
import { UtensilsCrossed, IceCreamCone, Croissant, CupSoda } from "lucide-react"

export interface Category {
    id: number
    title: string,
    icon: React.ReactNode;

}

interface MenuSidebarProps {
    seletedCategory: string,
    onSelectCategory: (categoryTitle: string) => void;
}
export default function MenuSidebar(props: MenuSidebarProps) {
    const [category, setCategory] = useState<Category[]>([
        { id: 1, title: 'อาหารจานหลัก', icon: <UtensilsCrossed /> },
        { id: 2, title: 'ของทานเล่น', icon: <Croissant /> },
        { id: 3, title: 'เครื่องดื่ม', icon: <CupSoda /> },
        { id: 4, title: 'ของหวาน', icon: <IceCreamCone /> },
    ])

    return (
        <div className="flex flex-col items-center gap-3 w-full font-kanit">
            {category.map((c) => (
                <CategoryCard key={c.id} category={c} isActive={props.seletedCategory === c.title} onClick={() => props.onSelectCategory(c.title)} />
            ))}
        </div>
    )
}
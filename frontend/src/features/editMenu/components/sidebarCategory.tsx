import {Plus} from 'lucide-react';



export default function SidebarCategory(){
    return (
        <div>
            <aside className='flex h-full w-40 flex-col border-r border-[#d9c6b0] bg-[#f3eadf]'>
                <ul className='flex-1 overflow-y-auto'>
                    
                </ul>

                <div className="shrink-0 broder-t border-[#d9c7b0] p-2">
                    <button className="w-full rounded-full border border-[#b08968] py-1.5 text-sm hover:[#b08968]">
                        <Plus/> เพิ่มหมวด
                    </button>
                </div>
            </aside>
        </div>
    )
}
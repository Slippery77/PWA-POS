import { useState } from "react";

interface restaurant_formstate{
    restaurant_name : string;
    tenant_slug : string;
    phone : string;
    house_number : string;
    moo : string;
    soi : string;
    road : string;
    subdistrict : string;
    district : string; 
    province : string;
    postal_code : string;
}

//สร้าง props เพื่อให้ต้องรับ function ชื่อ onNext จาก component แม่ (Register_page) เพื่อให้สามารถเรียกใช้งานได้เมื่อ form ถูก submit สำเร็จ
type Props = {
    initialValues? : Partial<restaurant_formstate>;
    onNext: (data: restaurant_formstate) => void;
};

export function Register_RestaurantForm({ initialValues, onNext }: Props){
    const [formState, setFormState] = useState<restaurant_formstate>({
        restaurant_name : initialValues?.restaurant_name ?? "",
        tenant_slug:     initialValues?.tenant_slug ?? "",
        phone:           initialValues?.phone ?? "",
        house_number:    initialValues?.house_number ?? "",
        moo:             initialValues?.moo ?? "",
        soi:             initialValues?.soi ?? "",
        road:            initialValues?.road ?? "",
        subdistrict:     initialValues?.subdistrict ?? "",
        district:        initialValues?.district ?? "",
        province:        initialValues?.province ?? "",
        postal_code:     initialValues?.postal_code ?? "",
    });

    const handleChange = (field: keyof restaurant_formstate, value: string) => {
        setFormState((prevState)=>({
            ...prevState,
            [field]: value,
        }));
    };

    const [ errors , setError] = useState<Record<string, string>>({});
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) =>{
        e.preventDefault();
        const newErrors = {
            restaurant_name : formState.restaurant_name.trim()==="" ? "กรุณากรอกชื่อร้าน" : "",
            tenant_slug : formState.tenant_slug.trim()==="" ? "กรุณากรอก Tenant Slug" : "",
            phone : formState.phone.trim()==="" ? "กรุณากรอกเบอร์โทรศัพท์" : "",
            house_number : formState.house_number.trim()==="" ? "กรุณากรอกบ้านเลขที่" : "",
            subdistrict : formState.subdistrict.trim() ==="" ? "กรุณากรอกตำบล" : "",
            district : formState.district.trim()==="" ? "กรุณากรอกอำเภอ" : "",
            province : formState.province.trim()==="" ? "กรุณากรอกจังหวัด": "",
            postal_code : formState.postal_code.trim()==="" ? "กรุณากรอกรหัสไปรษณีย์" : "",
            };
        setError(newErrors)
        const hasErrors = Object.values(newErrors).some((msg) => msg !== "");
        if (hasErrors){
            return; 
        }
        onNext(formState);
        }
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>ชื่อร้านอาหาร</label>
                    <input
                    type="text"
                    placeholder="Restaurant Name"
                    value={formState.restaurant_name}
                    onChange={(e) => handleChange("restaurant_name",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.restaurant_name && (<p className="text-red-500 text-sm">{errors.restaurant_name}</p>)}
                </div>
                <div>
                    <label>Tenant Slug</label>
                    <input
                    type="text"
                    placeholder="example: my-restaurant"
                    value={formState.tenant_slug}
                    onChange={(e) => handleChange("tenant_slug",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.tenant_slug && (<p className="text-red-500 text-sm">{errors.tenant_slug}</p>)}
                </div>
                <div>
                    <label>หมายเลขโทรศัพท์</label>
                    <input
                    type="text"
                    placeholder="0xx-xxx-xxxx"
                    value={formState.phone}
                    onChange={(e) => handleChange("phone",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.phone && (<p className="text-red-500 text-sm">{errors.phone}</p>)}
                </div>
                <div>
                    <label>บ้านเลขที่</label>
                    <input
                    type="text"
                    placeholder="example: 123"
                    value={formState.house_number}
                    onChange={(e) => handleChange("house_number",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.house_number && <p className="text-red-500 text-sm">{errors.house_number}</p>}
                </div>
                <div>
                    <label>หมู่</label>
                    <input
                    type="text"
                    value={formState.moo}
                    placeholder = "1"
                    onChange={(e) => handleChange("moo",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label>ซอย</label>
                    <input
                    type="text"
                    value={formState.soi}
                    onChange={(e) => handleChange("soi",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label>ถนน</label>
                    <input
                    type="text"
                    value={formState.road}
                    onChange={(e) => handleChange("road",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label>ตำบล</label>
                    <input
                    type="text"
                    value={formState.subdistrict}
                    onChange={(e) => handleChange("subdistrict",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"                    
                    />
                    {errors.subdistrict && <p className="text-red-500 text-sm">{errors.subdistrict}</p>}
                </div>
                <div>
                    <label>อำเภอ</label>
                    <input
                    type="text"
                    value={formState.district}
                    onChange={(e) => handleChange("district",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.district && <p className="text-red-500 text-sm">{errors.district}</p>}
                </div>
                <div>
                    <label>จังหวัด</label>
                    <input
                    type="text"
                    value={formState.province}
                    onChange={(e) => handleChange("province",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.province && <p className="text-red-500 text-sm">{errors.province}</p>}
                </div>
                <div>
                    <label>เลขไปรษณีย์</label>
                    <input
                    type="text"
                    placeholder="example: 12345"
                    value={formState.postal_code}
                    onChange={(e) => handleChange("postal_code",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.postal_code && <p className="text-red-500 text-sm">{errors.postal_code}</p>}
                </div>
                <div>
                    <button 
                    className = "h-14 w-full rounded-2xl bg-[#D8C2A9] text-lg font-semibold text-white transition hover:bg-[#C6A889] active:scale-[0.98]"
                    type="submit">
                        ถัดไป
                    </button>
                </div> 
            </form>
        </div>
    )
}
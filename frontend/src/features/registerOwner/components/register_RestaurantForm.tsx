import { useState } from "react";
import  useRegister  from '../hooks/register';
import { useNavigate, useParams } from "react-router-dom";

interface restaurant_formstate{
    restaurant_name : string;
    tenant_slug : string;
    phone : string;
    house_number : string;
    village : string;
    soi : string;
    road : string;
    subdistrict : string;
    district : string; 
    province : string;
    postal_code : string;
}

export function Register_RestaurantForm(){
    const [formState, setFormState] = useState<restaurant_formstate>({
        restaurant_name : "",
        tenant_slug : "",
        phone : "",
        house_number : "",
        village : "",
        soi : "",
        road : "",
        subdistrict : "",
        district : "", 
        province : "",
        postal_code : "",
    });
    const navigate = useNavigate();
    const handleChange = (field: keyof restaurant_formstate, value: string) => {
        setFormState((prevState)=>({
            ...prevState,
            [field]: value,
        }));
    };
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) =>{
        e.preventDefault();
        // TO DO : hook
        // const result = await useRegister(formState);
        // if(result){
        //     navigate()
        // }
    }
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Restaurant Name</label>
                    <input
                    type="text"
                    placeholder="Restaurant Name"
                    value={formState.restaurant_name}
                    onChange={(e) => handleChange("restaurant_name",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
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
                </div>
                <div>
                    <label>Phone Number</label>
                    <input
                    type="text"
                    placeholder="0xx-xxx-xxxx"
                    value={formState.phone}
                    onChange={(e) => handleChange("phone",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label>House Number</label>
                    <input
                    type="text"
                    placeholder="example: 123/4"
                    value={formState.house_number}
                    onChange={(e) => handleChange("house_number",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label>Village</label>
                    <input
                    type="text"
                    value={formState.village}
                    onChange={(e) => handleChange("village",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label>Soi</label>
                    <input
                    type="text"
                    value={formState.soi}
                    onChange={(e) => handleChange("soi",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label>Road</label>
                    <input
                    type="text"
                    value={formState.road}
                    onChange={(e) => handleChange("road",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label>Subdistrict</label>
                    <input
                    type="text"
                    value={formState.subdistrict}
                    onChange={(e) => handleChange("subdistrict",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"                    
                    />
                </div>
                <div>
                    <label>District</label>
                    <input
                    type="text"
                    value={formState.district}
                    onChange={(e) => handleChange("district",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label>Province</label>
                    <input
                    type="text"
                    value={formState.province}
                    onChange={(e) => handleChange("province",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label>Postal Code</label>
                    <input
                    type="text"
                    placeholder="example: 12345"
                    value={formState.postal_code}
                    onChange={(e) => handleChange("postal_code",e.target.value)}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </form>
        </div>
    )
}

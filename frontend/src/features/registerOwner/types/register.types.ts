export interface RegisterOwner{
    username : string;
    email : string;
    password : string;
    confirmPassword : string;
} 

export interface RegisterRestuarant{
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

export interface registerRequest{
    tenant: RegisterRestuarant;
    owner: RegisterOwner;
}
export interface RegisterOwner{
    username : string;
    email : string;
    password : string;
    confirmPassword : string;
} 

export interface RegisterRestaurant{
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

export type registerRequest = RegisterRestaurant & Omit<RegisterOwner, "confirmPassword">;
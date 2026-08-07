import { Injectable } from "@nestjs/common";
import { RolesRepository } from "./roles.repository";

@Injectable()
export class RolesService{
    constructor(
        private readonly rolesRepository : RolesRepository){}
    async findRoleName(role_name:string){
        return this.rolesRepository.findRoleByName(role_name);    
    }
    async findRoleByID(role_id:string){
        return this.rolesRepository.findRoleByID(role_id);
    }
}
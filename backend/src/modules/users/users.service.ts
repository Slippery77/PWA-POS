import { Injectable , ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { PoolClient } from 'pg';
import { CreateUserDTO } from './dto/createUser.dto';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository : UsersRepository ,
        private readonly rolesService : RolesService
    ){}
    // async findByUsernameAndTenantID(
    //     username: string,
    //     tenantID: string
    // ){
    //     return this.usersRepository.findByUsernameAndTenantID(
    //         username,
    //         tenantID
    //     );
    // }

    async createOwner(
        client:PoolClient,
        tenant_id:string,
        role_id:string,
        username:string,
        email:string,
        password:string,
        display_name:string
    ){
        return this.usersRepository.createOwner(
            client,
            tenant_id,
            role_id,
            username,
            email,
            password,
            display_name
        )
    }
    
    async findEmail(
        email:string
    ){
        return this.usersRepository.findEmail(email);
    }

    async findByUsernameAndTenantSlug(
        username: string,
        tenantSlug: string
    ){
        return this.usersRepository.findByUsernameAndTenantSlug(username, tenantSlug);
    }

    async createUser(tenantID:string, dto:CreateUserDTO){ 
        try{
            const isUsernameExisted = await this.usersRepository.findUsernameAndTenantID(tenantID,dto.username);

            if(isUsernameExisted){
                throw new ConflictException('Username already existed!');
            }
            
            const role = await this.rolesService.findRoleName(dto.role_name);
            if(!role){
                throw new BadRequestException('Invalid role');
            }
            const roleID = role.role_id
            
            const hash_password = await bcrypt.hash(dto.password,10);
            const pin_hash = dto.pin ? await bcrypt.hash(dto.pin,10) : null;
            const result = await this.usersRepository.createUser(tenantID,roleID,dto.username,hash_password,pin_hash,dto.display_name);
            return {
                message:'Create user Successfully!',
                user_id : result.users_id,
                username : result.username,
                display_name : result.display_name,
                role : dto.role_name
            }
        }catch(err:any){
            if(err.code==='23505'){
                throw new ConflictException('Username already existed!');
            }
            throw err;
        }
    }
}
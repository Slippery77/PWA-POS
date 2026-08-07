import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { PoolClient } from 'pg';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository : UsersRepository 
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
    ){
        return this.usersRepository.createOwner(
            client,
            tenant_id,
            role_id,
            username,
            email,
            password,
        )
    }
    async findUser(
        username : string 
    ){
        return this.usersRepository.findUser(username);
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
}
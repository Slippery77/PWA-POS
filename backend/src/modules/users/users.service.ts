import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

export type User = any;

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository : UsersRepository 
    ){}
    async findByUsernameAndTenantID(
        username: string,
        tenantID: string
    ){
        return this.usersRepository.findByUsernameAndTenantID(
            username,
            tenantID
        );
    }
    // async something(){
    //     return this.usersRepository.createRestuarant(

    //     )
    // }
}
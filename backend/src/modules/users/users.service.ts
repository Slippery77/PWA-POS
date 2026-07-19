import { Injectable } from '@nestjs/common';

export type User = any;

@Injectable()
export class UsersService {
    private readonly users = [
        {
            username:'TestUser',
            password:'TestPassword',
        }
    ];
    async findOne(username: string): Promise<User | undefined>{
        return this.users.find(user => user.username === username);
    }
}
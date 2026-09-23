import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../auth/dto/login.dto';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AuthService {
    constructor(
        private usersRepository: UsersRepository,
        private jwtService: JwtService
    ) { }
    async login(dto: LoginDto) {
        const user = await this.usersRepository.findbyUsernameAndTenantCode(dto.username, dto.tenantCode);
        if (!user) {
            throw new UnauthorizedException('Invalid Credentials');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }
        const payLoad = { sub: user.id, username: user.username, tenantCode: user.tenantCode, role: user.role };
        const accessToken = await this.jwtService.signAsync(payLoad);

        return {
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                tenantCode: user.tenantCode
            }
        };
    }
}

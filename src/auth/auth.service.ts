import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/createUser.dto';
import { SignInDto } from './dto/signIn.dto';
import { JwtManager } from './jwt/jwt.manager';
import { SignInViewModel } from './viewModels/sign-in.viewModel';
import { UpdateRefreshTokenViewModel } from './viewModels/updateREfreshToken.viewModel';

@Injectable()
export class AuthService {
    constructor( @InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

    async createUser(createUserDto: CreateUserDto): Promise<string> {
        let entity = await this.userModel.findOne({ email: createUserDto.email });

        if (entity !== null) throw new BadRequestException('Пользователь уже существует');

        createUserDto.password = await this.passwordHash(createUserDto.password);
        let user = await this.userModel.create(createUserDto);
        return user.id;
    }

    async signIn(loginDto: SignInDto): Promise<any> {
        let user = await this.userModel.findOne({ email: loginDto.email });

        if (user === null) throw new NotFoundException('Пользователь не найден');
        if (!this.passwordValidate(loginDto.password, user.password)) throw new BadRequestException('Неверный пароль');
        
        let tokenResult = new JwtManager().generateAccessToken(user);

        let refresh_token = null;
        let refresh_token_expires = null;

        if (loginDto.rememberMe){
            let result = await new JwtManager().generateRefreshToken(user.id);
            refresh_token = result.refresh_token;
            refresh_token_expires = result.expires;
        }

        return {
            userId: user.id,
            access_token: tokenResult.access_token,
            expires: tokenResult.expires,
            refresh_token: refresh_token,
            refresh_token_expires: refresh_token_expires
        } as SignInViewModel;
    }    

    async updateRefreshToken(refreshToken: string){
        let tokenInfo = null;

        try {
            tokenInfo = new JwtManager().parseToken(refreshToken);
        }
        catch(e) { throw new BadRequestException(e); }
        
        let user = await this.userModel.findById(tokenInfo.userId);
        if (user === null) throw new NotFoundException('Пользователь не найден');

        let tokenResult = new JwtManager().generateAccessToken(user);
        let refreshTokenResult = await new JwtManager().generateRefreshToken(user.id);
        
        return {
            access_token: tokenResult.access_token,
            expires: tokenResult.expires,
            refresh_token: refreshTokenResult.refresh_token,
            refresh_token_expires: refreshTokenResult.expires
        } as UpdateRefreshTokenViewModel;
    }    

    private async passwordValidate(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    private async passwordHash(password: string): Promise<string> {
        let salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    }
}

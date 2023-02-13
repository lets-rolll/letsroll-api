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
import { MailService } from 'src/modules/mail.service';
import { SignUpViewModel } from './viewModels/sign-up.viewModel';

const crypto = require('crypto');
const algorithm = 'aes-256-ctr';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        //private readonly mailService: MailService
    ) { }

    async createUser(createUserDto: CreateUserDto): Promise<SignUpViewModel> {
        let entity = await this.userModel.findOne({ email: createUserDto.email });

        if (entity !== null) throw new BadRequestException('Пользователь уже существует');

        createUserDto.password = await this.passwordHash(createUserDto.password);

        let user = await this.userModel.create(createUserDto);

        const crypt = this.generateEmailConfirmationCode(user.id, user.email);

        user.emailConfirmationCode = crypt.code;

        user.save();

        const confirmationLink = `${createUserDto.host}/confirmEmail?userId=${user.id}&token=${crypt.hash}`;

        //TODO: Эта херня не работает
        /*this.mailService.Send({
            to: createUserDto.email,
            from: process.env.SMTP_USERNAME,
            subject: 'Подтверждение почты',
            text: `Подтвердите свою почту: <a href="${confirmationLink}">`
        })*/

        return {
            userId: user.id,
            token: crypt.hash
        } as SignUpViewModel;
    }

    async signIn(loginDto: SignInDto): Promise<SignInViewModel> {
        let user = await this.userModel.findOne({ email: loginDto.email });
        if (user === null) throw new NotFoundException('Пользователь не найден');
        if (!user.emailConfirmed && !user.phoneComfirmed) throw new ForbiddenException('Почта не подтверждена');

        if (!this.passwordValidate(loginDto.password, user.password))
            throw new BadRequestException('Неверный пароль');
        
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

    async updateRefreshToken(refreshToken: string): Promise<UpdateRefreshTokenViewModel>{
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

    async emailConfirm(userId: string, token: string) {
        let user = await this.userModel.findById(userId);
        if (user === null) throw new NotFoundException('Пользователь не найден');
        if (user.emailConfirmed) throw new BadRequestException('Почта уже подтверждена');

        const isValid: boolean = this.validateEmailConfirmationCode(token, user.emailConfirmationCode, userId, user.email);

        if (isValid) {
            user.emailConfirmationCode = null;
            user.emailConfirmed = true;

            user.save()
            return;
        } else {
            throw new BadRequestException('Не удалось подтвердить почту, попробуйте ещё раз');
        }
    }

    private async passwordValidate(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    private async passwordHash(password: string): Promise<string> {
        let salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    }

    private generateEmailConfirmationCode(userId: string, email: string) {
        const сode: number = Math.floor(100000 + Math.random() * 900000);

        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv(algorithm, process.env.CRYPTO_SECRET, iv);

        const encrypted = Buffer.concat([cipher.update(JSON.stringify({userId: userId, email: email, code: сode})), cipher.final()]);

        return {
            hash: encrypted.toString('hex').concat('==', iv.toString('hex')),
            code: сode
        };
    }

    private validateEmailConfirmationCode(token: string, code: number, userId: string, email: string): boolean {
        const hash = token.split('==');

        const decipher = crypto.createDecipheriv(algorithm, process.env.CRYPTO_SECRET, Buffer.from(hash[1], 'hex'));

        const decrpyted: any = JSON.parse(Buffer.concat([decipher.update(Buffer.from(hash[0], 'hex')), decipher.final()]).toString());
        console.log(decrpyted);
        

        if (code === decrpyted.code && email === decrpyted.email && userId === decrpyted.userId) {
            return true;
        } else {
            return false;
        }
    }
}

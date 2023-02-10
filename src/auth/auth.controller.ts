import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { SignInDto } from './dto/signIn.dto';
import { SignInViewModel } from './viewModels/sign-in.viewModel';
import { UpdateRefreshTokenViewModel } from './viewModels/updateREfreshToken.viewModel';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    //TODO: Рассылка сообщений
    @HttpCode(HttpStatus.OK)
    @Post('/sign-up')
    async signUp(@Body() createUserDto: CreateUserDto): Promise<any> {
        let result: string = await this.authService.createUser(createUserDto).catch((e) => {
            throw e;
        });

        return { userId: result };
    }

    @HttpCode(HttpStatus.OK)
    @Post('/sign-in')
    async signIn(@Body() signInDto: SignInDto): Promise<any> {
        let result: SignInViewModel = await this.authService.signIn(signInDto).catch((e) => {
            throw e;
        });
        
        return result;
    }

    @HttpCode(HttpStatus.OK)
    @Get('update-refresh-token')
    async updateRefreshToken(@Query('token') refresh_token: string): Promise<any>{
        let result: UpdateRefreshTokenViewModel = await this.authService.updateRefreshToken(refresh_token).catch((e) => {
            throw e;
        });
        
        return result;
    }
}
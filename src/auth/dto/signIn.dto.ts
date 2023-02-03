import { IsBoolean, IsEmail, IsNotEmpty } from "class-validator";

export class SignInDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsBoolean()
    rememberMe: boolean;
}
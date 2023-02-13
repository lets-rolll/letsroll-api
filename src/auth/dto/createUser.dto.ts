import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDto{
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    firstName: string;
    
    @IsNotEmpty()
    lastName: string;
    
    @IsNotEmpty()
    middleName: string;

    @IsNotEmpty()
    host: string;
}
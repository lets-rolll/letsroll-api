import { IsNotEmpty } from "class-validator";

export class UpdateUsernameDto {
    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName: string;
    
    @IsNotEmpty()
    middleName: string;
}
import { IsNotEmpty, Length } from "class-validator";

export class UpdateLocationDto {
    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    @Length(2, 2)
    destination: string;

    @IsNotEmpty()
    @Length(2, 2)
    departure: string;
}
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: 'john@gmail.com', description: 'The email of the user' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '12345678', description: 'The password of the user' })
    @IsString()
    password: string;
}
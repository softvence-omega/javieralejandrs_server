import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
   
    @ApiProperty({example: 'john@gmail.com', description: 'The email of the user'})
    @IsEmail()
    email: string;

    @ApiProperty({example: '12345678', description: 'The password of the user'})
    @IsString()
    @MinLength(8)
    password: string;
}

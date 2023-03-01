import { Controller, FileTypeValidator, HttpStatus, ParseFilePipe } from '@nestjs/common';
import { Body, Delete, Get, HttpCode, Param, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UpdateLocationDto } from './dto/updateLocation.dto';
import { UpdateUsernameDto } from './dto/updateUsername.dto';
import { UserService } from './user.service';
import { DetailsViewModel } from './viewModel/details.viewModel';
import { UserViewModel } from './viewModel/user.viewModel';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    
    @HttpCode(HttpStatus.OK)
    @Get('details/:id')
    async getDetails(@Param('id') userId: string, @Req() req: Request): Promise<DetailsViewModel> {
        let hostUrl = req.protocol.concat('://', req.headers['host']);

        let result = await this.userService.getDetails(userId, hostUrl).catch((err) => {
            throw err;
        });

        return result;
    }

    @HttpCode(HttpStatus.OK)
    @Get('users')
    async getUsers(@Req() req: Request): Promise<UserViewModel[]> {
        let hostUrl = req.protocol.concat('://', req.headers['host']);

        let users = await this.userService.getUsers(hostUrl).catch((err) => {
            throw err;
        });

        return users;
    }
    
    @HttpCode(HttpStatus.OK)
    @Put('details')
    async updateUsername(@Body() updateUsernameDto: UpdateUsernameDto) {
        await this.userService.updateUsername(updateUsernameDto).catch((err) => {
            throw err;
        });
    }

    @HttpCode(HttpStatus.OK)
    @Put('avatar/:id')
    @UseInterceptors(FileInterceptor('file'))
    async updateAvatar(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new FileTypeValidator({ fileType: /\/(jpg|jpeg|png)$/ }),
            ],
        }),) file: Express.Multer.File, @Param('id') userId: string, @Req() req: Request): Promise<any> {
        let hostUrl = req.protocol.concat('://', req.headers['host']);

        let avatarUrl = await this.userService.updateAvatar(userId, file, hostUrl).catch((err) => {
            throw err;
        });

        return {
            avatarUrl: avatarUrl
        };
    }

    @HttpCode(HttpStatus.OK)
    @Delete('avatar/:id')
    async deleteAvatar(@Param('id') userId: string) {
        await this.userService.deleteAvatar(userId).catch((err) => {
            throw err;
        });
    }

    @HttpCode(HttpStatus.OK)
    @Put('update-location')
    async updateLocation(@Body() dto: UpdateLocationDto) {
        await this.userService.updateLocation(dto).catch((err) => {
            throw err;
        });
    }
}

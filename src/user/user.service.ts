import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { existsSync, mkdir, unlink, writeFile } from 'fs';
import { Model } from 'mongoose';
import { extname, join } from 'path';
import { UpdateUsernameDto } from './dto/updateUsername.dto';
import { User, UserDocument } from './schemas/user.schema';
import { DetailsViewModel } from './viewModel/details.viewModel';
import { v4 as uuid } from 'uuid';
import { UserViewModel } from './viewModel/user.viewModel';
import { UpdateLocationDto } from './dto/updateLocation.dto';

const _fileRootPath = './storage/user/avatar/';
const _filePath: string = '/user/avatar/';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    private logger: Logger = new Logger('UserService');

    private async getUserById(userId: string): Promise<UserDocument> {
        let user = await this.userModel.findById(userId).catch(e => {
            throw new BadRequestException("Неверный id");
        });
        if (!user) throw new NotFoundException('Пользователь не найден');

        return user;
    }

    private avatarUrlMap(url: string, host: string): string {
        return url === undefined ? null : host?.concat('/user/avatar/', url);
    }

    async getUsers(host: string): Promise<UserViewModel[]> {
        let users = await this.userModel.find();
        if (users.length === 0) throw new NotFoundException('Пользователи не найдены');

        let usersVM: UserViewModel[] = [];        

        users.forEach((user) => {
            usersVM.push({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                middleName: user.middleName,
                avatarUrl: this.avatarUrlMap(user.avatarUrl, host)
            })
        });

        return usersVM;
    }

    async getDetails(userId: string, host?: string): Promise<DetailsViewModel> {
        let user = await this.getUserById(userId);

        let detailsViewModel: DetailsViewModel = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            avatarUrl: this.avatarUrlMap(user.avatarUrl, host),
            email: user.email,
            phoneNumber: user.phoneNumber,
            destination: user.destination,
            departure: user.departure
        };

        return detailsViewModel;
    }

    async updateUsername(updateUsernameDto: UpdateUsernameDto) {
        let user = await this.getUserById(updateUsernameDto.userId);

        user.firstName = updateUsernameDto.firstName;
        user.lastName = updateUsernameDto.lastName;
        user.middleName = updateUsernameDto.middleName;
        user.save();
    }

    async updateLocation(dto: UpdateLocationDto) {
        let user = await this.getUserById(dto.userId);
        
        user.destination = dto.destination;
        user.departure = dto.departure;
        user.save();
    }

    async updateAvatar(userId: string, file: Express.Multer.File, host: string): Promise<string> {
        let user = await this.getUserById(userId);

        let _fileName: string = `${uuid()}${extname(file.originalname)}`
        
        if (!existsSync(_fileRootPath)){
            mkdir(_fileRootPath, {recursive: true}, (err) => { this.logger.error(err)});
        }
        this.logger.log('exist');
        writeFile(join(_fileRootPath, _fileName), file.buffer, (err) => {
            if (err) {
                this.logger.error(err);
            }
        });
        this.logger.log('write');

        unlink(_fileRootPath + user.avatarUrl, (err) => {
            if (err) {
                this.logger.error(err);
            }
        });
        this.logger.log('unlink');

        user.avatarUrl = _fileName;
        user.save();

        return host.concat(_filePath, _fileName);
    }

    async deleteAvatar(userId: string) {
        let user = await this.getUserById(userId);

        unlink(_fileRootPath + user.avatarUrl, (err) => {
            if (err){
                this.logger.error(err);
            }
        });

        user.avatarUrl = undefined;
        user.save();
    }
}

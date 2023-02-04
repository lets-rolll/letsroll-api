import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema()
export class User{
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;
    
    @Prop({ required: true })
    middleName: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop()
    avatarUrl?: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    phoneNumber?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
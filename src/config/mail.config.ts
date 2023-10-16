import {registerAs} from '@nestjs/config';
import {IsEmail, IsString} from 'class-validator';
import validateConfig from '../utils/validate-config';
import {MailConfig} from './config.type';

class EnvironmentVariablesValidator {
    @IsString()
    MAIL_USER: string;

    @IsString()
    MAIL_PASSWORD: string;

    @IsEmail()
    MAIL_DEFAULT_EMAIL: string;

    @IsString()
    MAIL_DEFAULT_NAME: string;

    @IsString()
    MAIL_SERVICE: string;
}

export default registerAs<MailConfig>('mail', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        user: process.env.MAIL_USER,
        password: process.env.MAIL_PASSWORD,
        defaultEmail: process.env.MAIL_DEFAULT_EMAIL,
        defaultName: process.env.MAIL_DEFAULT_NAME,
        service: process.env.MAIL_SERVICE
    };
});

import {registerAs} from '@nestjs/config';
import {IsEmail, IsEnum, IsInt, IsIP, IsOptional, IsString, Max, Min} from 'class-validator';
import {Transform} from 'class-transformer';
import validateConfig from '../utils/validate-config';
import {AppConfig} from './config.type';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test'
}

class EnvironmentVariablesScheme {
    @IsEnum(Environment)
    @IsOptional()
    NODE_ENV: Environment;

    @IsInt()
    @Min(0)
    @Max(65535)
    @IsOptional()
    @Transform(({value}) => Number.parseInt(value))
    APP_PORT: number;

    @IsString()
    @IsOptional()
    APP_NAME: string;

    @IsString()
    @IsOptional()
    API_PREFIX: string;

    @IsString()
    WEBHOOK_SECRET: string;

    @Transform(({value}) => value.split(','))
    @IsEmail({}, {each: true})
    EMAIL_DESTINATIONS: string[];

    @Transform(({value}) => value.split(','))
    @IsIP(4, {each: true})
    WHITELIST_IPS: string[];

    @IsString()
    TELEGRAM_TOKEN: string;

    @Transform(({value}) => value.split(','))
    @IsString({each: true})
    CHAT_IDS: string[];
}

export default registerAs<AppConfig>('app', () => {
    validateConfig(process.env, EnvironmentVariablesScheme);

    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        name: process.env.APP_NAME || 'app',
        workingDirectory: process.env.PWD || process.cwd(),
        port: process.env.APP_PORT
            ? parseInt(process.env.APP_PORT, 10)
            : process.env.PORT
            ? parseInt(process.env.PORT, 10)
            : 3000,
        apiPrefix: process.env.API_PREFIX || 'api',
        webhookSecret: process.env.WEBHOOK_SECRET,
        emailDestinations: process.env.EMAIL_DESTINATIONS.split(','),
        whiteListIps: process.env.WHITELIST_IPS.split(','),
        telegramToken: process.env.TELEGRAM_TOKEN,
        chatIds: process.env.CHAT_IDS.split(',')
    };
});

import * as process from 'process';
import {registerAs} from '@nestjs/config';
import {
    IsEmail,
    IsEnum,
    IsInt,
    IsIP,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    Min
} from 'class-validator';
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

    @IsNumber()
    CANDLES_CAPTURE: number;

    @IsOptional()
    @IsInt()
    MAIN_WIDTH: number;

    @IsOptional()
    @IsInt()
    MAIN_HEIGHT: number;

    @IsOptional()
    @IsInt()
    REAL_PAGE_LOAD_DELAY: number;

    @IsInt()
    COPY_URL_ATTEMPTS: number;

    @IsString()
    DB_PATH: string;

    @IsUrl()
    SHARED_CHART_URL_15M: string;

    @IsUrl()
    SHARED_CHART_URL_5M: string;

    @IsUrl()
    SHARED_CHART_URL_1H: string;

    @IsUrl()
    SHARED_CHART_URL_4H: string;

    @IsString()
    TV_USERNAME: string;

    @IsString()
    TV_PASSWORD: string;
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
        chatIds: process.env.CHAT_IDS.split(','),
        candlesCapture: Number.parseFloat(process.env.CANDLES_CAPTURE),
        kangarooMainWidth: Number.parseInt(process.env.MAIN_WIDTH || '1'),
        kangarooMainHeight: Number.parseInt(process.env.MAIN_HEIGHT || '1'),
        realPageLoadDelay: Number.parseInt(process.env.REAL_PAGE_LOAD_DELAY || '15000'),
        sharedChartUrl5m: process.env.SHARED_CHART_URL_5M,
        sharedChartUrl15m: process.env.SHARED_CHART_URL_15M,
        sharedChartUrl1h: process.env.SHARED_CHART_URL_1H,
        sharedChartUrl4h: process.env.SHARED_CHART_URL_4H,
        tvUsername: process.env.TV_USERNAME,
        tvPassword: process.env.TV_PASSWORD,
        dbPath: process.env.DB_PATH,
        copyUrlAttempts: Number.parseInt(process.env.COPY_URL_ATTEMPTS)
    };
});

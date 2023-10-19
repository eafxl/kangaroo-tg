import {IsEnum, IsString} from 'class-validator';

export enum KangarooEvents {
    KangarooLong = 'kangaroo.long',
    KangarooShort = 'kangaroo.short'
}

export class MainHookPayloadDto {
    @IsString()
    secret: string;

    @IsString()
    @IsEnum(KangarooEvents)
    event: string;

    @IsString()
    close: string;

    @IsString()
    timeframe: string;

    @IsString()
    ticker: string;

    @IsString()
    exchange: string;

    @IsString()
    open: string;

    @IsString()
    high: string;

    @IsString()
    low: string;

    @IsString()
    time: string;

    @IsString()
    volume: string;

    @IsString()
    timenow: string;
}

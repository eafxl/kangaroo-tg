import {IsArray, IsEnum, IsOptional, IsString} from 'class-validator';

export enum KangarooEvents {
    KangarooLong = 'kangaroo.long',
    KangarooShort = 'kangaroo.short',
    KangarooSwing = 'kangaroo.swing',
    KangarooLongTerm = 'kangaroo.longterm',
    KangarooIntraday = 'kangaroo.intraday',
    KangarooScalp = 'kangaroo.scalp'
}

export class MainHookPayloadDto {
    @IsString()
    secret: string;

    @IsString()
    @IsEnum(KangarooEvents)
    event: KangarooEvents;

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

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    chatIds?: string[];
}

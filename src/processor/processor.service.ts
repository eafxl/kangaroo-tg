import {Injectable, InternalServerErrorException, Logger} from '@nestjs/common';
import {minBy, sortBy} from 'lodash';
import {ConfigService} from '@nestjs/config';
import {QueueService} from '../queue';
import {candleToMarker, tickerToSymbol} from '../utils';
import {BinanceService} from '../binance';
import {TelegramService} from '../telegram';
import {KangarooEvents, MainHookPayloadDto} from '../admin/main-hook-payload.dto';
import {
    KANGAROO_MAIN_DEFAULT_HEIGHT,
    KANGAROO_MAIN_DEFAULT_WIDTH,
    TemplatingService
} from '../templating';
import {RenderService} from '../render';
import {DatabaseService} from '../db';
import {AllConfigType} from '../config';
import {SessionService} from '../session';
import {MailService} from '../mail';

@Injectable()
export class ProcessorService {
    private readonly width: number;
    private readonly height: number;
    private readonly realPageLoadDelay: number;
    private readonly sharedChartUrl1h: string;
    private readonly sharedChartUrl4h: string;
    private readonly sharedChartUrl15m: string;
    private readonly sharedChartUrl5m: string;
    private readonly logger = new Logger(ProcessorService.name);
    constructor(
        private readonly binanceService: BinanceService,
        private readonly telegramService: TelegramService,
        private readonly templatingService: TemplatingService,
        private readonly renderService: RenderService,
        private readonly queueService: QueueService,
        private readonly dbService: DatabaseService,
        private readonly sessionService: SessionService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService<AllConfigType>
    ) {
        this.width =
            this.configService.get('app.kangarooMainWidth', {
                infer: true
            }) || KANGAROO_MAIN_DEFAULT_WIDTH;

        this.height =
            this.configService.get('app.kangarooMainHeight', {
                infer: true
            }) || KANGAROO_MAIN_DEFAULT_HEIGHT;

        this.realPageLoadDelay =
            this.configService.get('app.realPageLoadDelay', {
                infer: true
            }) || KANGAROO_MAIN_DEFAULT_HEIGHT;

        this.sharedChartUrl5m = this.configService.get('app.sharedChartUrl5m', {
            infer: true
        });

        this.sharedChartUrl15m = this.configService.get('app.sharedChartUrl15m', {
            infer: true
        });

        this.sharedChartUrl1h = this.configService.get('app.sharedChartUrl1h', {
            infer: true
        });

        this.sharedChartUrl4h = this.configService.get('app.sharedChartUrl4h', {
            infer: true
        });
    }

    processEvent1_Old(params: MainHookPayloadDto): Promise<unknown> {
        return this.queueService.runTask(() => this.processEvent1_Old(params));
    }

    processEvent1(params: MainHookPayloadDto): Promise<unknown> {
        return this.queueService.runTask(() => this.event1(params));
    }

    private async event1_Old(body: MainHookPayloadDto) {
        const {ticker, timeframe, event} = body;
        const symbol = tickerToSymbol(ticker);

        const rawCandlesData = await this.binanceService.getTickerCandles({
            symbol,
            interval: timeframe
        });
        const data = this.binanceService.historicalToTemplatingFormat(rawCandlesData);
        if (!data.length) {
            throw new InternalServerErrorException(`error chartData got 0 length`);
        }

        const now = Math.round(new Date(body.time).getTime());
        const markerCandle = data.reduce((previousValue, currentValue) => {
            return Math.abs(currentValue.time - now) < Math.abs(previousValue.time - now)
                ? currentValue
                : previousValue;
        });

        await this.dbService.addEvent1Record({
            ...markerCandle,
            ticker,
            timeframe,
            event: event as KangarooEvents
        });

        await this.dbService.deleteOldEvent1Records({
            ticker,
            timeframe,
            event
        });

        const {time: from} = minBy(data, (o) => o.time);

        const shortCandles = await this.dbService.getRecords({
            from,
            to: markerCandle.time,
            event: KangarooEvents.KangarooShort,
            ticker,
            timeframe
        });

        const longCandles = await this.dbService.getRecords({
            from,
            to: markerCandle.time,
            event: KangarooEvents.KangarooLong,
            ticker,
            timeframe
        });

        const deduplicatedCandles = new Map(
            [...shortCandles, ...longCandles].map((el) => [el.time, el])
        );

        const markers = sortBy(Array.from(deduplicatedCandles.values()), (o) => o.time).map(
            candleToMarker
        );
        const lightweightDateAdjustedData = data.map((el) => ({
            ...el,
            time: Math.round(el.time / 1000)
        }));
        const html = await this.templatingService.templateKangaroo({
            markers,
            data: lightweightDateAdjustedData
        });
        await this.renderService.renderToBuffer(html, this.width, this.height);
        // await this.telegramService.mainHook(body, screenshot);
    }

    private async event1(body: MainHookPayloadDto) {
        const {ticker, exchange, timeframe} = body;

        const mapping = {
            '5m': this.sharedChartUrl5m,
            '15m': this.sharedChartUrl15m,
            '1h': this.sharedChartUrl1h,
            '4h': this.sharedChartUrl4h
        };

        const chartUrl = mapping[timeframe];
        let screenshot = '';
        if (!chartUrl) {
            this.logger.warn(`no chart available for ${timeframe}`);
        } else {
            try {
                const sessionId = await this.sessionService.resolveSessionId();
                const url = new URL(chartUrl);
                url.searchParams.append('symbol', `${exchange}:${ticker}`);

                screenshot = await this.renderService.renderUrlToBuffer({
                    url: url.toString(),
                    sessionId,
                    width: this.width,
                    height: this.height,
                    delay: this.realPageLoadDelay
                });
            } catch (e) {
                const message = `error while fetching screenshot ${e.message}`;
                this.logger.debug(message);
                await this.mailService.logAndNotifyAll(message, 'unknownExceptionAlert');
            }
        }

        await this.telegramService.mainHook(body, screenshot);
    }
}

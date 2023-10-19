import {Injectable, Logger} from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import {ConfigService} from '@nestjs/config';
import {MailService} from '../mail';
import {KangarooEvents, MainHookPayloadDto} from './main-hook-payload.dto';

const mappings = {
    [KangarooEvents.KangarooLong]: '📈',
    [KangarooEvents.KangarooShort]: '📉',
    logo: '🦘'
};

@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);
    private readonly telegramClient: TelegramBot;
    private readonly chatIds: string[];

    constructor(
        private readonly configService: ConfigService,
        private readonly mailService: MailService
    ) {
        const token = this.configService.get('app.telegramToken', {
            infer: true
        });
        this.telegramClient = new TelegramBot(token, {polling: true});
        this.chatIds = this.configService.get('app.chatIds', {infer: true});
    }

    async mainHook(event: MainHookPayloadDto) {
        const message = this.formatMainHookMessage(event);

        const errors = [];
        this.logger.debug(`event sent to channels ${message}`);
        for (const id of this.chatIds) {
            try {
                await this.telegramClient.sendMessage(id, message);
            } catch (e) {
                errors.push(`error while sending message to telegram: ${e.message} chatID: ${id}`);
            }
        }

        if (errors.length) {
            await this.mailService.logAndNotifyAll(errors.join('\n'), 'tgSendAlert');
        }
    }

    private formatMainHookMessage(event: MainHookPayloadDto) {
        const isLong = event.event === KangarooEvents.KangarooLong;
        return `${mappings.logo} Kangaroo ${isLong ? 'Long' : 'Short'} ${mappings[event.event]}
${event.ticker} ${event.timeframe}
Price: ${isLong ? event.low : event.high}
Time: ${event.time}
Exchange: ${event.exchange}`;
    }
}

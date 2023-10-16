import {Injectable, Logger} from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import {ConfigService} from '@nestjs/config';
import {MailService} from '../mail';
import {KangarooEvents, MainHookPayloadDto} from '../admin/main-hook-payload.dto';
import {EMOJI_MAPPING} from './types';
import {TELEGRAM_BOT_DEFAULT_OPTIONS} from './constants';

@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);
    private readonly chatIds: string[];
    private readonly token: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly mailService: MailService
    ) {
        this.token = this.configService.get('app.telegramToken', {infer: true});
        this.chatIds = this.configService.get('app.chatIds', {infer: true});
    }

    async mainHook(event: MainHookPayloadDto, screenshot: string) {
        const message = this.formatMainHookMessage(event, screenshot);
        const destinations = event.chatIds || this.chatIds;
        let telegramClient = new TelegramBot(this.token, TELEGRAM_BOT_DEFAULT_OPTIONS);

        const errors = [];
        this.logger.debug(`event sent to channels ${message}`);
        for (const chatId of destinations) {
            try {
                await telegramClient.sendMessage(chatId, message);
            } catch (e) {
                errors.push(`error while sending message to telegram: ${e.message} chatID: ${chatId}`);
                await telegramClient.close();
                telegramClient = new TelegramBot(this.token, TELEGRAM_BOT_DEFAULT_OPTIONS);
            }
        }

        await telegramClient.close();

        if (errors.length) {
            await this.mailService.logAndNotifyAll(errors.join('\n'), 'tgSendAlert');
        }
    }

    private formatMainHookMessage(event: MainHookPayloadDto, screenshot: string) {
        let eventMessage = null;
        switch (event.event) {
            case KangarooEvents.KangarooShort: {
                eventMessage = `${EMOJI_MAPPING[event.event]}Potential Reversal Area`;
                break;
            }
            case KangarooEvents.KangarooLong: {
                eventMessage = `${EMOJI_MAPPING[event.event]} Potential Reversal Area`;
                break;
            }
            case KangarooEvents.KangarooSwing: {
                eventMessage = `Swing Liquidity ${EMOJI_MAPPING[event.event]}`;
                break;
            }
            case KangarooEvents.KangarooIntraday: {
                eventMessage = `Intraday Liquidity ${EMOJI_MAPPING[event.event]}`;
                break;
            }
            case KangarooEvents.KangarooScalp: {
                eventMessage = `Scalp Liquidity ${EMOJI_MAPPING[event.event]}`;
                break;
            }
            case KangarooEvents.KangarooLongTerm: {
                eventMessage = `Long Term Liquidity ${EMOJI_MAPPING[event.event]}`;
                break;
            }
            default: {
                throw new Error(`unknown event ${event.event}`);
            }
        }
        return `${EMOJI_MAPPING.logo} Kangaroo
${eventMessage}
${event.ticker} ${event.timeframe}
Price: ${event.close}
Time: ${new Date(event.timenow).toTimeString()}
Exchange: ${event.exchange}${screenshot ? '\n' + screenshot : ''}`;
    }

    private formatMainHookMessage2(event: MainHookPayloadDto) {
        let eventMessage = null;
        switch (event.event) {
            case KangarooEvents.KangarooShort: {
                eventMessage = `Short ${EMOJI_MAPPING[event.event]}`;
                break;
            }
            case KangarooEvents.KangarooLong: {
                eventMessage = `Long ${EMOJI_MAPPING[event.event]}`;
                break;
            }
            case KangarooEvents.KangarooSwing: {
                eventMessage = `Swing Liquidity ${EMOJI_MAPPING[event.event]}`;
                break;
            }
            case KangarooEvents.KangarooIntraday: {
                eventMessage = `Intraday Liquidity ${EMOJI_MAPPING[event.event]}`;
                break;
            }
            case KangarooEvents.KangarooScalp: {
                eventMessage = `Scalp Liquidity ${EMOJI_MAPPING[event.event]}`;
                break;
            }
            case KangarooEvents.KangarooLongTerm: {
                eventMessage = `Long Term Liquidity ${EMOJI_MAPPING[event.event]}`;
                break;
            }
            default: {
                throw new Error(`unknown event ${event.event}`);
            }
        }
        return `${EMOJI_MAPPING.logo} Kangaroo2 ${eventMessage}
${event.ticker} ${event.timeframe}
Price: ${event.close}
Time: ${event.timenow}
Exchange: ${event.exchange}`;
    }
}

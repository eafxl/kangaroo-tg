import {Body, Controller, Post, Headers} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {MailService} from '../mail';
import {PREFIX_SUBNET} from '../utils';
import {TelegramService} from './telegram.service';
import {MainHookPayloadDto} from './main-hook-payload.dto';

@Controller('admin')
export class AdminController {
    private readonly whitelist: string[];
    private readonly secret: string;
    private readonly env: string;

    constructor(
        private readonly telegramService: TelegramService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService
    ) {
        this.whitelist = this.configService.get('app.whiteListIps', {
            infer: true
        });
        this.secret = this.configService.get('app.webhookSecret');
        this.env = this.configService.get('app.nodeEnv');
    }

    @Post('/kangaroo/main')
    async hook(@Headers() headers: unknown, @Body() body: MainHookPayloadDto) {
        const forwardedIps = headers['x-forwarded-for']?.split(', ');
        const ip = forwardedIps?.length ? forwardedIps[0] : 'ip not extracted';

        if (this.env === 'production') {
            if (!this.whitelist.includes(ip)) {
                const message = `forbidden origin performs hook request: ${ip} allowed ${this.whitelist.join(
                    ', '
                )}`;
                await this.mailService.logAndNotifyAll(message, 'unexpectedApiAccessAlert');
                return;
            }

            if (body.secret !== this.secret) {
                const message = `wrong secret provided body: ${JSON.stringify(body)} ip: ${ip}`;
                await this.mailService.logAndNotifyAll(message, 'authorizationAlert');
                return;
            }
        }

        return this.telegramService.mainHook(body);
    }
}

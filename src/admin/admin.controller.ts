import {createHash} from 'node:crypto';
import {Body, Controller, Headers, Logger, Post} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {omit} from 'lodash';
import {MailService} from '../mail';
import {ProcessorService} from '../processor';
import {KangarooEvents, MainHookPayloadDto} from './main-hook-payload.dto';
import {IP_NOT_EXTRACTED_ERROR} from './constants';

@Controller('admin')
export class AdminController {
    private readonly whitelist: string[];
    private readonly secret: string;
    private readonly env: string;
    private readonly logger = new Logger(AdminController.name);

    constructor(
        private readonly mailService: MailService,
        private readonly processingService: ProcessorService,
        private readonly configService: ConfigService
    ) {
        this.whitelist = this.configService.get('app.whiteListIps', {
            infer: true
        });
        this.secret = this.configService.get('app.webhookSecret');
        this.env = this.configService.get('app.nodeEnv');
    }

    @Post('/kangaroo/main')
    async hook(@Headers() headers: Headers, @Body() body: MainHookPayloadDto) {
        this.logger.log(`processing ${JSON.stringify(omit(body, 'secret'), null, 4)}`);

        const allowed = await this.checkAuth(
            this.extractIp(headers) || IP_NOT_EXTRACTED_ERROR,
            body.secret
        );
        if (!allowed) return;

        const event = body.event as KangarooEvents;
        if ([KangarooEvents.KangarooLong, KangarooEvents.KangarooShort].includes(event)) {
            this.processingService.processEvent1(body);
        }
    }

    private async checkAuth(ip: string, secret: string): Promise<boolean> {
        if (this.env === 'production') {
            if (!this.whitelist.includes(ip)) {
                const message = `forbidden origin performs hook request: ${ip} allowed ${this.whitelist.join(
                    ', '
                )}`;
                await this.mailService.logAndNotifyAll(message, 'unexpectedApiAccessAlert');
                return false;
            }

            if (createHash('sha256').update(secret).digest('hex') !== this.secret) {
                const message = `wrong secret provided body: ${secret} ip: ${ip}`;
                await this.mailService.logAndNotifyAll(message, 'authorizationAlert');
                return false;
            }
        }

        return true;
    }

    private extractIp(headers: Headers): string {
        return headers['x-forwarded-for']?.split(', ')?.[0];
    }
}

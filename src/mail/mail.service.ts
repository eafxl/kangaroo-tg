import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {AllConfigType} from '../config';
import {MailerService} from '../mailer';
import {alertTemplate} from '../mail-templates';

@Injectable()
export class MailService {
    private readonly emailDestinations: string[];
    private readonly logger = new Logger(MailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService<AllConfigType>
    ) {
        this.emailDestinations = this.configService.get('app.emailDestinations', {
            infer: true
        });
    }

    async logAndNotifyAll(message: string, alertCb: string) {
        this.logger.warn(message);
        return await Promise.all(
            this.emailDestinations.map((to) =>
                this[alertCb]({
                    to,
                    message
                })
            )
        );
    }

    async unexpectedApiAccessAlert({to, message}: {to: string; message: string}): Promise<void> {
        await this.mailerService.sendMail({
            to,
            subject: 'Unexpected ip accessed api',
            text: ``,
            context: {
                title: `Security Alert`,
                message
            },
            template: alertTemplate
        });
    }

    async authorizationAlert({to, message}: {to: string; message: string}): Promise<void> {
        await this.mailerService.sendMail({
            to,
            subject: 'Wrong authorization provided to hook',
            text: ``,
            context: {
                title: `Security Alert`,
                message
            },
            template: alertTemplate
        });
    }

    async unknownExceptionAlert({to, message}: {to: string; message: string}): Promise<void> {
        await this.mailerService.sendMail({
            to,
            subject: 'Exception happened',
            text: ``,
            context: {
                title: `Exception happened`,
                message
            },
            template: alertTemplate
        });
    }

    async tgSendAlert({to, message}: {to: string; message: string}): Promise<void> {
        await this.mailerService.sendMail({
            to,
            subject: 'Something went wrong while sending messages to telegram',
            text: ``,
            context: {
                title: `Malfunction Alert`,
                message
            },
            template: alertTemplate
        });
    }
}

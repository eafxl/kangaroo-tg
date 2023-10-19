import * as path from 'path';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {AllConfigType} from '../config';
import {MailerService} from '../mailer';

@Injectable()
export class MailService {
    private readonly wdir: string;
    private readonly emailDestinations: string[];
    private readonly logger = new Logger(MailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService<AllConfigType>
    ) {
        this.wdir = this.configService.getOrThrow('app.workingDirectory', {
            infer: true
        });
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
            templatePath: this.getPath('alert.hbs')
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
            templatePath: this.getPath('alert.hbs')
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
            templatePath: this.getPath('alert.hbs')
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
            templatePath: this.getPath('alert.hbs')
        });
    }

    private getPath(template: string): string {
        return path.join(this.wdir, 'mail-templates', template);
    }
}

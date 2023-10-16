import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import {AllConfigType} from '../config';

@Injectable()
export class MailerService {
    private readonly transporter: nodemailer.Transporter;
    constructor(private readonly configService: ConfigService<AllConfigType>) {
        this.transporter = nodemailer.createTransport({
            service: configService.get('mail.service', {infer: true}),
            auth: {
                user: configService.get('mail.user', {infer: true}),
                pass: configService.get('mail.password', {infer: true})
            }
        });
    }

    async sendMail({
        template,
        context,
        ...mailOptions
    }: nodemailer.SendMailOptions & {
        template: string;
        context: Record<string, unknown>;
    }): Promise<void> {
        const html = Handlebars.compile(template, {
            strict: true
        })(context);

        await this.transporter.sendMail({
            ...mailOptions,
            from: mailOptions.from
                ? mailOptions.from
                : `"${this.configService.get('mail.defaultName', {
                      infer: true
                  })}" <${this.configService.get('mail.defaultEmail', {
                      infer: true
                  })}>`,
            html: mailOptions.html ? mailOptions.html : html
        });
    }
}

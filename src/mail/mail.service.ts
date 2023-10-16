import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {AllConfigType} from 'src/config/config.type';
import {MailerService} from 'src/mailer/mailer.service';
import {MailData} from './interfaces/mail-data.interface';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService<AllConfigType>
    ) {}

    async userSignUp(_mailData: MailData<{hash: string}>): Promise<void> {
        // await this.mailerService.sendMail({
        //     to: mailData.to,
        //     subject: emailConfirmTitle,
        //     text: `${this.configService.get('app.frontendDomain', {
        //         infer: true
        //     })}/confirm-email?hash=${mailData.data.hash} ${emailConfirmTitle}`,
        //     templatePath: path.join(
        //         this.configService.getOrThrow('app.workingDirectory', {
        //             infer: true
        //         }),
        //         'src',
        //         'mail',
        //         'mail-templates',
        //         'activation.hbs'
        //     ),
        //     context: {
        //         title: emailConfirmTitle,
        //         url: `${this.configService.get('app.frontendDomain', {
        //             infer: true
        //         })}/confirm-email?hash=${mailData.data.hash}`,
        //         actionTitle: emailConfirmTitle,
        //         app_name: this.configService.get('app.name', {infer: true}),
        //         text1,
        //         text2,
        //         text3
        //     }
        // });
    }

    async forgotPassword(_mailData: MailData<{hash: string}>): Promise<void> {
        // await this.mailerService.sendMail({
        //     to: mailData.to,
        //     subject: resetPasswordTitle,
        //     text: `${this.configService.get('app.frontendDomain', {
        //         infer: true
        //     })}/password-change?hash=${mailData.data.hash} ${resetPasswordTitle}`,
        //     templatePath: path.join(
        //         this.configService.getOrThrow('app.workingDirectory', {
        //             infer: true
        //         }),
        //         'src',
        //         'mail',
        //         'mail-templates',
        //         'reset-password.hbs'
        //     ),
        //     context: {
        //         title: resetPasswordTitle,
        //         url: `${this.configService.get('app.frontendDomain', {
        //             infer: true
        //         })}/password-change?hash=${mailData.data.hash}`,
        //         actionTitle: resetPasswordTitle,
        //         app_name: this.configService.get('app.name', {
        //             infer: true
        //         }),
        //         text1,
        //         text2,
        //         text3,
        //         text4
        //     }
        // });
    }
}

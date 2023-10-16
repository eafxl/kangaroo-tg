import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import appConfig from './config/app.config';
import mailConfig from './config/mail.config';
import {MailModule} from './mail/mail.module';
import {MailerModule} from './mailer/mailer.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, mailConfig],
            envFilePath: ['.env']
        }),
        MailModule,
        MailerModule
    ]
})
export class AppModule {}

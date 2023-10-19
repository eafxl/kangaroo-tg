import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import appConfig from './config/app.config';
import mailConfig from './config/mail.config';
import {MailModule} from './mail';
import {MailerModule} from './mailer';
import {AdminModule} from './admin';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, mailConfig],
            envFilePath: ['.env']
        }),
        MailModule,
        MailerModule,
        AdminModule
    ]
})
export class AppModule {}

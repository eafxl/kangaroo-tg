import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import appConfig from './config/app.config';
import mailConfig from './config/mail.config';
import {MailModule} from './mail';
import {MailerModule} from './mailer';
import {AdminModule} from './admin';
import {BinanceModule} from './binance';
import {TemplatingModule} from './templating';
import {DatabaseModule} from './db';
import {TelegramModule} from './telegram';
import {RenderModule} from './render';
import {ProcessorModule} from './processor';
import {SessionModule} from './session/session.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, mailConfig],
            envFilePath: ['.env']
        }),
        MailModule,
        MailerModule,
        AdminModule,
        BinanceModule,
        TemplatingModule,
        DatabaseModule,
        TelegramModule,
        RenderModule,
        ProcessorModule,
        SessionModule
    ]
})
export class AppModule {}

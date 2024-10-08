import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {MailerModule} from '../mailer';
import {MailService} from './mail.service';

@Module({
    imports: [ConfigModule, MailerModule],
    providers: [MailService],
    exports: [MailService]
})
export class MailModule {}

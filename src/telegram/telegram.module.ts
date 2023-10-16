import {Module} from '@nestjs/common';
import {MailModule} from '../mail';
import {TelegramService} from './telegram.service';

@Module({
    imports: [MailModule],
    providers: [TelegramService],
    exports: [TelegramService]
})
export class TelegramModule {}

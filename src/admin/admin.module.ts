import {Module} from '@nestjs/common';
import {MailModule} from '../mail';
import {AdminController} from './admin.controller';
import {TelegramService} from './telegram.service';

@Module({
    imports: [MailModule],
    controllers: [AdminController],
    providers: [TelegramService]
})
export class AdminModule {}

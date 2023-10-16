import {Module} from '@nestjs/common';
import {MailModule} from '../mail';
import {BinanceModule} from '../binance';
import {TemplatingModule} from '../templating';
import {TelegramModule} from '../telegram';
import {RenderModule} from '../render';
import {QueueService} from '../queue';
import {DatabaseModule} from '../db';
import {SessionModule} from '../session';
import {ProcessorService} from './processor.service';

@Module({
    imports: [
        MailModule,
        BinanceModule,
        TemplatingModule,
        TelegramModule,
        RenderModule,
        DatabaseModule,
        SessionModule
    ],
    providers: [ProcessorService, QueueService],
    exports: [ProcessorService]
})
export class ProcessorModule {}

import {Module} from '@nestjs/common';
import {ProcessorModule} from '../processor';
import {MailModule} from '../mail';
import {AdminController} from './admin.controller';

@Module({
    imports: [ProcessorModule, MailModule],
    controllers: [AdminController]
})
export class AdminModule {}

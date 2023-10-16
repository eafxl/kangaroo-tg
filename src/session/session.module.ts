import {Module} from '@nestjs/common';
import {MailModule} from '../mail';
import {SessionService} from './session.service';

@Module({
    imports: [MailModule],
    providers: [SessionService],
    exports: [SessionService]
})
export class SessionModule {}

import {Module} from '@nestjs/common';
import {TemplatingService} from './templating.service';

@Module({
    providers: [TemplatingService],
    exports: [TemplatingService]
})
export class TemplatingModule {}

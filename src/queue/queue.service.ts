import {Injectable} from '@nestjs/common';

@Injectable()
export class QueueService {
    private concurrency = 1;
    private running = 0;
    private queue = [];

    next() {
        while (this.running < this.concurrency && this.queue.length) {
            const task = this.queue.shift();
            task().finally(() => {
                this.running--;
                this.next();
            });
            this.running++;
        }
    }

    runTask(task): Promise<unknown> {
        return new Promise((resolve, reject) => {
            this.queue.push(() => task().then(resolve, reject));
            process.nextTick(this.next.bind(this));
        });
    }
}

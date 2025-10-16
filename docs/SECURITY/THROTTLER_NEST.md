pnpm add -F api @nestjs/throttler
import { ThrottlerModule } from '@nestjs/throttler';
ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }])
main.ts: app.useGlobalGuards(new ThrottlerGuard());


import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

// Fields that are never selected unless a query explicitly asks for them
const globalOmit = {
    user: { password: true },
} as const;


@Injectable()
export class PrismaService
    extends PrismaClient<{ adapter: PrismaPg; omit: typeof globalOmit }>
    implements OnModuleInit, OnModuleDestroy {
    constructor(configService: ConfigService) {

        const adapter = new PrismaPg({
            connectionString: configService.getOrThrow<string>('DATABASE_URL'),
        });

        super({
            adapter, omit: globalOmit
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}

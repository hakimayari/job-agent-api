import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database/database.module';
import { CompaniesModule } from './companies/companies.module';
import { JobOffersModule } from './job-offers/job-offers.module';

@Module({
  imports: [LoggerModule.forRoot(),ConfigModule.forRoot({ isGlobal: true }),DatabaseModule, CompaniesModule, JobOffersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

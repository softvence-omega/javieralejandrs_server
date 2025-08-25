import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { ENVEnum } from './common/enum/env.enum';
import { AllExceptionsFilter } from './common/filter/http-exception.filter';
import session from 'express-session';
import passport from 'passport';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('ts');

  app.use(
    session({
      secret: configService.getOrThrow<string>(ENVEnum.JWT_SECRET),
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60000 },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // ✅ Swagger config with Bearer Auth
  const config = new DocumentBuilder()
    .setTitle('Link Party')
    .setDescription('Link Party API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'bearer',
      },
      'access-token',
    )
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);

  documentFactory.paths = Object.fromEntries(
    Object.entries(documentFactory.paths).map(([path, ops]) => [
      path,
      Object.fromEntries(
        Object.entries(ops).map(([method, op]) => [
          method,
          {
            ...op,
            security: [{ 'access-token': [] }],
          },
        ]),
      ),
    ]),
  );

  // const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('ts/docs', app, documentFactory);

  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
  app.use('/booking/webhook', bodyParser.raw({ type: 'application/json' }));
  app.use(cookieParser.default());

  const port = parseInt(configService.get<string>(ENVEnum.PORT) ?? '5003', 10);
  await app.listen(port);
}

void bootstrap();

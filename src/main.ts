import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassValidatorExceptionFactory } from './core/exception/class-validator/exception.factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // for class Transform & validation
  const exceptionFactory = new ClassValidatorExceptionFactory();
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe({ transform: true, exceptionFactory: exceptionFactory.throw() }));

  //for graceful ShutDown
  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();

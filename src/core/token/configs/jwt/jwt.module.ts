import { DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

export const getJwtModule = (): DynamicModule => {
  return JwtModule.register({
    secret: process.env.JWT_SECRET_KEY,
    signOptions: {
      issuer: process.env.JWT_ISSUER,
      /**
       * expiresIn는 https://github.com/vercel/ms 기준으로 정의된다.
       */
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  });
};

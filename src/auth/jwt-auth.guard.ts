import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // AuthGuard('jwt') จะใช้ JwtStrategy ที่เราสร้างไว้
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';

// Interface สำหรับ JWT Payload ที่เราสร้างไว้ใน AuthService
export interface JwtPayload {
  sub: number; // user ID
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ดึง Token จาก Header: Authorization: Bearer <token>
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'YOUR_SECRET_KEY', // ใช้ Secret Key เดียวกันกับที่ใช้ sign ใน AuthModule
    });
  }

  // Validate: ตรวจสอบ Payload และดึงข้อมูลผู้ใช้จาก DB
  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      // ถ้าหาผู้ใช้ไม่เจอ (เช่น ถูกลบไปแล้ว)
      return null;
    }
    // ข้อมูลที่คืนไปจะถูกใส่ใน req.user
    return user;
  }
}

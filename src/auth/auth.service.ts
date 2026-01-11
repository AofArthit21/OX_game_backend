import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Payload สำหรับ JWT
  private async generateJwtPayload(
    user: any,
  ): Promise<{ sub: number; username: string }> {
    // ตรวจสอบและบันทึกผู้ใช้ลงใน DB (ถ้ายังไม่มี)
    const dbUser = await this.userService.findOrCreate(user);

    // สร้าง Payload ที่จำเป็น (ใช้ Internal ID เป็น 'sub')
    return {
      sub: dbUser.id,
      username: dbUser.displayName,
    };
  }

  // ฟังก์ชันหลักในการ Login และสร้าง JWT
  async login(user: any): Promise<string> {
    const payload = await this.generateJwtPayload(user);

    // สร้าง JWT Token
    return this.jwtService.sign(payload);
  }
}

import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { BaseUserProfile } from './auth.types';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // Endpoint สำหรับ Login Facebook
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}
  // Endpoint สำหรับ Callback จาก Facebook
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as BaseUserProfile;

    const jwtToken = await this.authService.login(user);

    return res.redirect(`http://localhost:3001/?token=${jwtToken}`);
  }

  // Endpoint สำหรับเริ่มต้น Login google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  //Endpoint สำหรับ Callback จาก Google
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as BaseUserProfile;

    // 3. สร้าง JWT
    const jwtToken = await this.authService.login(user);

    // 4. Redirect กลับไปที่ Frontend พร้อม JWT ใน URL/Cookie
    return res.redirect(`http://localhost:3001/?token=${jwtToken}`);
  }
}

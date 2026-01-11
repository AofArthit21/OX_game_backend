import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../user/user.entity';
import { UserService } from 'src/user/user.service';
import { Board } from './game.service';

// Request Body สำหรับการเดินเกม
interface MoveRequest {
  board: Board;
  playerIndex: number;
}

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly userService: UserService,
  ) {}

  // ** ใช้ JwtAuthGuard เพื่อป้องกัน API นี้ **
  @UseGuards(JwtAuthGuard)
  @Post('move')
  async makeMove(@Req() req, @Body() body: MoveRequest) {
    // ต้องแก้ไข req.user.id ให้ปลอดภัย
    const userId = (req.user as User).id;

    return this.gameService.makeMove(userId, body.board, body.playerIndex);
  }

  // Endpoint สำหรับ Leaderboard (ไม่จำเป็นต้องใช้ JwtAuthGuard)
  @Get('leaderboard')
  async getLeaderboard() {
    // ดึงข้อมูล Leaderboard ผ่าน UserService ซึ่งจัดการ Redis Cache อยู่แล้ว
    return this.userService.getLeaderboard();
  }

  @UseGuards(JwtAuthGuard)
  @Get('start')
  async startGame(@Req() req) {
    // เมื่อผู้เล่นเริ่มเกมใหม่ ให้ดึงคะแนนปัจจุบันของเขามาด้วย
    const user = req.user as User;
    return {
      board: Array(9).fill(null) as Board, // Cast เป็น Board Type
      score: user.totalScore,
      consecutiveWins: user.consecutiveWins,
      gameStatus: 'PLAYING',
    };
  }
}

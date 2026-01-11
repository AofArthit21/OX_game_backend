import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
// import { User } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';

// Types
export type Cell = 'X' | 'O' | null;
export type Board = Cell[];

// Interface สำหรับ Score Update Payload
interface ScoreUpdateResult {
  score: number;
  consecutiveWins: number;
}

@Injectable()
export class GameService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
  ) {}

  // ** ตรรกะการเล่นเกม (Bot Logic) **
  private getBotMove(board: Board): number {
    // 1. ตรวจสอบการชนะในตาเดียว (Bot Win)
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const tempBoard = [...board];
        tempBoard[i] = 'O'; // Bot คือ 'O'
        if (this.checkWinner(tempBoard) === 'O') return i;
      }
    }

    // 2. ตรวจสอบการบล็อกผู้เล่น (Player Block)
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const tempBoard = [...board];
        tempBoard[i] = 'X'; // Player คือ 'X'
        if (this.checkWinner(tempBoard) === 'X') return i;
      }
    }

    // 3. เลือกมุมหรือช่องกลาง (Default/Strategic moves)
    const corners = [0, 2, 6, 8];
    const center = 4;

    if (board[center] === null) return center;

    // เลือกมุมที่ว่าง
    for (const corner of corners) {
      if (board[corner] === null) return corner;
    }

    // 4. เลือกช่องว่างใดๆ
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) return i;
    }
    return -1; // Should not happen if game is not over
  }

  // ** ตรรกะการตรวจสอบผู้ชนะ **
  private checkWinner(board: Board): Cell | 'DRAW' | 'CONTINUE' {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]; // 'X' หรือ 'O'
      }
    }

    // ตรวจสอบเสมอ
    if (board.every((cell) => cell !== null)) {
      return 'DRAW';
    }

    return 'CONTINUE';
  }

  // ** ตรรกะการอัปเดตคะแนน (ตาม Requirement) **
  async updateScore(
    userId: number,
    result: 'WIN' | 'LOSE' | 'DRAW',
  ): Promise<ScoreUpdateResult> {
    const user = await this.userService.findById(userId);
    if (!user) throw new Error('User not found');

    let scoreChange = 0;

    if (result === 'WIN') {
      scoreChange = 1;
      user.consecutiveWins += 1;

      // โบนัส 3 ครั้งติดต่อกัน
      if (user.consecutiveWins === 3) {
        scoreChange += 1; // คะแนนพิเศษเพิ่มอีก 1
        user.consecutiveWins = 0; // นับใหม่
      }
    } else if (result === 'LOSE') {
      scoreChange = -1;
      user.consecutiveWins = 0; // รีเซ็ตการชนะติดต่อกัน
    } else {
      // DRAW
      user.consecutiveWins = 0; // เสมอก็รีเซ็ตการชนะติดต่อกัน
    }

    user.totalScore += scoreChange;
    // ป้องกันคะแนนติดลบ ถ้ามีข้อจำกัด
    if (user.totalScore < 0) user.totalScore = 0;

    await this.userService.save(user); // ต้องสร้าง save method ใน UserService ด้วย

    // บันทึกประวัติเกมลงในตาราง Games
    const newGame = this.gamesRepository.create({
      userId: user.id,
      result: result,
    });
    await this.gamesRepository.save(newGame);

    return { score: user.totalScore, consecutiveWins: user.consecutiveWins };
  }

  // ** API Logic: การเดินเกม **
  async makeMove(
    userId: number,
    currentBoard: Board,
    playerIndex: number,
  ): Promise<any> {
    if (currentBoard[playerIndex] !== null) {
      throw new Error('Invalid move: Cell already occupied.');
    }

    const board = [...currentBoard];
    const playerMove: Cell = 'X'; // Player
    const botMove: Cell = 'O'; // Bot

    // 1. ผู้เล่นเดิน ('X')
    board[playerIndex] = playerMove;
    let status = this.checkWinner(board);

    let botIndex = -1;
    // *** การแก้ไขที่สำคัญ: ประกาศ Type ให้ชัดเจนว่าสามารถเป็น ScoreUpdateResult หรือ null ได้ ***
    let scoreUpdate: ScoreUpdateResult | null = null;

    if (status === 'CONTINUE') {
      // 2. บอทเดิน ('O')
      botIndex = this.getBotMove(board);
      if (botIndex !== -1) {
        board[botIndex] = botMove;
        status = this.checkWinner(board);
      }
    }

    // 3. ตรวจสอบผลลัพธ์และอัปเดตคะแนน
    if (status !== 'CONTINUE') {
      let result: 'WIN' | 'LOSE' | 'DRAW';
      if (status === 'X') {
        result = 'WIN';
      } else if (status === 'O') {
        result = 'LOSE';
      } else {
        result = 'DRAW';
      }
      scoreUpdate = await this.updateScore(userId, result); // ตอนนี้ Type ตรงกันแล้ว
    }

    // 4. คืนค่าสถานะปัจจุบัน
    return {
      board: board,
      gameStatus: status, // 'X', 'O', 'DRAW', 'CONTINUE'
      botMoveIndex: botIndex,
      score: scoreUpdate ? scoreUpdate.score : null,
      consecutiveWins: scoreUpdate ? scoreUpdate.consecutiveWins : null,
    };
  }
}

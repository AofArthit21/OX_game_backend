import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';

export type Cell = 'X' | 'O' | null;
export type Board = Cell[];

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

  // Perfect-play tic-tac-toe bot (minimax).
  private getBotMove(board: Board): number {
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (board[i] !== null) continue;

      board[i] = 'O';
      const score = this.minimax(board, 0, false);
      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }

    return bestMove;
  }

  private minimax(board: Board, depth: number, isBotTurn: boolean): number {
    const result = this.checkWinner(board);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'DRAW') return 0;

    if (isBotTurn) {
      let bestScore = Number.NEGATIVE_INFINITY;
      for (let i = 0; i < 9; i++) {
        if (board[i] !== null) continue;
        board[i] = 'O';
        const score = this.minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(bestScore, score);
      }
      return bestScore;
    }

    let bestScore = Number.POSITIVE_INFINITY;
    for (let i = 0; i < 9; i++) {
      if (board[i] !== null) continue;
      board[i] = 'X';
      const score = this.minimax(board, depth + 1, true);
      board[i] = null;
      bestScore = Math.min(bestScore, score);
    }
    return bestScore;
  }

  private checkWinner(board: Board): Cell | 'DRAW' | 'CONTINUE' {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    if (board.every((cell) => cell !== null)) {
      return 'DRAW';
    }

    return 'CONTINUE';
  }

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

      if (user.consecutiveWins === 3) {
        scoreChange += 1;
        user.consecutiveWins = 0;
      }
    } else if (result === 'LOSE') {
      scoreChange = -1;
      user.consecutiveWins = 0;
    } else {
      user.consecutiveWins = 0;
    }

    user.totalScore += scoreChange;
    if (user.totalScore < 0) user.totalScore = 0;

    await this.userService.save(user);

    const newGame = this.gamesRepository.create({
      userId: user.id,
      result: result,
    });
    await this.gamesRepository.save(newGame);

    return { score: user.totalScore, consecutiveWins: user.consecutiveWins };
  }

  async makeMove(
    userId: number,
    currentBoard: Board,
    playerIndex: number,
  ): Promise<{
    board: Board;
    gameStatus: Cell | 'DRAW' | 'CONTINUE';
    botMoveIndex: number;
    score: number | null;
    consecutiveWins: number | null;
  }> {
    if (currentBoard[playerIndex] !== null) {
      throw new Error('Invalid move: Cell already occupied.');
    }

    const board = [...currentBoard];
    const playerMove: Cell = 'X';
    const botMove: Cell = 'O';

    board[playerIndex] = playerMove;
    let status = this.checkWinner(board);

    let botIndex = -1;
    let scoreUpdate: ScoreUpdateResult | null = null;

    if (status === 'CONTINUE') {
      botIndex = this.getBotMove(board);
      if (botIndex !== -1) {
        board[botIndex] = botMove;
        status = this.checkWinner(board);
      }
    }

    if (status !== 'CONTINUE') {
      let result: 'WIN' | 'LOSE' | 'DRAW';
      if (status === 'X') {
        result = 'WIN';
      } else if (status === 'O') {
        result = 'LOSE';
      } else {
        result = 'DRAW';
      }
      scoreUpdate = await this.updateScore(userId, result);
    }

    return {
      board,
      gameStatus: status,
      botMoveIndex: botIndex,
      score: scoreUpdate ? scoreUpdate.score : null,
      consecutiveWins: scoreUpdate ? scoreUpdate.consecutiveWins : null,
    };
  }
}

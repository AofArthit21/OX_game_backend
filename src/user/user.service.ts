import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import Redis from 'ioredis';

interface UserProfile {
  providerId: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable()
export class UserService {
  private readonly redisClient: Redis;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    // สำหรับการตั้งค่า Redis Client localhost
    // this.redisClient = new Redis({
    //   host: process.env.REDIS_HOST || 'localhost',
    //   port: parseInt(process.env.REDIS_PORT || '6379'),
    // });

    // สำหรับการตั้งค่า Redis Client Upstash
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set.');
    }
    this.redisClient = new Redis(redisUrl);

    this.redisClient.on('error', (err) => {
      console.error(
        '[Redis Error] Could not connect or Redis error occurred:',
        err,
      );
    });
  }
  // ค้นหาผู้ใช้ด้วย ID ที่มาจาก Provider (เช่น Google ID)
  async findByProviderId(providerUserId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { providerUserId } });
  }

  // สร้างหรืออัปเดตผู้ใช้เมื่อเข้าสู่ระบบ
  async findOrCreate(profile: UserProfile): Promise<User> {
    const existingUser = await this.findByProviderId(profile.providerId);

    if (existingUser) {
      return existingUser;
    }

    const newUser = this.usersRepository.create({
      providerUserId: profile.providerId,
      displayName: `${profile.firstName} ${profile.lastName}`,
      email: profile.email,
      totalScore: 0,
      consecutiveWins: 0,
    });

    return this.usersRepository.save(newUser);
  }

  // ค้นหาผู้ใช้ด้วย Internal ID (สำหรับใช้ใน JWT Payload)
  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // เพิ่ม method สำหรับบันทึกการเปลี่ยนแปลงคะแนน
  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  // Method สำหรับดึง Leaderboard
  async getLeaderboard(): Promise<User[]> {
    const CACHE_KEY = 'leaderboard';
    const TTL = 300; // Time To Live: 5 นาที

    const cachedData = await this.redisClient.get(CACHE_KEY);
    if (cachedData) {
      console.log('Returning leaderboard from Redis cache.');
      return JSON.parse(cachedData) as User[];
    }

    const leaderboard = await this.usersRepository.find({
      order: {
        totalScore: 'DESC',
        consecutiveWins: 'DESC',
      },
      take: 100,
    });

    await this.redisClient.set(
      CACHE_KEY,
      JSON.stringify(leaderboard),
      'EX',
      TTL,
    );
    console.log('Leaderboard cached in Redis.');

    return leaderboard;
  }
}

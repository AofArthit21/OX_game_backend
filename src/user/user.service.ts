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

function normalizeRedisUrl(rawRedisUrl?: string): string | undefined {
  if (!rawRedisUrl) {
    return undefined;
  }

  let value = rawRedisUrl.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  const embeddedUrlIndex = Math.max(
    value.indexOf('rediss://'),
    value.indexOf('redis://'),
  );
  if (embeddedUrlIndex > 0) {
    value = value.slice(embeddedUrlIndex);
  }

  if (value.startsWith('redis-cli')) {
    const match = value.match(/-u\s+(\S+)/);
    if (match?.[1]) {
      value = match[1].trim();
    }
  }

  value = value.replace(/^['"]|['"]$/g, '');

  if (value.includes('upstash.io') && value.startsWith('redis://')) {
    value = `rediss://${value.slice('redis://'.length)}`;
  }

  return value;
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
    const redisUrl = normalizeRedisUrl(process.env.REDIS_URL);
    if (redisUrl) {
      this.redisClient = new Redis(redisUrl);
    } else {
      this.redisClient = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      });
    }

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

    try {
      const cachedData = await this.redisClient.get(CACHE_KEY);
      if (cachedData) {
        console.log('Returning leaderboard from Redis cache.');
        return JSON.parse(cachedData) as User[];
      }
    } catch (error) {
      console.warn(
        '[Redis Warning] Cache read failed, fallback to database query.',
        error,
      );
    }

    const leaderboard = await this.usersRepository.find({
      order: {
        totalScore: 'DESC',
        consecutiveWins: 'DESC',
      },
      take: 100,
    });

    try {
      await this.redisClient.set(
        CACHE_KEY,
        JSON.stringify(leaderboard),
        'EX',
        TTL,
      );
      console.log('Leaderboard cached in Redis.');
    } catch (error) {
      console.warn('[Redis Warning] Cache write failed.', error);
    }

    return leaderboard;
  }
}

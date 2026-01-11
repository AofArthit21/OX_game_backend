/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { UserService } from '../user/user.service';
import { BaseUserProfile } from './auth.types';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly userService: UserService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:3000/api/auth/facebook/callback',
      scope: ['email', 'public_profile'], // สิทธิ์ที่ขอ
      profileFields: ['id', 'displayName', 'photos', 'email', 'name'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<BaseUserProfile> {
    const userProfile: BaseUserProfile = {
      provider: 'facebook',
      providerId: profile.id,
      email: profile.emails?.[0]?.value ?? null,
      firstName: profile.name?.givenName ?? null,
      lastName: profile.name?.familyName ?? null,
      picture: profile.photos?.[0]?.value ?? null,
      accessToken,
    };
    return userProfile;
  }
}

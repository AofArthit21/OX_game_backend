import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { UserService } from '../user/user.service';
import { BaseUserProfile } from './auth.types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly userService: UserService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:3000/api/auth/google/callback',
      scope: ['email', 'profile'],

      passReqToCallback: false,
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<BaseUserProfile> {
    const userProfile: BaseUserProfile = {
      provider: 'google',
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

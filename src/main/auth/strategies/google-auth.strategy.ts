
// import { AuthService } from './../auth.service';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable } from '@nestjs/common';
// import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor(private readonly config: ConfigService,
//     private readonly authService: AuthService

//   ) {
//     super({
//       clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
//       clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
//       callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
//       scope: ['email', 'profile'],
//     });
//   }

//   async validate(
//     accessToken: string, 
//     refreshToken: string, 
//     profile: Profile, 
//     // done: VerifyCallback
//   ): Promise<any> {
  
//     console.log(profile)

//     const user = await this.authService.validateUser({
//       providerId: profile.id,
//       name: profile.name?.givenName + ' ' + profile.name?.familyName,
//       email: profile.emails?.[0].value ?? '',
//       displayName: profile.displayName,
//       picture: profile.photos?.[0].value?? '',
//       provider: 'google',
      
//     })
// console.log(user)
//     return user || null
    
//     // const { name, emails, photos } = profile;
//     // const user = {
//     //   email: emails?.[0].value,
//     //     firstName: name?.givenName,
//     //     lastName: name?.familyName,
//     //     picture: photos?.[0].value,
//     //   accessToken,
//     // };
//     // done(null, user);
//   }
// }

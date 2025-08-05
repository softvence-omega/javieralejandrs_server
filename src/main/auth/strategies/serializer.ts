// google oauth serializer

import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class Serializer {
  constructor(private readonly authService: AuthService) {
    // super();
  }
  serializeUser(user: any, done: Function) {
    done(null, user);
  }

  async deserializeUser(payload: any, done: Function) {
    const user = await this.authService.findUser(payload.sub);
    console.log(user, 'deserializeUser');
    return user ? done(null, user) : done(null, null);
  }
}

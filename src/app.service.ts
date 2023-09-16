import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    const arr = new Array(10).fill(1).map((a) => a + 1);
    return JSON.stringify(arr);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Articles } from 'src/entities/board.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Articles)
    private articlesRepository: Repository<Articles>,
  ) {}
  async articles() {
    const test = await this.articlesRepository.query(`
    SELECT * FROM articles
    `);

    return test;
  }

  async postArticle({
    title,
    context,
    userId,
  }: {
    title: string;
    context: string;
    userId: any;
  }) {
    try {
      await this.articlesRepository.query(`
    INSERT INTO articles (title, context, userId)
    VALUES ("${title}", "${context}", "${userId}")
    `);
      return true;
    } catch (err) {
      return false;
    }
  }
}

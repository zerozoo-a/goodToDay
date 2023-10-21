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
  async articles(): Promise<Result<Post>> {
    try {
      const data = await this.articlesRepository.query(`
    SELECT id, title, created_at, modified_at, userId 
    FROM articles
    ORDER BY created_at DESC
    LIMIT 10
    `);

      return { success: true, data, err: undefined };
    } catch (err) {
      return { success: false, data: undefined, err };
    }
  }

  async article(id: string): Promise<Result> {
    try {
      const data = await this.articlesRepository.query(
        `
      SELECT id, title, context, created_at, modified_at, name
      FROM articles
      LEFT JOIN users
      ON articles.userId = users.id
      WHERE articles.id=?
      `,
        [id],
      );
      console.log(
        '🚀 ~ file: board.service.ts:39 ~ BoardService ~ article ~ data:',
        data,
      );

      return { success: true, data, err: undefined };
    } catch (err) {
      return { success: false, data: undefined, err };
    }
  }

  async postArticle({
    title,
    context,
    userId,
  }: {
    title: string;
    context: string;
    userId: any;
  }): Promise<Result> {
    try {
      const response = await this.articlesRepository.query(
        `
      INSERT INTO articles (title, context, userId)
      VALUES (?, ?, ?)
      `,
        [title, context, userId],
      );
      return { success: true, data: response, err: undefined };
    } catch (err) {
      return { success: false, data: undefined, err };
    }
  }
}

export interface Result<T = any, K = any> {
  success: boolean;
  data: T;
  err: K;
}

interface Post {
  id: number;
  title: string;
  context: string;
  created_at: string;
  modified_at: string;
  userId: number;
}

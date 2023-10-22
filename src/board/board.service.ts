import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Articles } from 'src/entities/board.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Articles)
    private articlesRepository: Repository<Articles>,
  ) {}

  async articles(page = 1): Promise<Result<Post>> {
    try {
      if (!Number.isSafeInteger(page))
        throw new HttpException({ message: 'page arg is not acceptable' }, 500);

      page = page || 1;
      const itemsPerPage = 5;
      const offset = (page - 1) * itemsPerPage;

      const data = await this.articlesRepository.query(
        `
        SELECT id, title, created_at, modified_at, userId,
        (SELECT COUNT(*) FROM boarder.articles) AS total_articles
        FROM boarder.articles
        ORDER BY created_at DESC
        LIMIT ?
        OFFSET ?;
        `,
        [itemsPerPage, offset],
      );

      return { success: true, data, err: undefined };
    } catch (err) {
      return { success: false, data: undefined, err };
    }
  }

  async article(id: string): Promise<Result> {
    try {
      const data = await this.articlesRepository.query(
        `
      SELECT articles.id, title, context, articles.created_at, articles.modified_at, name, users.id as userId
      FROM articles
      LEFT JOIN users
      ON articles.userId = users.id
      WHERE articles.id=?
      `,
        [id],
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
  total_articles: number;
}

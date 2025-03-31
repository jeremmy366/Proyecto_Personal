 import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: "oracle",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "1521"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_SERVICE_NAME,
  synchronize: false,
  logging: true,
  entities: ["src/entities/**/*.ts"],
  migrations: [],
  subscribers: [],
});

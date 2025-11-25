import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "remindly",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  storage:
    process.env.DB_DIALECT === "sqlite" ? "./database.sqlite" : undefined,
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
});

export default sequelize;

# ORM(Object Relational Mapping)

## ORM에 대해서

- 객체와 관계형 데이터베이스의 데이터를 자동으로 변형 및 연결하는 작업

- ORM을 이용한 개발은 객체와 데이터베이스의 변형에 유연하게 사용할 수 있음

  ```
  Object  <--------------> 관계형 Database
  객체지향 프로그래밍           관계형 데이터베이스
  (클래스 사용)               (테이블 사용)
  ```

- ORM vs Pure JavaScript

  ```js
  // ORM
  const boards = Boards.find({ title: "Hello", status: "PUBLIC" });

  // Pure JavaScript
  db.query(
    'SELECT * FROM boards WHERE title = "Hello" AND status = "PUBLIC"',
    (err, result) => {
      if (err) {
        throw new Error("Error");
      }
      boards = result.rows;
    }
  );
  ```

<br />

- ORM과 Node.js 추상화 계층

  - 저수준: 데이터베이스 드라이버 -> 원시 SQL 문자열을 작성하여 데이터베이스에 전달하고 응답을 받음

    - ex) mysql(MySQL), pg(Postgres), sqlite3(sqlite)

    ```js
    // $npm install pg
    const { Client } = require("pg");
    const connection = require("./connection.json");
    const client = new Client(connection);

    client.connect();

    const query = ` SELECT
      ingredient.*, item.name AS item_name, item.type AS item_type
    FROM ingredient
    LEFT JOIN item ON item.id = ingredient.item_id
    WHERE ingredient.dish_id = $1`;

    client.query(query, [1]).then((res) => {
      console.log("Ingredients:");
      for (let row of res.rows) {
        console.log(`${row.item_name}: ${row.quantity} ${tow.unit}`);
      }

      client.end();
    });
    ```

  - 중간수준: 쿼리 빌더

    - 단순한 데이터베이스 드라이버 모듈과 완전한 ORM을 사용하는 것의 중간 수준

    - ex) Knex

    - 다른 SQL 언어에 대한 쿼리 생성 가능하며 문자열을 연결하여 SQL을 형성하는 경우(종종 보안 취약점 발생) 편리하게 동적 쿼리 생성 가능

    ```js
    // $npm i pg knex
    const knex = require("knex");
    const connection = require("./connection.json");
    const client = knex({
      client: "pg",
      connection
    });

    client
      .select([
        "*",
        client.ref("item.name").as("item_name"),
        client.ref("item.type").as("item_type")
      ])
      .from("ingredient")
      .leftJoin("item", "item.id", "ingredient.item_id")
      .where("dish_id", "=", 1)
      .debug()
      .then((rows) => {
        console.log("Ingredients:");
        for (let row of res.rows) {
          console.log(`${row.item_name}: ${row.quantity} ${tow.unit}`);
        }

        client.destroy();
      });
    ```

  - 고수준: ORM

    - 사전 설정이 많음

    - 관계형 데이터베이스의 데이터를 애플리케이션의 객체(클래스 인스턴스)에 매핑

    - ex) typeorm, sequelize, prisma

    - 장점: 하나의 소스 코드를 이용해서 여러 데이터베이스로 쉽게 교체 가능, 중복 코드 방지, SQL 인젝션 취약점으로부터 보호, 모델 유효성 검사/TypeScript 지원

    - 단점: SQL이 아닌 각 ORM 자체를 학습해야 함, 복잡한 호출시 성능이 좋지 않을 수 있음

<br />

## TypeORM 사용을 위한 준비

- 프로젝트 폴더 생성: typeorm-app

  ```shell
  $npm init -y
  ```

- node.js에서 실행되고 TypeScript로 작성된 객체 관계형 맵퍼 라이브러리

- Oracle, MariaDB, SQLite, PostgresSqL 등 여러 데이터베이스 지원

- 특징 및 이점

  - 모델을 기반으로 데이터베이스 테이블 체계를 자동으로 생성

  - 데이터베이스에서 객체를 쉽게 삽입, 업데이트 및 삭제 가능

  - 테이블 간의 맴핑(일대일, 일대다, 다대다)을 만듦

  - 간단한 CLI 명령 제공

  - 간단한 코딩으로 ORM 프레임워크 사용 가능

  - 다른 모듈과 쉽게 통합 가능

<br />

- tsconfig.json

  - TypeScript로 작성된 코드를 JavaScript로 컴파일하는 옵션을 설정하는 파일

  - tsc 명령어 사용

  ```shell
  $npx tsc --init
  ```

<br />

- 필요 모듈 설치

  - nodemon: 서버 코드를 변경할 때마다 서버 재시작을 자동으로 처리

  - ts-node: Node.js 상에서 TypeScript Compiler를 통하지 않고도, 직접 ts를 실행시키는 역할

  - morgan: Node.js에서 사용된느 로그 관리를 위한 미들웨어

  - @types/express, @types/node: Express 및 Node.js에 대한 type 정의에 도움

  ```shell
  $npm i morgan nodemon express
  ```

  ```shell
  $npm i -D typescript ts-node @types/node @types/express @types/morgan
  ```

<br />

- express 코드 작성

  ```ts
  import express from "express";
  import morgan from "morgan";

  const app = express();

  app.use(express.json());
  app.use(morgan("dev")); // dev, short, common, combined 옵션

  app.get("/", (req, res) => {
    res.send("running");
  });

  const port = 4000;
  app.listen(port, () => {
    console.log(`Sever Running at http://localhost: ${port}`);
  });
  ```

<br />

## TypeORM을 이용해서 앱과 데이터베이스 연결

- 필요 모듈 설치

  - pg: PostgresSQL 데이터베이스와 인터페이스하기 위한 Node.js 모듈 모음 -> 데이터베이스 드라이버

  - typeorm: ts, js와 함께 사용할 수 있는 Node.js에서 실행되는 ORM

  - reflect-metadata: 데코레이터를 사용하기 위한 모듈

  ```shell
  $npm i pg typeorm reflect-metadata -D
  ```

<br />

- TypeORM 설정 파일 생성

  ```shell
  $npx typeorm init
  ```

  - data-source.ts: 데이터베이스 설정 파일

  > index.ts, package.json 파일 수정 필요!

<br />

- Entity 생성

  - 클래스를 생성한 후 그 안에 칼럼 정의 -> 클래스가 DB 테이블로 변환

  - TypeORM 사용할 때는 보통 할당 단언 처리 -> ! 사용 -> 추후 옵션일 경우 ?로 변경

  ```ts
  import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

  @Entity()
  export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column()
    age!: number;
  }
  ```

<br />

## 도커를 이용한 Postgres 실행

- docker-compose.yml 파일 생성 및 작성

  ```yaml
  services:
    db:
      image: postgres:latest
      container_name: postgres_typeorm_container
      restart: always
      ports:
        - "5432:5432"
      environment:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: password
      volumes:
        - ./data:/var/lib/postgresql/data
  ```

<br />

## pgAdmin 사용법

- pgAdmin 설치 및 사용

<br />

## TypeORM을 이용한 CURD 구현

- CRUD 앱을 위한 로직 작성

  ```ts
  app.post("/users", async (req, res) => {
    try {
      const user = await AppDataSource.getRepository(User).create(req.body);
      console.log(user);

      const result = await AppDataSource.getRepository(User).save(user);
      res.send(result);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).send("Error creating user");
    }
  });

  app.get("/users", async (req, res) => {
    try {
      const result = await AppDataSource.getRepository(User).find();
      res.json(result);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).send("Error fetching users");
    }
  });

  app.get("/users/:id", async (req, res) => {
    try {
      const result = await AppDataSource.getRepository(User).findOneBy({
        id: Number(req.params.id)
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      res.status(500).send("Error fetching user by ID");
    }
  });

  app.put("/users/:id", async (req, res) => {
    try {
      const user = await AppDataSource.getRepository(User).findOneBy({
        id: Number(req.params.id)
      });

      if (!user) {
        res.status(404).send("User not found");
        return;
      }

      AppDataSource.getRepository(User).merge(user, req.body);
      const result = await AppDataSource.getRepository(User).save(user);
      res.send(result);
    } catch (error) {
      console.error("Error fetching user for update:", error);
      res.status(500).send("Error fetching user for update");
    }
  });

  app.delete("/users/:id", async (req, res) => {
    try {
      // 자동으로 기본 키(id) 기준으로 삭제
      const result = await AppDataSource.getRepository(User).delete(
        Number(req.params.id)
      );
      res.json(result);
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send("Error deleting user");
    }
  });
  ```

<br />

- postman을 사용해 crud 처리

<br />

## Sequelize 사용하기

- 프로젝트 폴더 생성: sequelize-app

  ```shell
  $npm init -y
  ```

<br />

- 필요 모듈 설치

  ```shell
  $npm i nodemon express pg pg-hstore sequelize
  ```

<br />

- Entry 파일 생성 및 express 앱 생성

- docker-compose.yml 파일 생성

  ```yaml
  services:
    db:
      image: postgres:latest
      container_name: postgres_sequelize_container
      restart: always
      ports:
        - "5432:5432"
      environment:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: password
      volumes:
        - ./data:/var/lib/postgresql/data
  ```

<br />

- Sequelize 설정

  - Sequelize CLI를 이용해서 바로 생성 가능

  ```shell
  $npm i sequelize-cli sequelize init
  ```

  > CLI 없이 직접 생성

  - models/index.js

  ```js
  const Sequelize = require("sequelize");

  const dbConfig = {
    HOST: "localhost",
    USER: "postgres",
    PASSWORD: "password",
    PORT: 5432,
    DB: "postgres",
    dialect: "postgres"
  };

  const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
      host: dbConfig.HOST,
      port: dbConfig.PORT,
      dialect: dbConfig.dialect
    }
  );

  const db = {};
  db.Sequelize = Sequelize;
  db.sequelize = sequelize;
  db.users = require("./user.model")(sequelize, Sequelize);
  module.exports = db;
  ```

  - models/user.model.js

  ```js
  module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      hasCar: {
        type: Sequelize.BOOLEAN
      }
    });

    return User;
  };
  ```

<br />

## Sequelize를 이용한 CURD 구현

- Read

  ```js
  app.get("/users", (req, res) => {
    User.findAll()
      .then((users) => {
        res.send(users);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving users."
        });
      });
  });

  app.get("/users/:id", (req, res) => {
    const id = req.params.id;
    User.findByPk(id)
      .then((user) => {
        if (user) {
          res.send(user);
        } else {
          res.status(404).send({
            message: `Cannot find User with id=${id}.`
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving user."
        });
      });
  });
  ```

<br />

- Create

  ```js
  app.post("/users", (req, res) => {
    const { firstName, lastName, hasCar } = req.body;

    const user = {
      firstName,
      lastName,
      hasCar
    };

    User.create(user)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while creating the User."
        });
      });
  });
  ```

<br />

- Update

  ```js
  app.put("/users/:id", (req, res) => {
    const id = req.params.id;
    User.update(req.body, {
      where: { id }
    })
      .then((result) => {
        if (result[0] === 1) {
          res.send("성공");
        } else {
          res.send(`${id}에 해당하는 User를 찾을 수 없습니다.`);
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while updating the User."
        });
      });
  });
  ```

<br />

- Delete

  ```js
  app.delete("/users/:id", (req, res) => {
    const id = req.params.id;
    User.destroy({
      where: { id }
    })
      .then((result) => {
        if (result == 1) {
          res.send({
            message: "성공적으로 삭제되었습니다."
          });
        } else {
          res.send({
            message: `${id}에 해당하는 User를 찾을 수 없습니다.`
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while deleting the User."
        });
      });
  });
  ```

# GraphQL

- Read -> Query

## Mutation

```graphql
mutation {
  addNewPost(
    # 데이터를 가진 포스트 생성
    id: "post3"
    title: "It is a third post"
    description: "It is a third post description"
  ) {
    # 생성한 후에 응답으로 오는 데이터
    title
    description
  }
}
```

- Create 기능 추가

  1. Mutation을 Schema에 정의

  ```graphql
  type Mutation {
    addNewPost(id: ID!, title: String!, description: String!): Post
  }
  ```

  2. 모델에서 데이터 생성 함수 생성

  ```js
  function addNewPost(id, title, description) {
    const newPost = {
      id,
      title,
      description,
      comments: []
    };

    posts.push(newPost);

    return newPost;
  }
  ```

  3. Query에 대응하는 리졸버 함수 생성

  ```js
  const postsModel = require("./posts.model");

  module.exports = {
    Query: {
      posts: () => postsModel.getAllPosts(),
      post: (_, args) => postsModel.getPostById(args.id)
    },
    Mutation: {
      addNewPost: (_, args) =>
        postsModel.addNewPost(args.id, args.title, args.description)
    }
  };
  ```

  4. Mutation 사용

  ```graphql
  mutation {
    addNewPost(id: "post3", title: "hello", description: "world") {
      title
      description
    }
  }
  ```

<br />

## Comment 생성하기

- Create 기능 추가

  1. Mutation을 Schema에 정의

  ```graphql
  type Mutation {
    addNewComment(id: ID!, text: String!): Comment
  }
  ```

  2. 모델에서 데이터 생성 함수 생성

  ```js
  function addNewComment(id, text) {
    const newComment = {
      id,
      text,
      likes: 0
    };

    comments.push(newComment);
    return newComment;
  }
  ```

  3. Query에 대응하는 리졸버 함수 생성

  ```js
  const commentsModel = require("./comments.model");

  module.exports = {
    Query: {
      comments: () => commentsModel.getAllComments(),
      commentsByLikes: (_, args) =>
        commentsModel.getCommentsByLikes(args.minLikes)
    },
    Mutation: {
      addNewComment: (_, args) =>
        commentsModel.addNewComment(args.id, args.text)
    }
  };
  ```

  4. Mutation 사용

  ```graphql
  mutation {
    addNewComment(id: "comment3", text: "adasd") {
      id
      text
      likes
    }
  }
  ```

<br />

## Apollo

- GraphQL을 client, server 모두에서 사용할 수 있는 도구와 프레임워크를 제공

  <br />

  - apollo client

  ```
  - GraphQL API와 통신하는 클라이언트 라이브러리

  - React, Vue, Angular 등 다양한 프론트엔드 프레임워크와 연동 가능

  - Query와 Mutation을 쉽게 전송할 수 있고, 자동 캐싱, 상태 관리, 로컬 상태 관리 등 다양한 기능을 제공

  - fetch나 axios 없이도 GraphQL 서버와 통신 가능
  ```

  ```js
  import { gql, useQuery } from "@apollo/client";

  const Username = () => {
    const { loading, error, data } = useQuery(gql`
      {
        me {
          username
        }
      }
    `);

    if (loading) return <text>Loading</text>;
    if (error) return <text>Error! ${error.message}</text>;
    if (!data || !data.user) return <text>Could not find user :(</text>;

    return <text>Your username: ${data.me.username}</text>;
  };
  ```

  <br />

  - apollo server

  ```
  - GraphQL 서버를 쉽게 구축할 수 있게 해주는 프레임워크

  - 스키마(typeDefs)와 리졸버(resolvers)를 정의해서 손쉽게 GraphQL API를 만들 수 있음

  - Express, Koa 등 다양한 Node.js 서버 프레임워크와 연동 가능
  ```

<br />

## Apollo Server V3

- 불필요 패키지 제거

  ```shell
  $npm uni express-graphql
  ```

- apollo server 패키지 설치

  ```shell
  $npm i apollo-server-express
  ```

> apollo server v3 사용을 위해 express 버전을 5.x에서 4.x로 재설치함

<br />

- server.js 코드 수정

  ```js
  const { makeExecutableSchema } = require("@graphql-tools/schema");
  const { loadFilesSync } = require("@graphql-tools/load-files");
  const express = require("express");
  const path = require("path");
  const { ApolloServer } = require("apollo-server-express");
  const loadFiles = loadFilesSync("**/*", {
    extensions: ["graphql"]
  });
  const loadResolvers = loadFilesSync(
    path.join(__dirname, "**/*.resolvers.js")
  );

  // Apollo Server와 Express를 함께 사용하는 GraphQL 서버 초기화 함수
  async function startApolloServer() {
    // 1. Express 앱 생성
    const app = express();

    // 2. GraphQL 스키마 생성 (typeDefs와 resolvers를 조합)
    const schema = makeExecutableSchema({
      typeDefs: loadFiles, // GraphQL 타입 정의 파일들
      resolvers: loadResolvers // 리졸버 함수들
    });

    // 3. Apollo Server 인스턴스 생성 (스키마 주입)
    const server = new ApolloServer({ schema });

    // 4. Apollo Server 시작 (비동기)
    await server.start();

    // 5. Apollo Server를 Express 미들웨어로 등록
    //    - path: "/graphql"로 GraphQL API 엔드포인트 지정
    server.applyMiddleware({ app, path: "/graphql" });

    // 6. Express 서버 실행 (포트 4000)
    app.listen(4000, () => {
      console.log(
        `Running a GraphQl API server at http://localhost:${4000}/graphql`
      );
    });
  }

  startApolloServer();
  ```

<br />

## Migrating to Apollo Server 4

- 버전 충돌 문제로 graphql 재설치

  ```shell
  $npm install graphql@^16.7.0
  ```

- apollo server 4 설치

  ```shell
  $npm install @apollo/server cors
  ```

  > apollo server v4 사용을 위해 express 버전을 4.x에서 5.x로 재설치함

- express5에서 expressMiddleware 사용을 위해 패키지 설치

  ```shell
  $npm install @as-integrations/express5
  ```

<br />

- server.js 파일 코드 수정

  ```js
  // Apollo Server와 Express를 함께 사용하는 GraphQL 서버 초기화 함수
  async function startApolloServer() {
    // Express 애플리케이션 인스턴스 생성
    const app = express();

    // typeDefs(스키마)와 resolvers를 결합하여 실행 가능한 GraphQL 스키마 생성
    const schema = makeExecutableSchema({
      typeDefs: loadFiles, // 여러 graphql 파일을 배열로 전달
      resolvers: loadResolvers // 여러 리졸버 파일을 배열로 전달
    });

    // ApolloServer 인스턴스 생성 (스키마 전달)
    const server = new ApolloServer({ schema });

    // ApolloServer 시작(내부적으로 초기화 작업 수행, 미들웨어 등록 전에 반드시 필요)
    await server.start();

    // /graphql 엔드포인트에 미들웨어 등록
    // - cors() : CORS 허용
    // - express.json() : JSON 바디 파싱
    // - expressMiddleware : Apollo 서버를 Express에 연결, context에서 요청 헤더의 token 추출
    app.use(
      "/graphql",
      cors(),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token })
      })
    );

    // 4000번 포트에서 서버 시작
    app.listen(4000, () => {
      console.log(
        `Running a GraphQl API server at http://localhost:${4000}/graphql`
      );
    });
  }
  ```

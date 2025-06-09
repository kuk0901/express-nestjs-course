const { makeExecutableSchema } = require("@graphql-tools/schema");
const { loadFilesSync } = require("@graphql-tools/load-files");
const express = require("express");
const path = require("path");
const { ApolloServer } = require("@apollo/server");
const cors = require("cors");
const { expressMiddleware } = require("@as-integrations/express5");

// GraphQL 스키마(.graphql) 파일들을 모두 동기적으로 로드
const loadFiles = loadFilesSync("**/*", {
  extensions: ["graphql"]
});

// GraphQL 리졸버(.resolvers.js) 파일들을 모두 동기적으로 로드
const loadResolvers = loadFilesSync(path.join(__dirname, "**/*.resolvers.js"));

// Apollo Server와 Express를 함께 사용하는 GraphQL 서버 초기화 함수
async function startApolloServer() {
  // Express 애플리케이션 인스턴스 생성
  const app = express();

  // typeDefs(스키마)와 resolvers를 결합하여 실행 가능한 GraphQL 스키마 생성
  const schema = makeExecutableSchema({
    typeDefs: loadFiles,      // 여러 graphql 파일을 배열로 전달
    resolvers: loadResolvers  // 여러 리졸버 파일을 배열로 전달
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

// 서버 실행 함수 호출
startApolloServer();

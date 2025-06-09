# GraphQL

## GraphQL이란

- API용 쿼리 언어

  1. 데이터 묘사

  ```graphql
  type Project {
    name: String
    tagline: String
    contributors: [User]
  }
  ```

  2. 클라이언트에서 필요한 데이터 요청

  ```graphql
  {
    project(name: "GraphQL") {
      tagline
    }
  }
  ```

  3. 서버에서 예측한 데이터를 받아옴

  ```json
  {
    "project": {
      "tagline": "A query language for APIs"
    }
  }
  ```

<br />

- GraphQL 장점

  1. REST API 개발을 마칠 때까지 기다리지 않아도 됨 -> FE / BE가 전체 개발 프로세스를 병렬로 작업할 수 있음

  2. overfetching과 underfetching을 막아줌

  3. REST를 이용할 때 필요한 데이터를 만들기 위해 여러 번 요청을 보내야 할 때 GraphQL은 한 번의 요청으로 데이터를 가져올 수 있음

<br />

## GraphQL 사용해보기

- https://graphql.org/swapi-graphql

```graphql
# 데이터 요청
{
  starship(starshipID: 9) {
    name
    model
    length
    crew
  }
}
```

```graphql
# 한 번에 여러 데이터를 가져옴
{
  starship(starshipID: 9) {
    name
    model
    length
    crew
  }
  species(speciesID: 3) {
    name
    homeworld {
      gravity
      population
    }
  }
}
```

<br />

## GraphQL의 장단점

- 장점

  1. REST API 개발을 마칠 때까지 기다리지 않아도 됨 -> FE / BE가 전체 개발 프로세스를 병렬로 작업할 수 있음

  2. overfetching과 underfetching을 막아줌

  3. REST를 이용할 때 필요한 데이터를 만들기 위해 여러 번 요청을 보내야 할 때 GraphQL은 한 번의 요청으로 데이터를 가져올 수 있음

  4. Schema를 작성하기에 데이터가 어떻게 이루어져 있는지 알 수 있음

  5. Type을 작성하기에 요처오가 응답에 유효한 데이터가 오고 갈 수 있음

<br />

- 단점

  1. GraphQL 사용법을 익혀야 함

  2. 백엔드에 Schema및 Type을 정의해줘야 함

  3. REST API보다 데이터를 캐싱하는 게 까다로움

  ```
  - REST의 데이터 캐싱
  : URL을 사용하여 리소스에 액세스하므로 리소스 URL이 식별자로 있기에 해당 수준에서 캐시 가능

  - GraphQL의 데이터 캐싱
  : 동일한 엔티티에서 작동하더라도 각 쿼리가 다를 수 있기 때문에 복잡함, 다만
  GraphQL위에 구축된 대부분의 라이브러리를 효율적인 캐싱 메커니즘 제공

  -> 캐싱을 위한 한가지 패턴
  : ID와 같은 필드를 전역 고유 식별자로 예약함
  ```

<br />

## Express GraphQL Server 생성

1. 폴더 생성

2. npm init -y

3. 모듈 설치

   ```shell
   $npm install express express-graphql graphql -D
   ```

   - graphql: 데이터를 어떻게 구성할지 정하는 '타입 스키마'를 만들 수 있고, 이렇게 만든 타입 스키마를 바탕으로 원하는 데이터를 요청하는 쿼리를 실행할 수 있음

   - express-graphql: 연결 스타일 미들웨어를 지원하는 모든 HTTP 웹 프레임워크로 GraphQL HTTP 서버를 만듦

4. 서버 생성

   ```js
   const express = require("express");
   const port = 4000;
   const app = express();

   app.listen(port, () => {
     console.log(
       `Running a GraphQl API server at http://localhost:${port}/graphql`
     );
   });
   ```

5. graphql schema 정의 및 resolver 구현, 미들웨어 등록

   ```js
   const express = require("express");
   const { graphqlHTTP } = require("express-graphql");
   const { buildSchema } = require("graphql");
   const port = 4000;
   const app = express();

   const schema = buildSchema(`
     type Query {
       description: String
     }
   `);

   const root = {
     description: "hello world"
   };

   app.use(
     "/graphql",
     graphqlHTTP({
       schema: schema,
       rootValue: root
     })
   );

   app.listen(port, () => {
     console.log(
       `Running a GraphQl API server at http://localhost:${port}/graphql`
     );
   });
   ```

> HTTP 요청은 POST 사용

<br />

## GraphiQL 사용하기

- express-graphql 패키지 안에 포함되어 있기에 설정시 사용 가능

```js
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);
```

- 설정 후 http://localhost:4000/graphql 로 접속

<br />

## Schema 작성하기

- schema 작성

  ```js
  const schema = buildSchema(`
    type Query {
      posts: [Post]
      comments: [Comment]
    }
  
    type Post {
      id: ID!
      title: String!
      description: String!
      comments: [Comment]
    }
  
    type Comment {
      id: ID!
      text: String!
      likes: Int
    }
  `);
  ```

<br />

- rootValue 작성

  ```js
  const root = {
    posts: [
      {
        id: "post1",
        title: "It is a first post",
        description: "It is a first post description",
        comments: [{ id: "comment1", text: "It is a first comment", likes: 1 }]
      },
      {
        id: "post2",
        title: "It is a second post",
        description: "It is a first second description",
        comments: []
      }
    ],
    comments: [
      {
        id: "comment1",
        text: "It is a first comment",
        likes: 1
      }
    ]
  };
  ```

<br />

- 데이터 조회

  ```graphql
  {
    posts {
      id
      title
      description
      comments {
        id
        text
        likes
      }
    }
  }
  ```

<br />

## GraphQL Tools

- graphql 파일들을 분리해도 다시 하나로 모아 합쳐주는 도구

- 패키지 설치

  ```shell
  $npm install @graphql-tools/schema
  ```

- 패키지 적용

  - buildSchema(graphql) -> makeExecutableSchema(graphql-tools)

  ```js
  const schemaString = `
    type Query {
      posts: [Post]
      comments: [Comment]
    }
  
    type Post {
      id: ID!
      title: String!
      description: String!
      comments: [Comment]
    }
  
    type Comment {
      id: ID!
      text: String!
      likes: Int
    }
  `;

  const schema = makeExecutableSchema({
    typeDefs: [schemaString]
  });
  ```

<br />

- 모듈화(파일 분리)

  ```graphql
  # posts/posts.graphql
  type Query {
    posts: [Post]
  }

  type Post {
    id: ID!
    title: String!
    description: String!
    comments: [Comment]
  }
  ```

  ```graphql
  # comments/comments.graphql
  type Query {
    comments: [Comment]
  }

  type Comment {
    id: ID!
    text: String!
    likes: Int
  }
  ```

- 모듈 합치기

  - 필요 패키지 설치: graphql-tools/load-files -> 조건에 만족하는 파일을 불러올 때 사용

  ```shell
  $npm i @graphql-tools/load-files
  ```

  ```js
  const loadFiles = loadFilesSync("**/*", {
    extensions: ["graphql"]
  });

  const schema = makeExecutableSchema({
    typeDefs: loadedFiles
  });

  // value도 모듈화 후 사용
  const root = {
    posts: require("./posts/posts.model"),
    comments: require("./comments/comments.model")
  };
  ```

<br />

## Resolver

- 스키마의 단일 필드에 대한 데이터를 채우는 역할을 하는 함수 -> GraphQL에서 스키마의 각 필드에 실제 데이터를 채워주는 함수

- 쿼리 요청이 들어왔을 때 실제로 어떤 데이터를 반환할지 결정하는 실행 로직

  ```js
  const schema = makeExecutableSchema({
    typeDefs: loadFiles,
    resolvers: {
      Query: {
        posts: (parent, args, context, info) => {
          console.log("parent:", JSON.stringify(parent, null, 2));
          console.log("args:", JSON.stringify(args, null, 2));
          console.log("context:", JSON.stringify(context, null, 2));
          console.log("info keys:", Object.keys(info));
          // 현재 코드에서의 parent -> 직접 서버에서 넘긴 값(GraphQL 실행 시 rootValue로 넘긴 객체이기 때문)
          return parent.posts;
        },
        comments: (parent) => {
          return parent.comments;
        }
      }
    }
  });
  ```

  ```
  - parent(source 라고도 함)
    - 리졸버가 속한 상위(parent) 객체
    - 최상위 Query/Mutation 리졸버에서는 거의 항상 undefined 또는 서버에서 직접 넘긴 값
    - 하위 타입의 리졸버에서는, 상위 리졸버가 반환한 객체가 parent로 전달됨

  - args
    - GraphQL 쿼리에서 전달된 인자(파라미터) 객체
    - ex) user(id: 1)에서 args는 { id: 1 }

  - context
    - 모든 리졸버에 공유되는 컨텍스트 객체
    - 주로 인증 정보, DB 커넥션, 유저 세션, 공통 유틸리티 등을 담아 사용
    - 서버를 설정할 때 context를 지정하면 모든 리졸버에서 접근할 수 있음

  - info
    - 현재 쿼리의 실행 정보 및 스키마 정보가 담긴 객체
    - 복잡한 쿼리 처리나 메타정보가 필요할 때 활용
    - ex) 어떤 필드가 요청됐는지, 쿼리의 경로, 반환 타입 등 다양한 정보가 포함됨
  ```

<br />

- resolver 함수에서 비동기 처리

  ```js
  const schema = makeExecutableSchema({
    typeDefs: loadFiles,
    resolvers: {
      Query: {
        posts: async (parent) => {
          const product = await Promise.resolve(parent.posts);
          return product;
        }
        },
        comments: (parent) => {
          return parent.comments;
        }
      }
    }
  });
  ```

<br />

## Resolvers 모듈화하기

- resolver 파일 생성

<br />

- resolver 파일들 load

  ```js
  const loadResolvers = loadFilesSync(
    path.join(__dirname, "**/*.resolvers.js")
  );

  const schema = makeExecutableSchema({
    typeDefs: loadFiles,
    resolvers: loadResolvers
  });
  ```

<br />

- 각 파일에 resolver 함수 가져오기

  ```js
  module.exports = {
    Query: {
      posts: (parent) => {
        return parent.posts;
      }
    }
  };

  module.exports = {
    Query: {
      comments: (parent) => {
        return parent.comments;
      }
    }
  };
  ```

<br />

- 로직을 model 함수 만들어서 처리 -> resolver 파일은 최대한 간단하게 작성

  1. model 함수 생성

  ```js
  const posts = [
    {
      id: "post1",
      title: "It is a first post",
      description: "It is a first post description",
      comments: [{ id: "comment1", text: "It is a first comment", likes: 1 }]
    },
    {
      id: "post2",
      title: "It is a second post",
      description: "It is a first second description",
      comments: []
    }
  ];

  function getAllPosts() {
    return posts;
  }

  module.exports = { getAllPosts };
  ```

  2. resolver에 함수 추가

  ```js
  const postsModel = require("./posts.model");

  module.exports = {
    Query: {
      posts: () => postsModel.getAllPosts()
    }
  };
  ```

  3. default value 제거

  ```js
  app.use(
    "/graphql",
    graphqlHTTP({
      schema: schema,
      graphiql: true
    })
  );
  ```

<br />

## 필터링 기능 추가하기

- likes가 특정 숫자 이상인 comments만 가져올 수 있도록 기능 추가

```graphql
# comments.graphql
type Query {
  comments: [Comment]
  commentsByLikes(minLikes: Int!): [Comment]
}
```

```js
// comments.model
function getCommentsByLikes(minLikes) {
  return comments.filter((comment) => comment.likes >= minLikes);
}
// > 데이터 조회 함수 내보내기 주의
```

```js
// comments.resolvers
const commentsModel = require("./comments.model");

module.exports = {
  Query: {
    comments: () => commentsModel.getAllComments(),
    commentsByLikes: (_, args) =>
      commentsModel.getCommentsByLikes(args.minLikes)
  }
};
```

<br />

## ID로 데이터 가져오기

- post ID를 이용해 Post 데이터 가져오기

  1. Query를 Schema에 정의

  ```graphql
  type Query {
    posts: [Post]
    post(id: ID): Post
  }
  ```

  2. 모델에서 데이터 조회 함수 생성

  ```js
  function getPostById(id) {
    return posts.find((post) => post.id === id);
  }
  ```

  3. Query에 대응하는 리졸버 함수 생성

  ```js
  const postsModel = require("./posts.model");

  module.exports = {
    Query: {
      posts: () => postsModel.getAllPosts(),
      post: (_, args) => postsModel.getPostById(args.id)
    }
  };
  ```

> 데이터 조회 함수 내보내기 주의

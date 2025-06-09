# JavaScript 변수 선언

## 변수 선언 방식

- var: 중복 선언, 재할당 모두 가능

  - 마지막에 할당된 값이 변수에 저장됨

  - 자율성은 생기지만 소스 코드가 복잡해질 경우 기존 선언해둔 변수를 잊고 다시 선언하거나 재 할당을 해서 어떤 부분에서 값이 변경되는지 파악하기 힘듦

  ```js
  var greeting = "hello";
  console.log(greeting); // hello

  var greeting = "hi";
  console.log(greeting); // hi

  greeting = "how are you?";
  console.log(greeting); // how are you?
  ```

<br />

- let(ES6): 중복 선언 불가, 재할당 가능

  ```js
  let greeting = "hello";
  console.log(greeting); // hello

  // error
  let greeting = "hi";

  greeting = "how are you?";
  console.log(greeting); // how are you?
  ```

<br />

- const(ES6): 중복 선언, 재할당 모두 불가능

  ```js
  const greeting = "hello";
  console.log(greeting); // hello

  // error
  const greeting = "hi";
  console.log(greeting);

  // error
  greeting = "how are you?";
  ```

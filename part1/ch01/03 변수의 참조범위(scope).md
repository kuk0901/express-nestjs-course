# Scope

## 유효한 참조 범위(Scope)

- var: 함수 레벨 스코프(function-level scope)

  - 함수 내에서 선언된 변수는 함수 내에서만 유효(함수 내에서는 블록 내외부에 관계 없이 유효)

  - 함수 외부에서는 참조 불가

  ```js
  function func() {
    if (true) {
      var a = "a";
      console.log(a); // a
    }

    console.log(a); // a
  }

  func();
  console.log(a); // error
  ```

- let, const: 블록 레벨 스코프(block-level scope)

  - 함수, if문, for문, while문, try-catch문 등 모든 코드 블록 내부에서 선언된 변수는 코드 블록 내에서만 유효하며 코드 블록 외부에서 참조 불가

  ```js
  function func() {
    if (true) {
      let a = 3;
      console.log(a);
    }

    console.log(a); // error
  }

  func();
  ```

<br />

## 변수 생성 단계

1. 선언 단계: 식별자를 스코프에 등록

2. 초기화 단계: 메모리 공간 할당 및 undefined 초기화

3. 할당 단계: 실제 값 할당

<br />

## TDZ(Temporal Dead Zone)

- "일시적 사각지대"라는 뜻으로, JavaScript에서 let이나 const로 선언된 변수가 선언은 되었지만 아직 초기화되지 않은 상태에 머무는 구간

- 스코프의 시작점부터 변수 선언문에 도달해 초기화가 이루어지기 전까지가 TDZ

- var는 선언과 동시에 undefined로 초기화되어 TDZ가 없지만, let과 const는 선언과 초기화가 분리되어 있어 TDZ가 생김


> 변수를 사용할 수 없는 일시적인 비활성 상태


<br />

## TDZ의 작동 원리

| 변수 타입 | 선언 호이스팅   | 초기화 시점    | TDZ 영향 여부 |
| --------- | --------------- | -------------- | ------------- |
| var       | O (동시 초기화) | 스코프 시작 시 | X             |
| let       | O               | 선언문 도달 시 | O             |
| const     | O               | 선언문 도달 시 | O             |

- 선언이 호이스팅된다는 것은, 변수 식별자가 스코프에 미리 등록된다는 의미

- 초기화(사용 가능 시점)는 선언문에 도달한 이후에만 가능

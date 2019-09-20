const http = require("http");
const { parse } = require("url");
const chalk = require("chalk");

function getArrayOfNumbers(q) {
  return q.match(/[0-9\.]+/g).map(x => parseFloat(x));
}

function isSquare(n) {
  return n % Math.sqrt(n) == 0;
}

function isCube(n) {
  return n % Math.cbrt(n) == 0;
}

function isPrime(n) {
  if (n === 1) {
    return false;
  } else if (n === 2) {
    return true;
  } else {
    for (var x = 2; x < n; x++) {
      if (n % x === 0) {
        return false;
      }
    }
    return true;
  }
}

function fibonacci(n) {
  let arr = [0, 1];
  for (let i = 2; i < n + 1; i++) {
    arr.push(arr[i - 2] + arr[i - 1]);
  }
  return arr[n];
}

const strings = new Map([["what colour is a banana", "yellow"]]);

const answerers = [
  q => {
    if (/numbers is the largest/.test(q)) {
      const max = Math.max(...getArrayOfNumbers(q));
      return max;
    }
  },
  q => {
    if (/what is \d+ plus \d+/.test(q)) {
      return getArrayOfNumbers(q).reduce((p, v) => p + v, 0);
    }
  },
  q => {
    if (/what is \d+ minus \d+/.test(q)) {
      const [a, b] = getArrayOfNumbers(q);
      return a - b;
    }
  },
  q => {
    if (/which of the following numbers is both a square and a cube/.test(q)) {
      const numbers = getArrayOfNumbers(q).filter(
        n => isCube(n) && isSquare(n)
      );
      return numbers.join(", ");
    }
  },
  q => {
    if (/what is \d+ multiplied by \d+/.test(q)) {
      const [a, b] = getArrayOfNumbers(q);
      return a * b;
    }
  },
  q => {
    if (/to the power of/.test(q)) {
      const [a, b] = getArrayOfNumbers(q);
      return a ** b;
    }
  },
  q => {
    if (/are primes/.test(q)) {
      const primes = getArrayOfNumbers(q).filter(n => isPrime(n));
      return primes.join(", ");
    }
  },
  q => {
    if (/number in the Fibonacci sequence/.test(q)) {
      const n = fibonacci(getArrayOfNumbers(q)[0]);
      return n;
    }
  },
  q => {
    if (strings.has(q)) {
      return strings.get(q);
    }
  }
];

function findAnswer(q) {
  for (const answerer of answerers) {
    const answer = answerer(q);
    if (typeof answer !== "undefined") {
      return answer.toString();
    }
  }
  return null;
}

http
  .createServer((req, res) => {
    try {
      // Get the question from the query string
      const question = parse(req.url, true).query.q || "";

      // Get an answer to the question
      let answer = findAnswer(question.replace(/^[a-z0-9]+: /, ""));

      // Write question and answer to the console
      if (answer) {
        console.log(chalk.gray(`Question: ${question}`));
        console.log(chalk.gray(`Answer:   ${answer}`));
      } else {
        answer = "I dont know";
        console.log(chalk.red(`Question: ${question}`));
        console.log(chalk.red(`Answer:   ${answer}`));
      }

      // Write response
      res.writeHead(200, "OK");
      res.end(answer);
    } catch (err) {
      console.log(err);
    }
  })
  .listen(3001, () => console.log("started"));

import test from "tape";
import { validate } from "../";

const expectStringMatch = (expected: string) => (_: string, actual: string) =>
  actual === expected ? void null : `Expected ${actual} to be ${expected}`;

const expectGreaterThan = (expected: number) => (_: string, actual: number) =>
  actual > expected
    ? void null
    : `Expected ${actual} to be greater than ${expected}`;

const expectDivisibleBy = (div: number) => (_: string, value: number) =>
  value % div === 0 ? void null : `Expected ${value} to be divisible by ${div}`;

test("Validates simple valid fields", (t) => {
  t.plan(2);
  type IFields = {
    name: string;
    age: number;
  };
  const fields: IFields = {
    name: "Bob",
    age: 32,
  };
  const result = validate(fields, {
    name: expectStringMatch("Bob"),
    age: (key, value, fields) =>
      value <= 30 ? `${fields.name}'s ${key} should be at least 30` : void null,
  });
  t.equal(typeof result.name, "undefined", "Name passes");
  t.equal(typeof result.age, "undefined", "Age passes");
});

test("Validates simple invalid fields", (t) => {
  t.plan(2);
  type IFields = {
    name: string;
    age: number;
  };
  const fields: IFields = {
    name: "Sally",
    age: 28,
  };
  const result = validate(fields, {
    name: expectStringMatch("Bob"),
    age: (key, value, fields) =>
      value <= 30 ? `${fields.name}'s ${key} should be at least 30` : void null,
  });
  t.equal(typeof result.name, "string", "Name fails");
  t.equal(typeof result.age, "string", "Age fails");
});

test("Validates multiple constraints per field", (t) => {
  t.plan(2);
  type Fields = {
    twenty: number;
    thirty: number;
  };
  const fields: Fields = {
    twenty: 20,
    thirty: 30,
  };
  const result = validate(fields, {
    twenty: [expectDivisibleBy(10), expectGreaterThan(25)],
    thirty: [expectDivisibleBy(10), expectGreaterThan(25)],
  });
  t.equal(typeof result.twenty, "string", "Twenty fails");
  t.equal(typeof result.thirty, "undefined", "Thirty passes");
});

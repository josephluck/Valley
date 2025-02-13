// import test from "tape";
// import { makeValidator } from "../";

// test("Validates simple valid fields", (t) => {
//   t.plan(2);
//   type IFields = {
//     name: string;
//     age: number;
//   };
//   const fields: IFields = {
//     name: "Bob",
//     age: 32,
//   };
//   const errors = makeValidator({
//     name: rules.stringMatch("Bob"),
//     age: (value, key, fields) =>
//       value <= 30 ? `${fields.name}'s ${key} should be at least 30` : void null,
//   })(fields);
//   t.equal(typeof errors.name, "undefined", "Name passes");
//   t.equal(typeof errors.age, "undefined", "Age passes");
// });

// test("Validates simple invalid fields", (t) => {
//   t.plan(2);
//   type IFields = {
//     name: string;
//     age: number;
//   };
//   const fields: IFields = {
//     name: "Sally",
//     age: 28,
//   };
//   const errors = makeValidator({
//     name: rules.stringMatch("Bob"),
//     age: rules.lessThan(30),
//   })(fields);
//   t.equal(typeof errors.name, "string", "Name fails");
//   t.equal(typeof errors.age, "string", "Age fails");
// });

// test("Validates multiple constraints per field", (t) => {
//   t.plan(4);
//   type Fields = {
//     twenty: number;
//     thirty: number;
//     fourty: number;
//   };
//   const fields: Fields = {
//     twenty: 20,
//     thirty: 30,
//     fourty: 40,
//   };
//   const validate = makeValidator<Fields>({
//     twenty: [rules.divisibleBy(10), rules.greaterThan(25)],
//     thirty: [rules.divisibleBy(10), rules.greaterThan(25)],
//     fourty: rules.divisibleBy(10),
//   });
//   const errors = validate(fields);
//   t.equal(typeof errors.twenty, "string", "Twenty fails");
//   t.equal(errors.twenty, "Expected 20 to be greater than 25");
//   t.equal(typeof errors.thirty, "undefined", "Thirty passes");
//   t.equal(typeof errors.fourty, "undefined", "Fourty passes");
// });

// test("Validates with asynchronous constraints", async (t) => {
//   t.plan(2);
//   type Fields = {
//     name: string;
//     age: number;
//   };
//   const fields: Fields = {
//     name: "Sam",
//     age: 35,
//   };
//   const errors = await makeValidator({
//     name: rules.asyncStringMatch("Bob"),
//     age: async (value) => {
//       try {
//         if (value < 30) {
//           throw new Error();
//         }
//       } catch (err) {
//         return "Fails";
//       }
//     },
//   })(fields);
//   t.equal(typeof errors.name, "string", "Name fails");
//   t.equal(typeof errors.age, "undefined", "Age passes");
// });

// test("Validates with multiple asynchronous constraints", async (t) => {
//   t.plan(2);
//   type Fields = {
//     age: number;
//   };
//   const fields: Fields = {
//     age: 20,
//   };
//   const errors = await makeValidator({
//     age: [rules.asyncGreaterThan(10), rules.asyncLessThan(15)],
//   })(fields);
//   t.equal(typeof errors.age, "string", "Age fails");
//   t.equal(
//     errors.age,
//     "Expected 20 to be less than 15",
//     "Age fails with the correct constraint"
//   );
// });

// test("Validates with a mix of synchronous and asynchronous constraints", async (t) => {
//   t.plan(3);
//   type Fields = {
//     age: number;
//   };
//   const validate = makeValidator<Fields>({
//     age: [rules.greaterThan(10), rules.asyncLessThan(15)],
//   });
//   const first = await validate({
//     age: 20,
//   });
//   t.deepEqual(
//     first,
//     { age: "Expected 20 to be less than 15" },
//     "First set of fields fail with correct constraints"
//   );
//   const second = await validate({
//     age: 5,
//   });
//   t.deepEqual(
//     second,
//     { age: "Expected 5 to be greater than 10" },
//     "Second set of fields fail with correct constraints"
//   );
//   const third = await validate({
//     age: 12,
//   });
//   t.deepEqual(third, { age: undefined }, "Third set of fields pass");
// });

// test("Real life create account example", async (t) => {
//   t.plan(5);
//   type Fields = {
//     email: string;
//     password: string;
//     confirmPassword: string;
//   };
//   const fields: Fields = {
//     email: "bob@acme.co",
//     password: "bobsdabest",
//     confirmPassword: "bobadaworst",
//   };
//   /**
//    * Usually these constraints would all be packaged up in a separate module for
//    * reusability, and imported where needed. Otherwise it looks a bit gnarly
//    * in-line...
//    */
//   const validate = makeValidator<Fields>({
//     email: [
//       async (value) => {
//         try {
//           if (!value.includes(".") || !value.includes("@")) {
//             throw new Error("Not a valid email");
//           }
//         } catch (err) {
//           return err.message;
//         }
//       },
//       async (value) => {
//         try {
//           const response = await api.getAccount(value);
//           if (response.data) {
//             throw new Error("Account already exists");
//           }
//         } catch (err) {
//           return err.message;
//         }
//       },
//     ],
//     password: async (value) => {
//       try {
//         if (value.length < 5) {
//           throw new Error("Password too short");
//         }
//       } catch (err) {
//         return err.message;
//       }
//     },
//     confirmPassword: async (value, _key, fields) => {
//       try {
//         if (fields.password !== value) {
//           throw new Error("Passwords do not match");
//         }
//       } catch (err) {
//         return err.message;
//       }
//     },
//   });
//   const errors = await validate(fields);
//   t.equal(typeof errors.email, "string", "Email fails");
//   t.equal(typeof errors.password, "undefined", "Password passes");
//   t.equal(typeof errors.confirmPassword, "string", "Confirm password fails");
//   t.equal(
//     errors.email,
//     "Account already exists",
//     "Email fails with correct constraint"
//   );
//   t.equal(
//     errors.confirmPassword,
//     "Passwords do not match",
//     "Confirm password fails with correct constraint"
//   );
// });

// const rules = {
//   stringMatch: (expected: string) => (actual: string) =>
//     actual === expected ? void null : `Expected ${actual} to be ${expected}`,

//   asyncStringMatch: (expected: string) => async (actual: string) => {
//     try {
//       if (actual !== expected) {
//         throw new Error();
//       }
//     } catch (err) {
//       return `Expected ${actual} to be ${expected}`;
//     }
//   },

//   confirmPassword: (
//     value: string,
//     _key: string,
//     fields: { password: string; [key: string]: any }
//   ) => (value === fields.password ? void null : "Passwords do not match"),

//   lessThan: (expected: number) => (value: number, key: string) =>
//     value <= 30 ? `${key} should be at least ${expected}` : void null,

//   greaterThan: (expected: number) => (actual: number) =>
//     actual > expected
//       ? void null
//       : `Expected ${actual} to be greater than ${expected}`,

//   asyncGreaterThan: (expected: number) => async (actual: number) => {
//     try {
//       if (actual < expected) {
//         throw new Error();
//       }
//     } catch (err) {
//       return Promise.resolve(
//         `Expected ${actual} to be greater than ${expected}`
//       );
//     }
//   },

//   asyncLessThan: (expected: number) => async (actual: number) => {
//     try {
//       if (actual > expected) {
//         throw new Error();
//       }
//     } catch (err) {
//       return Promise.resolve(`Expected ${actual} to be less than ${expected}`);
//     }
//   },

//   divisibleBy: (div: number) => (value: number) =>
//     value % div === 0
//       ? void null
//       : `Expected ${value} to be divisible by ${div}`,
// };

// const api = {
//   getAccount: async (email: string) => {
//     if (email === "bob@acme.co") {
//       return {
//         error: false,
//         status: 200,
//         data: {
//           name: "Bob",
//           email,
//           age: 30,
//         },
//       };
//     }
//     return { error: true, status: 404, message: "Not Found" };
//   },
// };

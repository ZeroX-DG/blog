---
title: 'Rust vs JS: What are the differences'
description: 'I'm a heavy JS/TS user so everything I think, I think using JS/TS mindset and that's exactly why I struggle so much with Rust. Therefore, I want to clearly list out the differences between Rust and JS in this article.'
tags: [rust, js]
---

A few days ago, I released my first ever [app](https://github.com/ZeroX-DG/rsn) written in [Rust](https://www.rust-lang.org/) and this is what I put in the about section:

> Have you ever wonder what will happen when an experienced JS/TS developer gives up all love and hope, trying to understand how the rust borrow checker works and failed pathetically? This is what he will produce.

I'm a heavy JS/TS user so everything I think, I think using JS/TS mindset and that's exactly why I struggle so much with Rust. Therefore, I want to clearly list out the differences between Rust and JS in this article.

## Assigning variables

This is a simple task in JS:

```js
const a = "a";
const b = a;
console.log(`${a}, ${b}`); // print a, a
```

However, we can't do the same thing with Rust:

```rust
let a = String::from("a");
let b = a;
print!("{}, {}", a, b); // error[E0382]: borrow of moved value: `a`
```

> "borrow"? Nobody said anything about borrowing? Is Rust drunk? Am I drunk?

Turns out, when assigning a variable to another variable, you don't "assign" the value of the current variable to another variable, but instead you're giving its' value to another variable and the variable will then become unusable. This concept is called move.

Because resources in Rust can only have 1 owner, every time you perform variable assignment or passing variable to a function call Rust will consider that as a `move`.

Therefore, in the example above, the variable `a` has been moved to variable `b`. After that `a` is unusable, that's why the error is throwed when `print!` tried to use `a`.

However, take a look at this code

```rust
let a = 10;
let b = a;
print!("{}, {}", a, b); // print 10, 10
```

According to the move rule, `a` should be unusable right? However, in this case, instead of performing a `move`, Rust copied the value of `a` into `b` because `a` and `b` are `i32` type which is a type that implements the `Copy` trait.

If a type implements the `Copy` trait, it's copyable and primitives types in Rust implements `Copy` by default.

Therefore, in the example code above, `a` will not be moved and `b` will copy the value of `a`. Thus `a` and `b` are independent variables and can be used in `print!`

## Borrowing

If you happen to encounter the `move` error above, another way to solve it is to borrow the variable.

```rust
let a = String::from("a");
let b = &a;
print!("{}, {}", a, b); // print a, a
```

The concept of borrowing is just like how you borrow something in real life. For example, you have a car and you friend borrow it from you. According to the law, you're a still owning that car. Thus, it satisfy the rule "1 owner rule" of Rust but you can still use it in a another variable.

With that being said, you can't change anything when you're borrowing. You friend would hit you in the head if he found out that you color his car pink after you borrow it. Filling up the tank is a different story tho :rolling_on_the_floor_laughing:

If you want to both borrow the variable and change its' value, you can borrow it as mutable.

```rust
let mut a = String::from("a");
let b = &mut a;
b.push('a');
print!("{}", a); // print aa
```

There are 2 rules that you have to follow when borrowing variable. But only follow one of them, you can't follow both of them at the same time.

- one or more references `(&T)` to a resource.
- exactly one mutable reference (&mut T).

The first rule means you can have as many immutable references to a variable as you like.

```rust
let a = String::from("a");
let b = &a;
let c = &a;
let d = &a;
print!("{} {} {} {}", a, b, c, d); // print a a a a
```

The second rule means you can only have 1 mutable reference in the current scope.

```rust
let mut a = String::from("a");
{
  let b = &mut a;
  b.push('c');
  print!("{}", b); // print ac
}
let c = &mut a;
c.push('d');
print!("{}", c); // print acd
```

In the code above, although `a` has been borrowed as mutable 2 times, but they are in different scope.

## Closure

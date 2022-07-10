---
title: std::mem::transmute the unsafe magic
tags: ["code", "rust"]
date: 2022/07/11
description: "Using mem::transmute for struct inheritance in Rust"
---

One great problem that kept me from fully enjoying Rust was the inability to use OOP. Now, before you take me to the gallows, I want you to know that I fully support composition over inheritance, and the concept of `trait` is one of the primary reasons why I love Rust. However, there are certain situations where OOP is irreplaceable. In my case, it’s the DOM tree structure.

The DOM tree structure was designed in the OOP paradigm. Meaning it relies heavily on inheritance: `HTMLElement` inherits `Element` inherits `Node`.

A straightforward way to implement this behaviour is to use nested structs:

```rust
struct HTMLElement {
  element: Element,
}

struct Element {
  node: Node,
}

struct Node {
  data: ...
}
```

This is fine, as long as the data access flows from top to bottom. Meaning you can access a property of `Node` from `HTMLElement` just fine, but not the other way around. You could argue that I should design my code in a way that only accesses data from top down, but that would certainly reduce the flexibility of the code. Repressing developer experience for the compiler’s happiness is like a slow burning fire that will one day spring out of control. The developer should write the code, not the other way around.

But here we’re pushing the limit of safe Rust. There’s no other choice but to introduce unsafe into the mix, and after understanding this trick, you will know that `unsafe` in Rust is only unsafe for the novice. The great master of the language should draw power from both sides of Rust. Safe and Unsafe. Order and Chaos.

Transmute in Rust is a function that treats a value of one type as another type that you desire, ignoring the type system entirely. In other words, it’s typecasting, a very unsafe type casting, but incredibly powerful. For example, you can cast an array of four `u8` into an `u32` since four `u8` sittings next to each other in memory is a `32-bit` memory segment which could be interpreted as a `u32`.

```rust
let a = [0u8, 1u8, 0u8, 0u8];
let b = std::mem::transmute::<[u8; 4], u32>(a);
println!("{}", b); // 256
```

You probably see where I’m going with this. Even though the DOM tree is a nested structure, the memory layout is still linear. The nested structure only exists in the type system of Rust, so in memory, the address of the `HTMLElement` is the same as the address of `Element` and `Node` (as long as the `element` and `node` field is the first field in each struct). This enables us to use `transmute` to cast between those types and access the data from the inner struct out to the containing struct.

```rust
struct HTMLElement {
  element: Element,
}

struct Element {
  node: Node,
}

struct Node {
  data: String
}

fn main() {
    
    let html = HTMLElement { element: Element { node: Node { data: String::from("data") } } };
    
    println!("node data: {}", html.element.node.data);
    
    let node: Node = unsafe { std::mem::transmute(html) };
    
    println!("node data: {}", node.data);
    
    let element: Element = unsafe { std::mem::transmute(node) };
    
    println!("node data: {}", element.node.data);
}
```

Our DOM tree is now infinitely more powerful and flexible. You can go so far as to design a convenient API for type casting in the DOM tree:

```rust
// Not tested yet, don't trust me.
trait Castable {
  fn cast<T>(self) -> T {
    unsafe { std::mem::transmute(self) }
  }
}

let html = HTMLElement::new();
let node: Node = html.cast::<Node>();
let element: Element = node.cast::<Element>();
```

So `unsafe` wasn’t that unsafe after all isn’t it? :)

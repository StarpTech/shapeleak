# shapeleak

Find subsequent changes in Objects which can result in unoptimized code. If you don't know what we talking about I can recommend [this](https://blog.ghaiklor.com/optimizations-tricks-in-v8-d284b6c8b183) article.

Requires Node 6.4+

## Features

* Print exact location of the violation.
* Can be applied to Factory, Object-Literal and objects instantiated by `new`.
* Does not break existing code.

## Output

```
E:\Repositorys\shaped\example.js
  20:8  type update  - Property 'name' has changed it's type from 'string' to 'number'
  21:7  create - Property 'foo' was added to shape (name)
  22:1  delete - Property 'name' was deleted from shape (name,foo)
  37:8  type update  - Property 'name' has changed it's type from 'string' to 'number'
  38:7  create - Property 'foo' was added to shape (name)
  39:1  delete - Property 'name' was deleted from shape (name,foo)
  50:8  type update  - Property 'name' has changed it's type from 'string' to 'number'
  51:7  create - Property 'foo' was added to shape (name)
  52:1  delete - Property 'name' was deleted from shape (foo)
```

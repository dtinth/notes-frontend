declare module "async-memoize-one" {
  function memoizeOne<T>(fn: () => T): () => T;
  export = memoizeOne;
}

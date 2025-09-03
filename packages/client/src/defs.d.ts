declare module "stopwords/english" {
  const mod: { english: string[] };
  export = mod;
}

declare module "async-memoize-one" {
  function memoizeOne<T>(fn: () => T): () => T;
  export = memoizeOne;
}

export interface CompiledNote {
  /** HTML of the rendered note */
  html: string;

  /** CSS of the rendered note */
  css: string;

  /** JavaScript code for the Vue component, compiled to CJS */
  js: string;

  /** Page title */
  title: string;

  /** data attributes to apply to the root element */
  dataset: Record<string, string>;

  /** Elements to add to the head of the page */
  head: HeadElement[];

  /** Front matter data */
  frontMatter: Record<string, any>;
}

export type HeadElement =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string];

languages = %w(
  astro
  bat
  c cpp csharp css csv
  diff docker dotenv
  erb
  fish
  gherkin glsl go graphql
  handlebars hcl html html-derivative http
  ini
  java javascript json json5 jsonc jsonl jsx
  kotlin kusto
  latex less liquid lua
  make markdown mdx mermaid
  nginx nix
  ocaml
  perl php plsql postcss powershell prisma proto pug python
  regexp rst ruby rust
  sass scss shellscript shellsession sql ssh-config stylus svelte swift systemd
  toml tsv tsx typescript
  vue vue-html
  xml
  yaml
)

# Generate import statements
imports = languages.map do |lang|
  "import langs#{lang.gsub('-', '').capitalize} from \"shiki/langs/#{lang}.mjs\";"
end.join("\n")

# Generate langs array
langs_array = languages.map do |lang|
  "langs#{lang.gsub('-', '').capitalize}"
end.join(",\n  ")

# Generate the complete TypeScript code
typescript_code = <<~CODE
/* Regenerate this file with: ruby src/compiler/shikiLangs.ts.rb | tee src/compiler/shikiLangs.ts */
#{imports}

export const langs = [
  #{langs_array}
];
CODE

puts typescript_code
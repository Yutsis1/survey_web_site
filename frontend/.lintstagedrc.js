const linters = {
  '**/*.{js,jsx,ts,tsx}': ['eslint --fix', 'git add'],
  '**/*.{css,scss}': ['stylelint --fix', 'git add'],
  '**/*.{json,md}': ['prettier --write', 'git add'],
};

module.exports = linters;
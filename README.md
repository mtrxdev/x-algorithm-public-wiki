# What you can actually make from X’s public ranking code

An independent, layman-language report on
[xai-org/x-algorithm](https://github.com/xai-org/x-algorithm).

This site is **not affiliated with X or xAI**. It only quotes their public
repository. It does not run the live For You feed.

## Development

```bash
npm install
npm test
npm run verify
npm run dev
```

`vendor/x-algorithm/` is a local clone used to check quotes. It is not
committed. Create it with:

```bash
git clone --depth 1 https://github.com/xai-org/x-algorithm.git vendor/x-algorithm
```

## Source of quotes

See `content/manifest.json` for the commit SHA and file ranges.

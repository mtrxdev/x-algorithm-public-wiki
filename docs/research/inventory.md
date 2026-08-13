# Inventory of xai-org/x-algorithm

- SHA: a389166f6cf5da70a286b568c87695d4dcdce3a1
- Fetched at: 2026-08-13T21:03:23Z
- Method: read the public tree only. Did not infer private production systems.

Clone command: `git clone --depth 1 https://github.com/xai-org/x-algorithm.git vendor/x-algorithm`. `git -C vendor/x-algorithm rev-parse HEAD` is the SHA above. `git check-ignore -v vendor/x-algorithm` reports `.gitignore:5:vendor`.

## Deploy

- GitHub: https://github.com/mtrxdev/x-algorithm-public-wiki (public). Default branch is `feat/x-algorithm-public-wiki` — this worktree is not `main`.
- Production: https://x-algorithm-public-wiki.vercel.app
- Vercel project `x-algorithm-public-wiki` is linked to that repo, framework Next.js, root `.`, no env vars.

## Top-level map

Every row is from `ls -1 vendor/x-algorithm` plus opening that path's README or first source file. Runnable means a person can train or serve from *this* drop without internal X/xAI services, production data, or unpublished build files.

| Path | What the files themselves say it is | Runnable from this drop? | Notes / evidence file |
| --- | --- | --- | --- |
| README.md | "This repository contains the core code that determines which posts a viewer sees in the **For You** feed on X." | n/a | README.md:1–3. Latest update (lines 26–41) lists visibility filtering, labeling systems, Phoenix train/serve code, SimClusters, and scoring-weight config. |
| LICENSE | Apache License Version 2.0, January 2004. | n/a | LICENSE:1–3. README.md:467–469: "Licensed under the Apache License 2.0. See LICENSE." |
| CODE_OF_CONDUCT.md | One line: "Be excellent to each other." | n/a | CODE_OF_CONDUCT.md:1 |
| abuse-enforcement-service/ | README table: "Acts on model scores about an account rather than on events: labels it or its posts, challenges it, or suspends it." Server starts Kafka consumers via `xai_service_runner` and `xai_kafka`. Rules live in YAML loaded by `rules.rs`. | no | README.md:297. `server/src/main.rs` imports `xai_service_runner::ServerBuilder` and `start_kafka_consumers`. `service-lib/src/rules.rs`: `include_str!("../rules/enforcement_user.yaml")`. No Cargo.toml / pyproject in this folder. |
| adult-content/ | README table: "Trains and calibrates a classifier for adult media." `training.py` builds a Keras sequential classifier on embeddings. | no | README.md:283. `training.py:13–27` (`build_model`). Pants `BUILD` only; `training.py` imports `twitter.adult_content.dataset_utils`. No dataset or checkpoints in the drop. |
| agatha/ | README table: "Offline batch jobs that label an account from how others respond to its posts: blocks, reports and spam reports relative to favorites…" `LabelGenerator` is a Scalding `TypedPipe` trait. | no | README.md:280. `hub/agatha/labels/LabelGenerator.scala:6–9`. `hub/agatha/job/AgathaJobTemplates.scala` uses `scalding_internal`. No standalone launcher. |
| bdsm/ | README: "A sequence-of-actions transformer that detects inauthentic (bot / spam / coordinated) accounts…" Ships `runtime/`, `training/`, `proto/`, `rust/`, and `pyproject.toml`. | partial | `bdsm/README.md:1–5`, `pyproject.toml` name `bdsm`. Caveats: backing sequence store is not in the release; operating points in `runtime/sink_policy.yaml` are redacted as `9.99`; no `MANIFEST.json` / `backbone.npz` in the tree. |
| botmaker/ | README table: "That rule engine: the language rules are written in, its compiler, and its runtime." `Compiler.java` is the ANTLR-backed compiler; `BotMakerApp` runs expressions and checks packages. | no | README.md:296. `src/java/com/twitter/botmaker/compiler/Compiler.java`. Bazel `BUILD` files exist; no Cargo/pyproject; imports Twitter/Finatra runtime. |
| botmaker-rules/ | README table: "The rules `scarecrow` loads. To reduce the risk of gaming… some rules aren't currently in this repository." Checked-in files are `.bot` / `.df` under `scarecrow/`. | no | README.md:297. Example `scarecrow/bot/GroxTweetProcessor.bot` applies `RISKY_HIGH_VIZ_REPLY` when `healthSideEffectSubEvent == "groxScore"`. No runner in this folder. |
| candidate-pipeline/ | README table: "The framework `home-mixer` is built on. Defines the stage types — source, hydrator, filter, scorer, selector, side effect…" `candidate_pipeline.rs` names those `PipelineStage`s. | no | README.md:231, 457–461. `candidate_pipeline.rs:24–35`. No Cargo.toml. Uses `xai_stats_receiver`. |
| clip/ | README table: "Trains the image and text embedding model whose media embeddings the classifiers above take as input." `training.py`: "CLIP training on Twitter data" with required `--dataset_path` GCS TFRecords. | no | README.md:279. `training.py:18–35`. Pants `BUILD`; notebooks talk to GCS/BigQuery. |
| docs/ | Single example algorithm diff for the bidirectional follow boost. | n/a | `docs/BIDIRECTIONAL_BOOST_CHANGE.md:1–5`. README.md:393 points here as "what you would see as a param value changes over time." |
| grox/ | README table: "Runs as posts are published. Classifiers for categories such as spam, adult content and violent media…" `Engine` / `Dispatcher` load `grox.config.config`. Prompt loaders expect `.j2` templates that are not in the tree. | no | README.md:276. `core/engine.py:27–31`. `flows/ptos/prompts.py:11`: "prompts are excluded to reduce gameability." `find grox -name '*.j2'` is empty. |
| home-mixer/ | README table: "Builds the For You feed: the pipeline stages, the scoring weights, and calls other systems on the request path." `main.rs`: "HomeMixer gRPC Server" via `XServiceBuilder`. Weights in `params/param.rs`. | no | README.md:230. `main.rs:14–16` (`xai_x_service_builder`). `for_you_server.rs:28–36` runs `ForYouCandidatePipeline`. No Cargo.toml. |
| media-model-proxy/ | README.rst: "Media Model Proxy provides a proxy service to the DeepBird Prediction services operated by Media Understanding." Server object is `cortex-media-annotator-server`. | no | `README.rst:5–13`. `src/main/scala/.../app/Server.scala:22–26`. Bazel/Finatra; internal DeepBird/Blobstore. |
| phoenix/ | README: JAX ranking + retrieval; "this release ships the **production implementation itself**" plus nano configs and synthetic data so "the whole system runs end to end with nothing external." Cargo workspace + `pyproject.toml` + `QUICKSTART.md`. | yes | `phoenix/README.md:1–19`, `QUICKSTART.md:1–6`, `Cargo.toml`, `pyproject.toml`. Hardware: Linux, NVIDIA GPU, CUDA 12, uv, Python 3.11+, Rust, protoc (`QUICKSTART.md:10–14`). Not production data or scale. |
| phoenix-rankall/ | README table: "Maintains the index of posts Phoenix retrieval queries, updating it as events arrive." `main.rs` starts `xai-recsys-rankall` Kafka pipelines. | no | README.md:253. `src/main.rs:35–40`. No Cargo.toml at this path (Phoenix serving crates live under `phoenix/crates/`). |
| phoenix-rankall-strato/ | README table: "The event layer that determines which index a post belongs in, consulting visibility filtering first." `shouldDropPostByVF` in `lib/eventProcessing.strato` fetches `visibility/xai/shouldDropTweet` / `shouldDropTweetV2`. Processor columns insert Kafka indexing events. | no | README.md:254. `lib/eventProcessing.strato:247–264`. `columns/phoenix_rank_all/phoenixRankAllCandidateProcessor.strato:16–23`. Strato-only; no local runner. |
| pnsfwmedia/ | README table: "An adult-media classifier that combines CLIP media embeddings with account-level scores, including the calibrated score from `agatha`." Single Keras `Model` file. | no | README.md:284. `model_experimental.py:17–27`. Imports `twitter.deepbird.*`; no build file. |
| safety-label-user-agg/ | README table: "Labels an account for what its posts collected." Strato processor applies `postToUserLabelRules` on `TweetSafetyLabelEvent`. | no | README.md:298. `safetyLabelToUserLevelAggregationV2Processor.strato:7–26`. Three `.strato` files only. |
| scarecrow/ | README table: "Applies label rules to events as they happen. Embeds `botmaker` as its rule engine." `ScarecrowRuntime` wraps `ScarecrowBotMaker`. | no | README.md:295. `ScarecrowRuntime.scala:37–40`. `Server.scala:7–11` is a Finatra `BotMakerAppServer`. No BUILD/Cargo here. |
| simclusters/ | README table: "Clusters accounts and posts by who engages with what, then uses the clusters to find candidates." `SimClustersAnnServer` is a Finatra Thrift/gRPC server. | no | README.md:243. `simclustersann/SimclustersAnnServer.scala:26–39`. `simclusters_v2/` is batch/score types. No BUILD at folder root. |
| thunder/ | README table: "Holds recent posts in memory as they are published, and returns those from the accounts a viewer follows." `PostStore` + `InNetworkPostsService`. | no | README.md:241. `main.rs:26–35`; `thunder_service.rs:12–15`. No Cargo.toml. |
| under-the-hood/ | README: "Builds the per-account Under the Hood report: daily jobs collect the labels…" Public tool is https://x.com/i/under_the_hood. | no | README.md:301, 425–429. `scalding/UnderTheHoodCommon.scala`; `strato/columns/underTheHoodReport.strato:27–28` describes the GraphQL report. Batch + Strato only. |
| user-cred-v2/ | README table: "Runs PageRank over the follow graph and engagement edges, and turns the resulting mass into a per-account score." | no | README.md:282. `UserCredV2.scala:13–18` (`fromMass`). `UserCredV2App.scala:21–36` reads internal DAL datasets (`FlockFollowsJavaDataset`). |
| visibility-filtering/ | README table: "Determines whether a post is shown to a viewer. Rules in `rules/registry.rs`." Answers ALLOW / INTERSTITIAL / DROP. | no | README.md:294, 188–195. `main.rs:8–9` (`Visibility Filtering gRPC Server` via `XServiceBuilder`). `filter.rs:9–20`. No Cargo.toml. |
| visibility-filtering-client/ | README table: "The client callers use to reach visibility filtering, and the post safety-label types it answers with." | no | README.md:300. `vf_client.rs` talks to `VisibilityFilteringServiceClient` over gRPC/Strato. No Cargo.toml. |
| vm-ranker/ | README table: "The service `VMRanker` calls once posts are scored. It reorders them with a determinantal point process over their embeddings…" | no | README.md:264. `ranker_service.rs:18–21`; `dpp.rs:15–20`. No Cargo.toml. |

Build-manifest check (this clone): `Cargo.toml` exists only under `phoenix/` and `bdsm/rust/`. `pyproject.toml` exists only under `phoenix/` and `bdsm/`. Most other services import `xai_service_runner`, `xai_kafka`, Scalding, Strato, or Finatra and do not ship a workspace you can `cargo run` / `uv sync` from this drop — matching README.md:417–419.

## Candidate run items

Each row must quote a file. Reject a row if you only “know” it from news.

| Working title | Evidence path | Why a regular person could attempt it |
| --- | --- | --- |
| Proof-of-concept Phoenix train/serve on synthetic data | `phoenix/QUICKSTART.md:1–6`, `phoenix/QUICKSTART.md:18–54`, `phoenix/README.md:59–65`, `README.md:417–419` | README.md:419: "Where code is meant to be built and run, the relevant manifests are in the repo, e.g. `phoenix/` ships a Cargo workspace, a `pyproject.toml`, a quickstart and synthetic data generation, so a small model can be trained and served end-to-end." QUICKSTART.md:1–6: train, checkpoint, resume, serve, then retrieve→rank on synthetic data. `phoenix/reference/README.md` says that directory is "runnable end to end with zero production data." Needs the hardware listed under cannot-do. |

No other top-level folder ships a quickstart plus synthetic data. `bdsm/` has a `pyproject.toml` and training scripts, but `bdsm/README.md:82–86` says the backing sequence store is not part of the release and `runtime/sink_policy.yaml` redacts thresholds — that is reuse/limit, not a walk-up-and-run item.

## Candidate build/reuse items

| Working title | Evidence path | Why reuse is realistic |
| --- | --- | --- |
| Apache License 2.0 | `README.md:467–469`, `LICENSE:1–3` | README: "Licensed under the Apache License 2.0. See LICENSE." LICENSE is Apache 2.0 January 2004. A person can copy, modify, and redistribute under those terms. |
| Inspectable ranking/filter source a person can read and copy under that license | `README.md:417–419` | "All of the code here is inspectable, and some of the code is even designed to be runnable end-to-end — e.g. training and running the Phoenix scoring model." Source for ranking (`home-mixer/scorers/ranking_scorer.rs`, `phoenix/`), filters (`home-mixer/filters/`, `visibility-filtering/rules/registry.rs`), and labeling (`botmaker-rules/`, `grox/` minus prompts) is in the tree. |
| Scoring-weight configuration the README says was added | `README.md:30`, `README.md:330`, `home-mixer/params/param.rs:279–288` | README:30: "Adds key configuration parameters (including weights used to blend predicted action values into a score for a post)." README:330: "The weights are in `home-mixer/params/param.rs`." Opened file quotes: "These weights reflect a combination of how much an action is valued in ranking and typical propensities of these actions across the X network"; defaults include `FavoriteWeight` 0.5, `ReplyWeight` 5.0, `BidirectionalFollowReplyWeightBoost` 15.0. Arithmetic is in `home-mixer/scorers/ranking_scorer.rs` (`ScoringWeights`). |
| Published example of a ranking-param change over time | `docs/BIDIRECTIONAL_BOOST_CHANGE.md:1–11`, `README.md:393` | The doc is an example diff of the "bidirectional follow reply boost" and states the value moved through an A/B test to 20 then 15. Matches `BidirectionalFollowReplyWeightBoost` default `15.0` in `param.rs:285–288`. Useful as reuse of *how* weights are documented, not as a live experiment. |
| Visibility-filter rule list | `visibility-filtering/rules/registry.rs`, `README.md:378–381` | README:381: both rule sets "are listed in evaluation order in `visibility-filtering/rules/registry.rs`." The file defines `SafetyLevel::{FilterAll, TimelineHome, TimelineHomeRecommendations}` and imports drop/interstitial rules. A person can read the order and conditions; they cannot run the gRPC service from this drop. |
| BDSM model + training code (not the enforcement numbers) | `bdsm/README.md:1–40`, `bdsm/pyproject.toml`, `bdsm/README.md:104–112` | Code for the transformer, eight task heads, and `training/train_head.py` is present. README says policy *structure* is real; only operating points are withheld. Reuse means reading/adapting the model code, not shipping production enforcement. |

## Candidate cannot-do items

| Working title | Evidence path | Limit the file actually states |
| --- | --- | --- |
| Grox prompts and some botmaker rules are not published | `README.md:399–406`, `grox/flows/ptos/prompts.py:11` | README "What's not in this repo?": "there are a limited set of files not currently published in the repository, e.g.: Grox prompts. E.g. the j2 files with the specific LLM prompts used in Grox. Some botmaker rules." Confirmed in-tree: `prompts.py` says "prompts are excluded to reduce gameability"; `find grox -name '*.j2'` is empty. |
| Production data, checkpoints, orchestration, and scale are not included | `phoenix/QUICKSTART.md:3–6`, `phoenix/TRAINING.md:8–10`, `phoenix/README.md:12–16` | QUICKSTART.md:3–6: "It is not a production-quality model or a production-scale setup. Production data, checkpoints, orchestration, and scale are not included." TRAINING.md: "The shipped path is an offline verification harness." |
| Many services may lack build/deploy files | `README.md:417–419` | "Elsewhere, code may not necessarily include build- or deployment-related files or generally self-explanatory infrastructure imports (e.g. `xai_service_runner` or `xai_kafka`)." Confirmed: `home-mixer/main.rs`, `visibility-filtering/main.rs`, and `abuse-enforcement-service` import those crates; those folders have no `Cargo.toml`. |
| Phoenix quickstart needs Linux, NVIDIA GPU, CUDA 12, uv, Python 3.11+, Rust, protoc | `phoenix/QUICKSTART.md:10–14` | Requirements: "Linux with an NVIDIA GPU and CUDA 12"; "`uv` and Python 3.11 or newer"; "A Rust toolchain and `protoc` 3.15 or newer." |
| BDSM enforcement thresholds are redacted | `bdsm/README.md:104–112`, `bdsm/runtime/sink_policy.yaml` | README: thresholds "ship as an out-of-range `9.99` sentinel" because "Publishing exact operating points would hand adversaries the detector's evasion boundary." YAML values are `9.99` with note "Operating points are redacted in this export." |
| BDSM backing stores and weight files are not in the drop | `bdsm/README.md:82–86`, `bdsm/README.md:99–101` | "Those clients are included for completeness but the backing services are not part of this release." "Weight paths (`--backbone-dir`, `--head-checkpoint`) have no baked-in filesystem defaults." No `MANIFEST.json` / `backbone.npz` present. |
| This drop does not draw interstitials or assemble ads / Who to Follow | `README.md:211–212`, `README.md:132–137` | README: "nothing in this repository draws the interstitial." Blending adds "ads · Who to Follow · prompts" as sources *around* ranked posts; those source implementations are not separate top-level runnable drops. |
| Phoenix optimizer is not the internal production variant | `phoenix/README.md:17–19`, `phoenix/TRAINING.md:14–17` | "the dense-optimizer slot ships as standard AdamW rather than production's tuned internal variant." |

## Rejected ideas

| Idea | Why it is not in the article |
| --- | --- |
| Run the live For You feed | README.md:399–406 and `phoenix/QUICKSTART.md:3–6` say production data, unpublished Grox prompts / some botmaker rules, orchestration, and scale are not in this repo. Home Mixer / Thunder / visibility-filtering have no build manifests. The files contradict treating this clone as the live feed. |
| Train Phoenix as a production-quality recommender | QUICKSTART.md:169–170: "The nano models and synthetic data do not demonstrate recommendation quality, production performance, or scale." |
| Reconstruct unpublished Grox LLM prompts from `prompts.py` | Loaders only call missing `.j2` templates (`grox/flows/ptos/prompts.py`). The files do not contain the prompt text. |
| Publish BDSM operating points or claim they shipped | `sink_policy.yaml` is an explicit redaction sentinel, not a real threshold. |
| Game visibility filters or botmaker rules | Out of scope for this explainer; README.md:403–406 withholds some rules specifically "to reduce the risk of" gaming. Inventory may quote that limit, not give a how-to. |
| Claim CLIP / adult-content / Agatha / user-cred training is a walk-up run | Those trees need GCS/DAL/Scalding datasets and internal imports. No synthetic-data quickstart. |
| Infer private production ranking that is not in a file | Method line: public tree only. |

## Line-number notes for later excerpt extraction

Confirmed at `a389166f6cf5da70a286b568c87695d4dcdce3a1` (same as the plan's authoring SHA; ranges did not shift):

| Suggested excerpt id | Path | Lines | Paragraph |
| --- | --- | --- | --- |
| readme-lede | README.md | 1–3 | What this repo is |
| readme-phoenix-runnable | README.md | 417–419 | Phoenix manifests + end-to-end train/serve |
| readme-not-published | README.md | 399–406 | Grox prompts / some botmaker rules |
| readme-deployment | README.md | 417–419 | Inspectable; not every folder ships build files |
| phoenix-quickstart-limits | phoenix/QUICKSTART.md | 1–6 | Not production; no prod data |
| phoenix-quickstart-requirements | phoenix/QUICKSTART.md | 10–14 | Hardware/tooling |
| readme-license | README.md | 467–469 | Apache 2.0 |
| readme-inspectable | README.md | 417–419 | Same block as runnable/deployment |
| scoring-weights | home-mixer/params/param.rs | 279–288 | Favorite/Reply/bidirectional-follow defaults |
| grox-prompts-excluded | grox/flows/ptos/prompts.py | 11 | In-tree confirmation that j2 prompts are omitted |
| bdsm-thresholds-redacted | bdsm/README.md | 104–112 | 9.99 sentinel |

Do not extract those files in this inventory task. Task 5 copies excerpts with `scripts/extract-excerpt.ts`.

## Verification

- Tests: `npm test` pass (9/9) on 2026-08-13
- Verifier: `npm run verify` output: `manifest ok (checked against vendor clone)`
- Build: `npx next build` pass
- Browser desktop: Chrome DevTools MCP was unavailable (no Chrome at `/opt/google/chrome/chrome`). Used Playwright Chromium against the live Vercel URL, then again against `npx next start` after a CSS fix. Scrolled the article. Clicked all seven TOC anchors (`#what-x-released` through `#sources`); each heading entered the viewport. Confirmed 19 cards each have layman prose, a `<pre><code>` excerpt, and a citation. GET of 17 unique GitHub permalinks returned HTTP 200. Opened `/missing-page` (404 copy + “Back to the article”) and followed that link to `/`.
- Browser narrow: 390×844. On live Vercel the page was 476px wide and cropped the title (unconstrained `pre`/`code` plus `grid-template-columns: 1fr`). After `app/globals.css` (`minmax(0, 1fr)`, `min-width: 0`, `pre { max-width: 100% }`, `overflow-wrap: anywhere`) local recheck: `scrollWidth` 390, TOC `position: static` and stacked above the article (no overlap), cards single-column 350px, long excerpts scroll inside `pre` only. Clicked all seven TOC anchors again; all in view.
- Vercel URL: https://x-algorithm-public-wiki.vercel.app
- Review handoff: Step 4 (`requesting-code-review`) is not run in this task. The controller will run it as the whole-branch review after Steps 1–3.

## Redesign verification

- Date: 2026-08-13
- Branch: `feat/creator-longread-redesign` at `f8ed357` (`feat: add reduced-motion-safe chapter fades`) plus this note.
- Tests: `npm test` pass (12/12)
- Verifier: `npm run verify` output: `manifest ok (excerpt files present; vendor clone not present)`
- Build: `npm run build` pass (`/` and `/_not-found` static)
- Copy check: banned gaming verbs (`evade`, `farm`, `game the`, `boost your`, `get more reach`) do not appear in `content/article.mdx` or checklist labels. Eight chapter `h2`s: What this drop is; How a post is found; How it is scored; What can hide or cover it; What is missing; What you can actually run or reuse; How we checked; Sources. Cannot-do remains substantial (nine `LimitBlock`s, including a dedicated “What is missing” chapter).
- Browser: Chrome DevTools MCP is connected but has no Chrome at `/opt/google/chrome/chrome`. Used Playwright Chromium against local `npx next start` on `:3000`. Desktop 1280×800: no document overflow. Clicked all six checklist hashes (`#visibility-rules` … `#scoring-weights`) and all eight TOC hashes; each target entered the viewport (last headings sit at document end). Opened `/missing-page` (HTTP 404, “That page is not part of this report.” + “Back to the article”) and followed that link to `/`. Narrow 390×844: `scrollWidth` 390, TOC `position: static`, no page overflow; same checklist and TOC clicks. `prefers-reduced-motion: reduce`: all `.shell h2` stay `opacity: 1` / `transform: none`. Could not click in a real Chrome window.
- Deploy: `git push -u origin feat/creator-longread-redesign` (no `vercel --prod`, no `vendor/` upload). Vercel git-deploy of `f8ed357` completed as Preview. Default production branch remains `feat/x-algorithm-public-wiki`, so https://x-algorithm-public-wiki.vercel.app still serves the pre-redesign article. Preview URLs: https://x-algorithm-public-wiki-git-feat-creator-c36c56-matrx-fe91629e.vercel.app and https://x-algorithm-public-wiki-gfu9b5i8k-matrx-fe91629e.vercel.app — both redirect to Vercel SSO; not publicly fetchable. Dashboard: https://vercel.com/matrx-fe91629e/x-algorithm-public-wiki/FF89vAgHcjYTgF3ocmToUyZidQXB
- Review handoff: Task 6 Step 6 (`requesting-code-review` on the whole feature branch) is not run in this task. The controller will run that whole-branch review after Steps 1–5.

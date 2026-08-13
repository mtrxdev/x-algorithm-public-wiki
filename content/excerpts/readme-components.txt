### Home Mixer and Candidate Pipeline


| Component                                    | What it does                                                                                                                                                         |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`home-mixer/`](home-mixer/)                 | Builds the For You feed: the pipeline stages, the scoring weights, and calls other systems on the request path.                                                      |
| [`candidate-pipeline/`](candidate-pipeline/) | The framework `home-mixer` is built on. Defines the stage types — source, hydrator, filter, scorer, selector, side effect — and runs them, in parallel where it can. |




### Candidate Sources


| Component                        | What it does                                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [`thunder/`](thunder/)           | Holds recent posts in memory as they are published, and returns those from the accounts a viewer follows. |
| [`phoenix/`](phoenix/) retrieval | Embeds the viewer and each post as vectors, and returns the posts nearest the viewer.                     |
| [`simclusters/`](simclusters/)   | Clusters accounts and posts by who engages with what, then uses the clusters to find candidates.          |




### Retrieval Index


| Component                                            | What it does                                                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [`phoenix-rankall/`](phoenix-rankall/)               | Maintains the index of posts Phoenix retrieval queries, updating it as events arrive.                 |
| [`phoenix-rankall-strato/`](phoenix-rankall-strato/) | The event layer that determines which index a post belongs in, consulting visibility filtering first. |




### Ranking


| Component                      | What it does                                                                                                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`phoenix/`](phoenix/) ranking | Predicts how likely the viewer is to take each action on each post. Training and serving code, in JAX with a Rust serving layer.                                                                |
| [`vm-ranker/`](vm-ranker/)     | The service `VMRanker` calls once posts are scored. It reorders them with a determinantal point process over their embeddings, giving up a little score for less similarity between neighbours. |




### Content Understanding

These produce the scores and labels that Visibility Filtering reads.


| Component                                  | What it does                                                                                                                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`grox/`](grox/)                           | Runs as posts are published. Classifiers for categories such as spam, adult content and violent media, plus numeric representations of a post's text and images.                      |
| [`media-model-proxy/`](media-model-proxy/) | Serves the image and video models: adult content, violence and gore, hateful symbols, subject matter, and matching against known media.                                               |
| [`clip/`](clip/)                           | Trains the image and text embedding model whose media embeddings the classifiers above take as input.                                                                                 |
| [`agatha/`](agatha/)                       | Offline batch jobs that label an account from how others respond to its posts: blocks, reports and spam reports relative to favorites, plus spam-suspension and adult-content labels. |
| [`bdsm/`](bdsm/)                           | Reads the sequence of actions an account takes over time to identify signs of inauthentic or abusive behavior.                                                                        |
| [`user-cred-v2/`](user-cred-v2/)           | Runs PageRank over the follow graph and engagement edges, and turns the resulting mass into a per-account score.                                                                      |
| [`adult-content/`](adult-content/)         | Trains and calibrates a classifier for adult media.                                                                                                                                   |
| [`pnsfwmedia/`](pnsfwmedia/)               | An adult-media classifier that combines CLIP media embeddings with account-level scores, including the calibrated score from `agatha`.                                                |




### Visibility Filtering


| Component                                                      | What it does                                                                                                                                                                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`visibility-filtering/`](visibility-filtering/)               | Determines whether a post is shown to a viewer. Rules in [`rules/registry.rs`](visibility-filtering/rules/registry.rs).                                                                                       |
| [`scarecrow/`](scarecrow/)                                     | Applies label rules to events as they happen. Embeds `botmaker` as its rule engine.                                                                                                                           |
| [`botmaker/`](botmaker/)                                       | That rule engine: the language rules are written in, its compiler, and its runtime.                                                                                                                           |
| [`botmaker-rules/`](botmaker-rules/)                           | The rules `scarecrow` loads. To reduce the risk of gaming to circumvent these systems, some rules aren't currently in this repository.                                                                        |
| [`abuse-enforcement-service/`](abuse-enforcement-service/)     | Acts on model scores about an account rather than on events: labels it or its posts, challenges it, or suspends it.                                                                                           |
| [`safety-label-user-agg/`](safety-label-user-agg/)             | Labels an account for what its posts collected.                                                                                                                                                               |
| [`visibility-filtering-client/`](visibility-filtering-client/) | The client callers use to reach visibility filtering, and the post safety-label types it answers with.                                                                                                        |
| [`under-the-hood/`](under-the-hood/)                           | Builds the per-account [Under the Hood](#under-the-hood-label-transparency-tool) report: daily jobs collect the labels applied to an account and its posts, which the serving layer aggregates over a period. |

export type Citation = {
  id: string;
  repo: "xai-org/x-algorithm";
  commit: string;
  path: string;
  start_line: number;
  end_line: number;
  excerpt_file: string;
};

export type Manifest = {
  repo: "xai-org/x-algorithm";
  commit: string;
  fetched_at: string;
  citations: Citation[];
};

export type VerifyError = {
  code:
    | "missing_excerpt"
    | "missing_citation"
    | "excerpt_mismatch"
    | "invalid_range"
    | "article_unknown_id";
  message: string;
};

export type VerifyResult = {
  ok: boolean;
  errors: VerifyError[];
  vendorPresent: boolean;
};

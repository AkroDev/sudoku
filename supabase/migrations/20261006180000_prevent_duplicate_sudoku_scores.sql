create unique index if not exists sudoku_completions_user_puzzle_unique_idx
  on public.sudoku_completions (user_id, puzzle_id);

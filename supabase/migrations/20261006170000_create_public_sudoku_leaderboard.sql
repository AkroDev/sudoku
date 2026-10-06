create or replace view public.sudoku_leaderboard as
select
  puzzle_id,
  difficulty,
  final_time_seconds,
  errors,
  notes_used,
  highlight_same,
  check_errors,
  completed_at
from public.sudoku_completions;

grant select on public.sudoku_leaderboard to anon, authenticated;

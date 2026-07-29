-- Public write for go_mo (server actions use anon key; service role optional)
drop policy if exists go_mo_dedications_public_insert on public.go_mo_dedications;
create policy go_mo_dedications_public_insert
  on public.go_mo_dedications
  for insert
  to anon, authenticated
  with check (
    char_length(devotee_name) between 1 and 80
    and session_count >= 0 and session_count <= 100000
    and day_count >= 0 and day_count <= 100000
    and (wish is null or char_length(wish) <= 500)
  );

drop policy if exists go_mo_daily_scores_public_insert on public.go_mo_daily_scores;
create policy go_mo_daily_scores_public_insert
  on public.go_mo_daily_scores
  for insert
  to anon, authenticated
  with check (
    char_length(client_key) between 8 and 80
    and strike_count >= 0 and strike_count <= 1000000
    and (display_name is null or char_length(display_name) <= 80)
  );

drop policy if exists go_mo_daily_scores_public_update on public.go_mo_daily_scores;
create policy go_mo_daily_scores_public_update
  on public.go_mo_daily_scores
  for update
  to anon, authenticated
  using (true)
  with check (
    strike_count >= 0 and strike_count <= 1000000
    and (display_name is null or char_length(display_name) <= 80)
  );

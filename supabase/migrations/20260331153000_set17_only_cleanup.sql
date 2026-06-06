begin;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'puzzles'
          and column_name = ('ion' || 'ia_path_id')
    ) and not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'puzzles'
          and column_name = 'featured_path_id'
    ) then
        execute 'alter table public.puzzles rename column '
            || quote_ident('ion' || 'ia_path_id')
            || ' to '
            || quote_ident('featured_path_id');
    end if;
end
$$;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'puzzles'
          and column_name = ('void' || '_mod_ids')
    ) and not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'puzzles'
          and column_name = 'featured_mod_ids'
    ) then
        execute 'alter table public.puzzles rename column '
            || quote_ident('void' || '_mod_ids')
            || ' to '
            || quote_ident('featured_mod_ids');
    end if;
end
$$;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'puzzles'
          and column_name = 'featured_mod_ids'
    ) then
        alter table public.puzzles
            alter column featured_mod_ids set default '{}'::text[];
    end if;
end
$$;

delete from public.puzzle_votes
where augment_id ilike ('TFT' || '16' || '_%');

delete from public.user_puzzle_attempts
where user_pick_id ilike ('TFT' || '16' || '_%')
   or coalesce(pro_pick_id, '') ilike ('TFT' || '16' || '_%');

delete from public.champions
where id ilike ('TFT' || '16' || '_%');

delete from public.traits
where id ilike ('TFT' || '16' || '_%');

delete from public.items
where id ilike ('TFT' || '16' || '_%');

delete from public.augments
where id ilike ('TFT' || '16' || '_%');

delete from public.items
where deleted_at is not null
  and coalesce(icon, '') ilike ('%' || 'set' || '16' || '%');

delete from public.augments
where deleted_at is not null
  and coalesce(icon, '') ilike ('%' || 'set' || '16' || '%');

commit;

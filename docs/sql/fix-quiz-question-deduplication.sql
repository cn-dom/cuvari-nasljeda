-- Fix duplicate detection for Croatian, city, and daily quiz rounds.
-- The previous function stored a double-escaped whitespace regex, so tabs,
-- repeated spaces, and line breaks were not normalized before deduplication.
-- Applied to Supabase project azerctpwfzdivydsxyex.

CREATE OR REPLACE FUNCTION private.start_quiz_attempt(p_quiz_type text, p_category text DEFAULT NULL::text, p_city_slug text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid := auth.uid();
  v_attempt uuid := gen_random_uuid();
  v_ids uuid[];
  v_questions jsonb;
begin
  if v_user is null then
    raise exception 'Za pokretanje kviza moraš biti prijavljen.';
  end if;
  if p_quiz_type not in ('croatian','city','daily') then
    raise exception 'Nepoznata vrsta kviza.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text || ':' || p_quiz_type || ':' || coalesce(p_category, p_city_slug, ''), 0));

  if p_quiz_type = 'city' then
    select array_agg(id order by random()) into v_ids
    from (
      select id
      from (
        select q.id,
          row_number() over (
            partition by lower(regexp_replace(trim(q.question), E'\\s+', ' ', 'g'))
            order by random()
          ) as duplicate_rank
        from public.city_questions q
        join public.cities c on c.id = q.city_id
        where q.active and c.active and c.slug = p_city_slug
      ) deduplicated
      where duplicate_rank = 1
      order by random()
      limit 10
    ) picked;
  elsif p_quiz_type = 'croatian' then
    select array_agg(id order by random()) into v_ids
    from (
      select id
      from (
        select q.id,
          row_number() over (
            partition by lower(regexp_replace(trim(q.question), E'\\s+', ' ', 'g'))
            order by random()
          ) as duplicate_rank
        from public.quiz_questions q
        where q.active and (p_category is null or q.category = p_category)
      ) deduplicated
      where duplicate_rank = 1
      order by random()
      limit 10
    ) picked;
  else
    select array_agg(id order by random()) into v_ids
    from (
      select id
      from (
        select q.id,
          row_number() over (
            partition by lower(regexp_replace(trim(q.question), E'\\s+', ' ', 'g'))
            order by random()
          ) as duplicate_rank
        from public.quiz_questions q
        where q.active
      ) deduplicated
      where duplicate_rank = 1
      order by random()
      limit 10
    ) picked;
  end if;

  if coalesce(array_length(v_ids, 1), 0) < 10 then
    raise exception 'Nema dovoljno aktivnih, jedinstvenih pitanja za ovaj kviz.';
  end if;

  if p_quiz_type = 'city' then
    select jsonb_agg(
      jsonb_build_object(
        'id', q.id,
        'category', q.category,
        'question', q.question,
        'answers', jsonb_build_array(q.answer_a, q.answer_b, q.answer_c, q.answer_d),
        'sourceUrl', q.source_url
      )
      order by array_position(v_ids, q.id)
    )
    into v_questions
    from public.city_questions q
    where q.id = any(v_ids);
  else
    select jsonb_agg(
      jsonb_build_object(
        'id', q.id,
        'category', q.category,
        'question', q.question,
        'answers', jsonb_build_array(q.answer_a, q.answer_b, q.answer_c, q.answer_d),
        'sourceUrl', q.source_url
      )
      order by array_position(v_ids, q.id)
    )
    into v_questions
    from public.quiz_questions q
    where q.id = any(v_ids);
  end if;

  insert into public.quiz_attempts(id, user_id, quiz_type, category, city_slug, question_ids)
  values (v_attempt, v_user, p_quiz_type, p_category, p_city_slug, v_ids);

  return jsonb_build_object('attemptId', v_attempt, 'questions', coalesce(v_questions, '[]'::jsonb));
end
$function$;

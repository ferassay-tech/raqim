-- Corrective fix for 20260810120001: resolve_download_token() and
-- record_download_token_use() both call pgcrypto's digest() internally,
-- but this project installs pgcrypto's functions into the `extensions`
-- schema (confirmed via pg_proc), not `public`. Both functions were
-- declared with `set search_path = public` — copied from
-- current_admin_role()/record_content_history(), which never needed
-- pgcrypto — so `digest(...)` was unresolvable and every call failed with
-- "function digest(text, unknown) does not exist" (42883), confirmed live
-- via a read-only diagnostic RPC call.
--
-- Fix: add `extensions` to the search_path. `extensions` is an
-- admin-controlled schema (not writable by anon/authenticated), so this
-- does not reopen the search-path-hijacking risk `set search_path` exists
-- to guard against on a SECURITY DEFINER function — it only makes
-- pgcrypto's own functions resolvable again.
--
-- Bodies are otherwise byte-identical to 20260810120001 — no table, RLS,
-- grant, or logic change.

create or replace function public.resolve_download_token(p_token text)
returns table (order_id text, file_ids jsonb)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text := encode(digest(p_token, 'sha256'), 'hex');
begin
  return query
    select dt.order_id, dt.file_ids
    from public.download_tokens dt
    where dt.token_hash = v_hash
      and dt.disabled = false
      and (dt.expires_at is null or dt.expires_at > now())
      and (dt.max_downloads is null or dt.download_count < dt.max_downloads);
end;
$$;

create or replace function public.record_download_token_use(p_token text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text := encode(digest(p_token, 'sha256'), 'hex');
begin
  update public.download_tokens
     set download_count = download_count + 1,
         last_downloaded_at = now()
   where token_hash = v_hash
     and disabled = false
     and (expires_at is null or expires_at > now())
     and (max_downloads is null or download_count < max_downloads);
end;
$$;

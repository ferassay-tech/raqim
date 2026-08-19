-- Phase 7 follow-up: set_admin_notification_preference() was created in
-- 20260819130001 with only `revoke all ... from public; grant ... to
-- authenticated;` — unlike every other new write-RPC from this same
-- session (restore_admin_invitation / delete_admin_invitation /
-- set_user_permission_override, all in 20260818180001), which additionally
-- revoke execute from anon explicitly. Supabase grants anon EXECUTE
-- directly at function-creation time (via default privileges), independent
-- of the PUBLIC pseudo-role grant, so `revoke ... from public` alone does
-- not remove it — confirmed live: anon still had EXECUTE after 20260819130001
-- was applied. The function's own internal owner-only check already blocks
-- an anon caller (current_admin_role() resolves off auth.uid(), null for
-- anon), so this is a defense-in-depth correction, not a fix for an
-- exploitable gap.

revoke execute on function public.set_admin_notification_preference(uuid, text, boolean) from anon;

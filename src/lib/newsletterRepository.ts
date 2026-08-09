import { getSupabaseClient } from "./supabaseClient";

export interface NewsletterSubscribeResult {
  /** True when this email was already on the list — not an error, just
   * nothing new to do. */
  alreadySubscribed: boolean;
}

/**
 * Plain insert, no `.select()` — same reasoning as insertConversation()
 * in admin/context/messagesRepository.ts: anon has no SELECT policy on
 * newsletter_subscribers, so an INSERT ... RETURNING would satisfy the
 * INSERT policy and then fail purely on the read-back. email is the
 * table's primary key, so a duplicate subscription surfaces as a
 * distinct, recognizable Postgres conflict (23505) rather than a
 * generic failure — the caller treats that as a soft success, not an
 * error, since "you're already subscribed" isn't a failure for the visitor.
 */
export async function subscribeToNewsletter(email: string): Promise<NewsletterSubscribeResult> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });

  if (error) {
    if (error.code === "23505") return { alreadySubscribed: true };
    throw error;
  }

  return { alreadySubscribed: false };
}

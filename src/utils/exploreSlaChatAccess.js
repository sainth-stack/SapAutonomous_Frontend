/** Hide Explore SLA floating chat on self-monitoring for specific accounts. */

const EXPLORE_SLA_CHAT_DISABLED_EMAILS = ['dmancuso2@luxotticaretail.com'];

export function canShowExploreSlaChatBot(user) {
  try {
    const email = (user?.email || '').trim().toLowerCase();
    if (!email) return true;
    return !EXPLORE_SLA_CHAT_DISABLED_EMAILS.some(
      (disabled) => disabled.toLowerCase() === email
    );
  } catch {
    return true;
  }
}

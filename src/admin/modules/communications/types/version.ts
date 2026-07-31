/** One immutable snapshot, taken at publish time. Generic so both
 * CommunicationTemplate and CommunicationTheme (and anything else
 * versionable added later) reuse the same shape instead of each declaring
 * their own history record. */
export interface EntityVersion<TContent> {
  id: string;
  entityId: string;
  version: number;
  content: TContent;
  publishedAt: string;
  publishedBy: string;
}

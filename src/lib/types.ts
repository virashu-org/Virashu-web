export type Vertical = {
  name: string;
  /** "operating" means a live business today; "mandate" means the company is chartered to pursue it. */
  status: 'operating' | 'mandate';
  summary: string;
  /** The clause of the Memorandum this vertical is drawn from. */
  objectClause: string;
  items: string[];
};

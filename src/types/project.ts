import { Property } from './property';
import { Unit } from './unit';
import { ComparisonRates } from './comparison';

export interface Project {
  id: string;
  name: string;
  description?: string;
  property: Property;
  units: Unit[];
  comparison: ComparisonRates;
  createdAt: string;
  updatedAt: string;
  isShared?: boolean;
}

export interface ProjectListItem {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

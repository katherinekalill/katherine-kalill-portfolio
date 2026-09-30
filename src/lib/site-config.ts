import siteData from '../data/site.json';
import { siteSchema } from './content/schema';

export const siteConfig = siteSchema.parse(siteData);

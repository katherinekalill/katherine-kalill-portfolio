import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { projectSchema } from './lib/content/schema';

const projects = defineCollection({
  loader: file('./src/data/projects.json'),
  schema: projectSchema,
});

export const collections = { projects };

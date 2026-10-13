import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';
import { sanityClient } from 'sanity:client';

const builder = createImageUrlBuilder(sanityClient);

/** Build a Sanity CDN image URL with transforms, e.g. `urlFor(image).width(800).url()`. */
export const urlFor = (source: SanityImageSource) => builder.image(source);

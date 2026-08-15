import { revalidateTag } from 'next/cache';
import { CONTENT_TAG } from './data';

/** Admin bir kayıt değiştirdiğinde genel sayfaların önbelleğini tazeler. */
export function revalidateContent(): void {
  revalidateTag(CONTENT_TAG);
}

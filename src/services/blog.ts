import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  publishedAt: Date
  author: string
  tags: string[]
  published: boolean
}

export async function getPosts(
  pageSize = 10,
  lastDoc?: DocumentSnapshot
): Promise<{ posts: BlogPost[]; lastDoc: DocumentSnapshot | null }> {
  const ref = collection(db, 'blog-posts')
  const constraints = [
    where('published', '==', true),
    orderBy('publishedAt', 'desc'),
    limit(pageSize),
  ]
  if (lastDoc) constraints.push(startAfter(lastDoc) as any)

  const snapshot = await getDocs(query(ref, ...constraints as any))
  const posts = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    publishedAt: d.data().publishedAt?.toDate() ?? new Date(),
  })) as BlogPost[]

  return {
    posts,
    lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const ref = collection(db, 'blog-posts')
  const snapshot = await getDocs(
    query(ref, where('slug', '==', slug), where('published', '==', true), limit(1))
  )
  if (snapshot.empty) return null
  const d = snapshot.docs[0]
  return {
    id: d.id,
    ...d.data(),
    publishedAt: d.data().publishedAt?.toDate() ?? new Date(),
  } as BlogPost
}

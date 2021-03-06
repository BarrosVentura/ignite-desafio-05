import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { PrismicDocument, Query } from '@prismicio/types';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function createPostObject(post: PrismicDocument): Post {
  return {
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      author: post.data.author,
      subtitle: post.data.subtitle,
      title: post.data.title,
    },
  };
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [paginationContent, setPaginationContent] = useState<PostPagination>();

  async function handleLoadMore(): Promise<void> {
    try {
      const nextPageUrl = paginationContent
        ? paginationContent.next_page
        : postsPagination.next_page;
      const data = await fetch(nextPageUrl);
      const result: Query<PrismicDocument> = await data.json();
      const posts: Post[] = result.results.map(post => {
        return createPostObject(post);
      });
      if (paginationContent) {
        return setPaginationContent({
          next_page: result.next_page,
          results: [...paginationContent.results, ...posts],
        });
      }
      return setPaginationContent({
        next_page: result.next_page,
        results: posts,
      });
    } catch (err) {
      /* eslint-disable-next-line */
      return console.log(err);
    }
  }

  function getLinkComponent(post: Post): JSX.Element {
    return (
      <Link key={post.uid} href={`/post/${post.uid}`}>
        <a key={post.uid} className={styles.card}>
          <h2>{post.data.title}</h2>
          <p>{post.data.subtitle}</p>
          <div className={styles.subcontent}>
            <time>
              <FiCalendar />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <span>
              <FiUser />
              {post.data.author}
            </span>
          </div>
        </a>
      </Link>
    );
  }

  function shouldShowLoadButton(): boolean {
    return !!(
      (postsPagination.next_page && !paginationContent) ||
      paginationContent?.next_page
    );
  }

  return (
    <div className={commonStyles.container}>
      {postsPagination.results.map(post => getLinkComponent(post))}
      {paginationContent?.results.map(post => getLinkComponent(post))}
      {shouldShowLoadButton() && (
        <button
          type="button"
          className={styles.loadMore}
          onClick={handleLoadMore}
        >
          Carregar mais posts
        </button>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 5,
  });
  const posts: Post[] = postsResponse.results.map(post => {
    return createPostObject(post);
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};

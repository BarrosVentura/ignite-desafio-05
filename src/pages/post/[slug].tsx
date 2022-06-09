import { asHTML } from '@prismicio/helpers';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: string;
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Carregando...</div>;
  }
  return (
    <div>
      <div className={styles.bannerContainer}>
        <img src={post.data.banner.url} alt="" />
      </div>
      <article className={`${commonStyles.container} ${styles.container}`}>
        <h1>{post.data.title}</h1>
        <div className={styles.detailsContainer}>
          <time>
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </time>
          <span>{post.data.author}</span>
          <span>tempo de leitura</span>
        </div>
        {post.data.content.map(item => (
          <div key={item.heading}>
            <h2>{item.heading}</h2>
            <div
              className={styles.bodyContainer}
              /* eslint-disable-next-line */
              dangerouslySetInnerHTML={{ __html: item.body }}
            />
          </div>
        ))}
      </article>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');
  const path = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths: path,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const postUid: string = !Array.isArray(params.slug) ? params.slug : '';
  const response = await prismic.getByUID('posts', postUid);
  const { content } = response.data;
  const post: Post = {
    first_publication_date: response.first_publication_date,
    data: {
      author: response.data.author,
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      content: content.map(item => {
        return {
          heading: item.heading,
          body: asHTML(item.body),
        };
      }),
    },
  };

  return {
    props: { post },
  };
};

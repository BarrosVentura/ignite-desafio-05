import { asHTML, asText } from '@prismicio/helpers';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

function getCountedWords(post: Post): number | null {
  if (!Array.isArray(post?.data.content)) return null;
  const { content } = post.data;

  const counterLettersFromBody = content.reduce((prevContent, currContent) => {
    const bodyAsText = asText(currContent.body);
    const headingAsText = currContent.heading;
    const fullContent = bodyAsText.concat(headingAsText);
    const filteredBodyText = fullContent.replace(/[\\n|\n]/gm, '');
    const lettersLength = filteredBodyText.split(' ').length;
    return prevContent + lettersLength;
  }, 0);

  return counterLettersFromBody;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  const counterLettersFromBody = getCountedWords(post);
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
            <FiCalendar />
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </time>
          <span>
            <FiUser />
            {post.data.author}
          </span>
          <span>
            <FiClock />
            {Math.ceil(counterLettersFromBody / 200)} min
          </span>
        </div>
        {post.data.content.map(item => (
          <div key={item.heading}>
            <h2>{item.heading}</h2>
            <div
              className={styles.bodyContainer}
              /* eslint-disable-next-line */
              dangerouslySetInnerHTML={{ __html: asHTML(item.body) }}
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
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: content.map(item => {
        return {
          body: item.body,
          heading: item.heading,
        };
      }),
    },
  };

  return {
    props: { post },
  };
};

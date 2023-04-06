import Head from "next/head";
export default function Metatags({
  title = "Blogsite",
  description = "Write short blog posts and browse others' posts!",
  image = "https://i.kym-cdn.com/entries/icons/original/000/032/280/meme1.jpg",
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@gybau" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
    </Head>
  );
}

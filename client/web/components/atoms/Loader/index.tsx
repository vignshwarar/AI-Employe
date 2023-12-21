import Head from "next/head";

import * as S from "./styles";

export default function Home() {
  return (
    <S.LoaderWrapper>
      <Head>
        <title>AIEmploye</title>
      </Head>
      <S.Loader />
    </S.LoaderWrapper>
  );
}

import * as S from "./styles";

export default function DashboardLoader() {
  return (
    <S.LoaderWrapper
      style={{
        width: "100%",
        height: "60vh",
      }}
    >
      hello
      <S.Loader />
    </S.LoaderWrapper>
  );
}

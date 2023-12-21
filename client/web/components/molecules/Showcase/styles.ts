import styled from "@emotion/styled";

export const ShowcaseContainer = styled.div`
  margin-top: 72px;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  border-radius: 8px;

  svg {
    width: 100%;
    max-height: 400px;
  }
`;

export const BlurryBackground = styled.div`
  width: 100%;
  height: 200px;
  background: black;
  position: absolute;
  bottom: -60px;
  filter: blur(50px);
`;

export const VideoMetaWrapper = styled.div`
  background: #1e1e1e;
  border: 1px solid #3e3e3e;
  margin: 0 16px 16px 0;
  border-radius: 8px;
  padding: 8px 8px 8px 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    border: 1px solid #fff;
    background: #3e3e3e;
  }
`;

export const VideoMetaTitle = styled.div`
  display: flex;
  align-items: center;
  p {
    font-size: 12px;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 200px;
  }
`;

export const MetaWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

export const VideoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  svg {
    width: 16px;
    height: 16px;
    fill: white;
    stroke: white;
  }
`;

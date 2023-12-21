import styled from "@emotion/styled";

export const SignInContainer = styled.div`
  width: 100%;
`;

export const ModalTitle = styled.h2`
  color: white;
  font-size: 18px;
  font-weight: 400;
`;

export const ModalDescription = styled.p``;

export const InputContainer = styled.div``;

export const SignInModalIcon = styled.div`
  width: 70px;
  height: 70px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 28px;

  svg {
    path,
    line,
    polyline {
      stroke: rgba(255, 255, 255, 0.3);
    }
  }
`;

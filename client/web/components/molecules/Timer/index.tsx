import { useState, useEffect } from "react";

import * as S from "./styles";

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const date = new Date("December 26, 2023 00:00:00").getTime();
    const timeLeftInSeconds = (date - new Date().getTime()) / 1000;
    setTimeLeft(timeLeftInSeconds);
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(timeLeft / (24 * 60 * 60));
  const hours = Math.floor((timeLeft / (60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 60) % 60);
  const seconds = Math.floor(timeLeft % 60);

  return (
    <S.TimerContainer>
      <S.DealEndsSoon>
        <S.ThinLine
          initial={{
            background:
              "radial-gradient( 0% 0% at 50% 100%,#fff 0%,rgba(255, 255, 255, 0) 100%)",
          }}
          animate={{
            background:
              "radial-gradient( 50% 30% at 50% 100%,#fff 0%,rgba(255, 255, 255, 0) 100%)",
          }}
          transition={{ duration: 1, delay: 1 }}
        />
        <p>Lifetime Deal ends in</p>
      </S.DealEndsSoon>

      <S.Timer>
        <S.TimerItem>
          <S.TimerItemValue>{days}</S.TimerItemValue>
          <S.TimerItemLabel>Days</S.TimerItemLabel>
        </S.TimerItem>
        <S.Colon>
          <p>:</p>
        </S.Colon>
        <S.TimerItem>
          <S.TimerItemValue>{hours}</S.TimerItemValue>
          <S.TimerItemLabel>Hours</S.TimerItemLabel>
        </S.TimerItem>
        <S.Colon>
          <p>:</p>
        </S.Colon>
        <S.TimerItem>
          <S.TimerItemValue>{minutes}</S.TimerItemValue>
          <S.TimerItemLabel>Minutes</S.TimerItemLabel>
        </S.TimerItem>
        <S.Colon>
          <p>:</p>
        </S.Colon>
        <S.TimerItem>
          <S.TimerItemValue>{seconds}</S.TimerItemValue>
          <S.TimerItemLabel>Seconds</S.TimerItemLabel>
        </S.TimerItem>
      </S.Timer>
    </S.TimerContainer>
  );
};

export default Timer;

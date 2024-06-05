import React, { useEffect, useState } from "react";

type Props = {
  children: any;
};
const Loader = ({ children }: Props) => {
  const [isVisible, setVisible, fadeProps] = useFade();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setVisible(true), []);
  return (
    <>
      {!isVisible && (
        <div className="app-loader-wrapper" {...fadeProps}>
          <span className="app-loader"></span>
        </div>
      )}
      <div
        style={{
          visibility: !isVisible ? "hidden" : "visible",
          minHeight: '100%',
          height: '100%'
        }}
      >
        {children}
      </div>
    </>
  );
};

export default Loader;

const useFade = (initial?: boolean) => {
  const [show, setShow] = useState(initial);
  const [isVisible, setVisible] = useState(show);

  useEffect(() => {
    if (show) setVisible(true);
  }, [show]);

  const onAnimationEnd = () => {
    if (!show) setVisible(false);
  };

  const style = { animation: `${show ? "appFadeIn" : "appFadeOut"} .3s` };

  const fadeProps = {
    style,
    onAnimationEnd,
  };

  return [isVisible, setShow, fadeProps] as [
    boolean,
    (b: boolean) => void,
    any
  ];
};

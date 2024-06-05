import React, { FC} from "react";
import * as cookie from "cookie";

import { GetServerSideProps } from "next/types";

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const { from } = context.query;

	const cookieStr = cookie.serialize("t", "", {
		path: "/",
	});
	context.res.setHeader("Set-Cookie", cookieStr);

  return {
		redirect: {
			destination: from as string || '/',
			permanent: false,
		}
	};
};

const Logout: FC = () => {
 
  return (
    <div></div>
  );
};

export default Logout;

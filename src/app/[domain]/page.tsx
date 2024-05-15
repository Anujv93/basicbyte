import React from "react";

type Props = {
  params: {
    domain: String;
  };
};

const Page = ({ params }: Props) => {
  return <div>{`Page ${params.domain}`}</div>;
};

export default Page;

import { useEffect } from "react";
import { SHOPIFY_QUERY, OPTIMIZE_MUTATION } from "~/graphql/query";
import { useQuery, useMutation } from "@apollo/client";
import { truncate } from "~/utils";
import { useState } from "react";

export const useOptimize = ({ accessToken }) => {
  const [toast, setToast] = useState("");
  const [queryInput, setQueryInput] = useState({});
  const { loading, error, data, refetch } = useQuery(SHOPIFY_QUERY, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: JSON.stringify(queryInput),
      merchantAccessToken: accessToken,
    },
  });
  const [optimizeMutation, { loading: optimizing }] = useMutation(
    OPTIMIZE_MUTATION,
    {
      onCompleted: () => {
        setQueryInput({});
        refetch();
      },
    }
  );
  const handleGetListFailure = () => {
    setToast("Get list failure");
    setQueryInput({});
  };

  let dataParsed =
    data && data.shopifyQuery ? JSON.parse(data && data.shopifyQuery) : false;

  const handleOptimize = (file) => {
    optimizeMutation({
      variables: {
        id: file.id,
        merchantAccessToken: accessToken,
      },
    });
  };
  useEffect(() => {
    if (error || (data && !data.shopifyQuery)) {
      handleGetListFailure();
    }
  }, [data, error]);
  const pageInfo = dataParsed?.files?.pageInfo || false;
  const handleNext = () => {
    console.log("nexx", pageInfo);
    if (pageInfo && pageInfo.endCursor)
      setQueryInput({ afterPage: pageInfo.endCursor });
  };
  const handlePrevious = () => {
    if (pageInfo && pageInfo.startCursor)
      setQueryInput({ beforePage: pageInfo.startCursor });
  };
  console.log("pageInfopageInfo", pageInfo);

  return {
    optimizing,
    loading,
    error,
    data,
    toast,
    setToast,
    dataParsed,
    handleOptimize,
    pageInfo,
    handlePrevious,
    handleNext,
  };
};

import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useState } from "react";
import { MdArrowForward, MdAutoFixHigh, MdHistory } from "react-icons/md";

import Button from "../components/Inputs/Button";
import TextField from "../components/Inputs/TextField";
import ImageList from "../components/Layout/ImageList";
import StyleList from "../components/Layout/StyleList";
import { createImageLoadingTexts as loadingTexts } from "../data/loading-texts";
import { imageStyles } from "../data/styles";
import { fetchPosts } from "../helpers/fetch";
import { createPost } from "../helpers/mutate";

export default function Create() {
  //#region Hooks

  const [prompt, setPrompt] = useState<string>("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [loadingText, setLoadingText] = useState<string>(loadingTexts.start);

  const {
    data: recentPosts,
    isLoading: areRecentPostsLoading,
    refetch: refetchRecentPosts,
  } = useQuery(
    ["recent_posts"],
    // TODO: Pass in the correct function once the API is ready.
    fetchPosts
  );
  const { mutate: create, isLoading: isCreating } = useMutation(createPost, {
    onSuccess: async () => {
      await refetchRecentPosts();
    },
  });

  // Dynamically change the loading text.
  useEffect(() => {
    if (isCreating) {
      setLoadingText(loadingTexts.start);
      const timeout1 = setTimeout(() => {
        setLoadingText(loadingTexts.dream);
      }, 2000);
      const timeout2 = setTimeout(() => {
        setLoadingText(loadingTexts.final);
      }, 5000);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
  }, [isCreating]);

  //#endregion

  //#region Handlers

  const handlePromptChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrompt(value);

    // TODO: Should we do this?
    // Change the order of the styles based on if the style was already typed in the prompt.
    // It should appear last if it was already typed.
    // if (value.trim() !== prompt) {
    //   const newStyles = [...styles];
    //   const index = newStyles.findIndex((s) =>
    //     value.trim().toLowerCase().includes(s.trim().toLowerCase())
    //   );
    //   if (index !== -1) {
    //     newStyles.push(newStyles.splice(index, 1)[0]);
    //     setStyles(newStyles);
    //   }
    // }
  };

  const handleCreate = () => {
    let finalPrompt = prompt.trim();
    if (selectedStyles.length > 0) {
      finalPrompt += `, ${selectedStyles.join(", ")}`;
    }
    create(finalPrompt);
  };

  //#endregion

  //#region Derived State

  const isCreateDisabled = prompt.trim() === "" || isCreating;

  //#endregion

  return (
    <main
      className={
        "mx-auto flex h-screen max-w-7xl flex-col items-center gap-8 px-4 pt-4 pb-8 sm:pt-16"
      }
    >
      <TextField
        placeholder={"Epic digital art of..."}
        startIcon={<MdAutoFixHigh className={"h-6 w-6"} />}
        className={"min-w-full"}
        value={prompt}
        onChange={handlePromptChange}
      />
      <StyleList
        styles={imageStyles}
        selectedStyles={selectedStyles}
        setSelectedStyles={setSelectedStyles}
      />
      <Button
        className={"w-fit"}
        loading={isCreating}
        disabled={isCreateDisabled}
        onClick={handleCreate}
      >
        {isCreating ? loadingText : "Create"}
        {!isCreating && (
          <MdArrowForward
            className={
              "h-full w-6 transition duration-200 ease-in-out group-hover:translate-x-0.5"
            }
          />
        )}
      </Button>
      <div className={`flex w-full flex-col`}>
        <h2 className={"w-full text-center text-2xl font-bold sm:text-justify"}>
          Recently Created <MdHistory className={"inline-block h-full w-9"} />
        </h2>
        <ImageList
          arePostsLoading={areRecentPostsLoading}
          posts={recentPosts}
          className={"py-8"}
        />
      </div>
    </main>
  );
}

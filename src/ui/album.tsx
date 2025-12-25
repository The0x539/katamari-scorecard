import { fileState } from "./scorecard.tsx";

import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

import type { JSX } from "preact";
import type { Photo } from "../save-file.ts";

export function Album(): JSX.Element {
  const game = fileState.save.value!.game;
  return (
    <>
      <ul class="album">
        {game.memoryPhoto.map(ShowPhoto)}
      </ul>

      <ul class="camera">
        {game.newPhoto.map(ShowPhoto)}
      </ul>
    </>
  );
}

function ShowPhoto(photo: Photo): JSX.Element {
  const blobURL = useSignal("");

  useEffect(() => {
    if (photo.data.length > 0) {
      // if this assertion fails, it indicates a memory leak,
      // as the old object URL has not been revoked
      console.assert(blobURL.value === "");

      const blob = new Blob([photo.data], { type: "image/jpeg" });
      blobURL.value = URL.createObjectURL(blob);
    }

    return () => {
      if (blobURL.value !== "") {
        URL.revokeObjectURL(blobURL.value);
        blobURL.value = "";
      }
    };
  }, [photo]);

  return (
    <li class="photo">
      {blobURL.value && <img src={blobURL.value}></img>}
    </li>
  );
}

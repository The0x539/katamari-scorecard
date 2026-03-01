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
        {game.memoryPhoto.map((p, i) => ShowPhoto(p, game.memoryPhotoDate[i]))}
      </ul>

      <ul class="camera">
        {game.newPhoto.map((p, i) => ShowPhoto(p, game.newPhotoDate[i]))}
      </ul>
    </>
  );
}

function ShowPhoto(photo: Photo, date: string): JSX.Element {
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
      {blobURL.value && (
        <>
          {Timestamp(date)}
          <img src={blobURL.value} />
        </>
      )}
    </li>
  );
}

function Timestamp(date: string): JSX.Element {
  const yy = date.slice(0, 2);
  const mm = date.slice(2, 4);
  const dd = date.slice(4, 6);

  return (
    <time datetime={`20${yy}-${mm}-${dd}`}>
      '{yy} {mm} {dd}
    </time>
  );
}

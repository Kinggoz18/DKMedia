import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "node:stream";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let didError = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onError(error: unknown) {
          didError = true;
          console.error(error);
          responseStatusCode = 500;
        },
        onAllReady() {
          if (didError) {
            reject(new Error("Rendering failed"));
            return;
          }

          // Create a PassThrough stream to convert Node stream to Web ReadableStream
          const passThrough = new PassThrough();
          pipe(passThrough);

          const body = new ReadableStream({
            start(controller) {
              passThrough.on("data", (chunk: Buffer) => {
                controller.enqueue(new Uint8Array(chunk));
              });
              passThrough.on("end", () => {
                controller.close();
              });
              passThrough.on("error", (err: Error) => {
                controller.error(err);
              });
            },
            cancel() {
              passThrough.destroy();
            },
          });

          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
        },
      }
    );

    // Abort after 5 seconds if not resolved
    setTimeout(() => abort(), 5000);
  });
}


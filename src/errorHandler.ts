import type { AppConfig } from "vue";

export const errorHandler: AppConfig["errorHandler"] = (err) => {
  console.log("ERROR", err);
  const error =
    err instanceof Error
      ? err.message
      : typeof err === "string"
      ? err
      : JSON.stringify(err);
  const root = document.getElementById("app") ?? document.body;
  root.insertAdjacentHTML(
    "beforeend",
    `
            <div>
                <p>An unhandled error occurred:</p>
                <blockquote>
                    <code>
                    ${error}
                    </code>
                </blockquote>
            </div>
        `
  );
};

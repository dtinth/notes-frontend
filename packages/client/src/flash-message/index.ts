const flashMessageElement = document.createElement("div");
flashMessageElement.id = "flashMessage";

let timeout: ReturnType<typeof setTimeout> | null = null;

export function flashMessage(
  message: string,
  options: {
    type?: "info" | "success" | "error";
  } = {}
) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  if (!message) {
    flashMessageElement.className = "hidden";
    return;
  }

  flashMessageElement.className =
    "fixed top-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-black " +
    {
      info: "bg-yellow-300",
      success: "bg-green-300",
      error: "bg-red-300",
    }[options.type || "info"];
  flashMessageElement.textContent = message;
  document.body.appendChild(flashMessageElement);

  timeout = setTimeout(() => {
    document.body.removeChild(flashMessageElement);
    timeout = null;
  }, 3000);
}

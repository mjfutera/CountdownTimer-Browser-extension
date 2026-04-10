export function buildValidationList(messages: string[]): HTMLOListElement {
  const list = document.createElement("ol");
  messages.forEach((message) => {
    const element = document.createElement("li");
    element.innerText = message;
    list.appendChild(element);
  });
  return list;
}

export const EXPIRED_TIMER_MESSAGE = "Your timer has expired. Please remove or edit it.";

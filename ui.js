(function (globalScope) {
  const CDBMUI = {
    /**
     * Builds an ordered list element with validation messages.
     * @param {string[]} messages
     * @returns {HTMLOListElement}
     */
    buildValidationList(messages) {
      const list = document.createElement("ol");
      messages.forEach((message) => {
        const element = document.createElement("li");
        element.innerText = message;
        list.appendChild(element);
      });
      return list;
    },
    /** @type {string} */
    expiredTimerMessage: "Your timer has expired. Please remove or edit it.",
  };

  globalScope.CDBMUI = CDBMUI;
})(typeof self !== "undefined" ? self : this);

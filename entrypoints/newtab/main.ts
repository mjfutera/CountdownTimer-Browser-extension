import {
  MAX_TIMERS,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  convertTimestampToDaysHoursMinutes,
  calculateProgress,
  isValidUrl,
  setDataFormat,
  toLocalISOString,
  pluralize,
  getRandomIndex,
} from "@/utils/core";
import { type Timer, getTimers, saveTimers, clearTimers, ensureTimerStorageSchema } from "@/utils/storage";
import { triggerNotification, playSound } from "@/utils/notifications";
import { buildValidationList, EXPIRED_TIMER_MESSAGE } from "@/utils/ui";
import {
  EXTENSION_NAME,
  EXTENSION_VERSION,
  AUTHOR_BRAND,
  UTM_PARAMS,
  SOCIAL_MEDIA,
  BORDER_COLORS,
} from "@/utils/constants";

const dialog = document.getElementById("mainPopUp") as HTMLDialogElement;
let timerTimeOut: ReturnType<typeof setTimeout>;

function createTab(url = ""): void {
  if (url === "") {
    browser.tabs.create({});
  } else {
    browser.tabs.create({ url });
  }
}

async function setAlarmIfNotExist(): Promise<void> {
  const alarm = await browser.alarms.get("timers");
  if (!alarm) {
    await browser.alarms.create("timers", { delayInMinutes: 1, periodInMinutes: 1 });
  }
}

async function removeAlarm(name: string): Promise<boolean> {
  return browser.alarms.clear(name);
}

// ---------- Form validation ----------

function allFieldsChecker(maxLength: number, maxDescription: number): boolean {
  const titleInput = document.getElementById("title") as HTMLInputElement;
  const startDateInput = document.getElementById("start_date") as HTMLInputElement;
  const endDateInput = document.getElementById("end_date") as HTMLInputElement;
  const descriptionInput = document.getElementById("description") as HTMLTextAreaElement;
  const infos = document.getElementById("infos")!;
  const siteOnTime = document.getElementById("site_on_time") as HTMLInputElement;
  const checkArray: boolean[] = [];
  const infoArray: string[] = [];

  const timerTitle = titleInput.value;
  const startDate = startDateInput.value;
  const startDateTimeStamp = new Date(startDate).getTime();
  const endDate = endDateInput.value;
  const endDateTimeStamp = new Date(endDate).getTime();
  const description = descriptionInput.value;

  if (!timerTitle.length) {
    checkArray.push(true);
    infoArray.push("Title can't be empty");
  } else if (timerTitle.length > maxLength) {
    checkArray.push(true);
    infoArray.push("Title too long");
  } else {
    checkArray.push(false);
  }

  if (!startDate) {
    checkArray.push(true);
    infoArray.push("Start date can't be empty");
  } else {
    checkArray.push(false);
  }

  if (!endDate) {
    checkArray.push(true);
    infoArray.push("End date can't be empty");
  } else if (startDateTimeStamp >= endDateTimeStamp) {
    checkArray.push(true);
    infoArray.push("End date can't be earlier than start date");
  } else {
    checkArray.push(false);
  }

  if (description.length > maxDescription) {
    checkArray.push(true);
    infoArray.push(`Description can't be longer than ${maxDescription} characters`);
  } else {
    checkArray.push(false);
  }

  if (siteOnTime?.checked) {
    const urlInput = document.getElementById("url_input") as HTMLInputElement;
    if (!isValidUrl(urlInput.value)) {
      checkArray.push(true);
      infoArray.push("Page URL is incorrect");
    } else {
      checkArray.push(false);
    }
  }

  const result = checkArray.includes(true);
  if (result) {
    infos.innerHTML = "";
    const list = buildValidationList(infoArray);
    infos.appendChild(list);
    (document.getElementById("addPic") as HTMLImageElement).src = "/img/sad.svg";
  } else {
    infos.innerHTML = "";
    (document.getElementById("addPic") as HTMLImageElement).src = "/img/happy.svg";
  }
  (document.getElementById("saveButton") as HTMLButtonElement).disabled = result;
  return result;
}

// ---------- Add/Edit form ----------

function addEditForm(timers: Timer[], timerID?: number): void {
  const maxLength = MAX_TITLE_LENGTH;
  const maxDescription = MAX_DESCRIPTION_LENGTH;
  const checker = () => allFieldsChecker(maxLength, maxDescription);

  dialog.innerHTML = "";
  dialog.showModal();
  const edit = Array.isArray(timers) && Number.isInteger(timerID);

  const table = document.createElement("table");

  // Row 1: Title
  const firstTr = document.createElement("tr");
  const firstTr_firstTd = document.createElement("td");
  firstTr_firstTd.classList.add("column", "min-width-150");
  const firstTr_firstTd_title = document.createElement("span");
  firstTr_firstTd_title.innerText = "Timer title";
  firstTr_firstTd.appendChild(firstTr_firstTd_title);
  const firstTr_firstTd_subtitle = document.createElement("span");
  firstTr_firstTd_subtitle.classList.add("smaller-font");
  firstTr_firstTd_subtitle.innerText = `Maximum ${maxLength} characters`;
  firstTr_firstTd.appendChild(firstTr_firstTd_subtitle);
  firstTr.appendChild(firstTr_firstTd);
  const firstTr_secondTd = document.createElement("td");
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.id = "title";
  titleInput.required = true;
  titleInput.classList.add("padding-10", "border-radius-10", "width-100p");
  titleInput.maxLength = 20;
  titleInput.placeholder = "For ex. winter solstice";
  firstTr_secondTd.appendChild(titleInput);
  firstTr.appendChild(firstTr_secondTd);
  const firstTr_thirdTd = document.createElement("td");
  firstTr_thirdTd.setAttribute("id", "title_length");
  firstTr_thirdTd.innerText = "0/20";
  titleInput.addEventListener("input", () => {
    if (titleInput.value.length > maxLength) {
      titleInput.value = titleInput.value.slice(0, maxLength);
    }
    firstTr_thirdTd.innerText = `${titleInput.value.length}/${maxLength}`;
    checker();
  });
  titleInput.addEventListener("change", () => {
    checker();
    if (titleInput.value.length > maxLength) {
      titleInput.value = titleInput.value.slice(0, maxLength);
    }
    firstTr_thirdTd.innerText = `${titleInput.value.length}/${maxLength}`;
  });
  firstTr.appendChild(firstTr_thirdTd);
  table.appendChild(firstTr);

  // Row 2: Start date
  const secondTr = document.createElement("tr");
  const secondTr_firstTd = document.createElement("td");
  secondTr_firstTd.classList.add("min-width-150");
  secondTr_firstTd.innerText = "Start date:";
  secondTr.appendChild(secondTr_firstTd);
  const secondTr_secondTd = document.createElement("td");
  const startDateInput = document.createElement("input");
  startDateInput.id = "start_date";
  if (edit && timerID !== undefined) {
    const startTime = timers[timerID].start_date;
    if (timers[timerID].show_time) {
      startDateInput.type = "datetime-local";
      startDateInput.value = setDataFormat("datetime-local", startTime);
    } else {
      startDateInput.type = "date";
      startDateInput.value = setDataFormat("date", startTime);
    }
  } else {
    startDateInput.type = "date";
  }
  startDateInput.required = true;
  startDateInput.classList.add("padding-10", "border-radius-10", "dates");
  startDateInput.addEventListener("change", checker);
  secondTr_secondTd.appendChild(startDateInput);
  secondTr.appendChild(secondTr_secondTd);

  const secondTr_thirdTd = document.createElement("td");
  const nowButton = document.createElement("button");
  const nowButtonImg = document.createElement("img");
  nowButtonImg.src = "/img/now.svg";
  nowButton.appendChild(nowButtonImg);
  const nowButtonText = document.createElement("span");
  nowButtonText.innerText = "Now";
  nowButton.appendChild(nowButtonText);
  nowButton.classList.add(
    "padding-10",
    "border-radius-10",
    "myButton-myGold",
    "myButton",
    "cursor-pointer"
  );
  secondTr_thirdTd.appendChild(nowButton);
  secondTr.appendChild(secondTr_thirdTd);
  table.appendChild(secondTr);

  // Row 3: End date
  const thirdTr = document.createElement("tr");
  const thirdTr_firstTd = document.createElement("td");
  thirdTr_firstTd.innerText = "End date";
  thirdTr.appendChild(thirdTr_firstTd);
  const thirdTr_secondTd = document.createElement("td");
  thirdTr_secondTd.colSpan = 2;
  const endDateInput = document.createElement("input");
  endDateInput.type = "date";
  if (edit && timerID !== undefined) {
    const endDate = timers[timerID].end_date;
    if (timers[timerID].show_time) {
      endDateInput.type = "datetime-local";
      endDateInput.value = setDataFormat("datetime-local", endDate);
    } else {
      endDateInput.type = "date";
      endDateInput.value = setDataFormat("date", endDate);
    }
  }
  endDateInput.id = "end_date";
  endDateInput.required = true;
  endDateInput.addEventListener("change", checker);
  endDateInput.classList.add("padding-10", "border-radius-10", "dates");
  thirdTr_secondTd.appendChild(endDateInput);
  thirdTr.appendChild(thirdTr_secondTd);
  table.appendChild(thirdTr);

  // Row 4: With time checkbox
  const fourthTr = document.createElement("tr");
  const fourthTr_firstTd = document.createElement("td");
  fourthTr_firstTd.classList.add("min-width-150");
  const labelForTimeFieldChanger = document.createElement("label");
  labelForTimeFieldChanger.setAttribute("for", "timeFieldChanger");
  labelForTimeFieldChanger.innerText = "With time:";
  fourthTr_firstTd.appendChild(labelForTimeFieldChanger);
  fourthTr.appendChild(fourthTr_firstTd);
  const fourthTr_secondTd = document.createElement("td");
  fourthTr_secondTd.colSpan = 2;
  const timeFieldChanger = document.createElement("input");
  timeFieldChanger.type = "checkbox";
  timeFieldChanger.id = "timeFieldChanger";
  if (edit && timerID !== undefined) {
    timeFieldChanger.checked = timers[timerID].show_time;
  }
  timeFieldChanger.addEventListener("click", (event) => {
    const target = event.target as HTMLInputElement;
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    if (target.checked) {
      startDateInput.type = "datetime-local";
      endDateInput.type = "datetime-local";
      const startDateTime = toLocalISOString(startDate);
      const endDateTime = toLocalISOString(endDate);
      if (startDateTime) startDateInput.value = startDateTime.slice(0, 16);
      if (endDateTime) endDateInput.value = endDateTime.slice(0, 16);
    } else {
      startDateInput.type = "date";
      endDateInput.type = "date";
      const startDateStr = toLocalISOString(startDate);
      const endDateStr = toLocalISOString(endDate);
      if (startDateStr) startDateInput.value = startDateStr.split("T")[0];
      if (endDateStr) endDateInput.value = endDateStr.split("T")[0];
    }
    checker();
  });
  fourthTr_secondTd.appendChild(timeFieldChanger);
  fourthTr.appendChild(fourthTr_secondTd);
  table.appendChild(fourthTr);

  // Row 5: Description
  const fifthTr = document.createElement("tr");
  fifthTr.classList.add("min-width-150");
  const fifthTr_firstTd = document.createElement("td");
  fifthTr_firstTd.classList.add("column");
  const fifthTr_firstTd_firstSpan = document.createElement("span");
  fifthTr_firstTd_firstSpan.innerText = "Description";
  fifthTr_firstTd.appendChild(fifthTr_firstTd_firstSpan);
  const fifthTr_firstTd_secondSpan = document.createElement("span");
  fifthTr_firstTd_secondSpan.classList.add("smaller-font");
  fifthTr_firstTd_secondSpan.innerText = `Maximum ${maxDescription} characters`;
  fifthTr_firstTd.appendChild(fifthTr_firstTd_secondSpan);
  fifthTr.appendChild(fifthTr_firstTd);
  const fifthTr_secondTd = document.createElement("td");
  const descriptionTextarea = document.createElement("textarea");
  descriptionTextarea.id = "description";
  descriptionTextarea.classList.add("padding-10", "border-radius-10");
  fifthTr_secondTd.appendChild(descriptionTextarea);
  fifthTr.appendChild(fifthTr_secondTd);
  const fifthTr_thirdTd = document.createElement("td");
  fifthTr_thirdTd.id = "description_length";
  fifthTr_thirdTd.innerText = `0/${maxDescription}`;
  descriptionTextarea.addEventListener("input", () => {
    if (descriptionTextarea.value.length > maxDescription) {
      descriptionTextarea.value = descriptionTextarea.value.slice(0, maxDescription);
    }
    fifthTr_thirdTd.innerText = `${descriptionTextarea.value.length}/${maxDescription}`;
    checker();
  });
  fifthTr.appendChild(fifthTr_thirdTd);
  table.appendChild(fifthTr);

  // Row 6: Launch site on time
  const sixthTr = document.createElement("tr");
  const sixthTr_firstTd = document.createElement("td");
  sixthTr_firstTd.classList.add("min-width-150");
  const timeOnSiteLabel = document.createElement("label");
  timeOnSiteLabel.setAttribute("for", "site_on_time");
  timeOnSiteLabel.innerText = "Launch site on time:";
  sixthTr_firstTd.appendChild(timeOnSiteLabel);
  sixthTr.appendChild(sixthTr_firstTd);
  const sixthTr_secondtTd = document.createElement("td");
  sixthTr_secondtTd.colSpan = 2;
  const siteOnTimeInput = document.createElement("input");
  siteOnTimeInput.type = "checkbox";
  siteOnTimeInput.id = "site_on_time";
  siteOnTimeInput.addEventListener("click", (event) => {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      const seventhTr = document.createElement("tr");
      seventhTr.id = "urlRow";
      const seventhTr_firstTd = document.createElement("td");
      seventhTr_firstTd.classList.add("min-width-150");
      seventhTr_firstTd.innerText = "Site URL";
      seventhTr.appendChild(seventhTr_firstTd);
      const seventhTr_secondTd = document.createElement("td");
      seventhTr_secondTd.colSpan = 2;
      const urlInput = document.createElement("input");
      urlInput.classList.add("padding-10", "border-radius-10");
      urlInput.id = "url_input";
      if (edit && timerID !== undefined) {
        urlInput.value = timers[timerID].newTab.url;
      }
      urlInput.addEventListener("change", checker);
      seventhTr_secondTd.append(urlInput);
      seventhTr.appendChild(seventhTr_secondTd);
      table.appendChild(seventhTr);
    } else {
      document.getElementById("urlRow")?.remove();
    }
    checker();
  });
  sixthTr_secondtTd.appendChild(siteOnTimeInput);
  sixthTr.appendChild(sixthTr_secondtTd);
  table.appendChild(sixthTr);

  if (edit && timerID !== undefined) {
    titleInput.value = timers[timerID].title;
    if (timers[timerID].newTab.active) {
      siteOnTimeInput.checked = true;
      const seventhTr = document.createElement("tr");
      seventhTr.id = "urlRow";
      const seventhTr_firstTd = document.createElement("td");
      seventhTr_firstTd.classList.add("min-width-150");
      seventhTr_firstTd.innerText = "Site URL";
      seventhTr.appendChild(seventhTr_firstTd);
      const seventhTr_secondTd = document.createElement("td");
      seventhTr_secondTd.colSpan = 2;
      const urlInput = document.createElement("input");
      urlInput.classList.add("padding-10", "border-radius-10");
      urlInput.id = "url_input";
      urlInput.value = timers[timerID].newTab.url;
      urlInput.addEventListener("change", checker);
      seventhTr_secondTd.append(urlInput);
      seventhTr.appendChild(seventhTr_secondTd);
      table.appendChild(seventhTr);
    }
  }

  // Row 8: Repeat
  const eighthTr = document.createElement("tr");
  const eighth_firstTd = document.createElement("td");
  eighth_firstTd.innerText = "Repeat";
  eighthTr.appendChild(eighth_firstTd);
  const eighth_secondTr = document.createElement("td");
  const repeatInput = document.createElement("input");
  repeatInput.type = "checkbox";
  eighth_secondTr.appendChild(repeatInput);
  eighthTr.appendChild(eighth_secondTr);
  table.appendChild(eighthTr);
  repeatInput.addEventListener("click", () => {
    if (repeatInput.checked) {
      const ninthTr = document.createElement("tr");
      ninthTr.id = "periodicity";
      const ninthTr_firstTd = document.createElement("td");
      ninthTr_firstTd.innerText = "Every";
      ninthTr.appendChild(ninthTr_firstTd);
      const ninthTr_secondTd = document.createElement("td");
      const numberOfPeriods = document.createElement("input");
      numberOfPeriods.type = "number";
      numberOfPeriods.classList.add("padding-10", "border-radius-10");
      numberOfPeriods.style.width = "35%";
      ninthTr_secondTd.appendChild(numberOfPeriods);
      const nameOfPeriods = document.createElement("select");
      nameOfPeriods.classList.add("padding-10", "border-radius-10");
      nameOfPeriods.style.width = "35%";
      let periods = ["day", "week", "month", "year"];
      const showPeriods = (p: string[]) => {
        nameOfPeriods.innerHTML = "";
        p.forEach((e) => {
          const singlePeriod = document.createElement("option");
          singlePeriod.innerText = e;
          singlePeriod.value = e;
          nameOfPeriods.appendChild(singlePeriod);
        });
      };
      timeFieldChanger.addEventListener("click", () => {
        if (timeFieldChanger.checked) {
          periods.unshift("minute", "hour");
          showPeriods(periods);
        } else {
          periods = periods.filter((el) => el !== "minute" && el !== "hour");
          showPeriods(periods);
        }
      });
      showPeriods(periods);
      ninthTr_secondTd.appendChild(nameOfPeriods);
      ninthTr.appendChild(ninthTr_secondTd);
      table.appendChild(ninthTr);
    } else {
      document.getElementById("periodicity")?.remove();
    }
  });

  dialog.appendChild(table);

  const infosDiv = document.createElement("div");
  infosDiv.id = "infos";
  dialog.appendChild(infosDiv);

  // Buttons
  const buttonsDiv = document.createElement("div");
  buttonsDiv.classList.add("flex");
  buttonsDiv.style.cssText = "justify-content:center; gap: 5px;";

  const saveButton = document.createElement("button");
  saveButton.addEventListener("click", () => {
    if (!checker() && (edit || timers.length < MAX_TIMERS)) {
      const newData: Record<string, any> = {};
      newData.title = titleInput.value;
      newData.start_date = new Date(startDateInput.value).getTime();
      newData.end_date = new Date(endDateInput.value).getTime();
      newData.show_time = timeFieldChanger.checked;
      newData.description = descriptionTextarea.value;
      newData.active = true;
      newData.newTab = {};
      if (siteOnTimeInput.checked) {
        newData.newTab.active = true;
        newData.newTab.url = (document.getElementById("url_input") as HTMLInputElement).value;
      } else {
        newData.newTab.active = false;
        newData.newTab.url = "";
      }

      if (edit && timerID !== undefined) {
        timers[timerID] = newData as Timer;
      } else {
        timers.push(newData as Timer);
      }
      saveTimers(timers);
      showTimers();
      dialog.close();
      dialog.innerHTML = "";
    } else {
      infosDiv.innerText = "You reached maximum amount of timers";
    }
  });
  saveButton.addEventListener("mouseover", checker);
  saveButton.id = "saveButton";
  saveButton.classList.add(
    "padding-10",
    "border-radius-10",
    "myButton-myGold",
    "myButton",
    "min-width-150",
    "cursor-pointer"
  );
  const saveButtonImg = document.createElement("img");
  saveButtonImg.src = "/img/happy.svg";
  saveButtonImg.id = "addPic";
  saveButton.appendChild(saveButtonImg);
  const saveButtonText = document.createElement("span");
  saveButtonText.innerText = "Save changes";
  saveButton.appendChild(saveButtonText);
  buttonsDiv.appendChild(saveButton);

  const deleteButton = document.createElement("button");
  deleteButton.classList.add(
    "padding-10",
    "border-radius-10",
    "myButton-myGold",
    "myButton",
    "min-width-150",
    "cursor-pointer"
  );
  const deleteButtonImg = document.createElement("img");
  deleteButtonImg.src = "/img/close.svg";
  deleteButtonImg.id = "close";
  deleteButton.appendChild(deleteButtonImg);
  const deleteButtonText = document.createElement("span");
  deleteButtonText.innerText = "Close without save";
  deleteButton.appendChild(deleteButtonText);
  deleteButton.addEventListener("click", () => {
    dialog.close();
    dialog.innerHTML = "";
  });
  buttonsDiv.appendChild(deleteButton);
  dialog.appendChild(buttonsDiv);
}

// ---------- Timer real-time update ----------

function timersUpdate(timers: Timer[]): void {
  const timestampNow = Date.now();
  timers.forEach((e, i) => {
    if (e.active) {
      const daysNumberField = document.getElementById("daysNumber-" + i);
      const timestampLeft = e.end_date - timestampNow;
      const timestampObject = convertTimestampToDaysHoursMinutes(timestampLeft, e.show_time);
      if (daysNumberField) daysNumberField.innerText = String(timestampObject.days);
      if (e.show_time) {
        const hoursNum = document.getElementById("hoursNumber-" + i);
        const hoursSub = document.getElementById("hoursSubtitle-" + i);
        const minsNum = document.getElementById("minutesNumber-" + i);
        const minsSub = document.getElementById("minutesSubtitle-" + i);
        if (hoursNum) hoursNum.innerText = String(timestampObject.hours);
        if (hoursSub) hoursSub.innerText = pluralize(timestampObject.hours, "hour", "hours");
        if (minsNum) minsNum.innerText = String(timestampObject.minutes);
        if (minsSub) minsSub.innerText = pluralize(timestampObject.minutes, "minute", "minutes");
      }
      const currentProgress = calculateProgress(e.start_date, e.end_date, timestampNow);
      const progressBar = document.getElementById("progressBar-" + i);
      if (progressBar) {
        progressBar.setAttribute("value", String(currentProgress));
        progressBar.innerText = String(currentProgress);
      }
      if (timestampLeft <= 0) {
        triggerNotification(
          `Congratulations! Your timer "${e.title}" just finished counting down. What now?`
        );
        playSound();
        if (e.newTab.active) {
          createTab(e.newTab.url);
        }
        e.active = false;
        saveTimers(timers);
        showTimers();
      }
    }
  });
  timerTimeOut = setTimeout(() => timersUpdate(timers), 1000);
}

// ---------- Reorder / Delete ----------

function moveUp(timers: Timer[], currentIndex: number, container: HTMLElement): void {
  const moveUpImg = document.createElement("img");
  if (currentIndex > 0) {
    moveUpImg.src = "/img/up.svg";
    moveUpImg.addEventListener("click", () => {
      const temp = timers[currentIndex];
      timers[currentIndex] = timers[currentIndex - 1];
      timers[currentIndex - 1] = temp;
      saveTimers(timers).then(() => showTimers());
    });
    moveUpImg.classList.add("cursor-pointer");
  } else {
    moveUpImg.src = "/img/blocked.svg";
  }
  container.appendChild(moveUpImg);
}

function moveDown(timers: Timer[], currentIndex: number, container: HTMLElement): void {
  const moveDownImg = document.createElement("img");
  if (currentIndex < timers.length - 1) {
    moveDownImg.src = "/img/down.svg";
    moveDownImg.classList.add("cursor-pointer");
    moveDownImg.addEventListener("click", async () => {
      const temp = timers[currentIndex];
      timers[currentIndex] = timers[currentIndex + 1];
      timers[currentIndex + 1] = temp;
      await saveTimers(timers);
      showTimers();
    });
  } else {
    moveDownImg.src = "/img/blocked.svg";
  }
  container.appendChild(moveDownImg);
}

async function removeElement(timers: Timer[], currentIndex: number): Promise<void> {
  if (confirm("Sure?")) {
    if (currentIndex >= 0 && currentIndex < timers.length) {
      timers.splice(currentIndex, 1);
    }
    saveTimers(timers).then(() => showTimers());
  }
}

// ---------- Render timers ----------

async function showTimers(): Promise<void> {
  const activeTimers = document.getElementById("cdbm_timers_active")!;
  activeTimers.innerHTML = "";
  const timers = await getTimers();
  const timestampNow = Date.now();

  timers.forEach((e, i) => {
    if (e.active) {
      const mainDiv = document.createElement("div");
      const borderColor = getRandomIndex(BORDER_COLORS);
      mainDiv.classList.add(
        "mainDiv_singleTimer",
        "padding-10",
        "border-radius-10",
        BORDER_COLORS[borderColor],
        "text-middle",
        "cdbm_timers_singleTimer"
      );

      const upDown = document.createElement("div");
      upDown.classList.add("showMe");
      moveUp(timers, i, upDown);
      const currentIndex = document.createElement("span");
      currentIndex.innerText = String(i + 1);
      currentIndex.classList.add("text-middle", "text-bold", "text-myGreen", "font-size-larger");
      upDown.appendChild(currentIndex);
      moveDown(timers, i, upDown);
      mainDiv.appendChild(upDown);

      const timerDiv = document.createElement("div");
      timerDiv.setAttribute("id", "timerDiv-" + i);

      const timestampLeft = e.end_date - timestampNow;
      const timestampObject = convertTimestampToDaysHoursMinutes(timestampLeft, e.show_time);

      const timerTitle = document.createElement("span");
      timerTitle.classList.add("font-oswald", "font-size-larger", "text-middle");
      timerTitle.innerText = e.title;
      timerDiv.appendChild(timerTitle);

      const days = document.createElement("span");
      days.classList.add("column");
      const daysNumber = document.createElement("span");
      daysNumber.setAttribute("id", "daysNumber-" + i);
      daysNumber.innerText = String(timestampObject.days);
      daysNumber.classList.add("text-middle", "text-bold", "font-size-4counter");
      days.appendChild(daysNumber);
      const daysSubtitle = document.createElement("span");
      daysSubtitle.setAttribute("id", "daysSubtitle-" + i);
      daysSubtitle.classList.add("text-middle");
      daysSubtitle.innerText = pluralize(timestampObject.days, "day", "days");
      days.appendChild(daysSubtitle);
      timerDiv.appendChild(days);

      if (e.show_time) {
        const hours = document.createElement("span");
        hours.classList.add("column");
        const hoursNumber = document.createElement("span");
        hoursNumber.classList.add("text-middle", "text-bold", "font-size-4counter");
        hoursNumber.innerText = String(timestampObject.hours);
        hoursNumber.setAttribute("id", "hoursNumber-" + i);
        hours.appendChild(hoursNumber);
        const hoursSubtitle = document.createElement("span");
        hoursSubtitle.setAttribute("id", "hoursSubtitle-" + i);
        hoursSubtitle.innerText = pluralize(timestampObject.hours, "hour", "hours");
        hoursSubtitle.classList.add("text-middle");
        hours.appendChild(hoursSubtitle);
        timerDiv.appendChild(hours);

        const minutes = document.createElement("span");
        minutes.classList.add("column");
        const minutesNumber = document.createElement("span");
        minutesNumber.setAttribute("id", "minutesNumber-" + i);
        minutesNumber.classList.add("text-middle", "text-bold", "font-size-4counter");
        minutesNumber.innerText = String(timestampObject.minutes);
        minutes.appendChild(minutesNumber);
        const minutesSubtitle = document.createElement("span");
        minutesSubtitle.setAttribute("id", "minutesSubtitle-" + i);
        minutesSubtitle.innerText = pluralize(timestampObject.minutes, "minute", "minutes");
        minutesSubtitle.classList.add("text-middle");
        minutes.appendChild(minutesSubtitle);
        timerDiv.appendChild(minutes);
      }

      const progress = calculateProgress(e.start_date, e.end_date, timestampNow);
      const progressBar = document.createElement("progress");
      progressBar.setAttribute("id", "progressBar-" + i);
      progressBar.setAttribute("max", "100");
      progressBar.setAttribute("value", String(progress));
      progressBar.innerText = String(progress);
      progressBar.style.width = "100%";
      timerDiv.appendChild(progressBar);

      if (e.description.length > 0) {
        const description = document.createElement("details");
        const summary = document.createElement("summary");
        summary.innerText = "Description";
        description.appendChild(summary);
        const descriptionText = document.createElement("p");
        descriptionText.innerText = e.description;
        description.appendChild(descriptionText);
        timerDiv.appendChild(description);
      }
      mainDiv.appendChild(timerDiv);

      const editDelete = document.createElement("div");
      editDelete.classList.add("showMe");
      const editPic = document.createElement("img");
      editPic.src = "/img/edit.svg";
      editPic.addEventListener("click", () => addEditForm(timers, i));
      editPic.classList.add("cursor-pointer");
      editDelete.appendChild(editPic);
      const deletePic = document.createElement("img");
      deletePic.src = "/img/delete.svg";
      deletePic.classList.add("cursor-pointer");
      deletePic.addEventListener("click", () => removeElement(timers, i));
      editDelete.appendChild(deletePic);
      mainDiv.appendChild(editDelete);
      activeTimers.appendChild(mainDiv);
    } else {
      // Inactive timer
      const mainDiv = document.createElement("div");
      const borderColor = getRandomIndex(BORDER_COLORS);
      mainDiv.classList.add(
        "mainDiv_singleTimer",
        "padding-10",
        "border-radius-10",
        "text-middle",
        "cdbm_timers_singleTimer"
      );

      const upDown = document.createElement("div");
      upDown.classList.add("showMe");
      moveUp(timers, i, upDown);
      const currentIndex = document.createElement("span");
      currentIndex.innerText = String(i + 1);
      currentIndex.classList.add("text-middle", "text-bold", "text-myGreen", "font-size-larger");
      upDown.appendChild(currentIndex);
      moveDown(timers, i, upDown);
      mainDiv.appendChild(upDown);

      const inactiveTimerDiv = document.createElement("div");
      inactiveTimerDiv.setAttribute("id", "timerDiv-" + i);
      const inactiveTimerTitle = document.createElement("div");
      inactiveTimerTitle.classList.add("text-middle", "font-size-larger");
      inactiveTimerTitle.innerText = e.title;
      inactiveTimerDiv.appendChild(inactiveTimerTitle);

      const inactiveTimerSubtitle = document.createElement("div");
      inactiveTimerSubtitle.innerText = EXPIRED_TIMER_MESSAGE;
      inactiveTimerSubtitle.classList.add("text-middle");
      inactiveTimerDiv.appendChild(inactiveTimerSubtitle);

      const timerImg = document.createElement("img");
      timerImg.classList.add("text-middle");
      timerImg.style.cssText = "margin-left: auto; margin-right: auto;";
      timerImg.src = "/img/warning.svg";
      inactiveTimerDiv.appendChild(timerImg);
      mainDiv.appendChild(inactiveTimerDiv);

      const editDelete = document.createElement("div");
      editDelete.classList.add("showMe");
      const editPic = document.createElement("img");
      editPic.src = "/img/edit.svg";
      editPic.addEventListener("click", () => addEditForm(timers, i));
      editPic.classList.add("cursor-pointer");
      editDelete.appendChild(editPic);
      const deletePic = document.createElement("img");
      deletePic.src = "/img/delete.svg";
      deletePic.classList.add("cursor-pointer");
      deletePic.addEventListener("click", () => removeElement(timers, i));
      editDelete.appendChild(deletePic);
      mainDiv.appendChild(editDelete);
      activeTimers.appendChild(mainDiv);
    }
  });

  if (timers.length < MAX_TIMERS) {
    const addTimer = document.createElement("a");
    addTimer.addEventListener("click", () => addEditForm(timers));
    addTimer.classList.add(
      "cdbm_timers_singleTimer",
      "padding-10",
      "border-radius-10",
      BORDER_COLORS[getRandomIndex(BORDER_COLORS)],
      "text-middle",
      "links",
      "cursor-pointer"
    );
    addTimer.innerText = "Add Timer";
    const img = document.createElement("img");
    img.setAttribute("src", "/img/add.svg");
    addTimer.appendChild(img);
    activeTimers.appendChild(addTimer);
  }

  clearTimeout(timerTimeOut);
  timersUpdate(timers);
}

// ---------- About dialog ----------

document.getElementById("aboutPlugin")!.addEventListener("click", () => {
  dialog.innerHTML = "";
  dialog.showModal();
  dialog.classList.add("dialog");

  const logoRow = document.createElement("div");
  logoRow.classList.add("about-logo-row");
  const logo = document.createElement("img");
  logo.src = "/logos/logo.png";
  logo.classList.add("logo", "border-radius-10");
  logoRow.appendChild(logo);

  const authorLogo = document.createElement("img");
  authorLogo.src = AUTHOR_BRAND.iconBasePath + AUTHOR_BRAND.icon;
  authorLogo.classList.add("about-author-logo", "cursor-pointer");
  authorLogo.alt = AUTHOR_BRAND.alt;
  authorLogo.addEventListener("click", () => createTab(AUTHOR_BRAND.link + UTM_PARAMS));
  logoRow.appendChild(authorLogo);
  dialog.appendChild(logoRow);

  const table = document.createElement("table");

  const firstTr = document.createElement("tr");
  const firstTr_firstTd = document.createElement("td");
  firstTr_firstTd.innerText = "Plugin name:";
  firstTr_firstTd.classList.add("min-width-150");
  firstTr.appendChild(firstTr_firstTd);
  const firstTr_secondTd = document.createElement("td");
  firstTr_secondTd.innerText = EXTENSION_NAME + " v. " + EXTENSION_VERSION;
  firstTr.appendChild(firstTr_secondTd);
  table.appendChild(firstTr);

  const secondTr = document.createElement("tr");
  const secondTr_firstTd = document.createElement("td");
  secondTr_firstTd.classList.add("min-width-150");
  secondTr_firstTd.innerText = "Description:";
  secondTr.appendChild(secondTr_firstTd);
  const secondTr_secondTd = document.createElement("td");
  secondTr_secondTd.innerText = "Create, manage, and be notified for important events.";
  const descriptionLinks = document.createElement("div");
  descriptionLinks.classList.add("margin-top-5");

  const repositoryLink = document.createElement("a");
  repositoryLink.href = "https://github.com/mjfutera/Countdowns-Chrome-extension";
  repositoryLink.target = "_blank";
  repositoryLink.innerText = "Public repository";
  const separator = document.createElement("span");
  separator.innerText = " | ";
  const projectPageLink = document.createElement("a");
  projectPageLink.href = "https://michalfutera.pro/my-projects/countdown-timer-chrome-extension/";
  projectPageLink.target = "_blank";
  projectPageLink.innerText = "Project page";
  const separator2 = document.createElement("span");
  separator2.innerText = " | ";
  const telegramLink = document.createElement("a");
  telegramLink.href = "https://t.me/MichalFuteraPro";
  telegramLink.target = "_blank";
  telegramLink.innerText = "Telegram";

  descriptionLinks.appendChild(repositoryLink);
  descriptionLinks.appendChild(separator);
  descriptionLinks.appendChild(projectPageLink);
  descriptionLinks.appendChild(separator2);
  descriptionLinks.appendChild(telegramLink);
  secondTr_secondTd.appendChild(descriptionLinks);
  secondTr.appendChild(secondTr_secondTd);
  table.appendChild(secondTr);

  const thirdTr = document.createElement("tr");
  const thirdTr_firstTd = document.createElement("td");
  thirdTr_firstTd.classList.add("min-width-150");
  thirdTr_firstTd.innerText = "Author:";
  thirdTr.appendChild(thirdTr_firstTd);
  const thirdTr_secondTd = document.createElement("td");
  const author = document.createElement("a");
  author.href = "https://linktr.ee/mjfutera";
  author.innerText = "Michał Futera";
  author.target = "_blank";
  thirdTr_secondTd.appendChild(author);
  thirdTr.appendChild(thirdTr_secondTd);
  table.appendChild(thirdTr);

  const fourthTr = document.createElement("tr");
  const fourthTr_firstTd = document.createElement("td");
  fourthTr_firstTd.innerText = "Pictures from:";
  fourthTr.appendChild(fourthTr_firstTd);
  const fourthTr_secondTd = document.createElement("td");
  const picsumLink = document.createElement("a");
  picsumLink.href = "https://picsum.photos/";
  picsumLink.target = "_blank";
  picsumLink.innerText = "Picsum photos";
  fourthTr_secondTd.appendChild(picsumLink);
  fourthTr.appendChild(fourthTr_secondTd);
  table.appendChild(fourthTr);
  dialog.appendChild(table);

  const socialMedia = document.createElement("div");
  socialMedia.classList.add("text-middle");
  const socialMediaText = document.createElement("div");
  socialMediaText.innerText = "Check my Social Media";
  socialMediaText.classList.add("text-middle");
  socialMedia.appendChild(socialMediaText);
  const socialMediaIcons = document.createElement("div");
  SOCIAL_MEDIA.forEach((e) => {
    const image = document.createElement("img");
    image.src = (e.iconBasePath ?? "/logos/socialMedia/") + e.icon;
    image.classList.add("social-media-icon", "cursor-pointer");
    image.alt = e.alt;
    image.addEventListener("click", () => createTab(e.link + UTM_PARAMS));
    socialMediaIcons.appendChild(image);
  });
  socialMedia.appendChild(socialMediaIcons);

  const telegramSocialLink = document.createElement("a");
  telegramSocialLink.href = "https://t.me/MichalFuteraPro";
  telegramSocialLink.target = "_blank";
  telegramSocialLink.style.display = "block";
  telegramSocialLink.style.marginTop = "8px";
  telegramSocialLink.innerText = "Telegram: @MichalFuteraPro";
  socialMedia.appendChild(telegramSocialLink);
  dialog.appendChild(socialMedia);

  const closeButton = document.createElement("div");
  closeButton.classList.add(
    "cursor-pointer",
    "myButton",
    "myButton-myGold",
    "text-middle",
    "padding-10",
    "border-radius-10"
  );
  closeButton.innerText = "Close";
  closeButton.addEventListener("click", () => {
    dialog.close();
    dialog.innerHTML = "";
    dialog.classList.remove("dialog");
  });
  dialog.appendChild(closeButton);
});

// ---------- Reset ----------

document.getElementById("bigReset")!.addEventListener("click", () => {
  if (confirm("This action cannot be undone. Proceed?")) {
    clearTimers()
      .then(() => removeAlarm("timers"))
      .then(() => setAlarmIfNotExist())
      .then(() => showTimers())
      .then(() => triggerNotification("All timers and settings have been reset"));
  }
});

// ---------- Footer link ----------

document.getElementById("byMichalFutera")!.addEventListener("click", () => {
  const link = SOCIAL_MEDIA.find((e) => e.name === "LinkTree");
  if (link) createTab(link.link + UTM_PARAMS);
});

// ---------- Init ----------

window.addEventListener("load", async () => {
  await showTimers();
  await ensureTimerStorageSchema();
});

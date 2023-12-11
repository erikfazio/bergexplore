import puppeteer from "puppeteer";
import mongoose from "mongoose";

async function searchEppenEvents(
  q = "",
  startDate = "",
  endDate = "",
  category = "",
  city = ""
) {
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();
  const pageUrl = `https://www.ecodibergamo.it/eventi/eppen/ricerca/?q=${q}&start=${startDate}&end=${endDate}&category=${category}&city=${city}`;
  await page.goto(pageUrl);

  // Extract locations from elements with class ".card-place"
  const data = await page.evaluate(() => {
    const cardContainers = document.querySelectorAll(".card-container");
    const result = [];

    cardContainers.forEach((container) => {
      const titleElement = container.querySelector(".card-title");
      const textElement = container.querySelector(".card-text");
      const timeElement = container.querySelector(".card-hour");
      const categoryElement = container.querySelector(".card-footer");
      const dayElement = container.querySelector(".card-day");
      const test = container.querySelector(".card-date");

      if (titleElement && textElement) {
        const title = titleElement.textContent.trim();
        const text = textElement.textContent.trim();
        const time = timeElement.textContent.trim();
        const category = categoryElement.textContent.trim();
        const day = dayElement.textContent.trim();
        const date = test.textContent.trim();

        result.push({ title, text, time, category, day, date });
      }
    });

    return result;
  });

  await browser.close();

  return data;
}

async function searchScovaEventiEvents(city = "", date = "") {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const pageUrl = `https://www.scovaeventi.it/eventi/${city}/${date}`;
  await page.goto(pageUrl);

  console.log(pageUrl);

  // Extract locations from elements with class ".card-place"
  const data = await page.evaluate(() => {
    const cardContainers = document.querySelectorAll(".card-container");
    const result = [];

    cardContainers.forEach((container) => {
      const titleElement = container.querySelector(".card-title");
      const textElement = container.querySelector(".card-text");
      const timeElement = container.querySelector(".card-hour");
      const categoryElement = container.querySelector(".card-footer");
      const dayElement = container.querySelector(".card-day");
      const test = container.querySelector(".card-date");

      if (titleElement && textElement) {
        const title = titleElement.textContent.trim();
        const text = textElement.textContent.trim();
        const time = timeElement.textContent.trim();
        const category = categoryElement.textContent.trim();
        const day = dayElement.textContent.trim();
        const date = test.textContent.trim();

        result.push({ title, text, time, category, day, date });
      }
    });

    return result;
  });

  await browser.close();

  return data;
}

async function searchDasteEvents() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const pageUrl = `https://www.dastebergamo.com/attivita/`;
  await page.goto(pageUrl);

  // Extract locations from elements with class ".card-place"
  const data = await page.evaluate(() => {
    const cardContainers = document.querySelectorAll(
      "absolute bg w-full h-full"
    );

    const result = [];

    for (const cardContainer of cardContainers) {
      cardContainer.click();
      page.waitForNavigation({ waitUntil: "networkidle2" });

      // Get the text on the redirected page
      const redirectedText = document.body.textContent.trim();
      result.push(redirectedText);

      // Go back to the original page
      history.back();
    }

    return result;
  });

  await browser.close();

  return data;
}

async function run() {
  const rawEvents = await searchEppenEvents();

  await mongoose.connect("mongodb://localhost:27017/bergexplore");

  const eventSchema = new mongoose.Schema({
    title: String,
    text: String,
    time: String,
    category: String,
    day: String,
    date: String,
  });

  const Event = mongoose.model("Event", eventSchema);

  Event.insertMany(rawEvents).then((result) => {
    mongoose.disconnect();
    console.log(result);
  });
}

run().catch((error) => console.log(error));

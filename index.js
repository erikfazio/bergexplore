const puppeteer = require("puppeteer");

async function searchEppenEvents(
  q = "",
  startDate = "",
  endDate = "",
  category = "",
  city = ""
) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const pageUrl = `https://www.ecodibergamo.it/eventi/eppen/ricerca/?q=${q}&start=${startDate}&end=${endDate}&category=${category}&city=${city}`;
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

async function run() {
  const data = await searchEppenEvents("libri");
  console.log(data);
}

run();

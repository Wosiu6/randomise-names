const namesInput = document.getElementById("namesInput");
const randomiseBtn = document.getElementById("randomiseBtn");
const copyBtn = document.getElementById("copyBtn");
const output = document.getElementById("output");
const statusEl = document.getElementById("status");

let latestResult = [];
let isAnimating = false;

function parseNames(raw) {
  return raw
    .split(/[,\n]/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function setStatus(message) {
  statusEl.textContent = message;
}

function animateCard(card, finalName, sourceNames, index) {
  return new Promise((resolve) => {
    const rollDuration = 650 + index * 170;
    const tick = 65;
    const startDelay = index * 110;

    setTimeout(() => {
      card.classList.add("show");
      let elapsed = 0;
      const intervalId = setInterval(() => {
        elapsed += tick;
        const randomName = sourceNames[Math.floor(Math.random() * sourceNames.length)];
        card.textContent = randomName;

        if (elapsed >= rollDuration) {
          clearInterval(intervalId);
          card.textContent = finalName;
          card.classList.add("final");
          resolve();
        }
      }, tick);
    }, startDelay);
  });
}

function sparkBurst(event) {
  const rect = randomiseBtn.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  for (let i = 0; i < 18; i += 1) {
    const spark = document.createElement("span");
    spark.className = "spark";

    const angle = (Math.PI * 2 * i) / 18;
    const radius = 18 + Math.random() * 42;

    spark.style.left = `${originX}px`;
    spark.style.top = `${originY}px`;
    spark.style.setProperty("--dx", `${Math.cos(angle) * radius}px`);
    spark.style.setProperty("--dy", `${Math.sin(angle) * radius}px`);

    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 750);
  }
}

async function randomiseNames() {
  if (isAnimating) {
    return;
  }

  const names = parseNames(namesInput.value);
  if (names.length < 2) {
    setStatus("Add at least 2 names to randomise.");
    output.innerHTML = "";
    latestResult = [];
    return;
  }

  isAnimating = true;
  randomiseBtn.disabled = true;
  setStatus(`Randomising ${names.length} names...`);
  output.innerHTML = "";

  sparkBurst();
  const shuffled = shuffle(names);

  const cards = shuffled.map(() => {
    const item = document.createElement("li");
    item.className = "name-card";
    item.textContent = "...";
    output.appendChild(item);
    return item;
  });

  await Promise.all(
    cards.map((card, index) => animateCard(card, shuffled[index], names, index))
  );

  latestResult = shuffled;
  setStatus("Done. New order is ready.");
  randomiseBtn.disabled = false;
  isAnimating = false;
}

async function copyResult() {
  if (!latestResult.length) {
    setStatus("Nothing to copy yet.");
    return;
  }

  try {
    await navigator.clipboard.writeText(latestResult.join("\n"));
    setStatus("Result copied to clipboard.");
  } catch (error) {
    setStatus("Clipboard not available in this browser.");
  }
}

randomiseBtn.addEventListener("click", randomiseNames);
copyBtn.addEventListener("click", copyResult);

namesInput.value = "Alex\nMorgan\nSam\nJordan\nTaylor";

<<<<<<< HEAD
// ===============================
// DOM ELEMENTS
// ===============================
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const quoteSource = document.getElementById("quoteSource");

const quoteBgImage = document.getElementById("quoteBgImage"); // image inside card

const categorySelect = document.getElementById("category");
const newQuoteBtn = document.getElementById("newQuoteBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const favBtn = document.getElementById("favBtn");
const whatsappBtn = document.getElementById("whatsappBtn");
const showFavBtn = document.getElementById("showFavBtn");
const favouritesPanel = document.getElementById("favouritesPanel");
const favList = document.getElementById("favList");
const closeFavBtn = document.getElementById("closeFavBtn");

// ===============================
// CATEGORY MAP (for quote API)
// ===============================
const categoryMap = {
  motivational: "motivation",
  success: "success",
  life: "life",
  love: "love",
  career: "success",   // closest
  depression: "wisdom" // or "motivation"
};

// ===============================
// ANIMATED GRADIENT BACKGROUND (KEEPING OLD UI)
// ===============================
const categoryBackgrounds = {
  motivational: "linear-gradient(-45deg,#232526,#414345,#000428,#004e92)",
  success: "linear-gradient(-45deg,#232526,#414345,#000428,#004e92)",
  life: "linear-gradient(-45deg,#232526,#414345,#000428,#004e92)",
  love: "linear-gradient(-45deg,#232526,#414345,#000428,#004e92)",
  career: "linear-gradient(-45deg,#232526,#414345,#000428,#004e92)",
  depression: "linear-gradient(-45deg,#232526,#414345,#000428,#004e92)"
};

function applyBackground(category) {
  document.body.style.background = categoryBackgrounds[category];
}

// ===============================
// UNSPLASH CONFIG (IMAGE INSIDE CARD)
// ===============================
const UNSPLASH_KEY = "8GkKb2o6NAIszRCwAD-1aJYQY9XlDfMc-1ocQykUlaI"; // <-- put your key
let currentImageUrl = ""; // used for download canvas later

async function setRandomCardImage(category) {
  const topic =
    {
      motivational: "motivation,inspiration",
      success: "success,achievement,goals",
      life: "life,nature,scenery",
      love: "love,couple,romantic",
      career: "office,career,work",
      depression: "dark,moody,alone"
    }[category] || "inspiration";

  const endpoint = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
    topic
  )}&orientation=landscape&client_id=${UNSPLASH_KEY}`; // orientation param is supported [web:19][web:66]

  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    const imageUrl = data.urls && data.urls.regular; // standard Unsplash field [web:19][web:10]

    if (imageUrl) {
      currentImageUrl = imageUrl;
      quoteBgImage.crossOrigin = "anonymous"; // allow canvas use [web:70][web:65]
      quoteBgImage.src = imageUrl;
    }
  } catch (err) {
    console.error("Unsplash error:", err);
  }
}

// ===============================
// FETCH QUOTE (quotes-api-self)
// ===============================
async function getQuote() {
  const cat = categorySelect.value;

  applyBackground(cat); // keep your animated background

  try {
    quoteText.textContent = "Loading...";
    quoteAuthor.textContent = "";
    quoteSource.textContent = "";

    const apiCategory = categoryMap[cat];
    let url = "https://quotes-api-self.vercel.app/quote";

    if (apiCategory) {
      url += `?category=${encodeURIComponent(apiCategory)}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json(); // { quote, author, category }

    quoteText.textContent = `"${data.quote}"`;
    quoteAuthor.textContent = `— ${data.author}`;
    quoteSource.textContent = data.category || apiCategory || "";

    favBtn.classList.remove("active");
    favBtn.textContent = "♡";

    // load Unsplash image inside the card
    setRandomCardImage(cat);
  } catch (err) {
    console.error("Fetch error:", err);
    quoteText.textContent = "Failed to load quote.";
  }
}

// ===============================
// COPY
// ===============================
copyBtn.onclick = () => {
  navigator.clipboard.writeText(
    `${quoteText.textContent} ${quoteAuthor.textContent}`
  );
};

// ===============================
// FAVOURITES (localStorage)
// ===============================
favBtn.onclick = () => {
  const favs = JSON.parse(localStorage.getItem("favouriteQuotes")) || [];

  const quote = {
    text: quoteText.textContent,
    author: quoteAuthor.textContent
  };

  if (!favs.some((q) => q.text === quote.text)) {
    favs.push(quote);
    localStorage.setItem("favouriteQuotes", JSON.stringify(favs));
    favBtn.textContent = "♥";
    favBtn.classList.add("active");
  }
};

showFavBtn.onclick = () => {
  renderFavourites();
  favouritesPanel.classList.add("active");
};

closeFavBtn.onclick = () => {
  favouritesPanel.classList.remove("active");
};

function renderFavourites() {
  const favs = JSON.parse(localStorage.getItem("favouriteQuotes")) || [];
  favList.innerHTML = "";

  favs.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "fav-item";
    div.innerHTML = `
      <p>${q.text}</p>
      <span>${q.author}</span>
      <button class="remove-fav" onclick="removeFavourite(${i})">Remove</button>
    `;
    favList.appendChild(div);
  });
}

window.removeFavourite = function (index) {
  const favs = JSON.parse(localStorage.getItem("favouriteQuotes")) || [];
  favs.splice(index, 1);
  localStorage.setItem("favouriteQuotes", JSON.stringify(favs));
  renderFavourites();
};

// ===============================
// WHATSAPP
// ===============================
whatsappBtn.onclick = () => {
  const text = encodeURIComponent(
    `${quoteText.textContent} ${quoteAuthor.textContent}`
  );
  window.open(`https://wa.me/?text=${text}`, "_blank");
};

// ===============================
// DOWNLOAD IMAGE (QUOTE + UNSPLASH)
// ===============================
downloadBtn.onclick = () => {
  const canvas = document.getElementById("posterCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 900;
  canvas.height = 400;

  // If there is no image yet, just draw solid background + text
  if (!currentImageUrl) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawQuoteOnCanvas(ctx, canvas);
    triggerDownload(canvas);
    return;
  }

  const img = new Image();
  img.crossOrigin = "anonymous"; // needed for toDataURL with Unsplash [web:70][web:65]
  img.src = currentImageUrl;

  img.onload = () => {
    // Draw background image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Dark overlay for readability
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawQuoteOnCanvas(ctx, canvas);
    triggerDownload(canvas);
  };

  img.onerror = () => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawQuoteOnCanvas(ctx, canvas);
    triggerDownload(canvas);
  };
};

function drawQuoteOnCanvas(ctx, canvas) {
  ctx.fillStyle = "#fff";
  ctx.font = "28px 'Segoe UI'";
  ctx.textAlign = "left";

  const text = quoteText.textContent.replace(/^"|"$/g, "");
  const author = quoteAuthor.textContent;

  const maxWidth = canvas.width - 120;
  const lineHeight = 36;
  let x = 60;
  let y = 140;

  const words = text.split(" ");
  let line = "";

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);

  ctx.font = "22px 'Segoe UI'";
  ctx.textAlign = "right";
  ctx.fillText(author, canvas.width - 60, y + 40);
}

function triggerDownload(canvas) {
  const link = document.createElement("a");
  link.download = "quote.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ===============================
// EVENTS
// ===============================
newQuoteBtn.onclick = getQuote;
getQuote();
=======
// ===============================
// DOM ELEMENTS
// ===============================
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const quoteSource = document.getElementById("quoteSource");

const categorySelect = document.getElementById("category");
const newQuoteBtn = document.getElementById("newQuoteBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const favBtn = document.getElementById("favBtn");
const whatsappBtn = document.getElementById("whatsappBtn");
const showFavBtn = document.getElementById("showFavBtn");
const favouritesPanel = document.getElementById("favouritesPanel");
const favList = document.getElementById("favList");
const closeFavBtn = document.getElementById("closeFavBtn");

// ===============================
// CATEGORY MAP
// (keys must match <option value=""> in your dropdown)
// ===============================
const categoryMap = {
  motivational: "motivation",
  success: "success",
  life: "philosophy",
  love: "love",
  career: "profession",   // closest category
  depression: "sadness" // or "motivation" if you prefer
};

// ===============================
// MASSIVE ANIMATED GRADIENTS
// ===============================
const categoryBackgrounds = {
  motivational: "linear-gradient(-45deg,#232526,#414345,#000428,#004e92)",
  success: "linear-gradient(-45deg,#232526,#414345,#000428,#004e92)",
  life: "linear-gradient(-45deg,#232526,#414345,#000428,#004e92)",
  love: "linear-gradient(-45deg,#232526,#414345,#000428,#004e92)",
  career: "linear-gradient(-45deg,#232526,#414345,#000428,#004e92)",
  depression: "linear-gradient(-45deg,#232526,#414345,#000428,#004e92)"
};

function applyBackground(category) {
  document.body.style.background = categoryBackgrounds[category];
}

// ===============================
// FETCH QUOTE (quotes-api-self)
// ===============================
async function getQuote() {
  const cat = categorySelect.value;          // e.g. "motivational"
  applyBackground(cat);

  try {
    quoteText.textContent = "Loading...";
    quoteAuthor.textContent = "";
    quoteSource.textContent = "";

    const apiCategory = categoryMap[cat];    // e.g. "motivation"
    let url = "https://quotes-api-self.vercel.app/quote";

    if (apiCategory) {
      url += `?category=${encodeURIComponent(apiCategory)}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();           // { quote, author, category }

    quoteText.textContent = `"${data.quote}"`;
    quoteAuthor.textContent = `— ${data.author}`;
    // show what type of quote it is
    quoteSource.textContent = data.category || apiCategory || "";

    favBtn.classList.remove("active");
    favBtn.textContent = "♡";
  } catch (err) {
    console.error("Fetch error:", err);
    quoteText.textContent = "Failed to load quote.";
  }
}

// ===============================
// COPY
// ===============================
copyBtn.onclick = () => {
  navigator.clipboard.writeText(
    `${quoteText.textContent} ${quoteAuthor.textContent}`
  );
};

// ===============================
// FAVOURITES (localStorage)
// ===============================
favBtn.onclick = () => {
  const favs = JSON.parse(localStorage.getItem("favouriteQuotes")) || [];

  const quote = {
    text: quoteText.textContent,
    author: quoteAuthor.textContent
  };

  if (!favs.some((q) => q.text === quote.text)) {
    favs.push(quote);
    localStorage.setItem("favouriteQuotes", JSON.stringify(favs));
    favBtn.textContent = "♥";
    favBtn.classList.add("active");
  }
};

showFavBtn.onclick = () => {
  renderFavourites();
  favouritesPanel.classList.add("active");
};

closeFavBtn.onclick = () => {
  favouritesPanel.classList.remove("active");
};

function renderFavourites() {
  const favs = JSON.parse(localStorage.getItem("favouriteQuotes")) || [];
  favList.innerHTML = "";

  favs.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "fav-item";
    div.innerHTML = `
      <p>${q.text}</p>
      <span>${q.author}</span>
      <button class="remove-fav" onclick="removeFavourite(${i})">Remove</button>
    `;
    favList.appendChild(div);
  });
}

window.removeFavourite = function (index) {
  const favs = JSON.parse(localStorage.getItem("favouriteQuotes")) || [];
  favs.splice(index, 1);
  localStorage.setItem("favouriteQuotes", JSON.stringify(favs));
  renderFavourites();
};

// ===============================
// WHATSAPP
// ===============================
whatsappBtn.onclick = () => {
  const text = encodeURIComponent(
    `${quoteText.textContent} ${quoteAuthor.textContent}`
  );
  window.open(`https://wa.me/?text=${text}`, "_blank");
};

// ===============================
// DOWNLOAD IMAGE
// ===============================
downloadBtn.onclick = () => {
  const canvas = document.getElementById("posterCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 900;
  canvas.height = 900;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "30px serif";
  ctx.fillText(quoteText.textContent, 50, 300);
  ctx.font = "22px serif";
  ctx.fillText(quoteAuthor.textContent, 50, 380);

  const link = document.createElement("a");
  link.download = "quote.png";
  link.href = canvas.toDataURL();
  link.click();
};

// ===============================
// EVENTS
// ===============================
newQuoteBtn.onclick = getQuote;
getQuote();

>>>>>>> cae1bb99471b1800cc1377ca8db3e9497dc56c79

require("dotenv").config();

let token = localStorage.getItem("token");

function updatePremiumUI() {
  const premiumStatusDiv = document.getElementById("premiumStatus");
  const buyPremiumBtn = document.getElementById("buyPremiumBtn");

  const userDetails = JSON.parse(localStorage.getItem("userDetails"));

  if (userDetails && userDetails.isPremium) {
    premiumStatusDiv.classList.remove("hidden");
    buyPremiumBtn.classList.add("hidden");
  } else {
    premiumStatusDiv.classList.add("hidden");
    buyPremiumBtn.classList.remove("hidden");
  }

  // 🔥 NEW
  updateDownloadUI();
}

function updateDownloadUI() {
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));

  const downloadBtn = document.getElementById("downloadExpensesBtn");
  const dailyBtn = document.getElementById("filterDaily");
  const weeklyBtn = document.getElementById("filterWeekly");
  const monthlyBtn = document.getElementById("filterMonthly");
  const premiumHint = document.getElementById("premiumHint");
  const askAI = document.getElementById("askAI");

  const isPremium = userDetails && userDetails.isPremium;

  if (isPremium) {
    downloadBtn.disabled = false;
    dailyBtn.disabled = false;
    weeklyBtn.disabled = false;
    monthlyBtn.disabled = false;

    premiumHint.classList.add("hidden");
  } else {
    downloadBtn.disabled = true;
    dailyBtn.disabled = true;
    weeklyBtn.disabled = true;
    monthlyBtn.disabled = true;
    askAI.disabled = true;
    viewLeaderboardBtn.disabled = true;

    premiumHint.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    window.location.href = "/login/index.html";
    return;
  }
  updatePremiumUI();

  const appContainer = document.getElementById("app-container");
  appContainer.classList.remove("hidden");
  logout.addEventListener("click", async function () {
    localStorage.clear();
    window.location.href = "/login/index.html";
    return;
  });

  buyPremiumBtn.addEventListener("click", async function () {
    try {
      buyPremiumBtn.disabled = true;
      buyPremiumBtn.textContent = "Processing...";

      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      // 1️⃣ Create order
      const res = await fetch(
        `${process.env.APPLICATION_BACKEND_BASE_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Order creation failed");

      // 2️⃣ Open Cashfree modal
      const cashfree = window.Cashfree({ mode: "sandbox" });

      const cashfreeResult = await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal",
      });
      if (cashfreeResult.error) {
        console.log("error during  pay", cashfreeResult.error);
      }
      if (cashfreeResult.redirect) {
        console.log("pay redicted", cashfreeResult.redirect);
      }
      if (cashfreeResult.paymentDetails) {
        console.log(
          "payment completed, check for payment status",
          cashfreeResult.paymentDetails,
        );
        console.log(cashfreeResult.paymentDetails.paymentMessage);
        const userToken = localStorage.getItem("token");
        console.log("userToken", userToken);
        const orderStatusResponse = await fetch(
          `${process.env.APPLICATION_BACKEND_BASE_URL}/api/payments/order-status?order_id=${data.order_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
          },
        );
        const orderStatusResponseData = await orderStatusResponse.json();
        console.log(orderStatusResponseData, "orderStatusResponseData");
        const alertStatus = orderStatusResponseData.orderStatus;
        // alert(`Payment status is:${alertStatus} `);

        const getUserDetails = await fetch(
          `${process.env.APPLICATION_BACKEND_BASE_URL}/api/users/userdetails/${orderStatusResponseData.userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
          },
        );
        const getUserDetailResponseData = await getUserDetails.json();
        localStorage.setItem(
          "userDetails",
          JSON.stringify(getUserDetailResponseData),
        );
        updatePremiumUI();
        alert("You are a premium user now");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Connection issue");
    } finally {
      buyPremiumBtn.disabled = false;
      buyPremiumBtn.textContent = "Buy Premium Membership";
    }
  });

  // document.getElementById("reportBtn").addEventListener("click", async () => {
  //   try {
  //     const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  //     // const userId = req.user.id;
  //     const userToken = localStorage.getItem("token");
  //     if (!userDetails.isPremium) {
  //       document.getElementById("buyPremiumBtn").click();
  //       return;
  //     }

  //     const res = await fetch(
  //       `${process.env.APPLICATION_BACKEND_BASE_URL}/api/premium/getexpencereport/${userId}`,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${userToken}`,
  //         },
  //       },
  //     );

  //     const data = await res.json();

  //     if (!res.ok) {
  //       throw new Error(data.message || "Failed to generate report");
  //     }

  //     window.open(data.reportUrl, "_blank");
  //   } catch (err) {
  //     alert(err.message);
  //   }
  // });

  document.getElementById("reportBtn").addEventListener("click", async () => {
    try {
      const userDetails = JSON.parse(localStorage.getItem("userDetails"));
      const userToken = localStorage.getItem("token");

      // Check if user is premium
      if (!userDetails || !userDetails.isPremium) {
        alert("Premium membership required");
        document.getElementById("buyPremiumBtn").click();
        return;
      }

      // Use the actual user ID
      const userId = userDetails.id;

      const res = await fetch(
        `${process.env.APPLICATION_BACKEND_BASE_URL}/api/premium/getexpencereport/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to generate report");
      }

      window.open(data.reportUrl, "_blank");
    } catch (err) {
      alert(err.message);
    }
  });

  async function fetchLeaderboard() {
    try {
      leaderboardContent.innerHTML = `<p class="text-center text-slate-500">Loading...</p>`;

      const userDetails = JSON.parse(localStorage.getItem("userDetails"));
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.APPLICATION_BACKEND_BASE_URL}/api/premium/getLeaderboard/${userDetails.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch leaderboard");

      const data = await res.json();

      renderLeaderboard(data.allUserExpense);
      openLeaderboardModal();
    } catch (err) {
      console.error(err);
      leaderboardContent.innerHTML = `
      <p class="text-center text-rose-600">Could not load leaderboard</p>
    `;
      openLeaderboardModal();
    }
  }

  function renderLeaderboard(expenses) {
    if (!expenses || expenses.length === 0) {
      leaderboardContent.innerHTML = `
      <p class="text-center text-slate-500">No data available</p>
    `;
      return;
    }

    leaderboardContent.innerHTML = expenses
      .map(
        (item) => `
        <div class="flex justify-between items-center bg-slate-50 rounded-lg px-4 py-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${getEmoji(item.category)}</span>
            <span class="font-medium">${item.category}</span>
          </div>
          <div class="font-semibold text-rose-600">
            ₹ ${Number(item.totalSpendAmout).toLocaleString()}
          </div>
        </div>
      `,
      )
      .join("");
  }

  // Change number of items per page
  document.getElementById("itemsPerPage")?.addEventListener("change", (e) => {
    itemsPerPage = parseInt(e.target.value);
    localStorage.setItem("itemsPerPage", itemsPerPage);

    currentPage = 1; // Reset to first page
    renderFilteredExpenses(); // Re-render
  });

  // Pagination buttons
  document.getElementById("prevPage")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderFilteredExpenses();
    }
  });

  document.getElementById("nextPage")?.addEventListener("click", () => {
    const totalPages = Math.ceil(
      getCurrentFilteredExpenses().length / itemsPerPage,
    );
    if (currentPage < totalPages) {
      currentPage++;
      renderFilteredExpenses();
    }
  });

  document
    .getElementById("downloadExpensesBtn")
    .addEventListener("click", () => {
      const userDetails = JSON.parse(localStorage.getItem("userDetails"));

      if (!userDetails || !userDetails.isPremium) {
        document.getElementById("buyPremiumBtn").click();
        return;
      }

      // Example image URLs (replace with backend-generated later)
      const imageMap = {
        daily:
          "https://drive.google.com/uc?id=1vL9FTtFlkcNH8TfOhaLg_-0XXcZDo92U",
        weekly:
          "https://drive.google.com/uc?id=1vL9FTtFlkcNH8TfOhaLg_-0XXcZDo92U",
        monthly:
          "https://drive.google.com/uc?id=1vL9FTtFlkcNH8TfOhaLg_-0XXcZDo92U",
      };

      window.open(imageMap[currentFilter], "_blank");
    });

  document.getElementById("premiumHint").addEventListener("click", () => {
    document.getElementById("buyPremiumBtn").click();
  });

  // ── Modal control ────────────────────────────────────────
  const modal = document.getElementById("addModal");
  const modalContent = modal.querySelector("div");
  const openBtn = document.getElementById("openAddBtn");
  const closeBtn = document.getElementById("closeAddBtn");

  function openModal() {
    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.classList.add("opacity-100", "pointer-events-auto");
    modalContent.classList.remove("scale-95", "opacity-0");
    modalContent.classList.add("scale-100", "opacity-100");
  }

  function closeModal() {
    modal.classList.add("opacity-0", "pointer-events-none");
    modal.classList.remove("opacity-100", "pointer-events-auto");
    modalContent.classList.add("scale-95", "opacity-0");
    modalContent.classList.remove("scale-100", "opacity-100");
    document.getElementById("expenseForm").reset();
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  //ASK AI
  const askAIBtn = document.getElementById("askAI");
  const askAIModal = document.getElementById("askAIModal");
  const closeAskAIBtn = document.getElementById("closeAskAIBtn");
  const sendAskAIBtn = document.getElementById("sendAskAIBtn");
  const askAIInput = document.getElementById("askAIInput");
  const askAIResponse = document.getElementById("askAIResponse");

  function openAskAIModal() {
    askAIModal.classList.remove("opacity-0", "pointer-events-none");
    askAIModal.classList.add("opacity-100", "pointer-events-auto");
    askAIModal.querySelector("div").classList.remove("scale-95", "opacity-0");
    askAIModal.querySelector("div").classList.add("scale-100", "opacity-100");
  }

  function closeAskAIModal() {
    askAIModal.classList.add("opacity-0", "pointer-events-none");
    askAIModal.classList.remove("opacity-100", "pointer-events-auto");
    askAIModal.querySelector("div").classList.add("scale-95", "opacity-0");
    askAIModal
      .querySelector("div")
      .classList.remove("scale-100", "opacity-100");
    askAIInput.value = "";
    askAIResponse.textContent = "";
  }

  if (askAIBtn) askAIBtn.addEventListener("click", openAskAIModal);
  if (closeAskAIBtn) closeAskAIBtn.addEventListener("click", closeAskAIModal);

  askAIModal.addEventListener("click", (e) => {
    if (e.target === askAIModal) closeAskAIModal();
  });

  // ── Leaderboard Modal ─────────────────────────────────────
  const leaderboardModal = document.getElementById("leaderboardModal");
  const leaderboardContent = document.getElementById("leaderboardContent");
  const viewLeaderboardBtn = document.getElementById("viewLeaderboardBtn");
  const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");

  function openLeaderboardModal() {
    leaderboardModal.classList.remove("opacity-0", "pointer-events-none");
    leaderboardModal.classList.add("opacity-100", "pointer-events-auto");
    leaderboardModal
      .querySelector("div")
      .classList.remove("scale-95", "opacity-0");
    leaderboardModal
      .querySelector("div")
      .classList.add("scale-100", "opacity-100");
  }

  function closeLeaderboardModal() {
    leaderboardModal.classList.add("opacity-0", "pointer-events-none");
    leaderboardModal.classList.remove("opacity-100", "pointer-events-auto");
    leaderboardModal
      .querySelector("div")
      .classList.add("scale-95", "opacity-0");
    leaderboardModal
      .querySelector("div")
      .classList.remove("scale-100", "opacity-100");
  }

  if (viewLeaderboardBtn) {
    viewLeaderboardBtn.addEventListener("click", fetchLeaderboard);
  }

  if (closeLeaderboardBtn) {
    closeLeaderboardBtn.addEventListener("click", closeLeaderboardModal);
  }

  leaderboardModal.addEventListener("click", (e) => {
    if (e.target === leaderboardModal) closeLeaderboardModal();
  });

  document.getElementById("filterDaily").addEventListener("click", () => {
    currentFilter = "daily";
    applyFilter();
  });

  document.getElementById("filterWeekly").addEventListener("click", () => {
    currentFilter = "weekly";
    applyFilter();
  });

  document.getElementById("filterMonthly").addEventListener("click", () => {
    currentFilter = "monthly";
    applyFilter();
  });

  // ── Expense logic ────────────────────────────────────────
  const expenseForm = document.getElementById("expenseForm");
  const todayList = document.getElementById("todayList");
  const todayTotalEl = document.getElementById("todayTotal");

  let todayTotal = 0;

  let allExpenses = [];
  let currentFilter = "daily";

  // ── Pagination variables ───────────────────────────────
  let currentPage = 1;
  let itemsPerPage = localStorage.getItem("itemsPerPage")
    ? parseInt(localStorage.getItem("itemsPerPage"))
    : 10;

  // Load saved preference on start
  document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("itemsPerPage");
    if (select) {
      select.value = itemsPerPage;
    }
  });

  fetchExpenses();

  // function applyFilter() {
  //   todayList.innerHTML = "";
  //   todayTotal = 0;

  //   let filteredExpenses = [];

  //   if (currentFilter === "daily") {
  //     filteredExpenses = allExpenses.filter((e) => isToday(e.date));
  //   } else if (currentFilter === "weekly") {
  //     filteredExpenses = allExpenses.filter((e) => isThisWeek(e.date));
  //   } else if (currentFilter === "monthly") {
  //     filteredExpenses = allExpenses.filter((e) => isThisMonth(e.date));
  //   }

  //   if (filteredExpenses.length === 0) {
  //     showNoExpensesPlaceholder();
  //     return;
  //   }

  //   todayTotalEl.classList.remove("opacity-50");

  //   filteredExpenses.forEach((exp) => addExpenseToList(exp));
  // }

  function applyFilter() {
    currentPage = 1; // Reset page when filter changes
    renderFilteredExpenses();
  }

  function renderFilteredExpenses() {
    todayList.innerHTML = "";
    todayTotal = 0;

    const filteredExpenses = getCurrentFilteredExpenses();

    if (filteredExpenses.length === 0) {
      showNoExpensesPlaceholder();
      updatePaginationUI(0, 1);
      return;
    }

    // Calculate pagination
    const totalItems = filteredExpenses.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredExpenses.slice(start, end);

    // Show only current page items
    pageItems.forEach((exp) => addExpenseToList(exp));

    // Update total for current filter (still full total, not page)
    filteredExpenses.forEach((exp) => {
      todayTotal += Number(exp.amount);
    });
    todayTotalEl.textContent = `₹ ${todayTotal.toLocaleString()}`;
    todayTotalEl.classList.remove("opacity-50");

    // Update pagination UI
    updatePaginationUI(totalItems, totalPages);
  }

  function updatePaginationUI(totalItems, totalPages) {
    const pageInfo = document.getElementById("pageInfo");
    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");

    if (pageInfo) {
      pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    }

    if (prevBtn) {
      prevBtn.disabled = currentPage === 1;
    }

    if (nextBtn) {
      nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
    }
  }

  expenseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById("amount").value);
    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value;

    if (isNaN(amount) || amount <= 0 || !title || !category) {
      alert("Please fill all fields correctly");
      return;
    }

    try {
      console.log({ amount, title, category });
      const res = await fetch(`${process.env.APPLICATION_BACKEND_BASE_URL}/api/expenses/addexpense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, title, category }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/login/index.html";
          return;
        }
        throw new Error(await res.text());
      }

      const expense = await res.json();
      allExpenses.unshift(expense);
      applyFilter();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Could not add expense: " + (err.message || "Unknown error"));
    }
  });

  async function fetchExpenses() {
    try {
      const res = await fetch(
        `${process.env.APPLICATION_BACKEND_BASE_URL}/api/expenses/getExpenses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/login/index.html";
          return;
        }
        throw new Error();
      }

      // const expenses = await res.json();

      // todayList.innerHTML = "";
      // todayTotal = 0;

      // let todayCount = 0;
      // expenses.forEach((exp) => {
      //   // if (isToday(exp.date)) {
      //   // }
      //   addExpenseToList(exp);
      //   todayCount++;
      // });

      // if (todayCount === 0) {
      //   showNoExpensesPlaceholder();
      // }

      allExpenses = await res.json();
      applyFilter();
    } catch (err) {
      console.error("Fetch failed", err);
      todayList.innerHTML = `<div class="p-12 text-center text-rose-600">Failed to load expenses</div>`;
    }
  }

  function addExpenseToList(exp) {
    const item = document.createElement("div");
    // Use exp.id if exists, otherwise exp._id
    const expenseId = exp.id || exp._id;
    item.dataset.id = expenseId;

    item.className =
      "expense-item p-5 sm:p-6 flex items-center gap-5 hover:bg-teal-50/70 transition relative group";

    const time = new Date(exp.date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    item.innerHTML = `
    <div class="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
      ${getEmoji(exp.category)}
    </div>
    <div class="flex-1 min-w-0">
      <div class="font-medium text-lg text-teal-900 truncate">${exp.title}</div>
      <div class="text-sm text-teal-700/80">${time} • ${exp.category}</div>
    </div>
    <div class="font-bold text-rose-500 text-xl whitespace-nowrap">–₹${Number(exp.amount).toLocaleString()}</div>
    <button class="delete-btn absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-rose-500 hover:text-rose-700 text-xl"
            title="Delete expense">
      🗑
    </button>
  `;

    item.querySelector(".delete-btn").addEventListener("click", async () => {
      if (!confirm("Delete this expense?")) return;

      try {
        const res = await fetch(
          `${process.env.APPLICATION_BACKEND_BASE_URL}/api/expenses/delete/${expenseId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login/index.html";
            return;
          }
          const errData = await res.json();
          throw new Error(errData.message || "Delete failed");
        }

        const amt = Number(exp.amount);
        todayTotal = Math.max(0, todayTotal - amt);
        todayTotalEl.textContent = `₹ ${todayTotal.toLocaleString()}`;

        item.remove();

        if (todayList.children.length === 0) {
          showNoExpensesPlaceholder();
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert("Could not delete expense: " + (err.message || "Server error"));
      }
    });

    todayList.prepend(item);

    // const amt = Number(exp.amount);
    // todayTotal += amt;
    // todayTotalEl.textContent = `₹ ${todayTotal.toLocaleString()}`;
  }

  // ask ai api

  sendAskAIBtn.addEventListener("click", async () => {
    const question = askAIInput.value.trim();
    if (!question) {
      alert("Please enter a question");
      return;
    }

    try {
      sendAskAIBtn.disabled = true;
      sendAskAIBtn.textContent = "Thinking...";
      askAIResponse.textContent = "";

      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.APPLICATION_BACKEND_BASE_URL}/api/callAI/callai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: question }),
      });

      if (!res.ok) throw new Error("AI request failed");

      const data = await res.json();

      // assuming backend returns { reply: "..." }
      askAIResponse.textContent = data.response || "No response from AI 🤖";
    } catch (err) {
      console.error(err);
      askAIResponse.textContent = "Something went wrong while talking to AI.";
    } finally {
      sendAskAIBtn.disabled = false;
      sendAskAIBtn.textContent = "Ask AI";
    }
  });

  function showNoExpensesPlaceholder() {
    let message = "";
    let emoji = "";
    let motivation = "";

    if (currentFilter === "daily") {
      message = "No expenses today yet";
      emoji = "☀️";
      motivation = "A spend-free day? Nice 😎";
    }

    if (currentFilter === "weekly") {
      message = "No expenses recorded this week";
      emoji = "📆";
      motivation = "Looks like a quiet week 💆";
    }

    if (currentFilter === "monthly") {
      message = "No expenses for this month";
      emoji = "🗓️";
      motivation = "Fresh month, fresh start 🌱";
    }

    todayList.innerHTML = `
    <div class="py-16 text-center text-teal-500/70">
      <div class="text-4xl mb-3">${emoji}</div>

      <div class="text-lg font-semibold mb-1">
        ${message}
      </div>

      <div class="text-sm italic mb-4">
        ${motivation}
      </div>

      <button
        onclick="document.getElementById('openAddBtn').click()"
        class="mt-2 px-5 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
      >
        + Add Expense
      </button>
    </div>
  `;

    // 🔹 Grey total when empty
    todayTotalEl.textContent = "₹ 0";
    todayTotalEl.classList.add("opacity-50");
  }

  function isToday(dateStr) {
    return new Date(dateStr).toDateString() === new Date().toDateString();
  }

  function isThisWeek(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return date >= startOfWeek && date < endOfWeek;
  }

  function isThisMonth(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  function getCurrentFilteredExpenses() {
    if (currentFilter === "daily") {
      return allExpenses.filter((e) => isToday(e.date));
    }
    if (currentFilter === "weekly") {
      return allExpenses.filter((e) => isThisWeek(e.date));
    }
    if (currentFilter === "monthly") {
      return allExpenses.filter((e) => isThisMonth(e.date));
    }
    return allExpenses; // fallback
  }

  function getEmoji(cat) {
    const map = {
      "Food & Drinks": "🍴",
      Transport: "🚕",
      Shopping: "🛍️",
      Bills: "💡",
      Entertainment: "🎬",
      Health: "🩺",
      Petrol: "⛽",
      Salary: "💰",
      Other: "📌",
    };
    return map[cat] || "📌";
  }
});

"use strict";


(() => {

  /* ==========================================
     TEST MODE

     true
     ----------------
     テストモード
     ・1日2回制限なし
     ・何度でも抽選可能
     ・依頼被りなし
     ・履歴保存あり

     false
     ----------------
     本番モード
     ・1日2回まで
     ・日本時間0:00で翌日扱い
     ・依頼被りなし
  ========================================== */

  const TEST_MODE = true;


  /* ==========================================
     1日の最大抽選回数
  ========================================== */

  const MAX_DRAWS_PER_DAY = 2;


  /* ==========================================
     DOM
  ========================================== */

  const screens =
    document.querySelectorAll(".screen");

  const startButton =
    document.querySelector("#start-button");

  const sourceCards =
    document.querySelectorAll(".broker-card");

  const historyButtonStart =
    document.querySelector("#history-button-start");

  const historyButton =
    document.querySelector("#history-button");

  const resultHistoryButton =
    document.querySelector("#result-history-button");

  const lockedHistoryButton =
    document.querySelector("#locked-history-button");

  const backButton =
    document.querySelector("#back-button");

  const brokerBackButton =
    document.querySelector("#broker-back-button");

  const lockedBackButton =
    document.querySelector("#locked-back-button");

  const resultHomeButton =
    document.querySelector("#result-home-button");

  const nextRequestButton =
    document.querySelector("#next-request-button");

  const resetButton =
    document.querySelector("#reset-button");

  const testPanel =
    document.querySelector("#test-panel");

  const todayMessage =
    document.querySelector("#today-message");

  const dailyStatus =
    document.querySelector("#daily-status");

  const brokerDailyStatus =
    document.querySelector("#broker-daily-status");

  const resultCategory =
    document.querySelector("#result-category");

  const resultNumber =
    document.querySelector("#result-number");

  const resultTitle =
    document.querySelector("#result-title");

  const resultDescription =
    document.querySelector("#result-description");

  const resultClient =
    document.querySelector("#result-client");

  const resultReward =
    document.querySelector("#result-reward");

  const historyList =
    document.querySelector("#history-list");


  /* ==========================================
     STORAGE
  ========================================== */

  const HISTORY_KEY =
    "uraTokyoRequestHistory";

  const DAILY_DRAW_KEY =
    "uraTokyoDailyDraw";


  /* ==========================================
     初期設定
  ========================================== */

  function initialize() {

    if (
      !window.REQUEST_DATA ||
      !Array.isArray(window.REQUEST_DATA)
    ) {

      console.error(
        "REQUEST_DATA が読み込まれていません。"
      );

      alert(
        "依頼データの読み込みに失敗しました。"
      );

      return;
    }


    if (TEST_MODE) {

      if (testPanel) {
        testPanel.style.display = "block";
      }

    }

    else {

      if (testPanel) {
        testPanel.style.display = "none";
      }

    }


    updateDailyStatus();

  }


  /* ==========================================
     画面切り替え
  ========================================== */

  function showScreen(id) {

    screens.forEach(
      screen => {

        screen.classList.remove(
          "active"
        );

      }
    );


    const target =
      document.querySelector(
        `#${id}`
      );


    if (target) {

      target.classList.add(
        "active"
      );

    }


    updateDailyStatus();

  }


  /* ==========================================
     日本時間の日付
  ========================================== */

  function getJapanDate() {

    const parts =
      new Intl.DateTimeFormat(
        "ja-JP",
        {
          timeZone: "Asia/Tokyo",

          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }
      ).formatToParts(
        new Date()
      );


    const values = {};


    parts.forEach(
      part => {

        if (
          part.type !== "literal"
        ) {

          values[part.type] =
            part.value;

        }

      }
    );


    return (
      `${values.year}-` +
      `${values.month}-` +
      `${values.day}`
    );

  }


  /* ==========================================
     日本時間の日時
  ========================================== */

  function getJapanDateTime() {

    return new Intl.DateTimeFormat(
      "ja-JP",
      {
        timeZone: "Asia/Tokyo",

        year: "numeric",
        month: "2-digit",
        day: "2-digit",

        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    ).format(
      new Date()
    );

  }


  /* ==========================================
     履歴取得
  ========================================== */

  function getHistory() {

    try {

      const data =
        localStorage.getItem(
          HISTORY_KEY
        );


      if (!data) {
        return [];
      }


      const parsed =
        JSON.parse(data);


      if (!Array.isArray(parsed)) {
        return [];
      }


      return parsed;

    }

    catch (error) {

      console.error(
        "履歴の読み込みに失敗しました。",
        error
      );

      return [];

    }

  }


  /* ==========================================
     履歴保存
  ========================================== */

  function saveHistory(history) {

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(history)
    );

  }


  /* ==========================================
     今日の抽選回数
  ========================================== */

  function getTodayDrawCount() {

    if (TEST_MODE) {
      return 0;
    }


    const today =
      getJapanDate();


    try {

      const raw =
        localStorage.getItem(
          DAILY_DRAW_KEY
        );


      if (!raw) {
        return 0;
      }


      const data =
        JSON.parse(raw);


      if (
        !data ||
        data.date !== today
      ) {

        return 0;
      }


      const count =
        Number(data.count);


      if (
        !Number.isFinite(count) ||
        count < 0
      ) {

        return 0;
      }


      return count;

    }

    catch (error) {

      console.error(
        "抽選回数の読み込みに失敗しました。",
        error
      );

      return 0;

    }

  }


  /* ==========================================
     抽選回数を増やす
  ========================================== */

  function incrementTodayDrawCount() {

    if (TEST_MODE) {
      return;
    }


    const today =
      getJapanDate();


    const currentCount =
      getTodayDrawCount();


    const data = {

      date: today,

      count:
        currentCount + 1

    };


    localStorage.setItem(
      DAILY_DRAW_KEY,
      JSON.stringify(data)
    );

  }


  /* ==========================================
     上限確認
  ========================================== */

  function hasReachedDailyLimit() {

    if (TEST_MODE) {
      return false;
    }


    return (
      getTodayDrawCount() >=
      MAX_DRAWS_PER_DAY
    );

  }


  /* ==========================================
     今日の状態表示
  ========================================== */

  function updateDailyStatus() {

    if (TEST_MODE) {

      if (dailyStatus) {

        dailyStatus.textContent =
          "TEST MODE｜抽選回数制限なし";

      }


      if (brokerDailyStatus) {

        brokerDailyStatus.textContent =
          "TEST MODE｜抽選回数制限なし";

      }


      return;
    }


    const count =
      Math.min(
        getTodayDrawCount(),
        MAX_DRAWS_PER_DAY
      );


    const text =
      `本日の依頼　${count} / ${MAX_DRAWS_PER_DAY}`;


    if (dailyStatus) {

      dailyStatus.textContent =
        text;

    }


    if (brokerDailyStatus) {

      brokerDailyStatus.textContent =
        text;

    }

  }


  /* ==========================================
     未取得依頼
  ========================================== */

  function getAvailableRequests(type) {

    const history =
      getHistory();


    const receivedIds =
      history.map(
        item => item.id
      );


    return window.REQUEST_DATA.filter(
      request => {

        return (
          request.type === type &&
          !receivedIds.includes(
            request.id
          )
        );

      }
    );

  }


  /* ==========================================
     抽選
  ========================================== */

  function drawRequest(type) {

    if (
      hasReachedDailyLimit()
    ) {

      showScreen(
        "locked-screen"
      );

      return;
    }


    const available =
      getAvailableRequests(
        type
      );


    if (
      available.length === 0
    ) {

      const sourceName =
        type === "daily"
          ? "掲示板"
          : "情報屋";


      alert(
        `${sourceName}から受け取れる依頼は、すべて取得済みです。`
      );

      return;
    }


    const randomIndex =
      Math.floor(
        Math.random() *
        available.length
      );


    const selected =
      available[randomIndex];


    const history =
      getHistory();


    const historyItem = {

      ...selected,

      receivedAt:
        getJapanDateTime(),

      receivedDate:
        getJapanDate()

    };


    history.push(
      historyItem
    );


    saveHistory(
      history
    );


    incrementTodayDrawCount();


    displayResult(
      selected
    );

  }


  /* ==========================================
     結果表示
  ========================================== */

  function displayResult(request) {

    if (
      request.type === "daily"
    ) {

      resultCategory.textContent =
        "BOARD / DAILY";

    }

    else {

      resultCategory.textContent =
        "BROKER / UNDERGROUND";

    }


    resultNumber.textContent =
      `REQUEST ${request.id}`;


    resultTitle.textContent =
      request.title;


    resultDescription.textContent =
      request.description;


    resultClient.textContent =
      request.client;


    resultReward.textContent =
      request.reward;


    const card =
      document.querySelector(
        ".request-card"
      );


    if (card) {

      card.classList.remove(
        "daily-result",
        "underground-result"
      );


      if (
        request.type ===
        "underground"
      ) {

        card.classList.add(
          "underground-result"
        );

      }

      else {

        card.classList.add(
          "daily-result"
        );

      }

    }


    updateResultMessage();


    showScreen(
      "result-screen"
    );

  }


  /* ==========================================
     結果メッセージ
  ========================================== */

  function updateResultMessage() {

    if (TEST_MODE) {

      todayMessage.innerHTML =
        "TEST MODE<br>" +
        "抽選回数制限を解除しています。";


      nextRequestButton.style.display =
        "inline-block";


      nextRequestButton.textContent =
        "TEST：もう一件引く";


      return;
    }


    const count =
      getTodayDrawCount();


    if (
      count <
      MAX_DRAWS_PER_DAY
    ) {

      const remaining =
        MAX_DRAWS_PER_DAY -
        count;


      todayMessage.innerHTML =
        `本日 ${count} / ${MAX_DRAWS_PER_DAY}件の依頼を受け取りました。<br>` +
        `あと${remaining}件受け取れます。`;


      nextRequestButton.style.display =
        "inline-block";


      nextRequestButton.textContent =
        "もう一件依頼を受ける";

    }

    else {

      todayMessage.innerHTML =
        `本日 ${MAX_DRAWS_PER_DAY} / ${MAX_DRAWS_PER_DAY}件の依頼を受け取りました。<br>` +
        "本日の受付は終了しました。<br>" +
        "次の依頼は日本時間 0:00 以降に受け取れます。";


      nextRequestButton.style.display =
        "none";

    }

  }


  /* ==========================================
     履歴
  ========================================== */

  function displayHistory() {

    const history =
      getHistory();


    historyList.innerHTML =
      "";


    if (
      history.length === 0
    ) {

      historyList.innerHTML = `
        <div class="empty-history">
          まだ依頼を受け取っていません。
        </div>
      `;


      showScreen(
        "history-screen"
      );


      return;
    }


    const reversed =
      [...history].reverse();


    reversed.forEach(
      item => {

        const element =
          document.createElement(
            "div"
          );


        element.className =
          `history-item ${item.type}`;


        const category =
          item.type === "daily"
            ? "BOARD / DAILY"
            : "BROKER / UNDERGROUND";


        element.innerHTML = `
          <div class="history-top">

            <span class="history-category">
              ${category}
            </span>

            <span class="history-date">
              ${escapeHTML(
                item.receivedAt
              )}
            </span>

          </div>

          <h3>
            ${escapeHTML(
              item.title
            )}
          </h3>

          <p>
            ${escapeHTML(
              item.description
            )}
          </p>

          <div class="history-bottom">

            <span>
              CLIENT：
              ${escapeHTML(
                item.client
              )}
            </span>

            <span>
              REWARD：
              ${escapeHTML(
                item.reward
              )}
            </span>

          </div>
        `;


        historyList.appendChild(
          element
        );

      }
    );


    showScreen(
      "history-screen"
    );

  }


  /* ==========================================
     HTMLエスケープ
  ========================================== */

  function escapeHTML(value) {

    return String(value)

      .replaceAll(
        "&",
        "&amp;"
      )

      .replaceAll(
        "<",
        "&lt;"
      )

      .replaceAll(
        ">",
        "&gt;"
      )

      .replaceAll(
        '"',
        "&quot;"
      )

      .replaceAll(
        "'",
        "&#039;"
      );

  }


  /* ==========================================
     TESTデータリセット
  ========================================== */

  function resetTestData() {

    if (!TEST_MODE) {
      return;
    }


    const confirmed =
      confirm(
        "受け取り履歴と抽選記録をすべて削除しますか？"
      );


    if (!confirmed) {
      return;
    }


    localStorage.removeItem(
      HISTORY_KEY
    );


    localStorage.removeItem(
      DAILY_DRAW_KEY
    );


    alert(
      "テストデータをリセットしました。"
    );


    updateDailyStatus();


    showScreen(
      "start-screen"
    );

  }


  /* ==========================================
     START
  ========================================== */

  startButton.addEventListener(
    "click",
    () => {

      if (
        hasReachedDailyLimit()
      ) {

        showScreen(
          "locked-screen"
        );

        return;
      }


      showScreen(
        "broker-screen"
      );

    }
  );


  /* ==========================================
     掲示板 / 情報屋
  ========================================== */

  sourceCards.forEach(
    card => {

      card.addEventListener(
        "click",
        () => {

          const type =
            card.dataset.type;


          drawRequest(
            type
          );

        }
      );

    }
  );


  /* ==========================================
     もう一件
  ========================================== */

  nextRequestButton.addEventListener(
    "click",
    () => {

      if (TEST_MODE) {

        showScreen(
          "broker-screen"
        );

        return;
      }


      if (
        hasReachedDailyLimit()
      ) {

        showScreen(
          "locked-screen"
        );

        return;
      }


      showScreen(
        "broker-screen"
      );

    }
  );


  /* ==========================================
     RESET
  ========================================== */

  resetButton.addEventListener(
    "click",
    resetTestData
  );


  /* ==========================================
     HISTORY
  ========================================== */

  historyButtonStart.addEventListener(
    "click",
    displayHistory
  );


  historyButton.addEventListener(
    "click",
    displayHistory
  );


  resultHistoryButton.addEventListener(
    "click",
    displayHistory
  );


  lockedHistoryButton.addEventListener(
    "click",
    displayHistory
  );


  /* ==========================================
     BACK / TOP
  ========================================== */

  backButton.addEventListener(
    "click",
    () => {

      showScreen(
        "start-screen"
      );

    }
  );


  brokerBackButton.addEventListener(
    "click",
    () => {

      showScreen(
        "start-screen"
      );

    }
  );


  lockedBackButton.addEventListener(
    "click",
    () => {

      showScreen(
        "start-screen"
      );

    }
  );


  resultHomeButton.addEventListener(
    "click",
    () => {

      showScreen(
        "start-screen"
      );

    }
  );


  /* ==========================================
     START
  ========================================== */

  initialize();

})();
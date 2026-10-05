"use strict";


(() => {

  /* ==========================================
     TEST MODE

     true
     → テストモード
     → 1日1回制限なし
     → 何度でも抽選可能
     → 依頼被りなしは有効

     false
     → 本番モード
     → 1日1回
     → 日本時間0時リセット
  ========================================== */

  const TEST_MODE = true;


  /* ==========================================
     DOM
  ========================================== */

  const screens =
    document.querySelectorAll(".screen");


  const startButton =
    document.querySelector("#start-button");


  const brokerCards =
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


  const testNextButton =
    document.querySelector("#test-next-button");


  const resetButton =
    document.querySelector("#reset-button");


  const testPanel =
    document.querySelector("#test-panel");


  const todayMessage =
    document.querySelector("#today-message");


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
     STORAGE KEY
  ========================================== */

  const HISTORY_KEY =
    "uraTokyoRequestHistory";


  const LAST_DRAW_KEY =
    "uraTokyoLastDraw";


  /* ==========================================
     初期設定
  ========================================== */

  function initialize() {

    /*
      TEST_MODEでなければ
      テスト用UIを消す
    */

    if (!TEST_MODE) {

      if (testPanel) {
        testPanel.style.display = "none";
      }


      if (testNextButton) {
        testNextButton.style.display = "none";
      }

    }


    /*
      TEST_MODEの場合
      結果画面の説明変更
    */

    if (TEST_MODE && todayMessage) {

      todayMessage.innerHTML =
        "TEST MODE<br>1日1回制限を解除しています。";

    }

  }


  /* ==========================================
     画面切り替え
  ========================================== */

  function showScreen(id) {

    screens.forEach(screen => {

      screen.classList.remove(
        "active"
      );

    });


    const target =
      document.querySelector(
        `#${id}`
      );


    if (target) {

      target.classList.add(
        "active"
      );

    }

  }


  /* ==========================================
     日本時間の日付

     例:
     2026-10-06
  ========================================== */

  function getJapanDate() {

    const formatter =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "Asia/Tokyo",

          year:
            "numeric",

          month:
            "2-digit",

          day:
            "2-digit"
        }
      );


    return formatter.format(
      new Date()
    );

  }


  /* ==========================================
     日本時間の日時
  ========================================== */

  function getJapanDateTime() {

    return new Intl.DateTimeFormat(
      "ja-JP",
      {
        timeZone:
          "Asia/Tokyo",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",

        hour:
          "2-digit",

        minute:
          "2-digit",

        second:
          "2-digit"
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


      return JSON.parse(data);

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
     今日すでに受け取ったか
  ========================================== */

  function hasDrawnToday() {

    /*
      TEST_MODEなら
      必ずfalse

      = 何回でも引ける
    */

    if (TEST_MODE) {

      return false;

    }


    const today =
      getJapanDate();


    const lastDraw =
      localStorage.getItem(
        LAST_DRAW_KEY
      );


    return lastDraw === today;

  }


  /* ==========================================
     未取得依頼を取得

     履歴に存在するIDは除外する
     ↓
     同じ依頼は二度と出ない
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
     ランダム抽選
  ========================================== */

  function drawRequest(type) {

    /*
      本番時の
      1日1回チェック
    */

    if (hasDrawnToday()) {

      showScreen(
        "locked-screen"
      );

      return;

    }


    /*
      未取得依頼
    */

    const available =
      getAvailableRequests(
        type
      );


    /*
      全部取得済み
    */

    if (available.length === 0) {

      alert(
        "この情報屋から受け取れる依頼は、すべて取得済みです。"
      );

      return;

    }


    /*
      ランダム抽選
    */

    const randomIndex =
      Math.floor(
        Math.random() *
        available.length
      );


    const selected =
      available[randomIndex];


    /*
      履歴取得
    */

    const history =
      getHistory();


    /*
      履歴データ作成
    */

    const historyItem = {

      ...selected,

      receivedAt:
        getJapanDateTime(),

      receivedDate:
        getJapanDate()

    };


    /*
      履歴追加
    */

    history.push(
      historyItem
    );


    saveHistory(
      history
    );


    /*
      最終抽選日を保存

      TEST_MODEでも保存しておく。
      本番へ切り替えたときにも
      データ構造が変わらないため。
    */

    localStorage.setItem(
      LAST_DRAW_KEY,
      getJapanDate()
    );


    /*
      結果表示
    */

    displayResult(
      selected
    );

  }


  /* ==========================================
     結果表示
  ========================================== */

  function displayResult(request) {

    /*
      CATEGORY
    */

    if (
      request.type ===
      "daily"
    ) {

      resultCategory.textContent =
        "DAILY";

    }

    else {

      resultCategory.textContent =
        "UNDERGROUND";

    }


    /*
      REQUEST ID
    */

    resultNumber.textContent =
      `REQUEST #${request.id}`;


    /*
      TITLE
    */

    resultTitle.textContent =
      request.title;


    /*
      DESCRIPTION
    */

    resultDescription.textContent =
      request.description;


    /*
      CLIENT
    */

    resultClient.textContent =
      request.client;


    /*
      REWARD
    */

    resultReward.textContent =
      request.reward;


    /*
      カテゴリ別デザイン
    */

    const card =
      document.querySelector(
        ".request-card"
      );


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


    /*
      結果画面
    */

    showScreen(
      "result-screen"
    );

  }


  /* ==========================================
     履歴表示
  ========================================== */

  function displayHistory() {

    const history =
      getHistory();


    historyList.innerHTML =
      "";


    /*
      履歴なし
    */

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


    /*
      新しい順に並べる
    */

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
            ? "DAILY"
            : "UNDERGROUND";


        element.innerHTML = `

          <div class="history-top">

            <span class="history-category">
              ${category}
            </span>

            <span class="history-date">
              ${escapeHTML(item.receivedAt)}
            </span>

          </div>


          <h3>
            ${escapeHTML(item.title)}
          </h3>


          <p>
            ${escapeHTML(item.description)}
          </p>


          <div class="history-bottom">

            <span>
              CLIENT：
              ${escapeHTML(item.client)}
            </span>

            <span>
              REWARD：
              ${escapeHTML(item.reward)}
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
     テストデータリセット
  ========================================== */

  function resetTestData() {

    /*
      TEST_MODE以外では
      実行させない
    */

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


    /*
      履歴削除
    */

    localStorage.removeItem(
      HISTORY_KEY
    );


    /*
      最終抽選日削除
    */

    localStorage.removeItem(
      LAST_DRAW_KEY
    );


    alert(
      "テストデータをリセットしました。"
    );


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

      /*
        本番モードで
        本日受取済みの場合
      */

      if (
        hasDrawnToday()
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
     情報屋選択
  ========================================== */

  brokerCards.forEach(
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
     TEST：もう一度引く
  ========================================== */

  testNextButton.addEventListener(
    "click",
    () => {

      if (!TEST_MODE) {

        return;

      }


      showScreen(
        "broker-screen"
      );

    }
  );


  /* ==========================================
     TEST：データリセット
  ========================================== */

  resetButton.addEventListener(
    "click",
    resetTestData
  );


  /* ==========================================
     履歴ボタン
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
     BACK
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


  /* ==========================================
     起動
  ========================================== */

  initialize();

})();
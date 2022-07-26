'use strict';

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var appPuzzle = function appPuzzle() {
  // game
  var $appNode = document.getElementById('app__puzzle');
  var $appNodeLock = document.getElementById('app__puzzle--lock');
  var $appShuffle = document.getElementById('app__shuffle');
  var $appCounter = document.getElementById('app__counter');
  var $appResultCount = document.getElementById('app__result--count');
  var $appResultTime = document.getElementById('app__result--time');
  var $appRecordCount = document.getElementById('app__record--count');
  var $appRecordTime = document.getElementById('app__record--time');
  var $appItemsNodes = Array.from($appNode.querySelectorAll('.app__puzzle--btn'));
  var $appShuffleElem = document.querySelector('.app__puzzle--shuffle');
  var $appRulesElem = document.querySelector('.app__rules');
  var $appBoxElem = document.querySelector('.app__box');
  var $appPublickElem = document.querySelector('.app__puzzle--public');
  var $appRecordElem = document.querySelector('.app__record');
  var $appTimeElem = document.querySelector('.app__record--time');
  var $appActualElem = document.querySelector('.app__actual'); // audio

  var $validAudio = new Audio('./audio/valid.mp3');
  var $noValidAudio = new Audio('./audio/no-valid.mp3');
  var $wonAudio = new Audio('./audio/won.mp3');
  var $recordAudio = new Audio('./audio/record.mp3');
  var $startAudio = new Audio('./audio/start.mp3'); // preloader

  var $preloader = document.querySelector('.preloader'); // time

  var $minute = document.getElementById('minute');
  var $second = document.getElementById('second');
  var $millisecond = document.getElementById('millisecond');
  var winFlatArr = new Array(16).fill(0).map(function (_item, index) {
    return index + 1;
  });
  var data = {
    count: 0,
    maxCount: 9999,
    time: '00:00:00',
    ms: 0,
    limit: 3599990
  }; // variables

  var blankNumber = 16;
  var countItems = 16;
  var countLine = 4;
  var maxShuffleCount = 100;
  var shuffled = false;
  var matrix = [];
  var blockedCoords = null;
  var shuffleCount = null;
  var timer = null;
  var minute = 0;
  var second = 0;
  var millisecond = 0;
  var interval = null;
  $appCounter.textContent = data.count;
  /** Reset time */

  var resetTimer = function resetTimer() {
    minute = 0;
    second = 0;
    millisecond = 0;
    $millisecond.textContent = addZero(millisecond);
    $second.textContent = addZero(second);
    $minute.textContent = addZero(minute);
  };

  var timeWonGame = function timeWonGame() {
    return "".concat(addZero(minute), ":").concat(addZero(second), ":").concat(addZero(millisecond));
  };
  /** Check result */


  var recordResult = function recordResult() {
    var storage = JSON.parse(localStorage.getItem('data'));
    $appRecordCount.textContent = storage.count;
    $appRecordTime.textContent = storage.time;
  };

  var noValidClick = function noValidClick() {
    if (window.navigator && window.navigator.vibrate) {
      navigator.vibrate(100);
      audioPlay($noValidAudio);
    } else {
      audioPlay($noValidAudio);
    }
  };
  /** Zero */


  var addZero = function addZero(n) {
    return n < 10 ? '0' + n : n;
  };
  /** Hide */


  var addClass = function addClass(elem, name) {
    return elem.classList.add(name);
  };
  /** Show */


  var removeClass = function removeClass(elem, name) {
    return elem.classList.remove(name);
  };

  var notificationRecord = function notificationRecord(text) {
    $appPublickElem.textContent = text;
    addClass($appPublickElem, 'open');
    setTimeout(function () {
      return removeClass($appPublickElem, 'open');
    }, 5000);
  };

  var totalCount = function totalCount() {
    if (data.count < data.maxCount) {
      data.count++;
      $appCounter.textContent = data.count;
    }
  };

  var removePreloader = function removePreloader() {
    if (!$preloader.classList.contains('hide')) {
      addClass($preloader, 'hide');
    }
  };

  var checkCountItems = function checkCountItems() {
    if ($appItemsNodes.length < countItems) {
      throw new Error("\u0414\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0440\u043E\u0432\u043D\u043E ".concat(countItems, " items in HTML"));
    }
  };

  var animateShuffleButton = function animateShuffleButton() {
    addClass($appShuffleElem, 'animate-btn');
    setTimeout(function () {
      removeClass($appShuffleElem, 'animate-btn');
    }, 1150);
  };

  var hideItemsLast = function hideItemsLast() {
    $appItemsNodes[countItems - 1].style.display = 'none';
  };

  var checkDatasetItems = function checkDatasetItems() {
    return $appItemsNodes.map(function (item) {
      return Number(item.dataset.matrixId);
    });
  };

  var removeDisabled = function removeDisabled() {
    if (!!$appShuffle.getAttribute('disabled')) {
      $appShuffle.removeAttribute('disabled');
    }
  };

  var removeNotificationRecord = function removeNotificationRecord() {
    if ($appPublickElem.classList.contains('open')) {
      removeClass($appPublickElem, 'open');
    }
  };

  var removeAnimateOpacity = function removeAnimateOpacity(items) {
    items.forEach(function (item) {
      if (item.classList.contains('animate-opacity')) {
        removeClass(item, 'animate-opacity');
      }
    });
  };

  var audioPlay = function audioPlay(audio) {
    return audio.play();
  };

  var resetCurrentTime = function resetCurrentTime(elem) {
    return elem.currentTime = 0;
  };
  /** Minutes */


  var clearTimer = function clearTimer() {
    if (minute === 59 && second === 59 && millisecond === 99) {
      clearInterval(interval);
      init();
    }
  };
  /** Seconds */


  var timerSeconds = function timerSeconds() {
    if (second > 59) {
      minute++;
      $minute.textContent = addZero(minute);
      second = 0;
      $second.textContent = addZero(second);
    }

    clearTimer();
  };
  /** Milliseconds */


  var timerMilliseconds = function timerMilliseconds() {
    if (millisecond > 99) {
      second++;
      $second.textContent = addZero(second);
      millisecond = 0;
      $millisecond.textContent = addZero(millisecond);
    }

    timerSeconds();
  };
  /** Timer */


  var startTimer = function startTimer() {
    millisecond++;
    $millisecond.textContent = addZero(millisecond);
    timerMilliseconds();
  };
  /** Matrix */


  var getMatrix = function getMatrix(arr) {
    var matrix = [[], [], [], []];
    var y = 0,
        x = 0;

    var _iterator = _createForOfIteratorHelper(arr),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var item = _step.value;

        if (x >= countLine) {
          y++;
          x = 0;
        }

        matrix[y][x] = item;
        x++;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return matrix;
  };
  /** Show won */


  var isWon = function isWon(matrix) {
    var flatMatrix = matrix.flat();

    for (var i = 0; i < winFlatArr.length; i++) {
      if (flatMatrix[i] !== winFlatArr[i]) {
        return false;
      }
    }

    return true;
  };

  var limitTimeGame = function limitTimeGame() {
    if (data.ms === data.limit) {
      notificationRecord('Лимит по времени исчерпан!');
      addClass($appActualElem, 'animate-opacity');
      resetTimer();
      data.count = 0;
      data.time = '00:00:00';
      audioPlay($wonAudio);
    }
  };

  var checkingGetItem = function checkingGetItem() {
    var storage = JSON.parse(localStorage.getItem('data'));

    if (data.count > 0 && storage.count === 0) {
      localStorage.setItem('data', JSON.stringify(data));
      recordResult();
      notificationRecord('Рекорд установлен!');
      addClass($appRecordElem, 'animate-opacity');
      audioPlay($recordAudio);
    }

    if (data.count !== 0 && data.count < storage.count) {
      localStorage.setItem('data', JSON.stringify(data));
      recordResult();
      notificationRecord('Новый рекорд!');
      addClass($appRecordElem, 'animate-opacity');
      audioPlay($recordAudio);
    }

    if (data.count >= storage.count && storage.count > 0) {
      notificationRecord('Рекорд не побит!');
      addClass($appActualElem, 'animate-opacity');
      audioPlay($wonAudio);
    }

    if (data.count === storage.count && data.ms < storage.ms) {
      localStorage.setItem('data', JSON.stringify(data));
      recordResult();
      notificationRecord('Время улучшено!');
      addClass($appTimeElem, 'animate-opacity');
      audioPlay($recordAudio);
    }
  };

  var checkingLocalStorage = function checkingLocalStorage() {
    limitTimeGame();

    if (localStorage.length < 1) {
      localStorage.setItem('data', JSON.stringify(data));
      recordResult();
    }

    if (localStorage.length >= 1) {
      recordResult();

      if (!!localStorage.getItem('data')) {
        checkingGetItem();
      }
    }
  };

  var addWonClass = function addWonClass() {
    if (isWon(matrix)) {
      data.time = timeWonGame();

      data.ms = function (s) {
        return 1E1 * s[2] + 1E3 * s[1] + 6E4 * s[0];
      }(data.time.split(':'));

      checkingLocalStorage();
      removeDisabled();
      clearInterval(interval);
      resetCurrentTime($wonAudio);
      $appResultCount.textContent = data.count;
      $appResultTime.textContent = data.time;
      removeClass($appNodeLock, 'hide');
      addClass($appBoxElem, 'hide');
      removeClass($appRulesElem, 'hide');
      setTimeout(function () {
        return removeClass($appNode, 'won');
      }, 70);
    } else {
      setTimeout(function () {
        return addClass($appNode, 'won');
      }, 70);
    }
  };
  /** Position */


  var setNodeStyles = function setNodeStyles(node, x, y) {
    var shiftPs = 100;
    node.style.transform = "translate3D(".concat(x * shiftPs, "%, ").concat(y * shiftPs, "%, 0)");
  };

  var setPositionItems = function setPositionItems(matrix) {
    for (var y = 0; y < matrix.length; y++) {
      for (var x = 0; x < matrix[y].length; x++) {
        var value = matrix[y][x];
        var node = $appItemsNodes[value - 1];
        setNodeStyles(node, x, y);
      }
    }

    addWonClass();
  };

  var findCoordinatesByNumber = function findCoordinatesByNumber(number, matrix) {
    for (var y = 0; y < matrix.length; y++) {
      for (var x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x] === number) return {
          y: y,
          x: x
        };
      }
    }

    return null;
  };

  var isValidForSwap = function isValidForSwap(coord01, coord02) {
    var diffX = Math.abs(coord01.x - coord02.x);
    var diffY = Math.abs(coord01.y - coord02.y);
    return (diffX === 1 || diffY === 1) && (coord01.x === coord02.x || coord01.y === coord02.y);
  };

  var swapItems = function swapItems(coords01, coords02, matrix) {
    var tempCoords = matrix[coords01.y][coords01.x];
    matrix[coords01.y][coords01.x] = matrix[coords02.y][coords02.x];
    matrix[coords02.y][coords02.x] = tempCoords;
  };

  var getСoordinatesNumber = function getСoordinatesNumber(btnCoords, blankCoords) {
    var isValid = isValidForSwap(btnCoords, blankCoords);

    if (isValid) {
      totalCount();
      resetCurrentTime($validAudio);
      audioPlay($validAudio);
      swapItems(btnCoords, blankCoords, matrix);
      setPositionItems(matrix);
    } else {
      resetCurrentTime($noValidAudio);
      noValidClick();
    }
  };
  /** Shuffle-1 or Shuffle-2  */

  /** Shuffle-2 */
  // const shuffleArray = arr => {
  //   return arr
  //     .map( value => ({ value, sort: Math.random() }))
  //     .sort((a, b) => a.sort - b.sort)
  //     .map(({ value }) => value);
  // };
  // const clickShuffleItems = () => {
  //   matrix = getMatrix(shuffleArray(matrix.flat()));
  //   setPositionItems(matrix);
  //   addWonClass();
  // };

  /** Shuffle-2 */


  var findValidCoords = function findValidCoords(_ref) {
    var blankCoords = _ref.blankCoords,
        matrix = _ref.matrix,
        blockedCoords = _ref.blockedCoords;
    var validCoords = [];

    for (var y = 0; y < matrix.length; y++) {
      for (var x = 0; x < matrix[y].length; x++) {
        if (isValidForSwap({
          x: x,
          y: y
        }, blankCoords)) {
          if (!blockedCoords || !(blockedCoords.x === x && blockedCoords.y === y)) {
            validCoords.push({
              x: x,
              y: y
            });
          }
        }
      }
    }

    return validCoords;
  };

  var randomSwap = function randomSwap(matrix) {
    var blankCoords = findCoordinatesByNumber(blankNumber, matrix);
    var validCoords = findValidCoords({
      blankCoords: blankCoords,
      matrix: matrix,
      blockedCoords: blockedCoords
    });
    var swapCoords = validCoords[Math.floor(Math.random() * validCoords.length)];
    swapItems(blankCoords, swapCoords, matrix);
    blockedCoords = blankCoords;
  };

  var startingGame = function startingGame() {
    timer = setInterval(function () {
      randomSwap(matrix);
      setPositionItems(matrix);
      $appShuffle.setAttribute('disabled', true);
      shuffleCount += 1;

      if (shuffleCount >= maxShuffleCount) {
        addClass($appNodeLock, 'hide');
        addClass($appRulesElem, 'hide');
        removeClass($appBoxElem, 'hide');
        resetTimer();
        clearInterval(timer);
        clearInterval(interval);
        interval = setInterval(startTimer, 10);
        shuffled = false;
      }
    }, 20);
  };

  var clickShuffleItems = function clickShuffleItems() {
    if (shuffled) return;
    shuffled = true;
    shuffleCount = 0;
    data.count = 0;
    $appCounter.textContent = data.count;
    removeNotificationRecord();
    removeAnimateOpacity([$appRecordElem, $appTimeElem, $appActualElem]);
    clearInterval(timer);

    if (shuffleCount === 0) {
      animateShuffleButton();
      resetCurrentTime($startAudio);
      audioPlay($startAudio);
      startingGame();
    }
  };
  /** Change position by click */


  var clickTargetItems = function clickTargetItems(_ref2) {
    var target = _ref2.target;
    if (shuffled) return;
    var btnNode = target.closest('.app__puzzle--btn');
    if (!btnNode) return;
    var btnNumber = Number(btnNode.dataset.matrixId);
    var btnCoords = findCoordinatesByNumber(btnNumber, matrix);
    var blankCoords = findCoordinatesByNumber(blankNumber, matrix);
    getСoordinatesNumber(btnCoords, blankCoords);
  };
  /** Change position by arrows */


  var isValidArrow = function isValidArrow(btnCoords, blankCoords) {
    if (btnCoords.y >= matrix.length || btnCoords.y < 0 || btnCoords.x >= matrix.length || btnCoords.x < 0) {
      return;
    }

    totalCount();
    swapItems(btnCoords, blankCoords, matrix);
    setPositionItems(matrix);
  };

  var shuffleItemsArrow = function shuffleItemsArrow(direction, btnCoords, blankCoords) {
    switch (direction) {
      case 'up':
        btnCoords.y += 1;
        break;

      case 'down':
        btnCoords.y -= 1;
        break;

      case 'left':
        btnCoords.x += 1;
        break;

      case 'right':
        btnCoords.x -= 1;
        break;
    }

    isValidArrow(btnCoords, blankCoords);
  };

  var clickArrows = function clickArrows(event) {
    if (shuffled) return;
    if (!event.key.includes('Arrow')) return;
    var blankCoords = findCoordinatesByNumber(blankNumber, matrix);
    var btnCoords = {
      x: blankCoords.x,
      y: blankCoords.y
    };
    var direction = event.key.split('Arrow')[1].toLowerCase();
    shuffleItemsArrow(direction, btnCoords, blankCoords);
  };
  /** Events */


  $appNode.addEventListener('click', clickTargetItems);
  $appShuffle.addEventListener('click', clickShuffleItems);
  document.body.addEventListener('keydown', clickArrows);
  /** Start */

  var init = function init() {
    checkCountItems();
    hideItemsLast();
    var matrixId = checkDatasetItems();
    matrix = getMatrix(matrixId);
    setPositionItems(matrix);
  };

  setTimeout(removePreloader, 2000);
  init();
};

appPuzzle();
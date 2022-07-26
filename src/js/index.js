'use strict';

const appPuzzle = () => {
  
  // game
  const $appNode = document.getElementById('app__puzzle');
  const $appNodeLock = document.getElementById('app__puzzle--lock');
  const $appShuffle = document.getElementById('app__shuffle');
  const $appCounter = document.getElementById('app__counter');

  const $appResultCount = document.getElementById('app__result--count'); 
  const $appResultTime = document.getElementById('app__result--time'); 

  const $appRecordCount = document.getElementById('app__record--count'); 
  const $appRecordTime = document.getElementById('app__record--time'); 

  const $appItemsNodes = Array.from($appNode.querySelectorAll('.app__puzzle--btn'));
  const $appShuffleElem = document.querySelector('.app__puzzle--shuffle');
  const $appRulesElem = document.querySelector('.app__rules');
  const $appBoxElem = document.querySelector('.app__box');
  const $appPublickElem = document.querySelector('.app__puzzle--public');
  const $appRecordElem = document.querySelector('.app__record');
  const $appTimeElem = document.querySelector('.app__record--time');
  const $appActualElem = document.querySelector('.app__actual');

  // audio
  const $validAudio = new Audio('./audio/valid.mp3');
  const $noValidAudio = new Audio('./audio/no-valid.mp3');
  const $wonAudio = new Audio('./audio/won.mp3');
  const $recordAudio = new Audio('./audio/record.mp3');
  const $startAudio = new Audio('./audio/start.mp3');


  // preloader
  const $preloader = document.querySelector('.preloader');

  // time
  const $minute = document.getElementById('minute');
  const $second = document.getElementById('second');
  const $millisecond = document.getElementById('millisecond');

  const winFlatArr = new Array(16).fill(0).map((_item, index) => index + 1);

  const data = {
    count: 0,
    maxCount: 9999,
    time: '00:00:00',
    ms: 0,
    limit: 3599990,
  };

  // variables
  const blankNumber = 16;
  const countItems = 16;
  const countLine = 4;
  const maxShuffleCount = 100;

  let shuffled = false;
  let matrix = [];
  let blockedCoords = null;
  let shuffleCount = null;
  let timer = null;

  let minute = 0;
  let second = 0;
  let millisecond = 0;
  let interval = null;

  $appCounter.textContent = data.count;

  /** Reset time */
  const resetTimer = () => {
    minute = 0;
    second = 0;
    millisecond = 0;
    $millisecond.textContent = addZero(millisecond);
    $second.textContent = addZero(second);
    $minute.textContent = addZero(minute);
  };

  const timeWonGame = () => `${addZero(minute)}:${addZero(second)}:${addZero(millisecond)}`;

  /** Check result */
  const recordResult = () => {
    const storage = JSON.parse(localStorage.getItem('data'));
    $appRecordCount.textContent = storage.count;
    $appRecordTime.textContent = storage.time;
  };

  const noValidClick = () => {
    if (window.navigator && window.navigator.vibrate) {
      navigator.vibrate(100);
      audioPlay($noValidAudio);
    }
    else {
      audioPlay($noValidAudio);
    }
  };

  /** Zero */
  const addZero = n => n < 10 ? '0' + n : n;

  /** Hide */
  const addClass = (elem, name) => elem.classList.add(name);

  /** Show */
  const removeClass = (elem, name) => elem.classList.remove(name);

  const notificationRecord = text => {
    $appPublickElem.textContent = text;
    addClass($appPublickElem, 'open');
    setTimeout(() => removeClass($appPublickElem, 'open'), 5000);
  };

  const totalCount = () => {
    if (data.count < data.maxCount) {
      data.count++;
      $appCounter.textContent = data.count;
    }
  };

  const removePreloader = () => {
    if (!$preloader.classList.contains('hide')) {
      addClass($preloader, 'hide');
    }
  };

  const checkCountItems = () => {
    if ($appItemsNodes.length < countItems) {
      throw new Error(`Должно быть ровно ${countItems} items in HTML`);
    }
  };

  const animateShuffleButton = () => {
    addClass($appShuffleElem, 'animate-btn');
    setTimeout(() => { removeClass($appShuffleElem, 'animate-btn') }, 1150);
  };

  const hideItemsLast = () => {
    $appItemsNodes[countItems - 1].style.display = 'none';
  };

  const checkDatasetItems = () => $appItemsNodes.map(item => Number(item.dataset.matrixId));

  const removeDisabled = () => {
    if (!!$appShuffle.getAttribute('disabled')) {
      $appShuffle.removeAttribute('disabled');
    }
  };

  const removeNotificationRecord = () => {
    if ($appPublickElem.classList.contains('open')) {
      removeClass($appPublickElem, 'open');
    }
  };

  const removeAnimateOpacity = items => {
    items.forEach(item => {
      if (item.classList.contains('animate-opacity')) {
        removeClass(item, 'animate-opacity');
      }
    });
  };

  const audioPlay = audio => audio.play();

  const resetCurrentTime = elem => elem.currentTime = 0;

  /** Minutes */
  const clearTimer = () => {
    if (minute === 59 && second === 59 && millisecond === 99) {
      clearInterval(interval);
      init();
    }
  };

  /** Seconds */
  const timerSeconds = () => {
    if (second > 59) {
      minute++;
      $minute.textContent = addZero(minute);
      second = 0;
      $second.textContent = addZero(second);
    }

    clearTimer();
  };

    /** Milliseconds */
    const timerMilliseconds = () => {
      if (millisecond > 99) {
        second++;
        $second.textContent = addZero(second);
        millisecond = 0;
        $millisecond.textContent = addZero(millisecond);
      }
      timerSeconds();
    };

  /** Timer */
  const startTimer = () => {
    millisecond++;
    $millisecond.textContent = addZero(millisecond);
    timerMilliseconds();
  };

  /** Matrix */
  const getMatrix = arr => {
    const matrix = [[], [], [], []];
    let y = 0,
        x = 0;

    for (let item of arr) {
      if (x >= countLine) {
        y++;
        x = 0;
      }
      matrix[y][x] = item;
      x++;
    }

    return matrix;
  };

  /** Show won */
  const isWon = matrix => {
    const flatMatrix = matrix.flat();
    for (let i = 0; i < winFlatArr.length; i++) {
      if (flatMatrix[i] !== winFlatArr[i]) {
        return false;
      }
    }
    return true;
  };

  const limitTimeGame = () => {
    if (data.ms === data.limit) {
      notificationRecord('Лимит по времени исчерпан!');
      addClass($appActualElem, 'animate-opacity');
      resetTimer();
      data.count = 0;
      data.time = '00:00:00';
      audioPlay($wonAudio);
    }
  };

  const checkingGetItem = () => {
    const storage = JSON.parse(localStorage.getItem('data'));

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

  const checkingLocalStorage = () => {
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

  const addWonClass = () => {
    if (isWon(matrix)) {

      data.time = timeWonGame();
      data.ms = (s => 1E1 * s[2] + 1E3 * s[1] + 6E4 * s[0])(data.time.split(':'));

      checkingLocalStorage();
      removeDisabled();

      clearInterval(interval);
      resetCurrentTime($wonAudio);
  
      $appResultCount.textContent = data.count;
      $appResultTime.textContent = data.time;
      
      removeClass($appNodeLock, 'hide');
      addClass($appBoxElem, 'hide');
      removeClass($appRulesElem, 'hide');

      setTimeout(() => removeClass($appNode, 'won'), 70);
    }
    else {
      setTimeout(() => addClass($appNode, 'won'), 70);
    }
  };

  /** Position */
  const setNodeStyles = (node, x, y) => {
    const shiftPs = 100;
    node.style.transform = `translate3D(${x * shiftPs}%, ${y * shiftPs}%, 0)`;
  };

  const setPositionItems = matrix => {

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const value = matrix[y][x];
        const node = $appItemsNodes[value - 1];
        
        setNodeStyles(node, x, y);
      }
    }

    addWonClass();
  };

  const findCoordinatesByNumber = (number, matrix) => {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x] === number) return {y, x};
      }
    }

    return null;
  };

  const isValidForSwap = (coord01, coord02) => {
    const diffX = Math.abs(coord01.x - coord02.x);
    const diffY = Math.abs(coord01.y - coord02.y);

    return (
      (diffX === 1 || diffY === 1) && 
      (coord01.x === coord02.x || coord01.y === coord02.y)
    );
  };

  const swapItems = (coords01, coords02, matrix) => {
    const tempCoords = matrix[coords01.y][coords01.x];
    matrix[coords01.y][coords01.x] = matrix[coords02.y][coords02.x];
    matrix[coords02.y][coords02.x] = tempCoords;
  };

  const getСoordinatesNumber = (btnCoords, blankCoords) => {
    const isValid = isValidForSwap(btnCoords, blankCoords);
  
    if (isValid) {
      totalCount();
      resetCurrentTime($validAudio);
      audioPlay($validAudio);
      swapItems(btnCoords, blankCoords, matrix);
      setPositionItems(matrix);
    }
    else {
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
  const findValidCoords = ({ blankCoords, matrix, blockedCoords }) => {
    const validCoords = [];

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (isValidForSwap({ x, y }, blankCoords)) {
          if (!blockedCoords || !(blockedCoords.x === x && blockedCoords.y === y)) {
            validCoords.push({ x, y });
          }
        }
      }
    }

    return validCoords;
  };

  const randomSwap = matrix => {
    const blankCoords = findCoordinatesByNumber(blankNumber, matrix);

    const validCoords = findValidCoords({ blankCoords, matrix, blockedCoords });

    const swapCoords = validCoords[
      Math.floor(Math.random() * validCoords.length)
    ];
    
    swapItems(blankCoords, swapCoords, matrix);
    blockedCoords = blankCoords;
  };

  const startingGame = () => {
    timer = setInterval(() => {
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

  const clickShuffleItems = () => {
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
  const clickTargetItems = ({ target }) => {
    if (shuffled) return;
    const btnNode = target.closest('.app__puzzle--btn');
    if (!btnNode) return;

    const btnNumber = Number(btnNode.dataset.matrixId);

    const btnCoords = findCoordinatesByNumber(btnNumber, matrix);
    const blankCoords = findCoordinatesByNumber(blankNumber, matrix);

    getСoordinatesNumber(btnCoords, blankCoords);
  };

  /** Change position by arrows */
  const isValidArrow = (btnCoords, blankCoords) => {
    if (
      btnCoords.y >= matrix.length || btnCoords.y < 0 || 
      btnCoords.x >= matrix.length || btnCoords.x < 0
    ) { 
      return; 
    }

    totalCount();
    swapItems(btnCoords, blankCoords, matrix);
    setPositionItems(matrix);
  };

  const shuffleItemsArrow = (direction, btnCoords, blankCoords) => {
    switch(direction) {
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

  const clickArrows = event => {
    if (shuffled) return;
    if (!event.key.includes('Arrow')) return;
    const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
    const btnCoords = { x: blankCoords.x, y: blankCoords.y };
    const direction = event.key.split('Arrow')[1].toLowerCase();

    shuffleItemsArrow(direction, btnCoords, blankCoords);
  };

  /** Events */
  $appNode.addEventListener('click', clickTargetItems);
  $appShuffle.addEventListener('click', clickShuffleItems);
  document.body.addEventListener('keydown', clickArrows);

  /** Start */
  const init = () => {
    checkCountItems();
    hideItemsLast();
    const matrixId = checkDatasetItems();
    matrix = getMatrix(matrixId);
    setPositionItems(matrix);
  };

  setTimeout(removePreloader, 2000);
  init();
};

appPuzzle();


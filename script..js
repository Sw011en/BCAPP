let player1Name, player2Name;
        let currentPlayer = 1; // Текущий игрок (1 или 2)
        let stats = {
            player1: { balls: 0, wins: 0, currentSeries: 0, longestSeries: 0 },
            player2: { balls: 0, wins: 0, currentSeries: 0, longestSeries: 0 }
        };
        let globalStats = {
            player1: { 'свой угол': 0, 'свой центр': 0, 'чужой угол': 0, 'чужой центр': 0, 'случайный угол': 0, 'случайный центр': 0, 'При разбое': 0, 'Подстава': 0, 'штрафной': 0 },
            player2: { 'свой угол': 0, 'свой центр': 0, 'чужой угол': 0, 'чужой центр': 0, 'случайный угол': 0, 'случайный центр': 0, 'При разбое': 0, 'Подстава': 0, 'штрафной': 0 }
        };
        let activePocket = null;
        let lastAction = null; // Последнее действие для отмены

        // Запрашиваем имена игроков при загрузке страницы
        function askPlayerNames() {
            player1Name = prompt("Введите имя первого игрока:") || "Игрок 1";
            player2Name = prompt("Введите имя второго игрока:") || "Игрок 2";
            document.getElementById('player1-name').textContent = player1Name;
            document.getElementById('player2-name').textContent = player2Name;
            document.getElementById('player1-name-longest').textContent = player1Name;
            document.getElementById('player2-name-longest').textContent = player2Name;
        }

        // Показываем меню при нажатии на лузу
        function showMenu(event) {
            event.stopPropagation();
            const pocket = event.target;

            // Если меню уже открыто на этой лузе, скрываем его
            if (activePocket === pocket && document.getElementById('menu').style.display === 'block') {
                hideMenu();
                return;
            }

            // Получаем координаты лузы относительно стола
            const pocketRect = pocket.getBoundingClientRect();
            const tableRect = document.querySelector('.pool-table').getBoundingClientRect();

            // Позиционируем меню по правому краю лузы
            const menu = document.getElementById('menu');
            menu.style.left = `${pocketRect.right - tableRect.left}px`;
            menu.style.top = `${pocketRect.top - tableRect.top}px`;
            menu.style.display = 'block';

            activePocket = pocket;
        }

        // Скрываем меню
        function hideMenu() {
            document.getElementById('menu').style.display = 'none';
            activePocket = null;
        }

        // Добавляем штраф
        function addPenalty() {
            // Начисляем шар сопернику
            const opponent = currentPlayer === 1 ? 2 : 1;
            stats[`player${opponent}`].balls++;
            globalStats[`player${opponent}`]['штрафной']++; // Учитываем штраф в общей статистике
            updateGlobalStats();
            updateCurrentStats();

            // Переход хода
            switchPlayer();

               // Проверяем, достиг ли игрок 8 шаров
               if (stats[`player${currentPlayer}`].balls >= 8) {
                stats[`player${currentPlayer}`].wins++;
                alert(`${currentPlayer === 1 ? player1Name : player2Name} побеждает в партии!`);
                resetGame();
            }
        }

        // Добавляем шар
        function addBall(type) {
            const pocketType = activePocket ? activePocket.getAttribute('data-pocket') : null; // "угол" или "центр"
            const key = pocketType ? `${type} ${pocketType}` : type; // Например, "свой угол" или "с разбоя"

            // Сохраняем последнее действие для отмены
            lastAction = { player: currentPlayer, key };

            // Обновляем глобальную статистику
            globalStats[`player${currentPlayer}`][key]++;
            updateGlobalStats();

            // Обновляем текущую статистику
            stats[`player${currentPlayer}`].balls++;
            stats[`player${currentPlayer}`].currentSeries++;

            // Проверяем, достиг ли игрок 8 шаров
            if (stats[`player${currentPlayer}`].balls >= 8) {
                stats[`player${currentPlayer}`].wins++;
                alert(`${currentPlayer === 1 ? player1Name : player2Name} побеждает в партии!`);
                resetGame();
            }

            // Обновляем самую длинную серию
            if (stats[`player${currentPlayer}`].currentSeries > stats[`player${currentPlayer}`].longestSeries) {
                stats[`player${currentPlayer}`].longestSeries = stats[`player${currentPlayer}`].currentSeries;
                updateLongestSeries();
            }

            // Обновляем отображение текущей статистики
            updateCurrentStats();

            // Скрываем меню
            hideMenu();
        }

        // Отменяем последний выбор шара
        function undoLastAction() {
            if (!lastAction) return; // Если нет последнего действия, ничего не делаем

            const { player, key } = lastAction;

            // Отменяем последнее действие
            if (globalStats[`player${player}`][key] > 0) {
                globalStats[`player${player}`][key]--;
                stats[`player${player}`].balls--;
                updateGlobalStats();
                updateCurrentStats();
            }

            lastAction = null; // Сбрасываем последнее действие
        }

        // Переход хода
        function switchPlayer() {
            // Сбрасываем текущую серию при переходе хода
            stats[`player${currentPlayer}`].currentSeries = 0;
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updateCurrentStats();
        }

        // Сброс игры
        function resetGame() {
            stats.player1.balls = 0;
            stats.player2.balls = 0;
            stats.player1.currentSeries = 0;
            stats.player2.currentSeries = 0;
            updateCurrentStats();
        }

        // Обновляем текущую статистику
        function updateCurrentStats() {
            document.getElementById('current-player').textContent = currentPlayer === 1 ? player1Name : player2Name;
            document.getElementById('player1-balls').textContent = stats.player1.balls;
            document.getElementById('player2-balls').textContent = stats.player2.balls;
            document.getElementById('player1-wins').textContent = stats.player1.wins;
            document.getElementById('player2-wins').textContent = stats.player2.wins;
        }

        // Обновляем общую статистику
        function updateGlobalStats() {
            const tbody = document.getElementById('global-stats-body');
            tbody.innerHTML = '';

            for (const player of ['player1', 'player2']) {
                for (const key in globalStats[player]) {
                    const [type, pocket] = key.split(' ');
                    const count = globalStats[player][key];
                    if (count > 0) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${player === 'player1' ? player1Name : player2Name}</td>
                            <td>${type}</td>
                            <td>${pocket || '-'}</td>
                            <td>${count}</td>
                        `;
                        tbody.appendChild(row);
                    }
                }
            }
        }

        // Обновляем самую длинную серию
        function updateLongestSeries() {
            document.getElementById('player1-longest-series').textContent = stats.player1.longestSeries;
            document.getElementById('player2-longest-series').textContent = stats.player2.longestSeries;
        }

        // Показываем/скрываем общую статистику
        function toggleStats() {
            const globalStatsDiv = document.getElementById('global-stats');
            globalStatsDiv.classList.toggle('hidden');
        }

        // Инициализация
        askPlayerNames();
        updateCurrentStats();
        updateLongestSeries();
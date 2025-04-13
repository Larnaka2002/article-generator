// Элементы DOM
const articleForm = document.getElementById('article-form');
const resultSection = document.getElementById('result-section');
const resultName = document.getElementById('result-name');
const resultDescription = document.getElementById('result-description');
const resultCode = document.getElementById('result-code');
const saveBtn = document.getElementById('save-btn');
const exportBtn = document.getElementById('export-btn');
const clearBtn = document.getElementById('clear-btn');
const savedArticles = document.getElementById('saved-articles');
const themeToggle = document.getElementById('theme-toggle');

// Глобальные переменные
let currentArticle = null;
let articles = [];
let darkTheme = localStorage.getItem('darkTheme') === 'true';
let isSupabaseConnected = false;

// Инициализация приложения
async function init() {
    // Проверка подключения к Supabase
    isSupabaseConnected = await checkSupabaseConnection();
    
    // Загрузка артикулов
    await loadArticles();
    
    // Инициализация темы
    initTheme();
    
    // Обработчики событий
    articleForm.addEventListener('submit', generateArticle);
    saveBtn.addEventListener('submit', saveArticle);
    saveBtn.addEventListener('click', saveArticle);
    exportBtn.addEventListener('click', exportToCSV);
    clearBtn.addEventListener('click', clearAllArticles);
    themeToggle.addEventListener('change', toggleTheme);
    
    // Показать сообщение о статусе подключения
    if (isSupabaseConnected) {
        showNotification('Подключение к облачному хранилищу установлено. Ваши артикулы доступны с любого устройства.', 'success');
    } else {
        showNotification('Работа в автономном режиме. Артикулы сохраняются только на этом устройстве.', 'warning');
        // Загрузка артикулов из localStorage как запасной вариант
        articles = JSON.parse(localStorage.getItem('articles')) || [];
        renderArticles();
    }
}

// Загрузка артикулов из Supabase
async function loadArticles() {
    if (isSupabaseConnected) {
        articles = await getArticlesFromSupabase();
    } else {
        articles = JSON.parse(localStorage.getItem('articles')) || [];
    }
    renderArticles();
}

// Инициализация темы
function initTheme() {
    // Проверка сохраненной темы в localStorage
    if (darkTheme) {
        document.body.classList.add('dark-theme');
        themeToggle.checked = true;
    }
}

// Переключение темы
function toggleTheme() {
    darkTheme = !darkTheme;
    document.body.classList.toggle('dark-theme');
    
    // Сохранение выбора в localStorage
    localStorage.setItem('darkTheme', darkTheme);
}

// Генерация артикула
function generateArticle(event) {
    event.preventDefault();
    
    // Получение значений из формы
    const productName = document.getElementById('product-name').value;
    const productDescription = document.getElementById('product-description').value;
    const prefix = document.getElementById('prefix').value.toUpperCase();
    
    // Генерация уникального кода артикула
    const uniqueNumber = generateUniqueNumber();
    const articleCode = `${prefix}-${uniqueNumber}`;
    
    // Сохранение текущего артикула во временную переменную
    currentArticle = {
        name: productName,
        description: productDescription,
        code: articleCode,
        created_at: new Date().toISOString()  // Изменено с dateCreated на created_at для соответствия Supabase
    };
    
    // Отображение результата
    resultName.textContent = productName;
    resultDescription.textContent = productDescription;
    resultCode.textContent = articleCode;
    resultSection.style.display = 'block';
    
    // Прокрутка к результату
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// Генерация уникального номера для артикула
function generateUniqueNumber() {
    // Текущая дата в формате ГГММДД
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateCode = `${year}${month}${day}`;
    
    // Случайное число от 1000 до 9999
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    
    return `${dateCode}-${randomNum}`;
}

// Сохранение артикула
async function saveArticle() {
    if (!currentArticle) return;
    
    let success = false;
    
    if (isSupabaseConnected) {
        // Сохранение в Supabase
        success = await saveArticleToSupabase(currentArticle);
        if (success) {
            // Обновить список артикулов
            await loadArticles();
        }
    } else {
        // Запасной вариант - сохранение в localStorage
        articles.push(currentArticle);
        localStorage.setItem('articles', JSON.stringify(articles));
        renderArticles();
        success = true;
    }
    
    if (success) {
        // Сброс формы
        articleForm.reset();
        resultSection.style.display = 'none';
        currentArticle = null;
        
        // Прокрутка к списку сохраненных артикулов
        savedArticles.scrollIntoView({ behavior: 'smooth' });
        
        showNotification('Артикул успешно сохранен', 'success');
    } else {
        showNotification('Не удалось сохранить артикул. Пожалуйста, попробуйте еще раз.', 'error');
    }
}

// Отображение списка сохраненных артикулов
function renderArticles() {
    // Очистка содержимого
    savedArticles.innerHTML = '';
    
    // Если нет сохраненных артикулов
    if (articles.length === 0) {
        savedArticles.innerHTML = '<p class="empty-message">Нет сохраненных артикулов</p>';
        return;
    }
    
    // Отображение каждого артикула
    articles.forEach((article, index) => {
        const articleElement = document.createElement('div');
        articleElement.className = 'article-item';
        
        // Форматирование даты
        const dateCreated = new Date(article.created_at || article.dateCreated); // Поддержка обоих форматов
        const formattedDate = dateCreated.toLocaleDateString('ru-RU');
        
        // Содержимое элемента
        articleElement.innerHTML = `
            <p><strong>Название:</strong> ${article.name}</p>
            <p><strong>Описание:</strong> ${article.description}</p>
            <p><strong>Артикул:</strong> ${article.code}</p>
            <p><strong>Дата создания:</strong> ${formattedDate}</p>
            <button class="delete-btn" data-id="${article.id || index}">Удалить</button>
        `;
        
        // Добавление обработчика события для кнопки удаления
        const deleteBtn = articleElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            if (isSupabaseConnected) {
                deleteArticleFromSupabase(article.id).then(success => {
                    if (success) {
                        loadArticles(); // Перезагрузка списка после удаления
                    }
                });
            } else {
                deleteArticle(index);
            }
        });
        
        // Добавление элемента в список
        savedArticles.appendChild(articleElement);
    });
}

// Удаление артикула (для localStorage)
function deleteArticle(index) {
    // Удаление артикула из массива
    articles.splice(index, 1);
    
    // Обновление localStorage
    localStorage.setItem('articles', JSON.stringify(articles));
    
    // Обновление отображения
    renderArticles();
}

// Очистка всех артикулов
async function clearAllArticles() {
    // Подтверждение перед удалением
    if (confirm('Вы уверены, что хотите удалить все сохраненные артикулы?')) {
        if (isSupabaseConnected) {
            // Удаление всех артикулов из Supabase
            try {
                const { error } = await supabase
                    .from('articles')
                    .delete()
                    .gte('id', 0); // Удаление всех записей
                
                if (error) {
                    console.error('Ошибка при удалении артикулов:', error);
                    showNotification('Ошибка при удалении артикулов', 'error');
                    return;
                }
                
                await loadArticles(); // Перезагрузка списка после удаления
                showNotification('Все артикулы успешно удалены', 'success');
            } catch (err) {
                console.error('Не удалось удалить артикулы:', err);
                showNotification('Не удалось удалить артикулы', 'error');
            }
        } else {
            articles = [];
            localStorage.removeItem('articles');
            renderArticles();
            showNotification('Все артикулы успешно удалены', 'success');
        }
    }
}

// Экспорт в CSV
function exportToCSV() {
    if (articles.length === 0) {
        alert('Нет артикулов для экспорта');
        return;
    }
    
    // Заголовки CSV
    let csvContent = 'Название,Описание,Артикул,Дата создания\n';
    
    // Добавление данных
    articles.forEach(article => {
        const dateCreated = new Date(article.created_at || article.dateCreated);
        const formattedDate = dateCreated.toLocaleDateString('ru-RU');
        
        // Экранирование запятых и кавычек в данных
        const name = article.name.replace(/"/g, '""');
        const description = article.description.replace(/"/g, '""');
        
        // Добавление строки
        csvContent += `"${name}","${description}","${article.code}","${formattedDate}"\n`;
    });
    
    // Создание и скачивание файла
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Настройка ссылки для скачивания
    link.setAttribute('href', url);
    link.setAttribute('download', `артикулы_${getCurrentDateString()}.csv`);
    link.style.visibility = 'hidden';
    
    // Добавление ссылки в DOM
    document.body.appendChild(link);
    
    // Имитация клика по ссылке
    link.click();
    
    // Удаление ссылки из DOM
    document.body.removeChild(link);
}

// Получение текущей даты в формате ГГГГ-ММ-ДД
function getCurrentDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    // Создание элемента уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Добавление уведомления в DOM
    document.body.appendChild(notification);
    
    // Показ уведомления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Удаление уведомления через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', init);

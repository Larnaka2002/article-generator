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
let articles = JSON.parse(localStorage.getItem('articles')) || [];
let darkTheme = localStorage.getItem('darkTheme') === 'true';

// Инициализация приложения
function init() {
    // Отображение сохраненных артикулов при загрузке страницы
    renderArticles();
    
    // Инициализация темы
    initTheme();
    
    // Обработчики событий
    articleForm.addEventListener('submit', generateArticle);
    saveBtn.addEventListener('submit', saveArticle);
    saveBtn.addEventListener('click', saveArticle);
    exportBtn.addEventListener('click', exportToCSV);
    clearBtn.addEventListener('click', clearAllArticles);
    themeToggle.addEventListener('change', toggleTheme);
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
        dateCreated: new Date().toISOString()
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
function saveArticle() {
    if (!currentArticle) return;
    
    // Добавление артикула в массив
    articles.push(currentArticle);
    
    // Сохранение в localStorage
    localStorage.setItem('articles', JSON.stringify(articles));
    
    // Обновление отображения списка артикулов
    renderArticles();
    
    // Сброс формы
    articleForm.reset();
    resultSection.style.display = 'none';
    currentArticle = null;
    
    // Прокрутка к списку сохраненных артикулов
    savedArticles.scrollIntoView({ behavior: 'smooth' });
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
        const dateCreated = new Date(article.dateCreated);
        const formattedDate = dateCreated.toLocaleDateString('ru-RU');
        
        // Содержимое элемента
        articleElement.innerHTML = `
            <p><strong>Название:</strong> ${article.name}</p>
            <p><strong>Описание:</strong> ${article.description}</p>
            <p><strong>Артикул:</strong> ${article.code}</p>
            <p><strong>Дата создания:</strong> ${formattedDate}</p>
            <button class="delete-btn" data-index="${index}">Удалить</button>
        `;
        
        // Добавление обработчика события для кнопки удаления
        const deleteBtn = articleElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            deleteArticle(index);
        });
        
        // Добавление элемента в список
        savedArticles.appendChild(articleElement);
    });
}

// Удаление артикула
function deleteArticle(index) {
    // Удаление артикула из массива
    articles.splice(index, 1);
    
    // Обновление localStorage
    localStorage.setItem('articles', JSON.stringify(articles));
    
    // Обновление отображения
    renderArticles();
}

// Очистка всех артикулов
function clearAllArticles() {
    // Подтверждение перед удалением
    if (confirm('Вы уверены, что хотите удалить все сохраненные артикулы?')) {
        articles = [];
        localStorage.removeItem('articles');
        renderArticles();
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
        const dateCreated = new Date(article.dateCreated);
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

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', init);

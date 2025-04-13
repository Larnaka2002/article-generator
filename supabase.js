// supabase.js
// Этот файл создаем для инициализации Supabase клиента

// Инициализация Supabase клиента
const supabaseUrl = 'https://qaxrxujjnmgxbwvhyejj.supabase.co'; // Замените на ссылку вашего проекта
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFheHJ4dWpqbm1neGJ3dmh5ZWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1Njg3NzgsImV4cCI6MjA2MDE0NDc3OH0.g1cXbkh8GDLlmnlXA2DjM5GUodATjzS49kokh10-PPo'; // Замените на публичный ключ anon key
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Функция для проверки статуса подключения
async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('count(*)', { count: 'exact' })
            .limit(1);
        
        if (error) {
            console.error('Ошибка подключения к Supabase:', error);
            return false;
        }
        
        console.log('Подключение к Supabase установлено успешно');
        return true;
    } catch (err) {
        console.error('Не удалось подключиться к Supabase:', err);
        return false;
    }
}

// Функция для сохранения артикула в Supabase
async function saveArticleToSupabase(article) {
    try {
        const { data, error } = await supabase
            .from('articles')
            .insert([article]);
        
        if (error) {
            console.error('Ошибка при сохранении артикула:', error);
            return false;
        }
        
        console.log('Артикул успешно сохранен:', data);
        return true;
    } catch (err) {
        console.error('Не удалось сохранить артикул:', err);
        return false;
    }
}

// Функция для получения всех артикулов из Supabase
async function getArticlesFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Ошибка при получении артикулов:', error);
            return [];
        }
        
        return data || [];
    } catch (err) {
        console.error('Не удалось получить артикулы:', err);
        return [];
    }
}

// Функция для удаления артикула из Supabase
async function deleteArticleFromSupabase(id) {
    try {
        const { data, error } = await supabase
            .from('articles')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Ошибка при удалении артикула:', error);
            return false;
        }
        
        console.log('Артикул успешно удален');
        return true;
    } catch (err) {
        console.error('Не удалось удалить артикул:', err);
        return false;
    }
}

// Функция для поиска артикулов в Supabase
async function searchArticlesInSupabase(searchTerm) {
    try {
        searchTerm = searchTerm.toLowerCase();
        
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
        
        if (error) {
            console.error('Ошибка при поиске артикулов:', error);
            return [];
        }
        
        return data || [];
    } catch (err) {
        console.error('Не удалось выполнить поиск артикулов:', err);
        return [];
    }
}

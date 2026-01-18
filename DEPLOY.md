# 📋 Инструкция по деплою Cat Tetris Mini App

## ✅ Шаг 1: Локальное тестирование

Игра уже готова к тестированию. Запустите локальный сервер:

```bash
cd /Users/denispopov/Downloads/cat-tetris-base
npm run dev
```

Или используйте Python напрямую:

```bash
python3 -m http.server 8000
```

Откройте браузер: `http://localhost:8000`

**Проверьте:**
- ✅ Игра запускается
- ✅ Фигуры падают
- ✅ Управление работает (стрелки ← → ↓ ↑)
- ✅ Линии очищаются
- ✅ Счёт увеличивается
- ✅ Нет ошибок в консоли браузера (F12)

## ✅ Шаг 2: Загрузка на GitHub

Если репозиторий еще не инициализирован:

```bash
cd /Users/denispopov/Downloads/cat-tetris-base
git init
git add .
git commit -m "Initial commit: Cat Tetris mini app for Base"
git branch -M main
git remote add origin https://github.com/denis198/cat-tetris-base.git
git push -u origin main
```

Если репозиторий уже существует:

```bash
git add .
git commit -m "Update: Add Base Mini App configuration"
git push origin main
```

## ✅ Шаг 3: Деплой на Vercel

1. Зайдите на [Vercel Dashboard](https://vercel.com/popovdenisn-1952s-projects)
2. Если проект уже подключен - он автоматически обновится после push в GitHub
3. Если проект новый:
   - Нажмите "Add New Project"
   - Выберите репозиторий `denis198/cat-tetris-base`
   - Настройки:
     - **Framework Preset**: Other
     - **Root Directory**: `./`
     - **Build Command**: (оставьте пустым или `echo 'No build'`)
     - **Output Directory**: `.`
   - Нажмите "Deploy"

4. После деплоя скопируйте URL (например: `https://cat-tetris-base-xxx.vercel.app`)

## ✅ Шаг 4: Настройка Base Mini App

### 4.1 Обновите farcaster.json

Замените `https://your-vercel-url.vercel.app` на ваш реальный URL от Vercel в файле `farcaster.json`:

```json
{
  "homeUrl": "https://ваш-vercel-url.vercel.app",
  "iconUrl": "https://ваш-vercel-url.vercel.app/icon.png",
  "splashImageUrl": "https://ваш-vercel-url.vercel.app/splash.png"
}
```

### 4.2 Настройте Account Association

1. Перейдите на [Base Account Association Tool](https://docs.base.org/mini-apps/overview)
2. Введите ваш домен (URL от Vercel)
3. Получите `payload` и `signature`
4. Обновите `farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "X-Base-Account-Association",
    "payload": "ВАШ_PAYLOAD",
    "signature": "ВАША_SIGNATURE"
  }
}
```

### 4.3 Загрузите обновленный farcaster.json

После обновления `farcaster.json`:

```bash
git add farcaster.json
git commit -m "Update: Add Base account association"
git push origin main
```

Vercel автоматически перезапустит деплой.

### 4.4 Проверьте настройки Vercel

В настройках проекта Vercel:
- ✅ Убедитесь, что "Vercel Authentication" **выключен**
- ✅ Проверьте, что все файлы доступны публично
- ✅ Убедитесь, что CORS настроен правильно (уже добавлен в vercel.json)

## ✅ Шаг 5: Публикация в Base App

1. Создайте пост в Base App с URL вашего мини-приложения
2. Следуйте официальной инструкции Base Mini Apps для финальной публикации
3. Протестируйте мини-приложение в Base App

## 🔍 Проверка работоспособности

После деплоя проверьте:

1. **Доступность**: Откройте URL в браузере - игра должна загружаться
2. **Файлы**: Проверьте доступность всех файлов:
   - `https://ваш-url.vercel.app/index.html`
   - `https://ваш-url.vercel.app/tetris.js`
   - `https://ваш-url.vercel.app/style.css`
   - `https://ваш-url.vercel.app/farcaster.json`

3. **Манифест**: Проверьте, что `farcaster.json` доступен и правильно настроен

## 🐛 Решение проблем

### Игра не загружается
- Проверьте консоль браузера (F12) на наличие ошибок
- Убедитесь, что все файлы загружены правильно
- Проверьте CORS настройки

### Vercel деплой не работает
- Проверьте, что `vercel.json` правильно настроен
- Убедитесь, что все файлы закоммичены в git
- Проверьте логи деплоя в Vercel Dashboard

### Base Mini App не работает
- Проверьте, что `farcaster.json` доступен по URL
- Убедитесь, что Account Association настроен правильно
- Проверьте, что домен правильно связан с Base аккаунтом

## 📞 Полезные ссылки

- [Base Mini Apps Documentation](https://docs.base.org/mini-apps/overview)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Repository](https://github.com/denis198/cat-tetris-base)
- [Vercel Project](https://vercel.com/popovdenisn-1952s-projects/cat-tetris-base)

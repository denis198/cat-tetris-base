# Конвертация SVG в PNG для Base Mini App

Base требует PNG иконку 1024x1024px без альфа-канала.

## Быстрый способ (онлайн):

1. Открой https://cloudconvert.com/svg-to-png
2. Загрузи файл `icon.svg`
3. Настройки:
   - Width: 1024
   - Height: 1024
   - Background color: #667eea (или любой другой)
4. Конвертируй и скачай `icon.png`
5. Загрузи `icon.png` в корень проекта

## Или через командную строку (если установлен ImageMagick):

```bash
convert icon.svg -resize 1024x1024 -background "#667eea" -alpha remove icon.png
```

## Или через Node.js (если установлен sharp):

```bash
npm install -g sharp-cli
sharp -i icon.svg -o icon.png --resize 1024 1024 --background "#667eea"
```

После создания `icon.png` - закоммить и задеплоить.

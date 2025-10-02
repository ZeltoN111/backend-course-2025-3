const fs = require('fs');
const { Command } = require('commander');
const program = new Command();

// Налаштування параметрів командного рядка
program
  .requiredOption('-i, --input <path>', 'path to input file')
  .option('-o, --output <path>', 'path to output file')
  .option('-d, --display', 'display result in console')
  .option('-s, --survived', 'show only survivors')
  .option('-a, --age', 'display passenger age');

program.parse(process.argv);
const options = program.opts();

// Перевірка обов'язкового параметра
if (!options.input) {
  console.error('Please, specify input file');
  process.exit(1);
}

// Перевірка існування файлу
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

// Читання та парсинг NDJSON
let data;
try {
  const fileContent = fs.readFileSync(options.input, 'utf8');
  
  // NDJSON формат - кожен рядок окремий JSON об'єкт
  const lines = fileContent.trim().split('\n');
  data = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine === '') return; // пропускаємо порожні рядки
    
    try {
      const parsed = JSON.parse(trimmedLine);
      data.push(parsed);
    } catch (err) {
      console.error(`Error parsing line ${index + 1}:`);
      console.error(`Content: ${trimmedLine.substring(0, 100)}...`);
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });
  
} catch (error) {
  console.error('Error reading or parsing file:', error.message);
  process.exit(1);
}

// Обробка даних
let results = [];

data.forEach(passenger => {
  // Фільтрація: тільки ті, хто вижив (якщо параметр -s)
  // Конвертуємо в число, бо може бути строка "1" або число 1
  if (options.survived && Number(passenger.Survived) !== 1) {
    return;
  }

  // Формування рядка виводу
  let output = passenger.Name;
  
  // Додаємо вік якщо параметр -a і Age не null
  if (options.age) {
    const age = passenger.Age;
    if (age !== null && age !== undefined && age !== 'null') {
      output += ' ' + age;
    }
  }
  
  // Додаємо номер квитка
  if (passenger.Ticket) {
    output += ' ' + passenger.Ticket;
  }

  results.push(output);
});

// Формування фінального результату
const finalOutput = results.join('\n');

// Вивід результатів
if (!options.output && !options.display) {
  // Якщо не задано жодного з необов'язкових параметрів - нічого не виводимо
  process.exit(0);
}

if (options.display) {
  console.log(finalOutput);
}

if (options.output) {
  fs.writeFileSync(options.output, finalOutput, 'utf8');
}
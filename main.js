const fs = require('fs');
const { Command } = require('commander');
const program = new Command();

program
  .requiredOption('-i, --input <path>', 'path to input file')
  .option('-o, --output <path>', 'path to output file')
  .option('-d, --display', 'display result in console')
  .option('-s, --survived', 'show only survivors')
  .option('-a, --age', 'display passenger age');

program.parse(process.argv);
const options = program.opts();


if (!options.input) {
  console.error('Please, specify input file');
  process.exit(1);
}


if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

let data;
try {
  const fileContent = fs.readFileSync(options.input, 'utf8');
  
  const lines = fileContent.trim().split('\n');
  data = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine === '') return; 
    
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

let results = [];

data.forEach(passenger => {
  if (options.survived && Number(passenger.Survived) !== 1) {
    return;
  }

  let output = passenger.Name;
  
  if (options.age) {
    const age = passenger.Age;
    if (age !== null && age !== undefined && age !== 'null') {
      output += ' ' + age;
    }
  }
  
  if (passenger.Ticket) {
    output += ' ' + passenger.Ticket;
  }

  results.push(output);
});

const finalOutput = results.join('\n');

if (!options.output && !options.display) {
  process.exit(0);
}

if (options.display) {
  console.log(finalOutput);
}

if (options.output) {
  fs.writeFileSync(options.output, finalOutput, 'utf8');
}